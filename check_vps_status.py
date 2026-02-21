import paramiko
import sys

HOST = "72.60.199.129"
USER = "root"
PASS = "xpaRVJMTWuY+VbEms;N2"

def main():
    try:
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        print("Connecting...")
        ssh.connect(HOST, username=USER, password=PASS, allow_agent=False, look_for_keys=False)
        
        stdin, stdout, stderr = ssh.exec_command("pm2 status")
        print("PM2 Status:")
        print(stdout.read().decode(errors='ignore'))
        
        stdin, stdout, stderr = ssh.exec_command("curl -I http://127.0.0.1:3000")
        print("Curl 3000:")
        print(stdout.read().decode(errors='ignore'))
        
        ssh.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
