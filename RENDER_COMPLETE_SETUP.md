# Complete Render Hosting Setup Guide

## Prerequisites

- GitHub repository: https://github.com/dilmahengineering-bot/quotation-system
- Render account: https://render.com (sign up with GitHub)

## Step-by-Step Setup

### Part 1: Create PostgreSQL Database

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com
   - Click **"New +"** button
   - Select **"PostgreSQL"**

2. **Configure Database**
   ```
   Name: quotation-db
   Database: quotation_db
   User: postgres (auto-generated)
   Region: Choose closest to your location
   PostgreSQL Version: 15 (or latest)
   Plan: Free
   ```

3. **Create Database**
   - Click **"Create Database"**
   - Wait for database to provision (1-2 minutes)
   - **Save the Internal Database URL** (you'll need this)

---

### Part 2: Deploy Backend (API Server)

1. **Create Web Service**
   - Click **"New +"** button
   - Select **"Web Service"**

2. **Connect GitHub Repository**
   - Click **"Connect repository"**
   - Select: `dilmahengineering-bot/quotation-system`
   - Click **"Connect"**

3. **Configure Backend Service**
   ```
   Name: quotation-backend
   Region: Same as database
   Branch: main
   Root Directory: backend
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   Plan: Free
   ```

4. **Environment Variables**
   
   Click **"Advanced"** → **"Add Environment Variable"**
   
   Add these variables:
   ```
   NODE_ENV = production
   ```
   
   **Link Database:**
   - Click **"Add Environment Variable"**
   - Select **"DATABASE_URL"** from dropdown
   - Choose your `quotation-db` database
   - This automatically sets the DATABASE_URL

5. **Create Web Service**
   - Click **"Create Web Service"**
   - Wait for deployment (3-5 minutes)
   - Watch logs for: "Server is running on port..."

6. **Initialize Database Schema**
   
   After backend deploys successfully, visit:
   ```
   https://your-backend-name.onrender.com/setup-db
   ```
   
   You should see:
   ```json
   {
     "status": "success",
     "message": "Database initialized successfully!"
   }
   ```

7. **Verify Backend**
   
   Check health endpoint:
   ```
   https://your-backend-name.onrender.com/health
   ```
   
   Should return:
   ```json
   {
     "status": "OK",
     "database": "Connected"
   }
   ```

8. **Save Backend URL**
   - Copy your backend URL: `https://your-backend-name.onrender.com`
   - You'll need this for frontend configuration

---

### Part 3: Deploy Frontend (React App)

1. **Create Static Site**
   - Click **"New +"** button
   - Select **"Static Site"**

2. **Connect Repository**
   - Select: `dilmahengineering-bot/quotation-system`
   - Click **"Connect"**

3. **Configure Frontend Service**
   ```
   Name: quotation-frontend
   Branch: main
   Root Directory: frontend
   Build Command: npm install && npm run build
   Publish Directory: build
   ```

4. **Environment Variables**
   
   Add this variable:
   ```
   REACT_APP_API_URL = https://your-backend-name.onrender.com/api
   ```
   
   **Important:** Replace `your-backend-name` with actual backend URL from Part 2

5. **Create Static Site**
   - Click **"Create Static Site"**
   - Wait for build and deployment (5-10 minutes)

6. **Verify Frontend**
   - Visit your frontend URL
   - Should see the dashboard
   - Test creating a quotation
   - Test PDF download

---

## Configuration Summary

### Your Services:

**PostgreSQL Database:**
```
Name: quotation-db
Status: ✅ Running
Internal URL: (provided by Render)
```

**Backend Service:**
```
Name: quotation-backend
URL: https://quotation-backend.onrender.com
Type: Web Service
Environment Variables:
  - NODE_ENV = production
  - DATABASE_URL = (linked to quotation-db)
```

**Frontend Service:**
```
Name: quotation-frontend
URL: https://quotation-frontend.onrender.com
Type: Static Site
Environment Variables:
  - REACT_APP_API_URL = https://quotation-backend.onrender.com/api
```

---

## Testing Your Deployment

### 1. Test Backend

**Health Check:**
```bash
curl https://your-backend-name.onrender.com/health
```

**Get Machines:**
```bash
curl https://your-backend-name.onrender.com/api/machines
```

**Get Customers:**
```bash
curl https://your-backend-name.onrender.com/api/customers
```

### 2. Test Frontend

1. Open frontend URL in browser
2. Should see dashboard with sample data
3. Try:
   - View machines, customers, auxiliary costs
   - Create a new quotation
   - Download PDF

### 3. Test PDF Generation

1. Create a test quotation
2. Click "Download PDF" button
3. PDF should download with proper formatting

---

## Troubleshooting

### Backend Won't Start

**Check Logs:**
1. Go to backend service in Render
2. Click "Logs" tab
3. Look for errors

**Common Issues:**

1. **Database not connected:**
   - Verify DATABASE_URL is set
   - Check database is running
   - Visit /setup-db to initialize

2. **Port binding error:**
   - Render automatically sets PORT
   - Don't hardcode port in code

3. **Dependencies missing:**
   - Check package.json includes all dependencies
   - Ensure pdfkit is listed

### Frontend Build Fails

**Common Issues:**

1. **Environment variable not set:**
   - Add REACT_APP_API_URL in Render dashboard
   - Must start with REACT_APP_

2. **Build command fails:**
   - Check Node version compatibility
   - Ensure all dependencies in package.json

### CORS Errors

**Solution:**
Backend already has CORS enabled. If issues persist:
1. Verify backend URL is correct in frontend env var
2. Check backend logs for CORS errors
3. Ensure using HTTPS (Render provides SSL automatically)

### Database Connection Fails

**Solutions:**
1. Verify database service is running
2. Check DATABASE_URL is linked correctly
3. Run database test:
   - Go to backend service
   - Click "Shell" tab
   - Run: `npm run test-db`

---

## Render Free Tier Limitations

### What You Get:
- ✅ 750 hours/month PostgreSQL
- ✅ 750 hours/month Web Service
- ✅ Unlimited Static Sites
- ✅ Automatic SSL certificates
- ✅ Automatic deployments from GitHub

### Limitations:
- ⏰ Services spin down after 15 min inactivity
- ⏰ First request after spin down: 30-60 seconds
- 💾 Limited database storage (1GB)
- 🔄 Limited build minutes

### Upgrade Benefits:
- 🚀 Always-on services (no spin down)
- 💾 More database storage
- ⚡ Faster build times
- 📊 Better performance

---

## Updating Your Deployment

### Automatic Updates (Recommended)

Enable Auto-Deploy:
1. Go to service settings
2. Under "Build & Deploy"
3. Enable "Auto-Deploy"
4. Choose branch: main

Now, every time you push to GitHub:
```bash
git add .
git commit -m "your changes"
git push origin main
```
Render automatically rebuilds and deploys! 🎉

### Manual Deploy

If you need to redeploy manually:
1. Go to service in Render dashboard
2. Click "Manual Deploy" button
3. Select "Deploy latest commit"
4. Wait for deployment

---

## Post-Deployment Checklist

- [ ] Database is running and accessible
- [ ] Backend health check returns "Connected"
- [ ] Backend /setup-db executed successfully
- [ ] Sample data loaded (machines, customers, etc.)
- [ ] Frontend loads dashboard
- [ ] Can create quotations
- [ ] PDF download works
- [ ] All master data visible (machines, customers, costs)
- [ ] Auto-deploy enabled for both services

---

## Service URLs Template

After setup, document your URLs:

```
Database:
  Internal URL: postgresql://user:pass@host/quotation_db

Backend:
  URL: https://quotation-backend-xxxx.onrender.com
  Health: https://quotation-backend-xxxx.onrender.com/health
  API: https://quotation-backend-xxxx.onrender.com/api

Frontend:
  URL: https://quotation-frontend-xxxx.onrender.com
```

---

## Support & Documentation

**Render Documentation:**
- Main Docs: https://render.com/docs
- Node.js: https://render.com/docs/deploy-node-express-app
- Static Sites: https://render.com/docs/deploy-create-react-app
- PostgreSQL: https://render.com/docs/databases

**Common Commands:**

```bash
# Test locally before deploying
npm run test-db

# Push to trigger auto-deploy
git push origin main

# Check deployment status
# (use Render dashboard)
```

---

## Quick Start Commands

```bash
# 1. Ensure code is pushed to GitHub
cd "c:\Users\Administrator\Desktop\React Project\my-app\quotation-system"
git status
git push origin main

# 2. Then follow Render dashboard steps above

# 3. After deployment, initialize database
# Visit: https://your-backend-url.onrender.com/setup-db

# 4. Test
# Visit: https://your-frontend-url.onrender.com
```

---

## Estimated Setup Time

- Database creation: 2 minutes
- Backend deployment: 5 minutes
- Frontend deployment: 10 minutes
- Testing: 5 minutes

**Total: ~20-25 minutes**

---

## Success Indicators

You know it's working when:
- ✅ All three services show "Live" status
- ✅ Health endpoint returns database "Connected"
- ✅ Frontend loads without errors
- ✅ Can view sample machines and customers
- ✅ Can create and download quotation PDFs

🎉 **Your quotation system is now live on Render!**
