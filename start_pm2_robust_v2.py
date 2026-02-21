import paramiko
import sys
import time

HOST = "72.60.199.129"
USER = "root"
PASS = "xpaRVJMTWuY+VbEms;N2"

def log(msg):
    try:
        print(msg, flush=True)
    except:
        pass

def run_and_read_file(ssh, cmd, outfile):
    # Use timeout to prevent hanging forever
    full_cmd = f"timeout 20s {cmd} > {outfile} 2>&1"
    log(f"Running: {full_cmd}")
    stdin, stdout, stderr = ssh.exec_command(full_cmd)
    exit_status = stdout.channel.recv_exit_status() # Wait for finish
    
    # Read output file via SFTP
    try:
        sftp = ssh.open_sftp()
        with sftp.file(outfile, "r") as f:
            content = f.read().decode(errors='ignore')
            log(f"OUTPUT ({outfile}):\n{content}")
        sftp.close()
    except Exception as e:
        log(f"Failed to read {outfile}: {e}")

def main():
    try:
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        log("Connecting...")
        ssh.connect(HOST, username=USER, password=PASS, allow_agent=False, look_for_keys=False)
        log("Connected.")

        # 1. Stop existing (with timeout)
        run_and_read_file(ssh, "pm2 delete tradecareplus || true", "/tmp/pm2_del.log")
        
        # 2. Start (with timeout? No, start returns quickly)
        # But if it hangs, timeout saves us.
        # We need to make sure pm2 daemon doesn't keep it open.
        # PM2 start should be quick.
        start_cmd = 'cd /var/www/tradecareplus && pm2 start "npm run start -- -p 3000 -H 0.0.0.0" --name tradecareplus'
        run_and_read_file(ssh, start_cmd, "/tmp/pm2_start.log")
        
        # 3. Save
        run_and_read_file(ssh, "pm2 save", "/tmp/pm2_save.log")
        
        # 4. Wait
        log("Waiting 10s...")
        time.sleep(10)
        
        # 5. Verify local
        run_and_read_file(ssh, "curl -I http://127.0.0.1:3000", "/tmp/curl_local.log")
        
        # 6. Verify nginx
        run_and_read_file(ssh, "curl -I http://127.0.0.1", "/tmp/curl_nginx.log")

        ssh.close()
    except Exception as e:
        log(f"Error: {e}")

if __name__ == "__main__":
    main()
