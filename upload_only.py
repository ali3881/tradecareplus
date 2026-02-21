import paramiko
import sys
import os

HOST = "72.60.199.129"
USER = "root"
PASS = "xpaRVJMTWuY+VbEms;N2"

def progress(transferred, total):
    print(f"Transferred: {transferred}/{total}", end='\r', flush=True)

def main():
    try:
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        print("Connecting...")
        ssh.connect(HOST, username=USER, password=PASS, allow_agent=False, look_for_keys=False)
        print("Connected.")
        
        sftp = ssh.open_sftp()
        local_path = "deploy.tar.gz"
        remote_path = "/var/www/tradecareplus/deploy.tar.gz"
        
        print(f"Uploading {local_path} to {remote_path}...")
        sftp.put(local_path, remote_path, callback=progress)
        print("\nUpload complete.")
        
        # Upload .env
        if os.path.exists(".env"):
            print("Uploading .env...")
            sftp.put(".env", "/var/www/tradecareplus/.env")
            print("Env uploaded.")
            
        sftp.close()
        ssh.close()
    except Exception as e:
        print(f"\nError: {e}")

if __name__ == "__main__":
    main()
