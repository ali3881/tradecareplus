import paramiko
import sys
import time

HOST = "72.60.199.129"
USER = "root"
PASS = "xpaRVJMTWuY+VbEms;N2"

def main():
    try:
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        print("Connecting...", flush=True)
        ssh.connect(HOST, username=USER, password=PASS, allow_agent=False, look_for_keys=False)
        print("Connected.", flush=True)

        # Use invoke_shell as it seemed to execute commands even if output lost
        # Or use exec_command with pty=True for synchronous
        
        # Kill node processes
        print("Killing node...", flush=True)
        ssh.exec_command("pkill node", get_pty=True)
        time.sleep(2)
        
        # Start with nohup directly
        cmd = "cd /var/www/tradecareplus && nohup npm run start -- -p 3000 -H 0.0.0.0 > /tmp/app.log 2>&1 &"
        print(f"Executing: {cmd}", flush=True)
        stdin, stdout, stderr = ssh.exec_command(cmd, get_pty=True)
        
        # Wait a bit
        time.sleep(10)
        
        # Check if running
        print("Checking logs...", flush=True)
        stdin, stdout, stderr = ssh.exec_command("cat /tmp/app.log", get_pty=True)
        print(stdout.read().decode(errors='ignore'))
        
        ssh.close()
        print("Done.", flush=True)

    except Exception as e:
        print(f"Error: {e}", flush=True)

if __name__ == "__main__":
    main()
