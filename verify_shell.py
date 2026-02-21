import paramiko
import time
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

        chan = ssh.invoke_shell()
        print("Shell invoked.")
        
        # Wait for shell prompt
        time.sleep(2)
        while chan.recv_ready():
            print("Initial shell output:", chan.recv(1024).decode(errors='ignore'))

        commands = [
            "curl -I http://127.0.0.1:3000",
            "curl -I http://127.0.0.1",
            "nginx -T | grep 'server_name'",
            "exit"
        ]

        for cmd in commands:
            print(f"Sending: {cmd}")
            chan.send(cmd + "\n")
            time.sleep(2)
            while chan.recv_ready():
                print("Output:", chan.recv(1024).decode(errors='ignore'))
        
        ssh.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
