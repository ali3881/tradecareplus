const SSH2Promise = require('ssh2-promise');

const config = {
  host: '72.60.199.129',
  username: 'root',
  password: 'xpaRVJMTWuY+VbEms;N2',
  tryKeyboard: true,
};

async function fixFirewall() {
  const ssh = new SSH2Promise(config);
  try {
    await ssh.connect();
    
    console.log('--- UFW Fix ---');
    await ssh.exec('ufw allow 3000'); // Allow external (for testing)
    await ssh.exec('ufw allow from 127.0.0.1');
    await ssh.exec('ufw reload');
    
    console.log('--- Restart Nginx ---');
    await ssh.exec('systemctl restart nginx');
    
    console.log('--- Curl ---');
    const curl = await ssh.exec('curl -I http://127.0.0.1:3000');
    console.log(curl);

  } catch (error) {
    console.error(error);
  } finally {
    await ssh.close();
  }
}

fixFirewall();
