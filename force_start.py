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

def main():
    try:
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        log("Connecting...")
        ssh.connect(HOST, username=USER, password=PASS, allow_agent=False, look_for_keys=False, timeout=30)
        log("Connected.")

        app_dir = "/var/www/tradecareplus"
        
        # Check .next
        stdin, stdout, stderr = ssh.exec_command(f"ls -d {app_dir}/.next")
        if not stdout.read().strip():
            log(".next missing. Trying minimal build...")
            # Minimal build command
            cmd = f"cd {app_dir} && npm install --omit=dev && npx prisma generate && npm run build"
            log(f"Running: {cmd}")
            stdin, stdout, stderr = ssh.exec_command(cmd)
            # Read output (might block)
            log(stdout.read().decode(errors='ignore'))
            log(stderr.read().decode(errors='ignore'))
        else:
            log(".next exists. Skipping build.")
            
        # Start
        log("Starting...")
        ssh.exec_command("pm2 delete tradecareplus || true")
        ssh.exec_command(f"cd {app_dir} && pm2 start npm --name tradecareplus -- start -- -p 3000 -H 0.0.0.0")
        ssh.exec_command("pm2 save")
        
        time.sleep(5)
        stdin, stdout, stderr = ssh.exec_command("pm2 status")
        log(stdout.read().decode(errors='ignore'))
        
        stdin, stdout, stderr = ssh.exec_command("curl -I http://127.0.0.1:3000")
        log(stdout.read().decode(errors='ignore'))
        
        ssh.close()

    except Exception as e:
        log(f"Error: {e}")

if __name__ == "__main__":
    main()
