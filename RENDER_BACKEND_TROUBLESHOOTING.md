# Render Backend Troubleshooting Guide

## Issue: Backend Works Locally But Not on Render

### Current Status
- ✅ Local: Backend working on localhost:5000
- ✅ Database: Connected to Render PostgreSQL
- ❌ Render: Backend deployment status unknown

---

## Step 1: Check if Backend is Deployed

### 1.1 Go to Render Dashboard
1. Visit https://dashboard.render.com
2. Log in with GitHub
3. Look for your backend web service

**Do you see a service named `quotation-backend` or similar?**

- ✅ **YES** → Go to Step 2 (Service exists but not working)
- ❌ **NO** → Go to Step 3 (Need to deploy)

---

## Step 2: Backend Deployed But Not Working

### 2.1 Check Service Status
In Render dashboard → Your backend service:

**Status Indicators:**
- 🟢 **Live** = Service is running
- 🟡 **Build in progress** = Currently deploying
- 🔴 **Failed** = Build or deployment failed
- 🔵 **Suspended** = Service stopped (free tier inactivity)

### 2.2 Check Logs (Most Important!)

Click on **"Logs"** tab and look for:

#### ✅ Success Logs:
```
==> Build successful
==> Starting service...
🔗 Using DATABASE_URL for database connection (Render/Production)
Server is running on port 10000
```

#### ❌ Common Error Logs:

**Error 1: Cannot find module**
```
Error: Cannot find module './routes'
Error: Cannot find module './config/database'
```
**Solution:** Check file paths and imports

**Error 2: Database connection failed**
```
Error: password authentication failed
Error: Connection timeout
```
**Solution:** Verify DATABASE_URL environment variable

**Error 3: Port issue**
```
Error: listen EADDRINUSE
Error: Port already in use
```
**Solution:** Ensure using `process.env.PORT`

**Error 4: Package.json script error**
```
Error: Cannot find module 'src/server.js'
```
**Solution:** Fix package.json start script (already fixed!)

### 2.3 Verify Environment Variables

Go to: **Environment** tab

**Required Variables:**

| Variable | Value | Status |
|----------|-------|--------|
| `DATABASE_URL` | postgresql://quotation_user:***@dpg-***.singapore-postgres.render.com/quotation_db_ut3y | ⚠️ Check |
| `NODE_ENV` | production | ⚠️ Check |
| `JWT_SECRET` | (your-secret-key-min-32-chars) | ⚠️ Check |
| `JWT_EXPIRES_IN` | 24h | ⚠️ Check |
| `PORT` | (Auto-set by Render) | ✅ Optional |

**How to check:**
1. Click **"Environment"** tab
2. Verify all variables exist
3. Click on DATABASE_URL to see if it's linked to database

### 2.4 Test Backend URL

Your backend URL should be something like:
```
https://quotation-backend-xxxx.onrender.com
```

**Test endpoints:**

#### Test 1: Health Check
```
https://your-backend.onrender.com/health
```
**Expected:** `{"status":"OK","message":"Quotation Management System API"}`

#### Test 2: API Base
```
https://your-backend.onrender.com/api
```

#### Test 3: Login (using curl or Postman)
```bash
curl -X POST https://your-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

**Expected:** JWT token and user data

### 2.5 Common Issues & Solutions

#### Issue: 502 Bad Gateway
**Causes:**
- Service is starting up (wait 1-2 minutes)
- Build failed (check logs)
- Free tier spinning up from sleep

**Solution:**
- Wait 2 minutes and retry
- Check logs for errors
- Visit URL again to wake service

#### Issue: 404 Not Found
**Causes:**
- Routes not properly configured
- Wrong URL path
- Service not deployed

**Solution:**
- Verify routes in code
- Check exact URL from Render dashboard
- Ensure service is "Live"

#### Issue: 500 Internal Server Error
**Causes:**
- Database connection failed
- Missing environment variables
- Code errors

**Solution:**
- Check logs for specific error
- Verify DATABASE_URL
- Test database connection

#### Issue: Login fails on Render but works locally
**Causes:**
- DATABASE_URL not set
- Different database (empty)
- JWT_SECRET mismatch

**Solution:**
- Ensure DATABASE_URL points to correct Render database
- Verify users exist in Render database
- Check JWT_SECRET is set

---

## Step 3: Backend Not Deployed Yet

### 3.1 Prerequisites Check

Before deploying:

- ✅ Code pushed to GitHub
- ✅ package.json start script correct: `"start": "node server.js"`
- ✅ server.js uses `process.env.PORT`
- ✅ Database connection uses `process.env.DATABASE_URL`
- ✅ All dependencies in package.json

### 3.2 Deploy Backend to Render

Follow these steps:

#### A. Create Web Service

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Click **"Connect repository"**
4. Select: `dilmahengineering-bot/quotation-system`
5. Click **"Connect"**

#### B. Configure Service

**Settings:**
```
Name: quotation-backend
Region: Singapore (same as database!)
Branch: main
Root Directory: backend
Runtime: Node
Build Command: npm install
Start Command: npm start
Instance Type: Free
```

#### C. Add Environment Variables

Click **"Advanced"** → Add these variables:

1. **DATABASE_URL**
   - Click "Add Environment Variable"
   - From dropdown, select "Link to database"
   - Choose your PostgreSQL database
   - Render auto-fills the URL

2. **NODE_ENV**
   ```
   Key: NODE_ENV
   Value: production
   ```

3. **JWT_SECRET**
   ```
   Key: JWT_SECRET
   Value: your-secure-random-string-min-32-characters-long
   ```

4. **JWT_EXPIRES_IN**
   ```
   Key: JWT_EXPIRES_IN
   Value: 24h
   ```

#### D. Deploy

1. Click **"Create Web Service"**
2. Wait 3-5 minutes for build
3. Watch logs for success message

#### E. Verify Deployment

1. Copy your backend URL
2. Test: `https://your-backend.onrender.com/health`
3. Should see: `{"status":"OK",...}`

