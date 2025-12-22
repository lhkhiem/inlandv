# Deployment Guide

Hướng dẫn deploy dự án lên production.

## Prerequisites

- Ubuntu 22.04+ server
- Node.js 18+
- PostgreSQL 15+
- Nginx
- PM2
- SSL certificate (Let's Encrypt)

## 1. Server Setup

### Install Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install PM2
sudo npm install -g pm2
```

## 2. Database Setup

### Create Production Database
```bash
sudo -u postgres createdb inland_realestate
```

### Run Migration
```bash
# Copy schema.sql to server
psql -d inland_realestate -f schema.sql
```

## 3. Application Deployment

### Clone Repository
```bash
cd /var/www
git clone <repository-url> inland-real-estate
cd inland-real-estate
```

### Install Dependencies
```bash
cd projects/public-backend && npm install --production
cd ../public-frontend && npm install --production
cd ../cms-backend && npm install --production
cd ../cms-frontend && npm install --production
```

### Build Applications
```bash
# Build all
./scripts/deployment/build.sh
```

### Setup Environment Variables
```bash
# Create .env files for each project
# Update with production values
```

### Start with PM2
```bash
# Public Backend
cd projects/public-backend
pm2 start dist/server.js --name public-backend

# CMS Backend
cd ../cms-backend
pm2 start dist/server.js --name cms-backend

# Save PM2 process list
pm2 save
pm2 startup
```

## 4. Nginx Configuration

### Public Site
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:4002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### CMS Site
```nginx
server {
    listen 80;
    server_name cms.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:4003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### API Endpoints
```nginx
# Public API
server {
    listen 80;
    server_name api.yourdomain.com;
    
    location /api {
        proxy_pass http://localhost:4000;
    }
}

# CMS API
server {
    listen 80;
    server_name cms-api.yourdomain.com;
    
    location /api {
        proxy_pass http://localhost:4001;
    }
}
```

## 5. SSL Setup

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificates
sudo certbot --nginx -d yourdomain.com
sudo certbot --nginx -d cms.yourdomain.com
sudo certbot --nginx -d api.yourdomain.com
sudo certbot --nginx -d cms-api.yourdomain.com
```

## 6. Post-Deployment

### Verify
- [ ] All services running
- [ ] Database connected
- [ ] SSL certificates valid
- [ ] All endpoints accessible

### Monitoring
```bash
# PM2 monitoring
pm2 monit

# Check logs
pm2 logs
```

## 7. Backup

### Database Backup
```bash
# Create backup script
pg_dump inland_realestate > backup_$(date +%Y%m%d).sql
```

### Automated Backups
Setup cron job for daily backups.

