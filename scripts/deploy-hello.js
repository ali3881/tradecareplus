const SSH2Promise = require('ssh2-promise');

const config = {
  host: '72.60.199.129',
  username: 'root',
  password: 'xpaRVJMTWuY+VbEms;N2',
  tryKeyboard: true,
};

const helloScript = `
const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello World from VPS!');
});
server.listen(3000, '0.0.0.0', () => {
  console.log('Server running at http://0.0.0.0:3000/');
});
`;

async function deployHello() {
  const ssh = new SSH2Promise(config);
  try {
    await ssh.connect();
    
    console.log('Stopping tradecareplus...');
    try { await ssh.exec('pm2 stop tradecareplus'); } catch (e) {}
    try { await ssh.exec('pm2 delete hello'); } catch (e) {}

    console.log('Writing hello.js...');
    await ssh.exec(`cat > /var/www/tradecareplus/hello.js <<EOF
${helloScript}
EOF`);

    console.log('Starting hello.js...');
    await ssh.exec('cd /var/www/tradecareplus && pm2 start hello.js --name hello');
    
    console.log('Waiting...');
    await new Promise(r => setTimeout(r, 2000));
    
    console.log('Checking Localhost...');
    const curl = await ssh.exec('curl -I http://127.0.0.1:3000');
    console.log(curl);

  } catch (error) {
    console.error('Deploy Hello Failed:', error);
  } finally {
    await ssh.close();
  }
}

deployHello();
