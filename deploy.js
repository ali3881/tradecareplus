const SSH2Promise = require('ssh2-promise');
const { exec } = require('child_process');
const fs = require('fs');
const util = require('util');
const execPromise = util.promisify(exec);

const config = {
  host: '72.60.199.129',
  username: 'root',
  password: 'xpaRVJMTWuY+VbEms;N2',
  tryKeyboard: true,
};

async function deploy() {
  const ssh = new SSH2Promise(config);

  try {
    console.log('--- Step 1: Creating Deployment Archive ---');
    // Create tarball excluding heavy/unnecessary folders
    // Windows tar (bsdtar) supports --exclude
    await execPromise('tar -czf deploy.tar.gz --exclude node_modules --exclude .next --exclude .git --exclude .env .');
    console.log('Archive created: deploy.tar.gz');

    console.log('--- Step 2: Connecting to VPS ---');
    await ssh.connect();
    console.log('Connected!');

    console.log('--- Step 3: Uploading Files ---');
    const sftp = ssh.sftp();
    
    console.log('Uploading deploy.tar.gz...');
    await sftp.fastPut('deploy.tar.gz', '/tmp/deploy.tar.gz');
    
    console.log('Uploading setup_remote.sh...');
    await sftp.fastPut('deploy/setup_remote.sh', '/tmp/setup_remote.sh');
    
    console.log('Uploading nginx.conf...');
    await sftp.fastPut('deploy/nginx.conf', '/tmp/nginx.conf');

    console.log('--- Step 4: Executing Remote Setup ---');
    // Using .exec to stream output would be better, but simple exec works if we wait
    // We'll use a custom exec function to stream logs if possible, or just wait.
    // ssh2-promise exec returns a promise that resolves with stdout.
    
    // We need to make the script executable first
    await ssh.exec('chmod +x /tmp/setup_remote.sh');
    
    // Now run it. This might take a while.
    console.log('Running setup script on VPS (this may take a few minutes)...');
    
    // We use stream to get real-time output
    const stream = await ssh.spawn('bash /tmp/setup_remote.sh');
    
    stream.on('data', (data) => {
      process.stdout.write(data.toString());
    });
    
    stream.on('error', (err) => {
      console.error('Remote Script Error:', err);
    });

    // Wait for stream to close
    await new Promise((resolve, reject) => {
      stream.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`Remote script exited with code ${code}`));
      });
    });

    console.log('\n--- Deployment Complete! ---');
    console.log(`Visit http://${config.host} to see your site.`);

  } catch (error) {
    console.error('Deployment Failed:', error);
  } finally {
    // Cleanup local tar
    if (fs.existsSync('deploy.tar.gz')) {
      fs.unlinkSync('deploy.tar.gz');
    }
    await ssh.close();
  }
}

deploy();
