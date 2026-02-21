const SSH2Promise = require('ssh2-promise');
const fs = require('fs');

const config = {
  host: '72.60.199.129',
  username: 'root',
  password: 'xpaRVJMTWuY+VbEms;N2',
  tryKeyboard: true,
};

async function deployEnv() {
  const ssh = new SSH2Promise(config);
  try {
    console.log('Reading local .env...');
    let envContent = fs.readFileSync('.env', 'utf8');
    
    // Update DATABASE_URL for production
    if (envContent.includes('DATABASE_URL=')) {
        envContent = envContent.replace(/DATABASE_URL=.*/, 'DATABASE_URL="file:./prod.db"');
    } else {
        envContent += '\nDATABASE_URL="file:./prod.db"';
    }

    // Ensure NEXTAUTH_URL is set to the IP
    if (envContent.includes('NEXTAUTH_URL=')) {
        envContent = envContent.replace(/NEXTAUTH_URL=.*/, 'NEXTAUTH_URL="http://72.60.199.129"');
    } else {
        envContent += '\nNEXTAUTH_URL="http://72.60.199.129"';
    }

    // Generate a secret if missing
    if (!envContent.includes('NEXTAUTH_SECRET=')) {
        const secret = require('crypto').randomBytes(32).toString('hex');
        envContent += `\nNEXTAUTH_SECRET="${secret}"`;
    }

    console.log('Connecting...');
    await ssh.connect();
    console.log('Connected!');

    console.log('Writing .env to server...');
    await ssh.exec(`cat > /var/www/tradecareplus/.env <<EOF
${envContent}
EOF`);

    console.log('Restarting PM2...');
    await ssh.exec('pm2 restart tradecareplus --update-env');
    
    console.log('Verifying...');
    await new Promise(r => setTimeout(r, 5000));
    const status = await ssh.exec('pm2 status');
    console.log(status);

    const curl = await ssh.exec('curl -I http://127.0.0.1:3000');
    console.log(curl);

  } catch (error) {
    console.error('Deploy Env Failed:', error);
  } finally {
    await ssh.close();
  }
}

deployEnv();