---

## Step 4: Verify Database Has Data

If backend deploys but login fails:

### Test Database Connection

From your local machine:

```bash
cd backend
node test-render-db.js
```

**Should show:**
```
✓ Successfully connected to Render database!
✓ Existing Tables: 8
✓ Users table: 4 users
  - admin (admin)
  - john.sales (sales)
  - jane.engineer (engineer)
```

### If Database is Empty

Run initialization:
```bash
cd backend
node init-render-database.js
```

---

## Step 5: Enable Auto-Deploy

Once working:

1. Go to backend service → **Settings**
2. Find **"Auto-Deploy"**
3. Toggle **ON**

Now every git push automatically deploys! 🚀

---

## Quick Diagnostic Checklist

Run through this checklist:

### Local Backend
- [ ] Works on localhost:5000
- [ ] Can login with admin/admin123
- [ ] Connected to Render database (DATABASE_URL set)

### Render Backend Service
- [ ] Service created in Render dashboard
- [ ] Status shows "Live" (green)
- [ ] Logs show "Server is running on port..."
- [ ] No errors in logs

### Environment Variables
- [ ] DATABASE_URL set (linked to database)
- [ ] NODE_ENV = production
- [ ] JWT_SECRET set
- [ ] JWT_EXPIRES_IN = 24h

### Code Configuration
- [ ] package.json start script: `node server.js`
- [ ] server.js exists in backend root
- [ ] server.js uses process.env.PORT
- [ ] Routes properly configured

### Database
- [ ] Render PostgreSQL database created
- [ ] Database status: Available
- [ ] Tables exist (8 tables)
- [ ] Users exist (admin user)

### Testing
- [ ] Health endpoint works: /health
- [ ] Login endpoint works: /api/auth/login
- [ ] Returns JWT token

---

## Your Backend Information

**Fill this in:**

```
Backend URL: https://________________________________.onrender.com

Status: [ ] Deployed [ ] Not deployed yet [ ] Failed

Last checked: __________________

Logs show: [ ] Success [ ] Error: _________________
```

---

## Get Help

### If still not working:

1. **Copy logs from Render:**
   - Go to Logs tab
   - Copy last 50 lines
   - Look for ERROR or FAIL messages

2. **Check service events:**
   - Events tab shows deployment history
   - Look for failed deployments

3. **Verify file structure:**
   ```
   backend/
   ├── server.js ← Must exist here
   ├── package.json
   ├── routes/
   ├── controllers/
   ├── models/
   └── config/
       └── database.js
   ```

4. **Test locally with Render database:**
   - Ensure DATABASE_URL in .env
   - Run: `node server.js`
   - Test login
   - If works locally with Render DB, issue is Render config

---

## Common Solutions Summary

| Problem | Solution |
|---------|----------|
| 502 Error | Wait 2 minutes, check logs |
| 404 Error | Verify URL, check routes |
| 500 Error | Check logs, verify DB connection |
| Build fails | Check package.json, verify dependencies |
| Login fails | Verify DATABASE_URL, check users exist |
| Can't find module | Check file paths, verify imports |
| Port error | Ensure using process.env.PORT |

---

**Next Step:** Which scenario describes your situation?

1. **No service in Render** → Follow Step 3 to deploy
2. **Service exists but error** → Check logs (Step 2.2)
3. **Service running but 502** → Wait 2 minutes, check health endpoint
4. **Login fails** → Verify database has users (Step 4)
