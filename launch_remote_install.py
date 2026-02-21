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
        
        # Fire and forget install
        print("Launching install in background...")
        cmd = f"cd {remote_dir} && nohup sh -c 'rm -rf node_modules package-lock.json .next; npm install && npx prisma generate && npx prisma migrate deploy && npm run build' > build_all.log 2>&1 &"
        ssh.exec_command(cmd)
        
        print("Command sent. Exiting.")
        ssh.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
