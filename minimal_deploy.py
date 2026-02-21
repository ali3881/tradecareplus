import tarfile
import os
import paramiko
import sys
import time

HOST = "72.60.199.129"
USER = "root"
PASS = "xpaRVJMTWuY+VbEms;N2"

def make_minimal_tar(output_filename, source_dir):
    print(f"Creating {output_filename}...")
    with tarfile.open(output_filename, "w:gz") as tar:
        for root, dirs, files in os.walk(source_dir):
            dirs[:] = [d for d in dirs if d not in ['node_modules', '.next', '.git', 'public', '.vscode']]
            
            for file in files:
                if file.endswith('.tar.gz') or file.endswith('.py') or file.endswith('.log') or file.endswith('.txt'):
                    continue
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, source_dir)
                tar.add(file_path, arcname=arcname)
    print("Minimal tar created.")

def main():
    try:
        make_minimal_tar("deploy_minimal.tar.gz", ".")
        
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        print("Connecting...")
        ssh.connect(HOST, username=USER, password=PASS, allow_agent=False, look_for_keys=False)
        
        sftp = ssh.open_sftp()
        remote_dir = "/var/www/tradecareplus"
        ssh.exec_command(f"mkdir -p {remote_dir}")
        
        print("Uploading deploy_minimal.tar.gz...")
        sftp.put("deploy_minimal.tar.gz", f"{remote_dir}/deploy_minimal.tar.gz")
        
        if os.path.exists(".env"):
            sftp.put(".env", f"{remote_dir}/.env")
            
        sftp.close()
        
        print("Deploying minimal...")
        cmds = [
            f"cd {remote_dir}",
            "tar -xzf deploy_minimal.tar.gz",
            "rm deploy_minimal.tar.gz",
            # Ensure public dir exists so build doesn't crash if it expects it
            "mkdir -p public", 
            # Install deps
            "npm install",
            "npx prisma generate",
            "npx prisma migrate deploy",
            # Build
            "npm run build",
            # Start
            "pm2 delete tradecareplus || true",
            "pm2 start npm --name tradecareplus -- start -- -p 3000 -H 0.0.0.0",
            "pm2 save",
            "systemctl restart nginx"
        ]
        
        full_cmd = " && ".join(cmds)
        stdin, stdout, stderr = ssh.exec_command(full_cmd, timeout=600)
        
        while not stdout.channel.exit_status_ready():
            if stdout.channel.recv_ready():
                print(stdout.channel.recv(1024).decode(errors='ignore'), end="")
            if stderr.channel.recv_ready():
                print(stderr.channel.recv(1024).decode(errors='ignore'), end="")
        
        print("\n\nExit:", stdout.channel.recv_exit_status())
        
        # Verify
        stdin, stdout, stderr = ssh.exec_command("curl -I http://127.0.0.1:3000")
        print("Curl 3000:", stdout.read().decode())
        
        ssh.close()

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
