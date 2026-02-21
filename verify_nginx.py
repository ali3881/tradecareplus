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

        commands = [
            "curl -I http://127.0.0.1:3000",
            "curl -I http://127.0.0.1",
            "tail -n 20 /var/log/nginx/error.log"
        ]

        for cmd in commands:
            print(f"\nRunning: {cmd}")
            stdin, stdout, stderr = ssh.exec_command(cmd)
            print("STDOUT:", stdout.read().decode().strip())
            print("STDERR:", stderr.read().decode().strip())

        ssh.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
