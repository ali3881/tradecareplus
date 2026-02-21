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

def run(ssh, cmd, wait=True):
    log(f"\nRunning: {cmd}")
    try:
        stdin, stdout, stderr = ssh.exec_command(cmd, get_pty=True)
        if wait:
            out = stdout.read().decode(errors='ignore').strip()
            if out: log(f"OUTPUT:\n{out}")
            return out
        else:
            return ""
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
        
        # 2. Start app directly with nohup and proper detachment
        # Redirect stdin/stdout/stderr to close PTY connection to the process
        # But wait, get_pty=True attaches PTY to the SHELL.
        # If we run 'cmd &', shell returns.
        # But if PTY is held...
        # We need to ensure the shell exits.
        
        # Try running without PTY for the background command?
        # But exec_command without PTY hangs?
        # Maybe because it waits for stdout?
        
        # Let's try with PTY but closing FDs explicitly
        start_cmd = "nohup sh -c 'cd /var/www/tradecareplus && npm run start -- -p 3000 -H 0.0.0.0' > /tmp/app.log 2>&1 < /dev/null &"
        
        # We use a trick: execute command and then exit immediately?
        # "cmd & exit"
        
        run(ssh, start_cmd + " exit")
        
        # 3. Wait for startup
        log("Waiting 10s...")
        time.sleep(10)
        
        # 4. Check logs
        run(ssh, "tail -n 20 /tmp/app.log")
        
        # 5. Check netstat
        run(ssh, "netstat -tuln | grep 3000")
        
        # 6. Check curl local
        run(ssh, "curl -I http://127.0.0.1:3000")
        
        ssh.close()
    except Exception as e:
        log(f"Error: {e}")

if __name__ == "__main__":
    main()
