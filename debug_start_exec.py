import paramiko
import sys
import time

HOST = "72.60.199.129"
USER = "root"
PASS = "xpaRVJMTWuY+VbEms;N2"

def log(msg):
    print(msg, flush=True)

def run(ssh, cmd):
    log(f"\nRunning: {cmd}")
    stdin, stdout, stderr = ssh.exec_command(cmd, get_pty=True)
    out = stdout.read().decode(errors='ignore').strip()
    if out: log(f"OUTPUT:\n{out}")
    return out

def main():
    try:
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        log("Connecting...")
        ssh.connect(HOST, username=USER, password=PASS, allow_agent=False, look_for_keys=False)
        log("Connected.")

        # Try to run start with timeout to see output
        run(ssh, "cd /var/www/tradecareplus && timeout 5s npm run start -- -p 3000")
        
        ssh.close()
    except Exception as e:
        log(f"Error: {e}")

if __name__ == "__main__":
    main()
