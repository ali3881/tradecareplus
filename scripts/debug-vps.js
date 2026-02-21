const SSH2Promise = require('ssh2-promise');

const config = {
  host: '72.60.199.129',
  username: 'root',
  password: 'xpaRVJMTWuY+VbEms;N2',
  tryKeyboard: true,
};

async function debug() {
  const ssh = new SSH2Promise(config);
  try {
    await ssh.connect();
    console.log('Connected!');

    console.log('--- Uptime ---');
    const uptime = await ssh.exec('uptime');
    console.log(uptime);

    console.log('--- PM2 Logs (Last 50 lines) ---');
    // Combine out and error
    const logs = await ssh.exec('tail -n 50 /root/.pm2/logs/tradecareplus-error.log');
    console.log(logs);

  } catch (error) {
    console.error('Debug Failed:', error);
  } finally {
    await ssh.close();
  }
}

debug();
