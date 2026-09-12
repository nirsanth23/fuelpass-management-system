# 🚀 FuelPass Management System - Production Deployment Guide

This comprehensive guide details step-by-step instructions for hosting the **Sri Lanka National FuelPass Management System** in production.

---

## 🏗️ Architecture Overview

The system consists of three main components:
1. **Frontend**: React + Vite SPA (Client Portal, Station Scanner, Admin Dashboard)
2. **Backend**: Node.js + Express REST API (Security Hardened, JWT RBAC, HMAC QR Signing, Rate Limiting)
3. **Database**: MySQL 8.0+ (ACID Transactions, Row-Level Locking, Schema Migrations)

---

## 🌟 Option 1: Cloud Deployment (Recommended - Free / Low-Cost & Fast)

### Step 1: Deploy Database (Cloud MySQL)
You can use any cloud MySQL provider such as **Aiven.io** (Free Tier), **Railway.app**, **TiDB Cloud**, or **PlanetScale**:

1. Create a MySQL database named `fuelpass`.
2. Note down your connection credentials:
   - `DB_HOST`
   - `DB_PORT`
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME`
   - `DB_SSL=true`

---

### Step 2: Deploy Backend (Render.com / Railway.app)

1. Push your project code to GitHub.
2. Log into [Render.com](https://render.com) and click **New + Web Service**.
3. Connect your GitHub repository.
4. Configure settings:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Under **Environment Variables**, add:
   ```env
   NODE_ENV=production
   PORT=5050
   DB_HOST=your-cloud-db-host
   DB_PORT=your-cloud-db-port
   DB_USER=your-cloud-db-user
   DB_PASSWORD=your-cloud-db-password
   DB_NAME=fuelpass
   DB_SSL=true
   JWT_SECRET=super_secret_jwt_random_key_production_2026
   QR_SECRET=super_secret_qr_random_key_production_2026
   ADMIN_USER=admin
   ADMIN_PASS=your_strong_admin_password
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_16_digit_gmail_app_password
   ALLOWED_ORIGINS=https://your-frontend.vercel.app
   ```
6. Click **Create Web Service**.
7. Once deployed, open the Render Terminal/Shell and run the database migration:
   ```bash
   npm run migrate
   npm run seed
   ```
8. Verify backend health by visiting: `https://your-backend.onrender.com/api/health`.

---

### Step 3: Deploy Frontend (Vercel / Netlify)

1. Log into [Vercel](https://vercel.com) and click **Add New > Project**.
2. Import your GitHub repository.
3. Configure settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Under **Environment Variables**, add:
   ```env
   VITE_API_BASE_URL=https://your-backend.onrender.com
   ```
5. Click **Deploy**.
6. Vercel will build and provide your production URL (e.g. `https://fuelpass.vercel.app`).
7. Update `ALLOWED_ORIGINS` in your Render Backend environment variables with your Vercel URL.

---

## 🖥️ Option 2: Dedicated Linux VPS (DigitalOcean / AWS / Hostinger)

### 1. Initial Server Setup (Ubuntu 22.04 / 24.04 LTS)
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nodejs npm mysql-server nginx certbot python3-certbot-nginx
sudo npm install -g pm2
```

### 2. Database Setup
```bash
sudo mysql -u root
```
```sql
CREATE DATABASE fuelpass;
CREATE USER 'fuelpass_user'@'localhost' IDENTIFIED BY 'StrongPassword123!';
GRANT ALL PRIVILEGES ON fuelpass.* TO 'fuelpass_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Clone & Setup Backend
```bash
cd /var/www
git clone <your-repo-url> fuelpass
cd /var/www/fuelpass/backend
npm install --production
cp .env.example .env
nano .env # (Configure database & SMTP credentials)
npm run migrate
npm run seed

# Start with PM2 Process Manager
pm2 start server.js --name "fuelpass-api"
pm2 save
pm2 startup
```

### 4. Build Frontend
```bash
cd /var/www/fuelpass/frontend
npm install
nano .env # (Set VITE_API_BASE_URL=https://api.yourdomain.com)
npm run build
```

### 5. Configure Nginx Reverse Proxy
```nginx
# /etc/nginx/sites-available/fuelpass
server {
    server_name yourdomain.com;
    root /var/www/fuelpass/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:5050;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
```bash
sudo ln -s /etc/nginx/sites-available/fuelpass /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. Enable Free SSL (HTTPS)
```bash
sudo certbot --nginx -d yourdomain.com
```

---

## ✅ Pre-Flight Production Checklist

- [x] Frontend SPA 404 rewrite rules configured (`vercel.json`, `_redirects`).
- [x] Frontend production build compiled successfully (`npm run build`).
- [x] Backend database pool configured with Cloud SSL (`DB_SSL=true`).
- [x] Backend Health Check endpoint active (`/api/health`).
- [x] Backend dynamic CORS whitelist for production domains.
- [x] Passwords hashed with `bcrypt` (10 rounds).
- [x] Rate limiting active for OTP and Authentication endpoints.
- [x] OTP 3-attempt defense and cryptographic HMAC QR signing enabled.
- [x] Atomic MySQL transactions with row-level locks enabled.
