const SSH2Promise = require('ssh2-promise');

const config = {
  host: '72.60.199.129',
  username: 'root',
  password: 'xpaRVJMTWuY+VbEms;N2',
  tryKeyboard: true,
};

async function fixBinding() {
  const ssh = new SSH2Promise(config);
  try {
    await ssh.connect();
    console.log('Connected!');

    console.log('Stopping all PM2 processes...');
    await ssh.exec('pm2 delete all || true');

    console.log('Starting tradecareplus on IPv4...');
    // We need to be in the directory
    await ssh.exec('cd /var/www/tradecareplus && pm2 start "npm run start -- -H 0.0.0.0 -p 3000" --name tradecareplus');
    
    console.log('Saving PM2 list...');
    await ssh.exec('pm2 save');

    console.log('Waiting for start...');
    await new Promise(r => setTimeout(r, 5000));

    console.log('--- Netstat ---');
    const net = await ssh.exec('netstat -tuln | grep 3000');
    console.log(net);

    console.log('--- Curl Localhost ---');
    const curl = await ssh.exec('curl -I http://127.0.0.1:3000');
    console.log(curl);

  } catch (error) {
    console.error('Fix Binding Failed:', error);
  } finally {
    await ssh.close();
  }
}

fixBinding();
