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
        
        # Use simple echo to create file (escaped quotes)
        # Or better, base64 encode the script locally and decode on server
        import base64
        script = """#!/bin/bash
exec > /var/www/tradecareplus/final_deploy.log 2>&1
echo "Starting final deploy..."
export PATH=$PATH:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin
cd /var/www/tradecareplus
echo "Installing..."
npm install
echo "Prisma..."
npx prisma generate
npx prisma migrate deploy
echo "Building..."
npm run build
echo "Starting..."
pm2 delete tradecareplus || true
pm2 start npm --name tradecareplus -- start -- -p 3000 -H 0.0.0.0
pm2 save
systemctl restart nginx
echo "DONE."
"""
        b64_script = base64.b64encode(script.encode()).decode()
        
        print("Uploading script via base64...")
        ssh.exec_command(f"echo {b64_script} | base64 -d > /var/www/tradecareplus/deploy.sh")
        ssh.exec_command("chmod +x /var/www/tradecareplus/deploy.sh")
        
        print("Executing deploy.sh via nohup...")
        # Use nohup instead of setsid if setsid is missing (but setsid is better)
        # nohup /var/www/tradecareplus/deploy.sh > /dev/null 2>&1 &
        ssh.exec_command("nohup /var/www/tradecareplus/deploy.sh > /dev/null 2>&1 &")
        
        print("Launched. Waiting 10s to check log...")
        time.sleep(10)
        
        stdin, stdout, stderr = ssh.exec_command("tail -n 20 /var/www/tradecareplus/final_deploy.log")
        print("Log Tail:")
        print(stdout.read().decode(errors='ignore'))
        
        ssh.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
