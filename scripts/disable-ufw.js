const SSH2Promise = require('ssh2-promise');

const config = {
  host: '72.60.199.129',
  username: 'root',
  password: 'xpaRVJMTWuY+VbEms;N2',
  tryKeyboard: true,
};

async function disableUfw() {
  const ssh = new SSH2Promise(config);
  try {
    await ssh.connect();
    
    console.log('--- Disabling Firewall ---');
    await ssh.exec('ufw disable');
    await ssh.exec('iptables -F'); // Flush all rules
    
    console.log('--- Restarting Nginx ---');
    await ssh.exec('systemctl restart nginx');
    
    console.log('--- Waiting ---');
    await new Promise(r => setTimeout(r, 2000));
    
    console.log('--- Curl App ---');
    const curl = await ssh.exec('curl -I http://127.0.0.1:3000');
    console.log(curl);

  } catch (error) {
    console.error(error);
  } finally {
    await ssh.close();
  }
}

disableUfw();
