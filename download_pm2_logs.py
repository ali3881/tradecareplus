import paramiko
import sys
import os

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

        sftp = ssh.open_sftp()
        try:
            sftp.get("/root/.pm2/logs/tradecareplus-error.log", "pm2_error.log")
            print("PM2 error log downloaded.", flush=True)
        except Exception as e:
            print(f"Failed to download PM2 error log: {e}", flush=True)
            
        try:
            sftp.get("/root/.pm2/logs/tradecareplus-out.log", "pm2_out.log")
            print("PM2 out log downloaded.", flush=True)
        except Exception as e:
            print(f"Failed to download PM2 out log: {e}", flush=True)

        sftp.close()
        ssh.close()
    except Exception as e:
        print(f"Error: {e}", flush=True)

if __name__ == "__main__":
    main()
