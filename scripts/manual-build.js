const SSH2Promise = require('ssh2-promise');

const config = {
  host: '72.60.199.129',
  username: 'root',
  password: 'xpaRVJMTWuY+VbEms;N2',
  tryKeyboard: true,
};

async function manualBuild() {
  const ssh = new SSH2Promise(config);
  try {
    await ssh.connect();
    console.log('Building...');
    try {
        // We use npm install instead of ci to be safer
        // And capture ALL output
        await ssh.exec('cd /var/www/tradecareplus && npm install && npm run build > build_result.txt 2>&1');
        console.log('Build command finished.');
    } catch(e) {
        console.log('Build command failed:', e.message);
    }
    
    console.log('--- Log Tail ---');
    const log = await ssh.exec('tail -n 50 /var/www/tradecareplus/build_result.txt');
    console.log(log);
    
    console.log('--- Restarting PM2 ---');
    await ssh.exec('pm2 restart tradecareplus');
    
  } catch (error) {
    console.error(error);
  } finally {
    await ssh.close();
  }
}

manualBuild();
