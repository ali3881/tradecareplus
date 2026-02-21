const SSH2Promise = require('ssh2-promise');

const config = {
  host: '72.60.199.129',
  username: 'root',
  password: 'xpaRVJMTWuY+VbEms;N2',
  tryKeyboard: true,
};

async function debugSys() {
  const ssh = new SSH2Promise(config);
  try {
    await ssh.connect();
    
    console.log('--- SELinux ---');
    try {
        const se = await ssh.exec('getenforce');
        console.log(se);
    } catch(e) { console.log('getenforce not found or failed'); }

    console.log('--- UFW ---');
    try {
        const ufw = await ssh.exec('ufw status');
        console.log(ufw);
    } catch(e) { console.log('ufw failed'); }

    console.log('--- Curl as www-data ---');
    try {
        const c = await ssh.exec('sudo -u www-data curl -I http://127.0.0.1:3000');
        console.log(c);
    } catch(e) { console.log('Curl as www-data failed:', e.message); }

  } catch (error) {
    console.error(error);
  } finally {
    await ssh.close();
  }
}

debugSys();
