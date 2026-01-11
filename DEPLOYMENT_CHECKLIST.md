# Quick Deployment Checklist

## Before You Start

1. [ ] Render account created at https://render.com
2. [ ] Logged in with GitHub
3. [ ] Repository visible: dilmahengineering-bot/quotation-system

---

## Backend Deployment (15 min)

### Step 1: Create Web Service
- [ ] Click "New +" → "Web Service"
- [ ] Connect repository: `quotation-system`
- [ ] Settings:
  - Name: `quotation-backend`
  - Region: **Singapore**
  - Root Directory: `backend`
  - Build: `npm install`
  - Start: `node server.js`
  - Plan: **Free**

### Step 2: Environment Variables (6 total)
- [ ] `DATABASE_URL` = `postgresql://quotation_user:0TPtXZmj2VmnDLgT9Z4tRBE8KAI3WZrN@dpg-d5hioiemcj7s73b2133g-a.singapore-postgres.render.com/quotation_db_ut3y`
- [ ] `NODE_ENV` = `production`
- [ ] `JWT_SECRET` = `(your-secure-random-string-min-32-chars)`
- [ ] `JWT_EXPIRES_IN` = `24h`
- [ ] `PORT` = `10000` (optional)
- [ ] `RENDER_EXTERNAL_URL` = (add after deploy)

### Step 3: Deploy & Test
- [ ] Click "Create Web Service"
- [ ] Wait 3-5 minutes for build
- [ ] Status shows "Live" (green)
- [ ] Copy backend URL: `https://________.onrender.com`
- [ ] Test health: Open `https://your-backend.onrender.com/health`
  - Should see: `{"status":"healthy","database":"connected"}`

✅ **Backend deployed!**

---

## Frontend Deployment (15 min)

### Step 4: Push API URL Fix
```bash
cd quotation-system
git add .
git commit -m "fix: Use environment variable for API URL"
git push origin main
```

### Step 5: Create Static Site
- [ ] Click "New +" → "Static Site"
- [ ] Connect repository: `quotation-system`
- [ ] Settings:
  - Name: `quotation-frontend`
  - Root Directory: `frontend`
  - Build: `npm install && npm run build`
  - Publish: `build`

### Step 6: Environment Variable
- [ ] `REACT_APP_API_URL` = `https://your-backend.onrender.com/api`
  - ⚠️ Use YOUR actual backend URL from Step 3!

### Step 7: Deploy & Test
- [ ] Click "Create Static Site"
- [ ] Wait 3-5 minutes for build
- [ ] Status shows "Live" (green)
- [ ] Copy frontend URL: `https://________.onrender.com`
- [ ] Open frontend URL in browser
- [ ] Try login: `admin` / `admin123`
- [ ] Should see dashboard after login

✅ **Frontend deployed!**

---

## Post-Deployment (5 min)

### Step 8: Enable Auto-Deploy
- [ ] Backend service → Settings → Auto-Deploy: **ON**
- [ ] Frontend service → Settings → Auto-Deploy: **ON**

### Step 9: Keep Backend Alive (Optional)
**Option A: External Cron Service**
- [ ] Sign up at https://cron-job.org
- [ ] Create job: `https://your-backend.onrender.com/health` every 10 min

**Option B: Environment Variable**
- [ ] Backend → Environment → Edit `RENDER_EXTERNAL_URL`
- [ ] Set to: `https://your-backend.onrender.com`
- [ ] Save (auto-redeploys)

---

## Final Testing

### Test Complete Workflow
- [ ] Login works
- [ ] Create new quotation
- [ ] View quotations list
- [ ] Edit quotation
- [ ] Export to Excel works
- [ ] Export to PDF works
- [ ] User management (admin)
- [ ] Password change works

---

## Your Deployment Info

**Write your URLs here:**

```
Backend:  https://________________________________.onrender.com
Frontend: https://________________________________.onrender.com

Database: dpg-d5hioiemcj7s73b2133g-a.singapore-postgres.render.com
Region:   Singapore
Status:   ✅ ACTIVE
```

**Admin Login:**
```
Username: admin
Password: admin123
```

---

## Troubleshooting

### Backend won't start?
1. Check logs in Render dashboard
2. Verify DATABASE_URL is correct
3. Wait 2 minutes (database connecting)

### Frontend can't connect?
1. Verify REACT_APP_API_URL is correct
2. Check backend is "Live"
3. Clear browser cache

### 502 Error?
- Backend is starting (wait 1-2 minutes)
- Free tier waking up from sleep

---

## Time Estimate
- Backend setup: 15 minutes
- Frontend setup: 15 minutes
- Testing: 10 minutes
- **Total: ~40 minutes**

---

**Ready? Start with Backend Deployment!** 🚀

Follow the detailed guide: [RENDER_HOSTING_STEP_BY_STEP.md](RENDER_HOSTING_STEP_BY_STEP.md)
