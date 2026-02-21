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
        print("Connecting...", flush=True)
        ssh.connect(HOST, username=USER, password=PASS, allow_agent=False, look_for_keys=False)
        print("Connected.", flush=True)

        chan = ssh.invoke_shell()
        # Wait for prompt
        time.sleep(2)
        if chan.recv_ready():
            print("Shell ready:", chan.recv(1024).decode(errors='ignore'))
        
        commands = [
            "cd /var/www/tradecareplus",
            "pm2 stop tradecareplus",
            "npm ci",
            "npx prisma generate",
            "npm run build",
            "pm2 restart tradecareplus || pm2 start 'npm run start -- -p 3000' --name tradecareplus",
            "pm2 save"
        ]

        for cmd in commands:
            print(f"Sending: {cmd}", flush=True)
            chan.send(cmd + "\n")
            # Wait for command to potentially finish. npm ci and build take time.
            # We will read output in a loop
            start_time = time.time()
            while time.time() - start_time < 60: # Wait up to 60s per command (build might take longer though)
                if chan.recv_ready():
                    out = chan.recv(4096).decode(errors='ignore')
                    print(out, end="", flush=True)
                    # Heuristic to detect command completion? Shell prompt?
                    if "root@" in out or "#" in out: # Assuming prompt ends with #
                        # But output might contain # too.
                        # Just a simple heuristic to not wait forever if it's quick
                        pass
                time.sleep(1)
            
            # For build, we might need more time
            if "build" in cmd or "install" in cmd or "ci" in cmd:
                 print("\nWaiting extra time for build/install...", flush=True)
                 time.sleep(60)
                 while chan.recv_ready():
                    print(chan.recv(4096).decode(errors='ignore'), end="", flush=True)

        ssh.close()
        print("\nDone.", flush=True)

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
