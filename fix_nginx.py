import paramiko
import time
import sys
import traceback

HOST = "72.60.199.129"
USER = "root"
PASSWORDS = ["xpaRVJMTWuY+VbEms;N2"] # Use the correct one directly

def log(msg):
    print(msg, flush=True)
    sys.stderr.write(msg + "\n")
    sys.stderr.flush()

def run_command(ssh, command):
    log(f"Running: {command}")
    try:
        stdin, stdout, stderr = ssh.exec_command(command, timeout=30)
        # Wait for command to complete
        exit_status = stdout.channel.recv_exit_status()
        out = stdout.read().decode().strip()
        err = stderr.read().decode().strip()
        
        if out: log(f"STDOUT: {out}")
        if err: log(f"STDERR: {err}")
        return exit_status, out, err
    except Exception as e:
        log(f"Command execution failed: {e}")
        return -1, "", str(e)

def main():
    log("Starting script...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        log(f"Connecting to {HOST}...")
        ssh.connect(HOST, username=USER, password=PASSWORDS[0], look_for_keys=False, allow_agent=False, timeout=20, banner_timeout=20)
        log("Connected.")
        
        # 1. List sites-enabled
        run_command(ssh, "ls -l /etc/nginx/sites-enabled/")
        
        # 2. Remove default
        run_command(ssh, "rm -f /etc/nginx/sites-enabled/default")
        
        # 3. Write config
        log("Writing config...")
        sftp = ssh.open_sftp()
        config = """server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}"""
        with sftp.file("/etc/nginx/sites-available/tradecareplus", "w") as f:
            f.write(config)
        sftp.close()
        log("Config written.")
        
        # 4. Enable site
        run_command(ssh, "ln -sf /etc/nginx/sites-available/tradecareplus /etc/nginx/sites-enabled/tradecareplus")
        
        # 5. Test nginx
        status, _, _ = run_command(ssh, "nginx -t")
        if status == 0:
            log("Reloading nginx...")
            run_command(ssh, "systemctl reload nginx")
        else:
            log("Nginx test failed!")
        
        # 6. Verify
        log("Verifying...")
        run_command(ssh, "curl -I http://127.0.0.1:3000")
        run_command(ssh, "curl -I http://127.0.0.1")
        
        # Check logs if needed
        run_command(ssh, "tail -n 20 /var/log/nginx/error.log")
        
        ssh.close()
        log("Done.")
        
    except Exception as e:
        log(f"Exception: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    main()
