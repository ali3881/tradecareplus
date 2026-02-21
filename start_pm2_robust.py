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

def run_blind(ssh, cmd):
    log(f"Sending: {cmd}")
    ssh.exec_command(cmd) # Fire and forget-ish (no pty, no read)
    # But wait a bit?
    # Actually exec_command returns channels. If we don't read them, they might block if buffer fills.
    # So we should read them or ignore them.
    # Best practice: redirect on server side.
    
def run_and_read_file(ssh, cmd, outfile):
    full_cmd = f"{cmd} > {outfile} 2>&1"
    log(f"Running: {full_cmd}")
    stdin, stdout, stderr = ssh.exec_command(full_cmd)
    exit_status = stdout.channel.recv_exit_status() # Wait for finish
    
    # Read output file
    sftp = ssh.open_sftp()
    try:
        with sftp.file(outfile, "r") as f:
            content = f.read().decode(errors='ignore')
            log(f"OUTPUT ({outfile}):\n{content}")
    except Exception as e:
        log(f"Failed to read {outfile}: {e}")
    sftp.close()

def main():
    try:
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        log("Connecting...")
        ssh.connect(HOST, username=USER, password=PASS, allow_agent=False, look_for_keys=False)
        log("Connected.")

        # 1. Stop existing
        run_and_read_file(ssh, "pm2 delete tradecareplus || true", "/tmp/pm2_del.log")
        
        # 2. Start with forced host
        # Using full path for pm2 just in case: `which pm2`?
        # Assuming pm2 is in PATH.
        # We need to use `npm start` command.
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
