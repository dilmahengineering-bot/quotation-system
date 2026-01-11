# Fix Render Frontend Login Issue

## Problem
Frontend deployed on Render shows login page but login fails because it's trying to connect to `http://localhost:5000` instead of your Render backend.

## Solution

### Step 1: Get Your Backend URL
Your backend URL on Render should look like:
```
https://quotation-backend-xxxx.onrender.com
```

Find it in your Render Dashboard → Backend Service → URL at the top.

### Step 2: Configure Frontend Environment Variable

1. Go to **Render Dashboard**
2. Click on your **Frontend Service** (Static Site)
3. Go to **Environment** tab
4. Click **Add Environment Variable**
5. Add:
   - **Key:** `REACT_APP_API_URL`
   - **Value:** `https://your-backend-url.onrender.com/api`
   
   Example: `https://quotation-backend-abc123.onrender.com/api`

6. Click **Save Changes**

### Step 3: Redeploy Frontend

1. Go to **Manual Deploy** section
2. Click **Clear build cache & deploy**
3. Wait for deployment to complete (2-3 minutes)

### Step 4: Test Login

1. Open your Render frontend URL
2. Try logging in with:
   - Username: `admin`
   - Password: `admin123`

## Verification

Open browser console (F12) and check:
- Network tab should show requests going to `https://your-backend.onrender.com/api/auth/login`
- Should NOT see requests to `localhost:5000`

## Backend CORS Configuration

✅ Backend has been updated to accept requests from:
- `localhost` (for local development)
- `*.onrender.com` (for Render deployment)

## Quick Troubleshooting

If login still fails:

1. **Check browser console** for errors
2. **Verify backend is running:** Visit `https://your-backend.onrender.com/health`
3. **Check environment variable:** Make sure `REACT_APP_API_URL` is set correctly
4. **Clear cache:** Try clearing browser cache or open in incognito

## Important Notes

⚠️ **Environment variables starting with `REACT_APP_` must be set BEFORE build**
- If you change the variable, you MUST redeploy
- Frontend builds the value into the static files

⚠️ **Don't forget the `/api` at the end**
- Correct: `https://backend.onrender.com/api`
- Wrong: `https://backend.onrender.com`
