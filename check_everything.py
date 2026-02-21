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
        ssh.connect(HOST, username=USER, password=PASS, allow_agent=False, look_for_keys=False, timeout=10)
        
        # Check PM2
        stdin, stdout, stderr = ssh.exec_command("pm2 jlist")
        pm2_out = stdout.read().decode(errors='ignore')
        print("PM2 List:", pm2_out[:500]) # truncated
        
        # Check Netstat
        stdin, stdout, stderr = ssh.exec_command("netstat -tuln | grep 3000")
        print("Netstat 3000:", stdout.read().decode())
        
        # Check Curl
        stdin, stdout, stderr = ssh.exec_command("curl -I http://127.0.0.1:3000")
        print("Curl 3000:", stdout.read().decode())
        
        # Check log tail
        stdin, stdout, stderr = ssh.exec_command("tail -n 20 /var/www/tradecareplus/final_deploy.log")
        print("Deploy Log Tail:")
        print(stdout.read().decode(errors='ignore'))
        
        ssh.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
