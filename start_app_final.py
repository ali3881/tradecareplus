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

def run(ssh, cmd):
    log(f"\nRunning: {cmd}")
    try:
        stdin, stdout, stderr = ssh.exec_command(cmd, get_pty=True)
        # Set timeout on read? No, just read
        # But wait a bit?
        out = stdout.read().decode(errors='ignore').strip()
        if out: log(f"OUTPUT:\n{out}")
        return out
    except Exception as e:
        log(f"Command failed: {e}")
        return ""

def main():
    try:
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        log("Connecting...")
        ssh.connect(HOST, username=USER, password=PASS, allow_agent=False, look_for_keys=False)
        log("Connected.")

        # 1. Kill existing node
        run(ssh, "pkill node || true")
        
        # 2. Start app directly with nohup
        # Use sh -c to ensure nohup works correctly
        start_cmd = "nohup sh -c 'cd /var/www/tradecareplus && npm run start -- -p 3000 -H 0.0.0.0' > /tmp/app.log 2>&1 &"
        run(ssh, start_cmd)
        
        # 3. Wait for startup
        log("Waiting 10s...")
        time.sleep(10)
        
        # 4. Check logs
        run(ssh, "cat /tmp/app.log")
        
        # 5. Check netstat
        run(ssh, "netstat -tuln | grep 3000")
        
        # 6. Check curl local
        run(ssh, "curl -I http://127.0.0.1:3000")
        
        ssh.close()
    except Exception as e:
        log(f"Error: {e}")

if __name__ == "__main__":
    main()
