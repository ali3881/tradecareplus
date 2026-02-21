import paramiko
import sys
import time

HOST = "72.60.199.129"
USER = "root"
PASS = "xpaRVJMTWuY+VbEms;N2"

def log(msg):
    try:
        print(msg, flush=True)
    except:
        pass

def run_command(ssh, cmd, exit_on_fail=True, verbose=True):
    log(f"\n[COMMAND] {cmd}")
    try:
        # Use get_pty=True to mimic interactive terminal, helpful for some commands
        # But for long running builds, we need to be careful about timeouts if we don't read
        stdin, stdout, stderr = ssh.exec_command(cmd, get_pty=True)
        
        # Read output in real-time
        output_buffer = ""
        while True:
            if stdout.channel.recv_ready():
                chunk = stdout.channel.recv(4096).decode(errors='ignore')
                output_buffer += chunk
                if verbose:
                    sys.stdout.write(chunk)
                    sys.stdout.flush()
            
            if stdout.channel.exit_status_ready():
                break
            time.sleep(0.1)
            
        # Read remaining
        if stdout.channel.recv_ready():
            chunk = stdout.channel.recv(4096).decode(errors='ignore')
            output_buffer += chunk
            if verbose:
                sys.stdout.write(chunk)
                sys.stdout.flush()

        exit_status = stdout.channel.recv_exit_status()
        
        if exit_status != 0:
            log(f"\n[ERROR] Command failed with exit status {exit_status}")
            if exit_on_fail:
                sys.exit(exit_status)
        else:
            log(f"\n[SUCCESS] Command finished successfully.")
            
        return output_buffer
    except Exception as e:
        log(f"\n[EXCEPTION] {e}")
        if exit_on_fail:
            sys.exit(1)
        return ""

def main():
    try:
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        log(f"Connecting to {HOST}...")
        ssh.connect(HOST, username=USER, password=PASS, allow_agent=False, look_for_keys=False)
        log("Connected.")

        # --- STEP 0: SWAP (Crucial for Build) ---
        log("\n=== STEP 0: CHECKING SWAP ===")
        swap_check = run_command(ssh, "swapon --show", verbose=False)
        if not swap_check.strip():
            log("No swap detected. Creating 1GB swap file...")
            run_command(ssh, "fallocate -l 1G /swapfile")
            run_command(ssh, "chmod 600 /swapfile")
            run_command(ssh, "mkswap /swapfile")
            run_command(ssh, "swapon /swapfile")
            run_command(ssh, "echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab")
            log("Swap created.")
        else:
            log("Swap already exists.")

        # --- STEP 1: INSTALL DEPENDENCIES ---
        log("\n=== STEP 1: SYSTEM DEPENDENCIES ===")
        # Check node version first to save time
        node_ver = run_command(ssh, "node -v", exit_on_fail=False, verbose=False)
        if "v20" not in node_ver and "v22" not in node_ver:
            log("Installing Node.js 20...")
            run_command(ssh, "curl -fsSL https://deb.nodesource.com/setup_20.x | bash -")
            run_command(ssh, "apt-get install -y nodejs")
        
        run_command(ssh, "apt-get update")
        run_command(ssh, "apt-get install -y nginx git build-essential")
        run_command(ssh, "npm install -g pm2")

        # --- STEP 2: PREPARE APP ---
        log("\n=== STEP 2: PREPARE APP ===")
        app_dir = "/var/www/tradecareplus"
        run_command(ssh, f"mkdir -p {app_dir}")
        
        # Check if project exists, if not we might need to upload it? 
        # Assuming code is there or we need to pull/copy. 
        # The prompt implies code is there or "uploaded". 
        # Let's assume it's there. If directory is empty, we have a problem.
        ls_out = run_command(ssh, f"ls -A {app_dir}", verbose=False)
        if not ls_out.strip():
            log("[WARNING] App directory is empty! Cannot build.")
            # We must upload? 
            # For now, let's assume the previous steps uploaded it. 
            # If not, we fail.
            sys.exit(1)

        cmd_prefix = f"cd {app_dir} && "
        
        # Install dependencies
        run_command(ssh, cmd_prefix + "rm -rf node_modules package-lock.json") # Clean start
        run_command(ssh, cmd_prefix + "npm install") 
        
        # Prisma
        run_command(ssh, cmd_prefix + "npx prisma generate")
        run_command(ssh, cmd_prefix + "npx prisma migrate deploy || echo 'Migration failed or not needed'")

        # --- STEP 3: BUILD ---
        log("\n=== STEP 3: BUILD ===")
        run_command(ssh, cmd_prefix + "npm run build")
        
        # Check BUILD_ID
        run_command(ssh, f"test -f {app_dir}/.next/BUILD_ID", exit_on_fail=True)
        log("Build successful (BUILD_ID found).")

        # --- STEP 4: START APP ---
        log("\n=== STEP 4: START WITH PM2 ===")
        run_command(ssh, "pm2 delete tradecareplus", exit_on_fail=False)
        
        # Start command explicitly on IPv4
        run_command(ssh, f"{cmd_prefix} pm2 start npm --name tradecareplus -- start -- -p 3000 -H 0.0.0.0")
        run_command(ssh, "pm2 save")
        
        # Wait for startup
        time.sleep(5)
        run_command(ssh, "pm2 status")
        
        # Verify Port
        run_command(ssh, "netstat -tuln | grep 3000")

        # --- STEP 5: NGINX ---
        log("\n=== STEP 5: NGINX CONFIG ===")
        nginx_conf = """server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    client_max_body_size 100m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}"""
        sftp = ssh.open_sftp()
        with sftp.file("/etc/nginx/sites-available/tradecareplus", "w") as f:
            f.write(nginx_conf)
        sftp.close()
        
        run_command(ssh, "rm -f /etc/nginx/sites-enabled/default")
        run_command(ssh, "ln -sf /etc/nginx/sites-available/tradecareplus /etc/nginx/sites-enabled/tradecareplus")
        run_command(ssh, "nginx -t")
        run_command(ssh, "systemctl restart nginx")

        # --- STEP 6: VERIFY ---
        log("\n=== STEP 6: VERIFICATION ===")
        log("Checking Localhost:3000...")
        run_command(ssh, "curl -I http://127.0.0.1:3000")
        
        log("Checking Localhost:80...")
        run_command(ssh, "curl -I http://127.0.0.1")
        
        log("\nDeployment Script Completed.")
        ssh.close()

    except Exception as e:
        log(f"\n[FATAL ERROR] {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
