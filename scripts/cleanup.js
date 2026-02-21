const SSH2Promise = require('ssh2-promise');

const config = {
  host: '72.60.199.129',
  username: 'root',
  password: 'xpaRVJMTWuY+VbEms;N2',
  tryKeyboard: true,
};

async function cleanup() {
  const ssh = new SSH2Promise(config);
  try {
    await ssh.connect();
    
    console.log('--- Cleaning up ---');
    try { await ssh.exec('pm2 delete hello'); } catch(e) { console.log('hello not running'); }
    
    console.log('--- Restarting tradecareplus ---');
    await ssh.exec('pm2 restart tradecareplus');
    
    console.log('Waiting...');
    await new Promise(r => setTimeout(r, 5000));
    
    console.log('--- Curl ---');
    const curl = await ssh.exec('curl -I http://127.0.0.1:3000');
    console.log(curl);

  } catch (error) {
    console.error(error);
  } finally {
    await ssh.close();
  }
}

cleanup();
