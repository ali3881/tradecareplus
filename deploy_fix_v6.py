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
        # Use PTY for interactive-like output streaming
        stdin, stdout, stderr = ssh.exec_command(cmd, get_pty=True)
        
        output_buffer = ""
        while not stdout.channel.exit_status_ready():
            if stdout.channel.recv_ready():
                chunk = stdout.channel.recv(4096).decode(errors='ignore')
                output_buffer += chunk
                if verbose:
                    sys.stdout.write(chunk)
                    sys.stdout.flush()
            time.sleep(0.1)
            
        # Read remaining
        while stdout.channel.recv_ready():
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

        app_dir = "/var/www/tradecareplus"
        cmd_prefix = f"cd {app_dir} && "
        
        # --- STEP 2 (Resume): Install Deps ---
        log("\n=== STEP 2: Install Deps ===")
        # Use --verbose to see progress
        run_command(ssh, cmd_prefix + "npm install --verbose")
        
        # Prisma
        run_command(ssh, cmd_prefix + "npx prisma generate")
        # Ensure migration happens
        run_command(ssh, cmd_prefix + "npx prisma migrate deploy")
        
        # Build
        log("\n=== STEP 3: Build ===")
        # Clean .next to force rebuild
        run_command(ssh, cmd_prefix + "rm -rf .next")
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
