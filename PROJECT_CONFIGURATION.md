# Project Configuration Guide for Ubuntu Server

## System Requirements

- Ubuntu Server 20.04 LTS or newer
- Node.js 18+ LTS
- PostgreSQL 14+
- Nginx (for reverse proxy)
- PM2 (for process management)

## Environment Variables

```env
# GoHighLevel Configuration
VITE_GHL_CLIENT_ID=your_client_id
VITE_GHL_CLIENT_SECRET=your_client_secret
VITE_REDIRECT_URI=your_redirect_uri

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Installation Steps

### 1. System Preparation
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y curl git build-essential
```

### 2. Install Node.js
```bash
# Install Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

### 3. Install PM2
```bash
# Install PM2 globally
sudo npm install -g pm2
```

### 4. Project Setup

#### Clone Repository
```bash
# Create project directory
mkdir -p /var/www/taskmanager
cd /var/www/taskmanager

# Clone repository
git clone your_repository_url .
```

#### Install Dependencies
```bash
# Install project dependencies
npm install
```

### 5. Build Project
```bash
# Build for production
npm run build
```

### 6. Nginx Configuration

#### Install Nginx
```bash
sudo apt install nginx
```

#### Configure Nginx
Create configuration file:
```bash
sudo nano /etc/nginx/sites-available/taskmanager
```

Add configuration:
```nginx
server {
    listen 80;
    server_name your_domain.com;

    root /var/www/taskmanager/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy configuration
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # GHL webhook configuration
    location /webhooks/ghl {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/taskmanager /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 7. SSL Configuration (Recommended)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your_domain.com
```

### 8. Process Management with PM2

Create ecosystem file:
```bash
# Create PM2 ecosystem file
nano ecosystem.config.js
```

Add configuration:
```javascript
module.exports = {
  apps: [{
    name: 'taskmanager',
    script: 'npm',
    args: 'run preview',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

Start application:
```bash
# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
```

### 9. Database Configuration

#### Supabase Setup
1. Create a new Supabase project
2. Set up database tables using migrations
3. Configure RLS policies
4. Set up real-time subscriptions

#### GHL Integration Setup
1. Configure GHL OAuth credentials
2. Set up webhook endpoints
3. Configure task synchronization
4. Set up contact synchronization

### 10. Monitoring and Logs

```bash
# Monitor application
pm2 monit

# View logs
pm2 logs taskmanager

# View nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## Security Considerations

1. **Firewall Configuration**
```bash
# Configure UFW
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

2. **File Permissions**
```bash
# Set proper ownership
sudo chown -R www-data:www-data /var/www/taskmanager
sudo chmod -R 755 /var/www/taskmanager
```

3. **Environment Variables**
- Keep all sensitive data in `.env` file
- Restrict file permissions: `chmod 600 .env`
- Use different keys for development and production

4. **API Security**
- Implement rate limiting
- Use CORS properly
- Validate all inputs
- Implement proper authentication

## Maintenance

### Updates
```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Rebuild application
npm run build

# Restart PM2
pm2 restart taskmanager
```

### Backups
```bash
# Backup configuration
tar -czf config-backup.tar.gz .env ecosystem.config.js

# Backup nginx configuration
sudo cp /etc/nginx/sites-available/taskmanager /backup/
```

### Database Maintenance
- Regular backups through Supabase
- Monitor database performance
- Regular cleanup of old data
- Index optimization

## Troubleshooting

1. **Application Issues**
   - Check PM2 logs: `pm2 logs taskmanager`
   - Verify environment variables
   - Check file permissions
   - Monitor memory usage

2. **Nginx Issues**
   - Check nginx status: `sudo systemctl status nginx`
   - Verify nginx configuration: `sudo nginx -t`
   - Check nginx logs
   - Verify SSL certificates

3. **Database Issues**
   - Check Supabase connection
   - Verify RLS policies
   - Monitor real-time subscriptions
   - Check GHL synchronization status

4. **GHL Integration Issues**
   - Verify OAuth tokens
   - Check webhook configurations
   - Monitor task synchronization
   - Verify contact synchronization