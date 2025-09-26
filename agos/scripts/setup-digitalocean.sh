#!/bin/bash

# AGOS DigitalOcean Server Setup Script
# Run this script on your fresh DigitalOcean droplet

set -e

echo "🚀 Setting up AGOS on DigitalOcean droplet..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install essential packages
echo "📦 Installing essential packages..."
sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Install Node.js 18
echo "📦 Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Docker
echo "🐳 Installing Docker..."
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Install Docker Compose
echo "🐳 Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER

# Install PM2 for Node.js process management (alternative to Docker)
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Install Nginx (if not using Docker for reverse proxy)
echo "📦 Installing Nginx..."
sudo apt install -y nginx

# Setup firewall
echo "🔥 Configuring firewall..."
sudo ufw allow OpenSSH
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3000  # For direct access during development
sudo ufw --force enable

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /var/www/agos
sudo mkdir -p /var/www/agos/logs
sudo mkdir -p /var/www/agos/data
sudo chown -R $USER:$USER /var/www/agos

# Setup log rotation
echo "📝 Setting up log rotation..."
sudo tee /etc/logrotate.d/agos > /dev/null <<EOF
/var/www/agos/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0644 $USER $USER
    postrotate
        systemctl reload nginx > /dev/null 2>&1 || true
    endscript
}
EOF

# Install SSL certificate tool (Certbot)
echo "🔒 Installing Certbot for SSL certificates..."
sudo apt install -y certbot python3-certbot-nginx

# Create swap file (recommended for small droplets)
echo "💾 Setting up swap file..."
if [ ! -f /swapfile ]; then
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
fi

# Setup monitoring (optional)
echo "📊 Installing system monitoring tools..."
sudo apt install -y htop iotop nethogs

# Create system service template
echo "⚙️ Creating systemd service template..."
sudo tee /etc/systemd/system/agos.service > /dev/null <<EOF
[Unit]
Description=AGOS Flood Monitoring System
After=network.target
StartLimitIntervalSec=0

[Service]
Type=simple
Restart=always
RestartSec=1
User=$USER
WorkingDirectory=/var/www/agos
ExecStart=/usr/bin/node server.js
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# Generate SSH key for GitHub (if needed)
if [ ! -f ~/.ssh/id_rsa ]; then
    echo "🔑 Generating SSH key for GitHub..."
    ssh-keygen -t rsa -b 4096 -C "agos-server@$(hostname)" -f ~/.ssh/id_rsa -N ""
    echo "📋 Your public key (add this to GitHub):"
    cat ~/.ssh/id_rsa.pub
fi

# Setup automatic security updates
echo "🔒 Enabling automatic security updates..."
sudo apt install -y unattended-upgrades
echo 'Unattended-Upgrade::Automatic-Reboot "false";' | sudo tee -a /etc/apt/apt.conf.d/50unattended-upgrades

# Create deployment user (optional, for security)
echo "👤 Creating deployment user..."
if ! id "deploy" &>/dev/null; then
    sudo useradd -m -s /bin/bash deploy
    sudo usermod -aG docker deploy
    sudo mkdir -p /home/deploy/.ssh
    sudo cp ~/.ssh/authorized_keys /home/deploy/.ssh/ 2>/dev/null || true
    sudo chown -R deploy:deploy /home/deploy/.ssh
    sudo chmod 700 /home/deploy/.ssh
    sudo chmod 600 /home/deploy/.ssh/authorized_keys 2>/dev/null || true
fi

# Final setup
echo "🔧 Final system configuration..."
sudo systemctl daemon-reload
sudo systemctl enable nginx
sudo systemctl start nginx

# Create status check script
sudo tee /usr/local/bin/agos-status > /dev/null <<EOF
#!/bin/bash
echo "=== AGOS System Status ==="
echo "Node.js version: \$(node --version)"
echo "Docker version: \$(docker --version)"
echo "Docker Compose version: \$(docker-compose --version)"
echo ""
echo "Services:"
sudo systemctl status agos --no-pager -l || echo "AGOS service not running"
sudo systemctl status nginx --no-pager -l || echo "Nginx not running"
echo ""
echo "Docker containers:"
docker ps -a || echo "No Docker containers"
echo ""
echo "Disk usage:"
df -h /
echo ""
echo "Memory usage:"
free -h
EOF

sudo chmod +x /usr/local/bin/agos-status

echo "✅ DigitalOcean droplet setup complete!"
echo ""
echo "🔧 Next steps:"
echo "1. Configure your domain DNS to point to this server IP: $(curl -s ifconfig.me)"
echo "2. Set up your GitHub repository secrets:"
echo "   - DIGITALOCEAN_HOST: $(curl -s ifconfig.me)"
echo "   - DIGITALOCEAN_USERNAME: $USER"
echo "   - DIGITALOCEAN_SSH_KEY: (your private key)"
echo "   - DIGITALOCEAN_PORT: 22"
echo "3. Push your AGOS code to GitHub to trigger automatic deployment"
echo "4. Run 'agos-status' anytime to check system status"
echo ""
echo "🌐 Your server is ready for AGOS deployment!"
echo "📋 Public key for GitHub (if needed):"
cat ~/.ssh/id_rsa.pub 2>/dev/null || echo "No SSH key found"
