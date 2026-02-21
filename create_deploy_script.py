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
        sftp = ssh.open_sftp()
        with sftp.file("/var/www/tradecareplus/deploy.sh", "w") as f:
            f.write(script)
        sftp.close()
        
        ssh.exec_command("chmod +x /var/www/tradecareplus/deploy.sh")
        
        print("Executing deploy.sh in background...")
        # Use setsid to detach completely
        cmd = "setsid /var/www/tradecareplus/deploy.sh > /dev/null 2>&1 &"
        ssh.exec_command(cmd)
        
        print("Launched. Waiting 30s to check log...")
        time.sleep(30)
        
        stdin, stdout, stderr = ssh.exec_command("tail -n 20 /var/www/tradecareplus/final_deploy.log")
        print("Log Tail:")
        print(stdout.read().decode(errors='ignore'))
        
        ssh.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
