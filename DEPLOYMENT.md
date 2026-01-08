# Deployment Guide

This guide covers deploying the Quotation Management System to production environments.

## 📋 Pre-Deployment Checklist

- [ ] PostgreSQL database set up
- [ ] Environment variables configured
- [ ] Database schema initialized
- [ ] Sample data loaded (optional)
- [ ] Backend tested locally
- [ ] Frontend tested locally
- [ ] API endpoints tested
- [ ] Security measures implemented
- [ ] Backup strategy defined

## 🗄️ Database Setup

### PostgreSQL Production Configuration

1. **Create Production Database:**
```bash
psql -U postgres
CREATE DATABASE quotation_db_prod;
CREATE USER quotation_user WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE quotation_db_prod TO quotation_user;
\q
```

2. **Initialize Schema:**
```bash
psql -U quotation_user -d quotation_db_prod -f backend/database/schema.sql
```

3. **Configure PostgreSQL for Production:**
Edit `/etc/postgresql/[version]/main/postgresql.conf`:
```
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
```

4. **Set Up Backups:**
```bash
# Daily backup script
pg_dump -U quotation_user quotation_db_prod > backup_$(date +%Y%m%d).sql

# Add to crontab
0 2 * * * /path/to/backup_script.sh
```

## 🖥️ Backend Deployment

### Option 1: Traditional Server (Ubuntu/Debian)

1. **Install Node.js:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. **Set Up Application:**
```bash
cd /var/www/quotation-backend
npm install --production
```

3. **Create Production .env:**
```bash
nano .env
```
```
PORT=5000
DB_USER=quotation_user
DB_HOST=localhost
DB_NAME=quotation_db_prod
DB_PASSWORD=secure_password
DB_PORT=5432
NODE_ENV=production
```

4. **Install PM2 Process Manager:**
```bash
sudo npm install -g pm2
pm2 start server.js --name quotation-backend
pm2 startup
pm2 save
```

5. **Configure Nginx Reverse Proxy:**
```bash
sudo nano /etc/nginx/sites-available/quotation-backend
```
```nginx
server {
    listen 80;
    server_name api.yourcompany.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/quotation-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

6. **Set Up SSL with Let's Encrypt:**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourcompany.com
```

### Option 2: Docker Deployment

1. **Create Dockerfile for Backend:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
```

2. **Create docker-compose.yml:**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: quotation_db_prod
      POSTGRES_USER: quotation_user
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/database/schema.sql:/docker-entrypoint-initdb.d/schema.sql
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    environment:
      PORT: 5000
      DB_USER: quotation_user
      DB_HOST: postgres
      DB_NAME: quotation_db_prod
      DB_PASSWORD: secure_password
      DB_PORT: 5432
      NODE_ENV: production
    ports:
      - "5000:5000"
    depends_on:
      - postgres

volumes:
  postgres_data:
```

3. **Deploy with Docker:**
```bash
docker-compose up -d
```

## 🌐 Frontend Deployment

### Build for Production

1. **Update Environment Variables:**
```bash
cd frontend
nano .env.production
```
```
REACT_APP_API_URL=https://api.yourcompany.com/api
```

2. **Build the Application:**
```bash
npm run build
```

### Option 1: Nginx Static Hosting

1. **Copy Build Files:**
```bash
sudo cp -r build/* /var/www/quotation-frontend/
```

2. **Configure Nginx:**
```bash
sudo nano /etc/nginx/sites-available/quotation-frontend
```
```nginx
server {
    listen 80;
    server_name quotation.yourcompany.com;
    root /var/www/quotation-frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/quotation-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

3. **Set Up SSL:**
```bash
sudo certbot --nginx -d quotation.yourcompany.com
```

### Option 2: Docker Deployment

1. **Create Dockerfile for Frontend:**
```dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

2. **Create nginx.conf:**
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

3. **Add to docker-compose.yml:**
```yaml
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
```

## 🔒 Security Best Practices

### 1. Environment Variables
- Never commit .env files
- Use strong database passwords
- Rotate credentials regularly

### 2. Database Security
```sql
-- Revoke public access
REVOKE ALL ON DATABASE quotation_db_prod FROM PUBLIC;

-- Grant specific permissions
GRANT CONNECT ON DATABASE quotation_db_prod TO quotation_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO quotation_user;
```

### 3. API Security
Add to backend server.js:
```javascript
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 4. CORS Configuration
```javascript
const corsOptions = {
  origin: 'https://quotation.yourcompany.com',
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

### 5. Firewall Rules
```bash
# Allow SSH
sudo ufw allow 22

# Allow HTTP/HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Deny direct database access from outside
sudo ufw deny 5432

# Enable firewall
sudo ufw enable
```

## 📊 Monitoring

### 1. PM2 Monitoring
```bash
# View logs
pm2 logs quotation-backend

# Monitor resources
pm2 monit

# View process info
pm2 info quotation-backend
```

### 2. Database Monitoring
```sql
-- Check active connections
SELECT * FROM pg_stat_activity;

-- Check database size
SELECT pg_size_pretty(pg_database_size('quotation_db_prod'));

-- Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### 3. Nginx Monitoring
```bash
# Check error logs
sudo tail -f /var/log/nginx/error.log

# Check access logs
sudo tail -f /var/log/nginx/access.log
```

## 🔄 Update Strategy

### Backend Updates
```bash
# Pull latest code
git pull origin main

# Install dependencies
cd backend
npm install

# Restart with PM2
pm2 restart quotation-backend
```

### Frontend Updates
```bash
# Pull latest code
git pull origin main

# Build
cd frontend
npm install
npm run build

# Deploy
sudo cp -r build/* /var/www/quotation-frontend/
```

### Database Migrations
```bash
# Create migration script
nano migrations/001_add_new_field.sql

# Apply migration
psql -U quotation_user -d quotation_db_prod -f migrations/001_add_new_field.sql
```

## 🚨 Disaster Recovery

### Backup Strategy
```bash
# Full backup script
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Database backup
pg_dump -U quotation_user quotation_db_prod > $BACKUP_DIR/db_$DATE.sql

# Application backup
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /var/www/quotation-backend /var/www/quotation-frontend

# Keep only last 30 days
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
```

### Restore Procedure
```bash
# Restore database
psql -U quotation_user -d quotation_db_prod < backup_20240115.sql

# Restore application
tar -xzf app_20240115.tar.gz -C /
pm2 restart quotation-backend
sudo systemctl restart nginx
```

## 📱 Health Checks

### Backend Health Endpoint
Add to server.js:
```javascript
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

### Monitoring Script
```bash
#!/bin/bash
HEALTH_URL="https://api.yourcompany.com/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ $RESPONSE != "200" ]; then
    echo "Health check failed! Status: $RESPONSE"
    pm2 restart quotation-backend
fi
```

## 🎯 Performance Optimization

### Database Indexing
```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_quotations_customer_date ON quotations(customer_id, quotation_date);
CREATE INDEX idx_quotations_status_date ON quotations(quotation_status, quotation_date);
```

### Nginx Caching
```nginx
location /static/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Database Connection Pooling
Update database.js:
```javascript
const pool = new Pool({
  max: 20, // maximum number of connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

---

**Note:** Adjust all configurations according to your specific infrastructure and security requirements.
