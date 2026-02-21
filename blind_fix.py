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
        print("Connecting...", flush=True)
        ssh.connect(HOST, username=USER, password=PASS, allow_agent=False, look_for_keys=False)
        print("Connected.", flush=True)

        chan = ssh.invoke_shell()
        time.sleep(1)
        
        commands = [
            "pm2 delete all",
            "cd /var/www/tradecareplus",
            "pm2 start \"npm run start -- -p 3000 -H 0.0.0.0\" --name tradecareplus",
            "pm2 save",
            "systemctl restart nginx",
            "exit"
        ]
        
        for cmd in commands:
            print(f"Sending: {cmd}", flush=True)
            chan.send(cmd + "\n")
            time.sleep(2) # Give some time for each command
        
        print("Waiting 10s...", flush=True)
        time.sleep(10)
        ssh.close()
        print("Done.", flush=True)

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
