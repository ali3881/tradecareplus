const SSH2Promise = require('ssh2-promise');

const config = {
  host: '72.60.199.129',
  username: 'root',
  password: 'xpaRVJMTWuY+VbEms;N2',
  tryKeyboard: true,
};

async function fix() {
  const ssh = new SSH2Promise(config);
  try {
    await ssh.connect();
    console.log('Connected!');

    // 1. Check Memory & Add Swap if needed
    console.log('--- Checking Memory ---');
    const free = await ssh.exec('free -h');
    console.log(free);

    const swap = await ssh.exec('swapon --show');
    if (!swap) {
        console.log('--- Adding 1GB Swap ---');
        await ssh.exec('fallocate -l 1G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=1024');
        await ssh.exec('chmod 600 /swapfile');
        await ssh.exec('mkswap /swapfile');
        await ssh.exec('swapon /swapfile');
        console.log('Swap added.');
    } else {
        console.log('Swap exists.');
    }

    // 2. Run Build
    console.log('--- Running Build (this may take time) ---');
    // We use spawn to stream output so we can see progress/errors
    const stream = await ssh.spawn('cd /var/www/tradecareplus && npm run build');
    
    stream.on('data', (data) => {
        process.stdout.write(data.toString());
    });
    
    stream.on('error', (err) => {
        console.error('Build Stream Error:', err);
    });

    await new Promise((resolve, reject) => {
        stream.on('close', (code) => {
            if (code === 0) resolve();
            else reject(new Error(`Build failed with code ${code}`));
        });
    });

    // 3. Restart PM2
    console.log('\n--- Restarting App ---');
    await ssh.exec('pm2 restart tradecareplus');
    
    console.log('--- Verifying ---');
    await new Promise(r => setTimeout(r, 5000)); // Wait for start
    
    const status = await ssh.exec('pm2 status');
    console.log(status);
    
    const curl = await ssh.exec('curl -I http://127.0.0.1:3000');
    console.log(curl);

  } catch (error) {
    console.error('Fix Failed:', error);
  } finally {
    await ssh.close();
  }
}

fix();
