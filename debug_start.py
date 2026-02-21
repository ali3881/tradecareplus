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

        # Check node version
        run(ssh, "node -v")
        
        # Check npm version
        run(ssh, "npm -v")

        # Try to start app manually (timeout after 10s if it hangs meaning it works)
        log("\nAttempting manual start...")
        chan = ssh.invoke_shell()
        time.sleep(1)
        chan.send("cd /var/www/tradecareplus\n")
        chan.send("npm run start -- -p 3000\n")
        
        time.sleep(5)
        # Read whatever output
        if chan.recv_ready():
            print(chan.recv(4096).decode(errors='ignore'))
        
        # Kill it (Ctrl+C)
        chan.send("\x03")
        time.sleep(1)
        
        ssh.close()
    except Exception as e:
        log(f"Error: {e}")

if __name__ == "__main__":
    main()
