const SSH2Promise = require('ssh2-promise');

const config = {
  host: '72.60.199.129',
  username: 'root',
  password: 'xpaRVJMTWuY+VbEms;N2',
  tryKeyboard: true,
};

async function readLogs() {
  const ssh = new SSH2Promise(config);
  try {
    await ssh.connect();
    
    console.log('--- ERROR LOG ---');
    const err = await ssh.exec('tail -n 50 /root/.pm2/logs/tradecareplus-error.log');
    console.log(err);
    
    console.log('--- OUT LOG ---');
    const out = await ssh.exec('tail -n 50 /root/.pm2/logs/tradecareplus-out.log');
    console.log(out);

  } catch (error) {
    console.error(error);
  } finally {
    await ssh.close();
  }
}

readLogs();
