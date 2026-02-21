#!/bin/bash
set -e

# 1. Install dependencies
echo "Installing system dependencies..."
apt-get update
apt-get install -y nginx git ufw curl

# Install Node.js 20
if ! command -v node &> /dev/null; then
    echo "Installing Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

# Install PM2
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    npm install -g pm2
fi

# Swap
if ! swapon --show | grep -q "/swapfile"; then
    echo "Adding 1GB Swap..."
    fallocate -l 1G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=1024
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab
fi

# 2. Setup App Directory
mkdir -p /var/www/tradecareplus
cd /var/www/tradecareplus

# 3. Extract Code (Assuming deploy.tar.gz is in /tmp)
echo "Extracting code..."
tar -xzf /tmp/deploy.tar.gz -C /var/www/tradecareplus

# 4. Install & Build
echo "Installing dependencies..."
npm ci

echo "Generating Prisma..."
export DATABASE_URL="file:./prod.db"
npx prisma generate
npx prisma migrate deploy

echo "Building Next.js app..."
npm run build

# 5. Start with PM2
echo "Starting with PM2..."
pm2 delete tradecareplus || true
# Force IPv4 binding
pm2 start "npm run start -- -H 0.0.0.0 -p 3000" --name tradecareplus
pm2 save
pm2 startup | bash || true

# 6. Configure Nginx
echo "Configuring Nginx..."
cp /tmp/nginx.conf /etc/nginx/sites-available/tradecareplus
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/tradecareplus /etc/nginx/sites-enabled/tradecareplus

# Check configuration
nginx -t

# Restart Nginx
systemctl restart nginx

# 7. Firewall
echo "Configuring Firewall..."
ufw allow 80
ufw allow 22
# We use --force to avoid prompt
ufw --force enable

# 8. Verification
echo "--- Verification ---"
echo "PM2 Status:"
pm2 status

echo "Checking Localhost (Port 3000):"
curl -I http://127.0.0.1:3000

echo "Checking Nginx (Port 80):"
curl -I http://localhost

echo "Deployment Script Finished Successfully!"
