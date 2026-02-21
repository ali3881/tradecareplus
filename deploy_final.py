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

def main():
    try:
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        log("Connecting...")
        ssh.connect(HOST, username=USER, password=PASS, allow_agent=False, look_for_keys=False)
        log("Connected.")

        app_dir = "/var/www/tradecareplus"
        
        # Start build process in background with logging
        build_cmd = f"cd {app_dir} && (npm install && npx prisma generate && npx prisma migrate deploy && npm run build) > build.log 2>&1"
        log(f"Starting build: {build_cmd}")
        
        # Use nohup to detach
        ssh.exec_command(f"nohup sh -c '{build_cmd}' &")
        
        # Tail the log file
        log("Tailing build.log...")
        time.sleep(2)
        
        offset = 0
        while True:
            stdin, stdout, stderr = ssh.exec_command(f"tail -n +{offset+1} {app_dir}/build.log")
            new_lines = stdout.read().decode(errors='ignore')
            if new_lines:
                log(new_lines.strip())
                offset += len(new_lines.splitlines())
            
            # Check if build finished (by checking if node process for build is gone or specific success message)
            # Actually, let's just check for "Compiled successfully" or error
            if "Compiled successfully" in new_lines:
                log("Build SUCCESS!")
                break
            if "ERR!" in new_lines or "Error:" in new_lines:
                # Don't break immediately, let it finish printing
                pass
            
            # Check if process is still running
            stdin, stdout, stderr = ssh.exec_command("pgrep -f 'npm run build' || pgrep -f 'next build'")
            if not stdout.read().strip():
                # Process finished
                log("Build process finished.")
                break
            
            time.sleep(5)
            
        # Verify Build ID
        stdin, stdout, stderr = ssh.exec_command(f"cat {app_dir}/.next/BUILD_ID")
        build_id = stdout.read().decode().strip()
        if not build_id:
            log("Build FAILED: No BUILD_ID found.")
            # Print last lines of log
            stdin, stdout, stderr = ssh.exec_command(f"tail -n 20 {app_dir}/build.log")
            log(stdout.read().decode(errors='ignore'))
            sys.exit(1)
        
        log(f"Build ID: {build_id}")
        
        # Start App
        log("Starting App...")
        ssh.exec_command("pm2 delete tradecareplus || true")
        ssh.exec_command(f"cd {app_dir} && pm2 start npm --name tradecareplus -- start -- -p 3000 -H 0.0.0.0")
        ssh.exec_command("pm2 save")
        
        time.sleep(5)
        
        # Verify
        stdin, stdout, stderr = ssh.exec_command("curl -I http://127.0.0.1:3000")
        log(stdout.read().decode(errors='ignore'))
        
        ssh.close()

    except Exception as e:
        log(f"Error: {e}")

if __name__ == "__main__":
    main()
