const SSH2Promise = require('ssh2-promise');

const config = {
  host: '72.60.199.129',
  username: 'root',
  password: 'xpaRVJMTWuY+VbEms;N2',
  tryKeyboard: true,
};

async function restart() {
  const ssh = new SSH2Promise(config);
  try {
    await ssh.connect();
    console.log('Restarting...');
    await ssh.exec('pm2 restart tradecareplus');
    
    console.log('Checking status...');
    await new Promise(r => setTimeout(r, 5000));
    
    const status = await ssh.exec('pm2 status');
    console.log(status);
    
    const curl = await ssh.exec('curl -I http://127.0.0.1:3000');
    console.log(curl);

  } catch (error) {
    console.error(error);
  } finally {
    await ssh.close();
  }
}

restart();
