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

        cmd = "nohup sh -c 'pm2 delete all; cd /var/www/tradecareplus && pm2 start \"npm run start -- -p 3000 -H 0.0.0.0\" --name tradecareplus && pm2 save && systemctl restart nginx' > /dev/null 2>&1 &"
        print(f"Executing: {cmd}", flush=True)
        
        # Use exec_command
        stdin, stdout, stderr = ssh.exec_command(cmd)
        
        # Wait a bit
        time.sleep(5)
        
        ssh.close()
        print("Done.", flush=True)

    except Exception as e:
        print(f"Error: {e}", flush=True)

if __name__ == "__main__":
    main()
