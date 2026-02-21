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
        # Use simple exec_command without pty to avoid potential hanging on some commands
        # But for build we want output. 
        # Let's try to read until channel closes.
        stdin, stdout, stderr = ssh.exec_command(cmd)
        
        output_buffer = ""
        # Read stdout
        while not stdout.channel.exit_status_ready():
            if stdout.channel.recv_ready():
                chunk = stdout.channel.recv(4096).decode(errors='ignore')
                output_buffer += chunk
                if verbose:
                    sys.stdout.write(chunk)
                    sys.stdout.flush()
            
            if stderr.channel.recv_ready():
                 chunk = stderr.channel.recv(4096).decode(errors='ignore')
                 output_buffer += chunk # append stderr to buffer too
                 if verbose:
                    sys.stderr.write(chunk)
                    sys.stderr.flush()
            time.sleep(0.1)
            
        # Read remaining
        while stdout.channel.recv_ready():
            chunk = stdout.channel.recv(4096).decode(errors='ignore')
            output_buffer += chunk
            if verbose:
                sys.stdout.write(chunk)
                sys.stdout.flush()
        
        while stderr.channel.recv_ready():
            chunk = stderr.channel.recv(4096).decode(errors='ignore')
            output_buffer += chunk
            if verbose:
                sys.stderr.write(chunk)
                sys.stderr.flush()

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

        # --- STEP 1: Dependencies ---
        log("\n=== STEP 1: Dependencies ===")
        # Install Node 20 if needed
        node_ver = run_command(ssh, "node -v", exit_on_fail=False, verbose=False)
        if "v20" not in node_ver:
            log("Installing Node 20...")
            run_command(ssh, "curl -fsSL https://deb.nodesource.com/setup_20.x | bash -")
            run_command(ssh, "apt-get install -y nodejs")
            run_command(ssh, "npm install -g pm2")
        
        # --- STEP 2: Prepare App ---
        log("\n=== STEP 2: App Setup ===")
        app_dir = "/var/www/tradecareplus"
        
        run_command(ssh, f"mkdir -p {app_dir}")
        run_command(ssh, f"ls -l {app_dir}")

        cmd_prefix = f"cd {app_dir} && "
        
        # Install deps
        # Using npm ci if package-lock exists, else install
        run_command(ssh, cmd_prefix + "npm install")
        
        # Prisma
        run_command(ssh, cmd_prefix + "npx prisma generate")
        run_command(ssh, cmd_prefix + "npx prisma migrate deploy || echo 'Skipping migrate'")
        
        # Build
        log("\n=== STEP 3: Build ===")
        # Increase memory limit for build just in case
        run_command(ssh, cmd_prefix + "export NODE_OPTIONS='--max-old-space-size=4096' && npm run build")
        
        # Verify Build
        run_command(ssh, f"test -f {app_dir}/.next/BUILD_ID")
        log("Build confirmed.")
        
        # --- STEP 4: Start ---
        log("\n=== STEP 4: Start ===")
        run_command(ssh, "pm2 delete tradecareplus || true")
        
        # Start command
        start_cmd = f"cd {app_dir} && pm2 start npm --name tradecareplus -- start -- -p 3000 -H 0.0.0.0"
        run_command(ssh, start_cmd)
        run_command(ssh, "pm2 save")
        
        # Wait
        time.sleep(5)
        run_command(ssh, "pm2 status")
        
        # Verify Port
        run_command(ssh, "netstat -tuln | grep 3000")
        
        # Verify Curl
        run_command(ssh, "curl -I http://127.0.0.1:3000")

        # --- STEP 5: Nginx ---
        log("\n=== STEP 5: Nginx ===")
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
        
        # Final Verification
        log("\n=== FINAL VERIFICATION ===")
        run_command(ssh, "curl -I http://127.0.0.1")
        
        ssh.close()
        log("Done.")

    except Exception as e:
        log(f"\n[FATAL ERROR] {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
