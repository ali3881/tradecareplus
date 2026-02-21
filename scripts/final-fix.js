const SSH2Promise = require('ssh2-promise');

const config = {
  host: '72.60.199.129',
  username: 'root',
  password: 'xpaRVJMTWuY+VbEms;N2',
  tryKeyboard: true,
};

async function finalFix() {
  const ssh = new SSH2Promise(config);
  try {
    await ssh.connect();
    
    console.log('--- Netstat ---');
    const net = await ssh.exec('netstat -tuln | grep 3000');
    console.log(net);
    
    console.log('--- Restarting Nginx ---');
    await ssh.exec('systemctl restart nginx');
    
    console.log('--- Curl Localhost (Nginx) ---');
    const curl = await ssh.exec('curl -I http://localhost');
    console.log(curl);

    console.log('--- Curl App (127.0.0.1:3000) ---');
    const curlApp = await ssh.exec('curl -I http://127.0.0.1:3000');
    console.log(curlApp);

  } catch (error) {
    console.error(error);
  } finally {
    await ssh.close();
  }
}

finalFix();
