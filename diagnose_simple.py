import paramiko
import sys
import time

HOST = "72.60.199.129"
USER = "root"
PASS = "xpaRVJMTWuY+VbEms;N2"

def log(msg):
    print(msg, flush=True)

def run(ssh, cmd):
    log(f"\nRunning: {cmd}")
    stdin, stdout, stderr = ssh.exec_command(cmd, get_pty=True)
    # Read with timeout if possible or just read everything
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

        # 1. Check if node/pm2 running
        run(ssh, "ps aux | grep node")
        
        # 2. Check Port 3000
        run(ssh, "netstat -tuln | grep 3000")
        
        # 3. Check Local App via curl
        out = run(ssh, "curl -I http://127.0.0.1:3000")
        
        # 4. Check Nginx Proxy via curl
        out = run(ssh, "curl -I http://127.0.0.1")
        
        # 5. Check firewall
        run(ssh, "ufw status")

        ssh.close()
    except Exception as e:
        log(f"Error: {e}")

if __name__ == "__main__":
    main()
