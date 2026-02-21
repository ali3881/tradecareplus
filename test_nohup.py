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
        
        print("Running test nohup...")
        cmd = "cd /var/www/tradecareplus && nohup echo 'hello world' > test.log 2>&1 &"
        ssh.exec_command(cmd)
        
        time.sleep(2)
        
        stdin, stdout, stderr = ssh.exec_command("cat /var/www/tradecareplus/test.log")
        print("Test Log:")
        print(stdout.read().decode())
        
        ssh.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
