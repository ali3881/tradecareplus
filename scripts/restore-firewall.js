const SSH2Promise = require('ssh2-promise');

const config = {
  host: '72.60.199.129',
  username: 'root',
  password: 'xpaRVJMTWuY+VbEms;N2',
  tryKeyboard: true,
};

async function restoreFirewall() {
  const ssh = new SSH2Promise(config);
  try {
    await ssh.connect();
    
    console.log('--- Restoring Firewall ---');
    await ssh.exec('ufw enable');
    await ssh.exec('ufw allow 80');
    await ssh.exec('ufw allow 22');
    await ssh.exec('ufw allow 3000'); // Keep 3000 for debug
    
  } catch (error) {
    console.error(error);
  } finally {
    await ssh.close();
  }
}

restoreFirewall();
