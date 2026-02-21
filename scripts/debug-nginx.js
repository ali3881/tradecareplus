const SSH2Promise = require('ssh2-promise');

const config = {
  host: '72.60.199.129',
  username: 'root',
  password: 'xpaRVJMTWuY+VbEms;N2',
  tryKeyboard: true,
};

async function debugNginx() {
  const ssh = new SSH2Promise(config);
  try {
    await ssh.connect();
    
    console.log('--- Nginx Error Log ---');
    const logs = await ssh.exec('tail -n 20 /var/log/nginx/error.log');
    console.log(logs);

    console.log('--- Netstat ---');
    const net = await ssh.exec('netstat -tuln | grep 3000');
    console.log(net);
    
    console.log('--- Curl Localhost ---');
    try {
        const curl = await ssh.exec('curl -v http://127.0.0.1:3000');
        console.log(curl);
    } catch (e) {
        console.log('Curl failed:', e.message);
    }

  } catch (error) {
    console.error(error);
  } finally {
    await ssh.close();
  }
}

debugNginx();
