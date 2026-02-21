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

        cmds = [
            "cd /var/www/tradecareplus",
            "npm install",
            "npx prisma generate",
            "npm run build",
            "pm2 delete all",
            "pm2 start 'npm run start -- -p 3000 -H 0.0.0.0' --name tradecareplus",
            "pm2 save"
        ]
        
        full_cmd = " && ".join(cmds)
        print(f"Executing massive chain: {full_cmd}", flush=True)
        
        # Use nohup to ensure it runs even if we disconnect or timeout
        final_cmd = f"nohup sh -c '{full_cmd}' > /tmp/rebuild.log 2>&1 &"
        
        ssh.exec_command(final_cmd, get_pty=True)
        
        print("Command sent. Waiting 60s...", flush=True)
        time.sleep(60)
        
        ssh.close()
        print("Done.", flush=True)

    except Exception as e:
        print(f"Error: {e}", flush=True)

if __name__ == "__main__":
    main()
