const SSH2Promise = require('ssh2-promise');

const config = {
  host: '72.60.199.129',
  username: 'root',
  password: 'xpaRVJMTWuY+VbEms;N2',
  tryKeyboard: true,
};

async function fixNginxUser() {
  const ssh = new SSH2Promise(config);
  try {
    await ssh.connect();
    
    console.log('--- Fixing Nginx User ---');
    await ssh.exec("sed -i 's/user www-data;/user root;/g' /etc/nginx/nginx.conf");
    
    console.log('--- Restarting Nginx ---');
    await ssh.exec('systemctl restart nginx');
    
    console.log('--- Waiting ---');
    await new Promise(r => setTimeout(r, 2000));
    
    console.log('--- Curl ---');
    const curl = await ssh.exec('curl -I http://localhost');
    console.log(curl);

  } catch (error) {
    console.error(error);
  } finally {
    await ssh.close();
  }
}

fixNginxUser();
