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
        log_file = f"{remote_dir}/build_all.log"
        
        start_time = time.time()
        success = False
        
        while time.time() - start_time < 900: # 15 mins
            stdin, stdout, stderr = ssh.exec_command(f"tail -n 20 {log_file}")
            log_tail = stdout.read().decode(errors='ignore')
            print("--- LOG TAIL ---")
            print(log_tail)
            
            # Check for build success indicators
            if "Compiled successfully" in log_tail or "Build ID" in log_tail:
                # Double check BUILD_ID file
                stdin, stdout, stderr = ssh.exec_command(f"cat {remote_dir}/.next/BUILD_ID")
                bid = stdout.read().decode().strip()
                if bid:
                    print(f"Build SUCCESS confirmed. ID: {bid}")
                    success = True
                    break
            
            # Check for failure
            if "npm ERR!" in log_tail:
                print("Build FAILED detected in log.")
                break
                
            time.sleep(30)
            
        if success:
            print("Starting PM2...")
            ssh.exec_command("pm2 delete tradecareplus || true")
            ssh.exec_command(f"cd {remote_dir} && pm2 start npm --name tradecareplus -- start -- -p 3000 -H 0.0.0.0")
            ssh.exec_command("pm2 save")
            ssh.exec_command("systemctl restart nginx")
            
            time.sleep(10)
            stdin, stdout, stderr = ssh.exec_command("curl -I http://127.0.0.1:3000")
            print("Curl 3000:")
            print(stdout.read().decode(errors='ignore'))
            
            print("DONE.")
        else:
            print("Timed out or failed.")
            
        ssh.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
