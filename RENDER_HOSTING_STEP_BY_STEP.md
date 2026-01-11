# Render Hosting - Complete Step-by-Step Guide

**Your database is already set up and ready!** ✅  
Now let's deploy the backend and frontend.

---

## Prerequisites Checklist

- ✅ GitHub repository: https://github.com/dilmahengineering-bot/quotation-system
- ✅ Render database: PostgreSQL 18.1 (Singapore) - **READY**
- ✅ Database initialized with all tables and users
- ✅ Local testing completed successfully
- 🔲 Render account (we'll create/login in Step 1)

---

## Part 1: Create Render Account (5 minutes)

### Step 1.1: Sign Up / Login
1. Go to https://render.com
2. Click **"Get Started"** or **"Sign In"**
3. Choose **"Sign in with GitHub"**
4. Authorize Render to access your GitHub account
5. You'll be redirected to Render Dashboard

### Step 1.2: Verify Access
- You should see your GitHub username in top-right
- Dashboard should be empty (if new account)
- You can see "New +" button in top menu

✅ **Ready to proceed to database setup**

---

## Part 2: PostgreSQL Database (Already Done! ✅)

### Your Database Details:
```
Status: ACTIVE ✅
Region: Singapore
Version: PostgreSQL 18.1
Database: quotation_db_ut3y
User: quotation_user
Tables: 8 tables (users, quotations, customers, machines, etc.)
Users: 4 users with passwords set
```

**Connection String:**
```
postgresql://quotation_user:0TPtXZmj2VmnDLgT9Z4tRBE8KAI3WZrN@dpg-d5hioiemcj7s73b2133g-a.singapore-postgres.render.com/quotation_db_ut3y
```

⚠️ **IMPORTANT:** Keep this connection string safe! You'll need it in Step 3.5

✅ **Skip to Part 3 - Database already initialized**

---

## Part 3: Deploy Backend API (15 minutes)

### Step 3.1: Create Web Service
1. Click **"New +"** button (top-right)
2. Select **"Web Service"**
3. You'll see "Create a new Web Service" page

### Step 3.2: Connect Repository
1. Under "Connect a repository":
   - If you see your repo listed, click **"Connect"**
   - If not, click **"Configure account"** to authorize more repos
2. Find and select: **`dilmahengineering-bot/quotation-system`**
3. Click **"Connect"**

### Step 3.3: Configure Service Settings

**Fill in these fields exactly:**

| Field | Value |
|-------|-------|
| **Name** | `quotation-backend` (or your preferred name) |
| **Region** | Singapore (same as database!) |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |

### Step 3.4: Select Plan
- Scroll down to "Instance Type"
- Select **"Free"** (Free: $0/month)
- ⚠️ Note: Free tier spins down after 15 min of inactivity

### Step 3.5: Set Environment Variables

Click **"Advanced"** button to expand environment settings.

Add these **6 environment variables** (click "Add Environment Variable" for each):

#### Variable 1: DATABASE_URL
```
Key: DATABASE_URL
Value: postgresql://quotation_user:0TPtXZmj2VmnDLgT9Z4tRBE8KAI3WZrN@dpg-d5hioiemcj7s73b2133g-a.singapore-postgres.render.com/quotation_db_ut3y
```

#### Variable 2: NODE_ENV
```
Key: NODE_ENV
Value: production
```

#### Variable 3: JWT_SECRET
```
Key: JWT_SECRET
Value: your-super-secure-jwt-secret-key-min-32-characters-change-this
```
⚠️ **IMPORTANT:** Change this to a random secure string!

#### Variable 4: JWT_EXPIRES_IN
```
Key: JWT_EXPIRES_IN
Value: 24h
```

#### Variable 5: PORT (Optional - Render sets automatically)
```
Key: PORT
Value: 10000
```

#### Variable 6: RENDER_EXTERNAL_URL (Optional - for keep-alive)
```
Key: RENDER_EXTERNAL_URL
Value: (Leave blank for now - we'll add after deploy)
```

### Step 3.6: Deploy Backend
1. Scroll to bottom
2. Click **"Create Web Service"**
3. Render will start building:
   - ⏳ Installing dependencies...
   - ⏳ Starting server...
   - This takes 2-5 minutes

### Step 3.7: Monitor Deployment

Watch the **Logs** section (auto-opens):

**What you should see:**
```
==> Cloning from https://github.com/dilmahengineering-bot/quotation-system...
==> Installing dependencies...
==> Build successful!
==> Starting server...
🔗 Using DATABASE_URL for database connection (Render/Production)
Server is running on port 10000
```

✅ **Success indicators:**
- Status shows "Live" (green dot)
- No error messages in logs
- You see "Server is running on port..."

### Step 3.8: Get Your Backend URL

At the top of the page, you'll see your service URL:
```
https://quotation-backend-xxxx.onrender.com
```

**Copy this URL!** You'll need it for frontend configuration.

### Step 3.9: Test Backend API

#### Test 1: Health Check
Open in browser:
```
https://your-backend-url.onrender.com/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "database": "connected"
}
```

#### Test 2: Login Test
Use Postman or curl:
```bash
curl -X POST https://your-backend-url.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

**Expected response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": 1,
    "username": "admin",
    "role": "admin",
    "email": "admin@company.com"
  }
}
```

✅ **Backend deployment complete!**

---

## Part 4: Deploy Frontend (15 minutes)

### Step 4.1: Update Frontend Configuration

**Before deploying,** we need to update the API URL in your code.

Open: `frontend/src/utils/api.js` or `frontend/src/config.js`

Update the API base URL:
```javascript
// Change from:
const API_URL = 'http://localhost:5000/api';

// To:
const API_URL = process.env.REACT_APP_API_URL || 'https://your-backend-url.onrender.com/api';
```

**Save and commit:**
```bash
cd quotation-system
git add frontend/src/utils/api.js
git commit -m "Update API URL for production"
git push origin main
```

### Step 4.2: Create Static Site

1. Go back to Render Dashboard
2. Click **"New +"** button
3. Select **"Static Site"**

### Step 4.3: Connect Repository
1. Select: **`dilmahengineering-bot/quotation-system`**
2. Click **"Connect"**

### Step 4.4: Configure Static Site

**Fill in these fields:**

| Field | Value |
|-------|-------|
| **Name** | `quotation-frontend` |
| **Branch** | `main` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `build` |

### Step 4.5: Set Environment Variable

Click **"Advanced"** and add:

```
Key: REACT_APP_API_URL
Value: https://your-backend-url.onrender.com/api
```

Replace with your actual backend URL from Step 3.8!

### Step 4.6: Deploy Frontend
1. Click **"Create Static Site"**
2. Wait for build (3-5 minutes)

**Build logs should show:**
```
==> Installing dependencies...
==> Running npm run build...
==> Build successful!
==> Publishing build directory...
```

### Step 4.7: Get Frontend URL

Your frontend URL will be:
```
https://quotation-frontend-xxxx.onrender.com
```

### Step 4.8: Test Frontend

1. Open the URL in browser
2. You should see the login page
3. Try logging in:
   - Username: `admin`
   - Password: `admin123`

✅ **If login works, deployment is complete!**

---

## Part 5: Configure Custom Domain (Optional)

### Step 5.1: Add Custom Domain to Frontend
1. Go to your frontend service
2. Click "Settings" tab
3. Scroll to "Custom Domain"
4. Click "Add Custom Domain"
5. Enter: `quotations.yourdomain.com`
6. Follow DNS instructions

### Step 5.2: Add Custom Domain to Backend
1. Go to your backend service
2. Repeat same steps
3. Use: `api.yourdomain.com`

---

## Part 6: Enable Auto-Deploy (Recommended)

### Step 6.1: Configure Auto-Deploy
1. Go to each service → "Settings"
2. Find "Auto-Deploy"
3. Toggle **ON**

Now every `git push` automatically deploys! 🚀

---

## Part 7: Keep Backend Alive (Free Tier)

Free tier services spin down after 15 minutes of inactivity.

### Option 1: Use Cron-Job.org (Recommended)
1. Sign up at https://cron-job.org
2. Create new cron job:
   - URL: `https://your-backend.onrender.com/health`
   - Schedule: Every 10 minutes
   - This keeps your backend active

### Option 2: Set RENDER_EXTERNAL_URL
1. Go to backend service → Environment
2. Edit `RENDER_EXTERNAL_URL` variable
3. Set value: `https://your-backend-url.onrender.com`
4. Save changes
5. Service auto-deploys with keep-alive

---

## Troubleshooting

### Issue 1: Backend Build Fails
**Error:** "npm install failed"

**Solution:**
1. Check `backend/package.json` exists
2. Verify Node version compatibility
3. Check Render logs for specific error

### Issue 2: Database Connection Failed
**Error:** "password authentication failed"

**Solution:**
1. Verify `DATABASE_URL` environment variable
2. Check connection string is correct
3. Ensure database is not paused

### Issue 3: Frontend Shows Connection Error
**Error:** "Network Error" or "Cannot connect to API"

**Solution:**
1. Verify backend is deployed and running
2. Check `REACT_APP_API_URL` is correct
3. Ensure CORS is enabled in backend
4. Check backend health: `/health` endpoint

### Issue 4: 502 Bad Gateway
**Error:** "502 Bad Gateway"

**Solution:**
1. Backend is starting (wait 1-2 minutes)
2. Free tier spinning up from sleep
3. Check backend logs for errors

### Issue 5: Frontend Build Fails
**Error:** "Build command failed"

**Solution:**
1. Verify `package.json` in frontend folder
2. Check for dependency errors
3. Test build locally: `npm run build`

---

## Deployment Checklist

### Pre-Deployment ✓
- [x] Code pushed to GitHub
- [x] Database initialized
- [x] Local testing successful
- [ ] API URL updated in frontend code

### Backend Deployment ✓
- [ ] Web Service created
- [ ] Environment variables set (6 variables)
- [ ] Build successful
- [ ] Health endpoint working
- [ ] Login endpoint working

### Frontend Deployment ✓
- [ ] Static Site created
- [ ] REACT_APP_API_URL set
- [ ] Build successful
- [ ] Can access login page
- [ ] Can login successfully

### Post-Deployment ✓
- [ ] Auto-deploy enabled
- [ ] Keep-alive configured (optional)
- [ ] Custom domain added (optional)
- [ ] SSL certificate active (automatic)

---

## Your Deployment URLs

**Fill these in after deployment:**

```
Backend API:  https://__________________________.onrender.com
Frontend App: https://__________________________.onrender.com
Database:     dpg-d5hioiemcj7s73b2133g-a.singapore-postgres.render.com
```

**Admin Login:**
```
Username: admin
Password: admin123
```

---

## Quick Commands Reference

### Local Testing Before Deploy
```bash
# Test backend locally
cd backend
npm install
node server.js

# Test frontend locally
cd frontend
npm install
npm start
```

### Push Changes to Deploy
```bash
git add .
git commit -m "Your changes"
git push origin main
```

### View Render Logs
```bash
# From Render Dashboard:
1. Click on your service
2. Click "Logs" tab
3. Real-time logs appear
```

---

## Support Resources

- **Render Documentation:** https://render.com/docs
- **Render Status:** https://status.render.com
- **Community Forum:** https://community.render.com
- **Your GitHub Repo:** https://github.com/dilmahengineering-bot/quotation-system

---

## Next Steps After Deployment

1. **Test all features:**
   - User login/logout
   - Create quotation
   - View quotations list
   - Export to Excel/PDF
   - User management (admin)

2. **Set up monitoring:**
   - Render provides basic metrics
   - Consider adding error tracking (Sentry)

3. **Backup strategy:**
   - Render provides daily database backups
   - Download backups regularly

4. **Security:**
   - Change JWT_SECRET to strong random string
   - Update admin password
   - Enable 2FA on GitHub

5. **Performance:**
   - Consider upgrading to paid tier ($7/month) for:
     - No spin-down
     - Better performance
     - More resources

---

**Ready to deploy?** Start with Part 3! 🚀
