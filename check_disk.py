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
        
        # Check disk space
        stdin, stdout, stderr = ssh.exec_command("df -h /")
        print("Disk Usage:")
        print(stdout.read().decode())
        
        # Check if file exists
        stdin, stdout, stderr = ssh.exec_command("ls -l /var/www/tradecareplus/deploy.tar.gz")
        print("File check:")
        print(stdout.read().decode())
        print(stderr.read().decode())
        
        ssh.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
