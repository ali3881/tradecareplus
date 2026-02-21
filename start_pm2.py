import paramiko
import sys
import time

HOST = "72.60.199.129"
USER = "root"
PASS = "xpaRVJMTWuY+VbEms;N2"

def log(msg):
    # Encode/decode to avoid charmap errors on Windows console
    try:
        print(msg, flush=True)
    except UnicodeEncodeError:
        print(msg.encode('ascii', 'ignore').decode('ascii'), flush=True)

def run(ssh, cmd):
    log(f"\nRunning: {cmd}")
    stdin, stdout, stderr = ssh.exec_command(cmd, get_pty=True)
    out = stdout.read().decode(errors='ignore').strip()
    if out: log(f"OUTPUT:\n{out}")
    return out

def main():
    try:
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        log("Connecting...")
        ssh.connect(HOST, username=USER, password=PASS, allow_agent=False, look_for_keys=False)
        log("Connected.")

        # 1. Stop existing
        run(ssh, "pm2 delete tradecareplus || true")
        
        # 2. Start with forced host
        # Note: --name tradecareplus is important
        # We use 'npm start' directly or 'npm run start'
        # The command should be: pm2 start "npm run start -- -p 3000 -H 0.0.0.0" --name tradecareplus
        start_cmd = 'pm2 start "npm run start -- -p 3000 -H 0.0.0.0" --name tradecareplus --cwd /var/www/tradecareplus'
        run(ssh, start_cmd)
        
        # 3. Save
        run(ssh, "pm2 save")
        
        # 4. Check status
        run(ssh, "pm2 status")
        
        # 5. Wait a bit for startup
        log("Waiting 5s for app startup...")
        time.sleep(5)
        
        # 6. Verify local curl
        run(ssh, "curl -I http://127.0.0.1:3000")
        
        # 7. Verify nginx proxy
        run(ssh, "curl -I http://127.0.0.1")

        ssh.close()
    except Exception as e:
        log(f"Error: {e}")

if __name__ == "__main__":
    main()
