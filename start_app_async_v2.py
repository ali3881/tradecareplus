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
        # Phase 1: Start App
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        log("Connecting (Phase 1)...")
        ssh.connect(HOST, username=USER, password=PASS, allow_agent=False, look_for_keys=False)
        log("Connected.")

        # Fire and forget start command
        # Use nohup and redirect to log file
        cmd = "nohup sh -c 'cd /var/www/tradecareplus && npm run start -- -p 3000 -H 0.0.0.0' > /tmp/app.log 2>&1 < /dev/null &"
        log(f"Starting app: {cmd}")
        ssh.exec_command(cmd, get_pty=True)
        # Don't read output! Just close!
        ssh.close()
        log("Disconnected Phase 1.")
        
        # Phase 2: Verify
        log("Waiting 10s...")
        time.sleep(10)
        
        log("Connecting (Phase 2)...")
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(HOST, username=USER, password=PASS, allow_agent=False, look_for_keys=False)
        log("Connected.")
        
        # Check logs
        stdin, stdout, stderr = ssh.exec_command("tail -n 20 /tmp/app.log", get_pty=True)
        out = stdout.read().decode(errors='ignore').strip()
        log(f"LOGS:\n{out}")
        
        ssh.close()
        log("Done.")

    except Exception as e:
        log(f"Error: {e}")

if __name__ == "__main__":
    main()
