# Deploying to Render - Quick Guide

## Automatic Deployment (Recommended)

Since your code is now on GitHub, Render will automatically deploy when you push changes.

### ✅ Your changes are already pushed to GitHub!

Render will detect the new commit and automatically redeploy.

## Manual Deployment Steps

### 1. Check Render Dashboard

1. Go to https://dashboard.render.com
2. Log in to your account
3. Find your quotation-system services

You should have TWO services:
- **Backend Service** (Node.js)
- **PostgreSQL Database**

### 2. Trigger Manual Deploy (if needed)

If auto-deploy is disabled:

1. Click on your **Backend Service**
2. Click the **"Manual Deploy"** button
3. Select **"Deploy latest commit"**
4. Click **"Deploy"**

### 3. Monitor Deployment

Watch the deployment logs:
- Build phase: Installing dependencies
- Start phase: Running your server
- Look for: "Server is running on port..."

### 4. Set Environment Variables

Make sure these are set in Render Dashboard:

```
DATABASE_URL=<automatically set by Render>
NODE_ENV=production
PORT=<automatically set by Render>
```

For the frontend (if deployed separately):
```
REACT_APP_API_URL=https://your-backend.onrender.com/api
```

## Database Setup on Render

### Initialize Database Schema

**Option 1: Use the /setup-db endpoint**
```bash
# After backend deploys, visit:
https://your-backend-url.onrender.com/setup-db
```

**Option 2: Use Render Shell**
1. Go to your Backend service in Render
2. Click **"Shell"** tab
3. Run:
```bash
node init-render-db.js
```

## Deployment Configuration

### Backend (Web Service)

**Build Command:**
```
npm install
```

**Start Command:**
```
npm start
```

**Environment Variables:**
- Automatically gets `DATABASE_URL` from linked PostgreSQL
- `PORT` is automatically set by Render

### Frontend (Static Site)

**Build Command:**
```
npm install && npm run build
```

**Publish Directory:**
```
build
```

## Verify Deployment

### 1. Check Backend Health
```
https://your-backend-url.onrender.com/health
```

Should return:
```json
{
  "status": "OK",
  "message": "Quotation Management System API",
  "database": "Connected",
  "timestamp": "..."
}
```

### 2. Test API
```
https://your-backend-url.onrender.com/api/machines
```

### 3. Check Frontend
Visit your frontend URL and test the application.

## Troubleshooting

### Issue: Build Fails

**Check:**
1. Build logs in Render dashboard
2. Ensure all dependencies are in package.json
3. Node version compatibility

### Issue: Database Connection Fails

**Solutions:**
1. Verify PostgreSQL database is running
2. Check if DATABASE_URL is set
3. Initialize schema using /setup-db endpoint
4. Check database connection in Render Shell:
   ```bash
   npm run test-db
   ```

### Issue: Application Starts but Crashes

**Check:**
1. Environment variables are set correctly
2. Database schema is initialized
3. Look at application logs in Render dashboard

### Issue: Frontend Can't Connect to Backend

**Fix:**
1. Update REACT_APP_API_URL in frontend environment variables
2. Ensure CORS is enabled in backend
3. Use HTTPS URLs (Render provides SSL automatically)

## Updating After Changes

### Every time you make changes:

1. **Make changes locally**
2. **Test locally**
   ```bash
   npm run test-db  # Test database
   npm start        # Test backend
   ```

3. **Commit and push to GitHub**
   ```bash
   git add .
   git commit -m "Your change description"
   git push origin main
   ```

4. **Render auto-deploys!** 🎉
   - Watch deployment in Render dashboard
   - Usually takes 2-5 minutes

## Quick Commands Reference

```bash
# Local testing
cd backend
npm run test-db        # Test database connection
npm start              # Start backend

# Git workflow
git status             # Check changes
git add .              # Stage all changes
git commit -m "msg"    # Commit with message
git push origin main   # Push to GitHub (triggers Render deploy)

# Check deployment
git log --oneline -5   # View recent commits
```

## Render Service URLs

After deployment, you'll have:

**Backend API:**
```
https://your-service-name.onrender.com
```

**Frontend (if deployed):**
```
https://your-frontend-name.onrender.com
```

**Database Connection String:**
```
Automatically provided by Render as DATABASE_URL
```

## Features Available on Render

All your new features work on Render:
- ✅ PDF Generation (PDFKit is included)
- ✅ Database Connection Pooling
- ✅ Health Check with DB status
- ✅ Error handling and recovery
- ✅ All API endpoints

## Monitoring

### Check Application Health

**Health Endpoint:**
```
https://your-backend-url.onrender.com/health
```

**Check Logs:**
1. Go to Render Dashboard
2. Select your service
3. Click "Logs" tab
4. Look for:
   - "Server is running on port..."
   - "✅ Database connected successfully"

### Performance

Render free tier:
- Spins down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- Upgrade to paid tier for always-on service

## Best Practices

1. **Always test locally first** using `npm run test-db`
2. **Use meaningful commit messages** for easier tracking
3. **Monitor first deployment** to catch any issues
4. **Check health endpoint** after each deployment
5. **Keep environment variables in Render** (never commit them)

## Current Status

Your latest commit is deployed:
```
f50d085 - Add PDF generation and database connection improvements
```

Next push to GitHub will automatically deploy to Render! 🚀

---

**Need Help?**
- Render Docs: https://render.com/docs
- Check logs in Render Dashboard
- Test health endpoint after deployment
