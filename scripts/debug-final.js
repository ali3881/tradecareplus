const SSH2Promise = require('ssh2-promise');

const config = {
  host: '72.60.199.129',
  username: 'root',
  password: 'xpaRVJMTWuY+VbEms;N2',
  tryKeyboard: true,
};

async function debugFinal() {
  const ssh = new SSH2Promise(config);
  try {
    await ssh.connect();
    
    console.log('--- Sysctl ---');
    try {
        const sys = await ssh.exec('sysctl net.ipv6.bindv6only');
        console.log(sys);
    } catch(e) { console.log('sysctl failed'); }

    console.log('--- Process List ---');
    const ps = await ssh.exec('ps aux | grep node');
    console.log(ps);

    console.log('--- Curl IPv6 ---');
    try {
        const c6 = await ssh.exec('curl -I http://[::1]:3000');
        console.log(c6);
    } catch(e) { console.log('Curl IPv6 failed'); }

    console.log('--- Curl IPv4 ---');
    try {
        const c4 = await ssh.exec('curl -I http://127.0.0.1:3000');
        console.log(c4);
    } catch(e) { console.log('Curl IPv4 failed'); }

  } catch (error) {
    console.error(error);
  } finally {
    await ssh.close();
  }
}

debugFinal();
