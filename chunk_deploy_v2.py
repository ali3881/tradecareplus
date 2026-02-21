import paramiko
import sys
import os
import time

HOST = "72.60.199.129"
USER = "root"
PASS = "xpaRVJMTWuY+VbEms;N2"
CHUNK_SIZE = 512 * 1024 # 512KB

def main():
    try:
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        print("Connecting...")
        ssh.connect(HOST, username=USER, password=PASS, allow_agent=False, look_for_keys=False)
        print("Connected.")
        
        sftp = ssh.open_sftp()
        remote_dir = "/var/www/tradecareplus"
        ssh.exec_command(f"mkdir -p {remote_dir}")
        
        file_size = os.path.getsize("deploy.tar.gz")
        print(f"File size: {file_size}")
        
        with open("deploy.tar.gz", "rb") as f:
            chunk_num = 0
            while True:
                data = f.read(CHUNK_SIZE)
                if not data:
                    break
                
                chunk_name = f"deploy.part{chunk_num:03d}"
                remote_path = f"{remote_dir}/{chunk_name}"
                # Only upload if not exists or size differs? No, overwrite to be safe.
                # But checking might save time if we resume.
                # Let's just upload.
                
                t0 = time.time()
                with sftp.file(remote_path, "wb") as remote_f:
                    remote_f.write(data)
                dt = time.time() - t0
                print(f"Uploaded {chunk_name} ({len(data)} bytes) in {dt:.2f}s")
                
                chunk_num += 1
        
        print("Chunks uploaded. Reassembling...")
        cmd = f"cd {remote_dir} && cat deploy.part* > deploy.tar.gz && rm deploy.part*"
        stdin, stdout, stderr = ssh.exec_command(cmd)
        exit_status = stdout.channel.recv_exit_status()
        if exit_status == 0:
            print("Reassembly successful.")
        else:
            print("Reassembly failed.")
            print(stderr.read().decode())
            sys.exit(1)
            
        # Upload .env
        if os.path.exists(".env"):
            print("Uploading .env...")
            sftp.put(".env", f"{remote_dir}/.env")
            
        sftp.close()
        
        # Deploy
        print("Deploying...")
        deploy_cmds = [
            f"cd {remote_dir}",
            "tar -xzf deploy.tar.gz",
            "rm deploy.tar.gz",
            "apt-get update && apt-get install -y nginx curl git build-essential",
            "node -v || curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs",
            "npm install -g pm2",
            "npm install",
            "npx prisma generate",
            "npx prisma migrate deploy",
            "npm run build",
            "pm2 delete tradecareplus || true",
            "pm2 start npm --name tradecareplus -- start -- -p 3000 -H 0.0.0.0",
            "pm2 save",
            "systemctl restart nginx"
        ]
        
        full_deploy_cmd = " && ".join(deploy_cmds)
        
        stdin, stdout, stderr = ssh.exec_command(full_deploy_cmd, timeout=1200) # 20 mins
        
        while not stdout.channel.exit_status_ready():
            if stdout.channel.recv_ready():
                print(stdout.channel.recv(1024).decode(errors='ignore'), end="")
            if stderr.channel.recv_ready():
                print(stderr.channel.recv(1024).decode(errors='ignore'), end="")
                
        print("\n\nExit code:", stdout.channel.recv_exit_status())
        
        # Nginx config
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
        
        print("Done.")
        ssh.close()

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
