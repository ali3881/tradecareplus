import paramiko
import sys
import base64
import os
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
        print("Connected.")
        
        remote_dir = "/var/www/tradecareplus"
        ssh.exec_command(f"mkdir -p {remote_dir}")
        
        # 1. Upload via Base64 stream
        print("Reading file...")
        with open("deploy.tar.gz", "rb") as f:
            data = f.read()
            
        print("Encoding...")
        b64_data = base64.b64encode(data)
        
        print(f"Uploading {len(b64_data)} bytes via stdin...")
        
        # Open channel
        transport = ssh.get_transport()
        chan = transport.open_session()
        chan.exec_command(f"cat > {remote_dir}/deploy.tar.gz.b64")
        
        # Send data in chunks
        chunk_size = 32768
        total_sent = 0
        for i in range(0, len(b64_data), chunk_size):
            chunk = b64_data[i:i+chunk_size]
            chan.send(chunk)
            total_sent += len(chunk)
            print(f"Sent {total_sent}/{len(b64_data)}", end='\r')
            
        chan.shutdown_write()
        print("\nUpload complete. Waiting for exit...")
        exit_status = chan.recv_exit_status()
        if exit_status != 0:
            print("Upload failed!")
            sys.exit(1)
            
        print("Decoding on server...")
        ssh.exec_command(f"cd {remote_dir} && base64 -d deploy.tar.gz.b64 > deploy.tar.gz && rm deploy.tar.gz.b64")
        
        # Upload .env (small enough for sftp or just cat)
        if os.path.exists(".env"):
            print("Uploading .env...")
            with open(".env", "r") as f:
                env_content = f.read()
            # Escape quotes? Actually assume env is simple KEY=VALUE
            # Safer to use sftp for small file
            sftp = ssh.open_sftp()
            sftp.put(".env", f"{remote_dir}/.env")
            sftp.close()
            
        # Deploy
        print("Deploying...")
        deploy_cmds = [
            f"cd {remote_dir}",
            "tar -xzf deploy.tar.gz",
            "rm deploy.tar.gz",
            # Install system deps
            "apt-get update && apt-get install -y nginx curl git build-essential",
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
            "pm2 startup systemd -u root --hp /root || true",
            "systemctl enable pm2-root || true"
        ]
        
        full_deploy_cmd = " && ".join(deploy_cmds)
        
        # Execute
        stdin, stdout, stderr = ssh.exec_command(full_deploy_cmd, timeout=900)
        
        while not stdout.channel.exit_status_ready():
            if stdout.channel.recv_ready():
                print(stdout.channel.recv(1024).decode(errors='ignore'), end="")
            if stderr.channel.recv_ready():
                print(stderr.channel.recv(1024).decode(errors='ignore'), end="")
                
        print("\n\nExit code:", stdout.channel.recv_exit_status())
        
        # Nginx
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
        
        # Verify
        print("Verifying...")
        stdin, stdout, stderr = ssh.exec_command("curl -I http://127.0.0.1:3000")
        print("Local curl (3000):", stdout.read().decode(errors='ignore'))
        
        stdin, stdout, stderr = ssh.exec_command("curl -I http://127.0.0.1")
        print("Local curl (80):", stdout.read().decode(errors='ignore'))
        
        ssh.close()
        print("Done.")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
