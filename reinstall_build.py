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
        
        print("Cleaning...")
        ssh.exec_command(f"cd {remote_dir} && rm -rf node_modules package-lock.json .next")
        
        print("Installing (this may take 5 mins)...")
        # Use nohup to ensure it finishes
        cmd = f"cd {remote_dir} && nohup npm install > install.log 2>&1"
        ssh.exec_command(cmd)
        
        # Monitor install
        time.sleep(10)
        while True:
            stdin, stdout, stderr = ssh.exec_command(f"pgrep -f 'npm install'")
            if not stdout.read().strip():
                print("Install finished.")
                break
            print("Install running...")
            time.sleep(30)
            
        # Check install success
        stdin, stdout, stderr = ssh.exec_command(f"ls {remote_dir}/node_modules/.bin/next")
        if "No such file" in stderr.read().decode():
            print("Install FAILED. Check install.log:")
            stdin, stdout, stderr = ssh.exec_command(f"cat {remote_dir}/install.log")
            print(stdout.read().decode(errors='ignore'))
            sys.exit(1)
            
        print("Install success. Generating Prisma...")
        ssh.exec_command(f"cd {remote_dir} && npx prisma generate && npx prisma migrate deploy")
        
        print("Building...")
        cmd = f"cd {remote_dir} && nohup npm run build > build.log 2>&1"
        ssh.exec_command(cmd)
        
        # Monitor build
        while True:
            stdin, stdout, stderr = ssh.exec_command(f"pgrep -f 'npm run build'")
            if not stdout.read().strip():
                print("Build finished.")
                break
            print("Build running...")
            time.sleep(30)
            
        # Check build success
        stdin, stdout, stderr = ssh.exec_command(f"cat {remote_dir}/.next/BUILD_ID")
        bid = stdout.read().decode().strip()
        if bid:
            print(f"Build SUCCESS. ID: {bid}")
            print("Starting App...")
            ssh.exec_command("pm2 delete tradecareplus || true")
            ssh.exec_command(f"cd {remote_dir} && pm2 start npm --name tradecareplus -- start -- -p 3000 -H 0.0.0.0")
            ssh.exec_command("pm2 save")
            ssh.exec_command("systemctl restart nginx")
        else:
            print("Build FAILED. Check build.log:")
            stdin, stdout, stderr = ssh.exec_command(f"cat {remote_dir}/build.log")
            print(stdout.read().decode(errors='ignore'))
        
        ssh.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
