const SSH2Promise = require('ssh2-promise');

const config = {
  host: '72.60.199.129',
  username: 'root',
  password: 'xpaRVJMTWuY+VbEms;N2',
  tryKeyboard: true,
};

async function checkNext() {
  const ssh = new SSH2Promise(config);
  try {
    await ssh.connect();
    
    console.log('--- Check .next ---');
    try {
        const ls = await ssh.exec('ls -la /var/www/tradecareplus/.next');
        console.log(ls);
    } catch(e) { console.log('.next MISSING or empty'); }

    console.log('--- Check BUILD_ID ---');
    try {
        const bid = await ssh.exec('cat /var/www/tradecareplus/.next/BUILD_ID');
        console.log('BUILD_ID:', bid);
    } catch(e) { console.log('BUILD_ID MISSING'); }

  } catch (error) {
    console.error(error);
  } finally {
    await ssh.close();
  }
}

checkNext();
