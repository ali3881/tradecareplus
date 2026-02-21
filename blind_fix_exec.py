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

        cmd = "pm2 delete all; cd /var/www/tradecareplus && pm2 start 'npm run start -- -p 3000 -H 0.0.0.0' --name tradecareplus && pm2 save && systemctl restart nginx"
        print(f"Executing: {cmd}", flush=True)
        
        # Use get_pty=True as it worked before
        stdin, stdout, stderr = ssh.exec_command(cmd, get_pty=True)
        
        # Wait a bit without reading
        time.sleep(10)
        
        # Try to read a little bit just to see if it finished
        if stdout.channel.recv_ready():
            print("Output:", stdout.read(1024).decode(errors='ignore'), flush=True)
        
        ssh.close()
        print("Done.", flush=True)

    except Exception as e:
        print(f"Error: {e}", flush=True)

if __name__ == "__main__":
    main()
