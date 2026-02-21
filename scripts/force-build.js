const SSH2Promise = require('ssh2-promise');

const config = {
  host: '72.60.199.129',
  username: 'root',
  password: 'xpaRVJMTWuY+VbEms;N2',
  tryKeyboard: true,
};

async function forceBuild() {
  const ssh = new SSH2Promise(config);
  try {
    await ssh.connect();
    
    console.log('--- Force Build ---');
    try {
        await ssh.exec('cd /var/www/tradecareplus && npm run build > build.log 2>&1');
        console.log('Build command finished without error throw.');
    } catch(e) {
        console.log('Build command threw error:', e.message);
    }

    console.log('--- Build Log Tail ---');
    const log = await ssh.exec('tail -n 100 /var/www/tradecareplus/build.log');
    console.log(log);

  } catch (error) {
    console.error(error);
  } finally {
    await ssh.close();
  }
}

forceBuild();
