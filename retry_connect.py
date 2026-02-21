import paramiko
import sys
import time

HOST = "72.60.199.129"
USER = "root"
PASS = "xpaRVJMTWuY+VbEms;N2"

def main():
    print("Starting loop...")
    for i in range(5):
        try:
            print(f"Attempt {i+1}...")
            ssh = paramiko.SSHClient()
            ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            ssh.connect(HOST, username=USER, password=PASS, allow_agent=False, look_for_keys=False, timeout=10)
            
            print("Connected!")
            stdin, stdout, stderr = ssh.exec_command("curl -I http://127.0.0.1:3000")
            out = stdout.read().decode(errors='ignore')
            print("Output:", out)
            
            if "HTTP/1.1 200" in out or "HTTP/1.1 308" in out:
                print("SUCCESS")
                ssh.close()
                return
            
            ssh.close()
        except Exception as e:
            print(f"Error: {e}")
        
        time.sleep(10)

if __name__ == "__main__":
    main()
