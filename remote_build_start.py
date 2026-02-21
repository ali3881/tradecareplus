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
        print("Connecting...")
        ssh.connect(HOST, username=USER, password=PASS, allow_agent=False, look_for_keys=False)
        
        remote_dir = "/var/www/tradecareplus"
        
        # Check if node_modules exists
        stdin, stdout, stderr = ssh.exec_command(f"ls -d {remote_dir}/node_modules")
        if not stdout.read().strip():
             print("Installing dependencies...")
             # Use nohup for install too
             cmd = f"cd {remote_dir} && npm install > install.log 2>&1"
             ssh.exec_command(cmd)
             # Wait? No, just check log
             time.sleep(5)
        
        # Start build in background
        print("Starting build...")
        cmd = f"cd {remote_dir} && nohup npm run build > build.log 2>&1 &"
        ssh.exec_command(cmd)
        
        print("Build started. Waiting 30s to check log...")
        time.sleep(30)
        
        stdin, stdout, stderr = ssh.exec_command(f"tail -n 20 {remote_dir}/build.log")
        print("Build Log Tail:")
        print(stdout.read().decode(errors='ignore'))
        
        ssh.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
