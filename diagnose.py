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
    out = stdout.read().decode().strip()
    if out: log(f"OUTPUT:\n{out}")
    return out

def main():
    try:
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        log("Connecting...")
        ssh.connect(HOST, username=USER, password=PASS, allow_agent=False, look_for_keys=False)
        log("Connected.")

        # 1. Check PM2
        run(ssh, "pm2 status")
        
        # 2. Check Port 3000
        run(ssh, "netstat -tuln | grep 3000")
        
        # 3. Check Local App
        out = run(ssh, "curl -I http://127.0.0.1:3000")
        if "HTTP/1.1 200" in out or "HTTP/1.1 30" in out:
            log("Local App OK")
        else:
            log("Local App FAILED")
            # Check PM2 logs
            run(ssh, "tail -n 50 /root/.pm2/logs/tradecareplus-error.log")
            run(ssh, "tail -n 50 /root/.pm2/logs/tradecareplus-out.log")

        # 4. Check Nginx Proxy
        out = run(ssh, "curl -I http://127.0.0.1")
        if "HTTP/1.1 502" in out:
            log("Nginx 502 Detected")
            # Check journalctl
            run(ssh, "journalctl -u nginx --no-pager | tail -n 50")
            # Check nginx error log again (maybe it has content now?)
            run(ssh, "cat /var/log/nginx/error.log")
        
        # 5. Check Firewall
        run(ssh, "ufw status")

        ssh.close()
    except Exception as e:
        log(f"Error: {e}")

if __name__ == "__main__":
    main()
