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
        
        stdin, stdout, stderr = ssh.exec_command("pgrep -f 'npm run build'")
        pid = stdout.read().strip()
        if pid:
            print(f"Build running (PID {pid.decode()})...")
        else:
            print("Build process NOT running.")
            
        print("Last 20 lines of build.log:")
        stdin, stdout, stderr = ssh.exec_command("tail -n 20 /var/www/tradecareplus/build.log")
        print(stdout.read().decode(errors='ignore'))
        
        ssh.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
