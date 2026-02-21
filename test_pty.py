import paramiko
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

        stdin, stdout, stderr = ssh.exec_command("echo hello", get_pty=True)
        print("STDOUT:", stdout.read().decode().strip(), flush=True)
        
        ssh.close()
    except Exception as e:
        print(f"Error: {e}", flush=True)

if __name__ == "__main__":
    main()
