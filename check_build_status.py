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
        print("Connecting...")
        ssh.connect(HOST, username=USER, password=PASS, allow_agent=False, look_for_keys=False)
        
        remote_dir = "/var/www/tradecareplus"
        
        # Check if build running
        stdin, stdout, stderr = ssh.exec_command("pgrep -f 'npm run build'")
        pid = stdout.read().strip()
        if pid:
            print(f"Build running (PID {pid.decode()})...")
        else:
            print("Build NOT running.")
            # Check last lines of build log
            stdin, stdout, stderr = ssh.exec_command(f"tail -n 50 {remote_dir}/build.log")
            print("Last 50 lines of build.log:")
            print(stdout.read().decode(errors='ignore'))
            
            # If not running, maybe finished? Check .next/BUILD_ID
            stdin, stdout, stderr = ssh.exec_command(f"cat {remote_dir}/.next/BUILD_ID")
            bid = stdout.read().decode().strip()
            if bid:
                print(f"Build ID found: {bid}")
                # Start PM2
                print("Starting PM2...")
                ssh.exec_command("pm2 delete tradecareplus || true")
                ssh.exec_command(f"cd {remote_dir} && pm2 start npm --name tradecareplus -- start -- -p 3000 -H 0.0.0.0")
                ssh.exec_command("pm2 save")
                time.sleep(5)
                stdin, stdout, stderr = ssh.exec_command("curl -I http://127.0.0.1:3000")
                print("Curl 3000:")
                print(stdout.read().decode(errors='ignore'))
            else:
                print("Build failed (no BUILD_ID).")
                # Try to run build again? No, check log first.
        
        ssh.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
