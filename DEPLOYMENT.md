# Hospital Management System Deployment Guide

## Prerequisites

1. Node.js (v14 or higher)
2. PostgreSQL database
3. PM2 (for process management)
4. Nginx (for reverse proxy)
5. SSL certificate
6. Domain name

## Backend Deployment Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/Ramakrishna18code/hospital-management-system.git
   cd hospital-management-system
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update the values with your production settings

4. Install PM2 globally:
   ```bash
   npm install -g pm2
   ```

5. Start the application with PM2:
   ```bash
   pm2 start server/app.js --name hospital-system
   ```

6. Set up PM2 to start on system boot:
   ```bash
   pm2 startup
   pm2 save
   ```

## Frontend Deployment Steps

1. Build the frontend:
   ```bash
   cd web
   npm install
   npm run build
   ```

2. Configure Nginx:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       # Redirect HTTP to HTTPS
       return 301 https://$server_name$request_uri;
   }

   server {
       listen 443 ssl;
       server_name yourdomain.com;

       ssl_certificate /path/to/certificate.crt;
       ssl_certificate_key /path/to/private.key;

       # Frontend static files
       location / {
           root /path/to/hospital-management-system/web/dist;
           try_files $uri $uri/ /index.html;
           expires 30d;
           add_header Cache-Control "public, no-transform";
       }

       # Backend API proxy
       location /api {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       # Health check endpoint
       location /health {
           proxy_pass http://localhost:3000/health;
           access_log off;
           proxy_http_version 1.1;
           proxy_set_header Connection '';
           proxy_set_header Host $host;
       }
   }
   ```

3. Test Nginx configuration:
   ```bash
   sudo nginx -t
   ```

4. Restart Nginx:
   ```bash
   sudo systemctl restart nginx
   ```

## SSL Certificate Setup

1. Install Certbot:
   ```bash
   sudo apt-get update
   sudo apt-get install certbot python3-certbot-nginx
   ```

2. Obtain SSL certificate:
   ```bash
   sudo certbot --nginx -d yourdomain.com
   ```

## Database Setup

1. Create production database:
   ```sql
   CREATE DATABASE hospital_db;
   CREATE USER hospital_user WITH PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE hospital_db TO hospital_user;
   ```

2. Update database configuration in `.env` file.

## Monitoring and Maintenance

1. Monitor application logs:
   ```bash
   pm2 logs hospital-system
   ```

2. Monitor server resources:
   ```bash
   pm2 monit
   ```

3. Set up log rotation:
   ```bash
   sudo nano /etc/logrotate.d/pm2-hospital-system
   ```
   Add:
   ```
   /home/user/.pm2/logs/*.log {
       daily
       rotate 7
       compress
       delaycompress
       missingok
       notifempty
   }
   ```

## Backup Strategy

1. Database backup (daily):
   ```bash
   pg_dump -U hospital_user hospital_db > backup_$(date +%Y%m%d).sql
   ```

2. File backup:
   ```bash
   tar -czf backup_files_$(date +%Y%m%d).tar.gz uploads/
   ```

## Security Considerations

1. Enable firewall:
   ```bash
   sudo ufw enable
   sudo ufw allow ssh
   sudo ufw allow http
   sudo ufw allow https
   ```

2. Set up fail2ban:
   ```bash
   sudo apt-get install fail2ban
   sudo systemctl enable fail2ban
   sudo systemctl start fail2ban
   ```

3. Regular security updates:
   ```bash
   sudo apt-get update
   sudo apt-get upgrade
   ```

## Troubleshooting

1. Check application status:
   ```bash
   pm2 status
   ```

2. Check Nginx error logs:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

3. Check application logs:
   ```bash
   pm2 logs hospital-system
   ```

4. Check SSL certificate status:
   ```bash
   sudo certbot certificates
   ```