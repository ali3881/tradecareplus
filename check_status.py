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
        print("Connected.")
        
        # Check if node_modules exists and is populated
        stdin, stdout, stderr = ssh.exec_command("ls -l /var/www/tradecareplus/node_modules | head -n 5")
        print("Node modules:")
        print(stdout.read().decode(errors='ignore'))
        
        # Check if build started?
        stdin, stdout, stderr = ssh.exec_command("ls -l /var/www/tradecareplus/.next")
        print(".next dir:")
        print(stdout.read().decode(errors='ignore'))
        
        ssh.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
