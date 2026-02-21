import tarfile
import os
import paramiko
import sys

HOST = "72.60.199.129"
USER = "root"
PASS = "xpaRVJMTWuY+VbEms;N2"
LOCAL_DIR = r"C:\root\Documents\trae_projects\tradecareplus" # Adjusted for Windows env if needed, or use current cwd
# Actually, I am running in C:\root... so os.getcwd() is fine or relative "."

def make_tarfile(output_filename, source_dir):
    print(f"Creating {output_filename}...")
    with tarfile.open(output_filename, "w:gz") as tar:
        for root, dirs, files in os.walk(source_dir):
            # Exclusions
            dirs[:] = [d for d in dirs if d not in ['node_modules', '.next', '.git', '.vscode', '.idea']]
            
            for file in files:
                if file in ['deploy.tar.gz', '.env', 'pm2_error.log', 'npm-debug.log']:
                    continue
                if file.endswith('.py') or file.endswith('.txt'): # Skip my helper scripts/logs
                    continue
                    
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, source_dir)
                tar.add(file_path, arcname=arcname)
    print("Tarfile created.")

def main():
    try:
        # 1. Pack
        make_tarfile("deploy.tar.gz", ".")
        
        # 2. Upload
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        print("Connecting...")
        ssh.connect(HOST, username=USER, password=PASS, allow_agent=False, look_for_keys=False)
        print("Connected.")
        
        sftp = ssh.open_sftp()
        remote_dir = "/var/www/tradecareplus"
        
        # Ensure dir exists
        ssh.exec_command(f"mkdir -p {remote_dir}")
        
        print("Uploading deploy.tar.gz...")
        sftp.put("deploy.tar.gz", f"{remote_dir}/deploy.tar.gz")
        
        # Upload .env separately (securely)
        print("Uploading .env...")
        if os.path.exists(".env"):
            sftp.put(".env", f"{remote_dir}/.env")
        else:
            print("WARNING: Local .env not found!")
            
        sftp.close()
        
        # 3. Deploy
        print("Running deployment commands...")
        commands = [
            f"cd {remote_dir}",
            "tar -xzf deploy.tar.gz",
            "rm deploy.tar.gz",
            # Install system deps if missing
            "apt-get update && apt-get install -y nginx curl git build-essential",
            # Node 20 check
            "node -v || curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs",
            "npm install -g pm2",
            # App deps
            "npm install",
            "npx prisma generate",
            "npx prisma migrate deploy",
            # Build
            "npm run build",
            # PM2
            "pm2 delete tradecareplus || true",
            "pm2 start npm --name tradecareplus -- start -- -p 3000 -H 0.0.0.0",
            "pm2 save",
            "pm2 startup systemd -u root --hp /root || true", # Ensure startup
            "systemctl enable pm2-root || true"
        ]
        
        full_cmd = " && ".join(commands)
        
        # Use a wrapper to capture output and ensure it runs
        # We need to increase timeout for build
        stdin, stdout, stderr = ssh.exec_command(full_cmd, timeout=600)
        
        # Stream output
        while not stdout.channel.exit_status_ready():
            if stdout.channel.recv_ready():
                print(stdout.channel.recv(1024).decode(errors='ignore'), end="")
            if stderr.channel.recv_ready():
                print(stderr.channel.recv(1024).decode(errors='ignore'), end="")
        
        print("\n\nExit status:", stdout.channel.recv_exit_status())
        
        # 4. Nginx Config
        print("Configuring Nginx...")
        nginx_conf = """server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    client_max_body_size 100m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}"""
        sftp = ssh.open_sftp()
        with sftp.file("/etc/nginx/sites-available/tradecareplus", "w") as f:
            f.write(nginx_conf)
        sftp.close()
        
        ssh.exec_command("rm -f /etc/nginx/sites-enabled/default")
        ssh.exec_command("ln -sf /etc/nginx/sites-available/tradecareplus /etc/nginx/sites-enabled/tradecareplus")
        ssh.exec_command("nginx -t && systemctl restart nginx")
        
        # 5. Verify
        print("Verifying...")
        stdin, stdout, stderr = ssh.exec_command("curl -I http://127.0.0.1:3000")
        print("Local curl (3000):", stdout.read().decode(errors='ignore'))
        
        stdin, stdout, stderr = ssh.exec_command("curl -I http://127.0.0.1")
        print("Local curl (80):", stdout.read().decode(errors='ignore'))
        
        ssh.close()
        print("Done.")

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
