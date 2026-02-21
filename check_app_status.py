import paramiko
import sys
import json

HOST = "72.60.199.129"
USER = "root"
PASS = "xpaRVJMTWuY+VbEms;N2"

def main():
    try:
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        print("Connecting...")
        ssh.connect(HOST, username=USER, password=PASS, allow_agent=False, look_for_keys=False)
        
        # Check .next
        stdin, stdout, stderr = ssh.exec_command("ls -l /var/www/tradecareplus/.next | head -n 5")
        print(".next:")
        print(stdout.read().decode())
        
        # Check PM2
        stdin, stdout, stderr = ssh.exec_command("/usr/bin/pm2 jlist")
        out = stdout.read().decode()
        try:
            data = json.loads(out)
            for app in data:
                print(f"App: {app['name']}, Status: {app['pm2_env']['status']}, Restarts: {app['pm2_env']['restart_time']}")
        except:
            print("PM2 output raw:", out)
            print("PM2 stderr:", stderr.read().decode())
            
        # Curl
        stdin, stdout, stderr = ssh.exec_command("curl -I http://127.0.0.1:3000")
        print("Curl 3000:", stdout.read().decode())
        
        ssh.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
