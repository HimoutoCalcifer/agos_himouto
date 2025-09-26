# AGOS Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. DigitalOcean Setup

- [ ] Create DigitalOcean droplet (Ubuntu 22.04 LTS)
- [ ] Note down droplet IP address: `_______________`
- [ ] SSH key pair generated and added to droplet
- [ ] Connect to droplet via SSH successful

### 2. GitHub Repository Setup

- [ ] Fork or create GitHub repository
- [ ] Repository URL: `_______________`
- [ ] Add GitHub repository secrets:
  - [ ] `DIGITALOCEAN_HOST` = your-droplet-ip
  - [ ] `DIGITALOCEAN_USERNAME` = your-username
  - [ ] `DIGITALOCEAN_SSH_KEY` = your-private-ssh-key
  - [ ] `DIGITALOCEAN_PORT` = 22

### 3. Domain Setup (Optional)

- [ ] Domain purchased: `_______________`
- [ ] DNS A record pointing to droplet IP
- [ ] WWW record pointing to droplet IP

## ⚙️ Server Setup Steps

### 1. Connect to your droplet:

```bash
ssh root@YOUR_DROPLET_IP
```

### 2. Run the automated setup script:

```bash
wget https://raw.githubusercontent.com/YOUR_USERNAME/agos-flood-monitoring/main/scripts/setup-digitalocean.sh
chmod +x setup-digitalocean.sh
./setup-digitalocean.sh
```

### 3. Configure environment:

```bash
cd /var/www/agos
cp .env.example .env
nano .env  # Edit with your settings
```

## 🚀 Deployment Steps

### 1. Push your code to GitHub:

```bash
git add .
git commit -m "Initial AGOS deployment"
git push origin main
```

### 2. Monitor GitHub Actions:

- Go to your repository > Actions tab
- Watch the deployment process
- Ensure all steps complete successfully

### 3. Verify deployment:

```bash
# On your droplet
agos-status
curl http://localhost:3000/api/health
```

## 🔧 Configuration Checklist

### Environment Variables (.env)

- [ ] `NODE_ENV=production`
- [ ] `PORT=3000`
- [ ] `DB_PASSWORD` = secure password
- [ ] `JWT_SECRET` = secure random string
- [ ] `SMTP_USER` = your email for alerts
- [ ] `SMTP_PASSWORD` = email app password
- [ ] Hardware serial port configured

### Hardware Configuration

- [ ] Arduino R4 WiFi connected via USB
- [ ] SIM800L GSM module configured
- [ ] Optical encoder sensor connected
- [ ] POF sensors calibrated
- [ ] Power supply stable

### Security Configuration

- [ ] Firewall configured (UFW)
- [ ] SSH key authentication only
- [ ] Strong passwords set
- [ ] SSL certificate installed (if using domain)

## 🔄 Continuous Deployment Workflow

Once setup is complete:

1. **Local Development**:

   ```bash
   npm run dev  # Test locally
   ```

2. **Deploy Changes**:

   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

3. **Automatic Deployment**: GitHub Actions handles the rest!

## 📊 Monitoring Commands

```bash
# Check system status
agos-status

# View application logs
docker-compose logs -f agos-app

# View system resources
htop

# Check disk space
df -h

# Monitor network
nethogs

# Restart application
sudo systemctl restart agos
```

## 🚨 Emergency Procedures

### Application Won't Start

```bash
cd /var/www/agos
docker-compose down
docker-compose up --build -d
```

### Server Issues

```bash
sudo systemctl status agos
sudo journalctl -u agos -f
```

### Database Issues

```bash
docker-compose restart agos-db
```

## 📞 Getting Help

- **GitHub Issues**: https://github.com/YOUR_USERNAME/agos-flood-monitoring/issues
- **Documentation**: README.md
- **Server Status**: `agos-status` command

## ✅ Post-Deployment Verification

- [ ] Application accessible at `http://YOUR_DROPLET_IP:3000`
- [ ] All 4 modules loading correctly
- [ ] WebSocket connections working
- [ ] Health check endpoint responding
- [ ] SSL certificate installed (if using domain)
- [ ] Automatic deployment working from GitHub
- [ ] Monitoring tools configured
- [ ] Backup procedures in place

## 🎉 You're Ready!

Your AGOS flood monitoring system should now be:

- ✅ Deployed on DigitalOcean
- ✅ Automatically updating from GitHub
- ✅ Monitoring flood conditions 24/7
- ✅ Ready for emergency response

**Next Steps**: Connect your Arduino hardware and start monitoring! 🌊
