const SSH2Promise = require('ssh2-promise');

const config = {
  host: '72.60.199.129',
  username: 'root',
  password: 'xpaRVJMTWuY+VbEms;N2',
  tryKeyboard: true,
};

async function debugBuild() {
  const ssh = new SSH2Promise(config);
  try {
    await ssh.connect();
    console.log('Connected!');

    console.log('--- Running Build and logging to file ---');
    // We ignore exit code here to ensure we read the log
    try {
        await ssh.exec('cd /var/www/tradecareplus && npm run build > build.log 2>&1');
    } catch (e) {
        console.log('Build command failed/exited with non-zero:', e.message);
    }

    console.log('--- Build Log ---');
    const log = await ssh.exec('cat /var/www/tradecareplus/build.log');
    console.log(log);

    console.log('--- Check .next ---');
    try {
        const ls = await ssh.exec('ls -la /var/www/tradecareplus/.next');
        console.log(ls);
    } catch (e) {
        console.log('.next folder missing or empty');
    }

  } catch (error) {
    console.error('Debug Build Failed:', error);
  } finally {
    await ssh.close();
  }
}

debugBuild();
