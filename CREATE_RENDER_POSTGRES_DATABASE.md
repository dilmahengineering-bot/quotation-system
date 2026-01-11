# Create New PostgreSQL Database in Render

**Step-by-step guide to create a PostgreSQL database on Render.com**

---

## Prerequisites

- Render account (sign up at https://render.com)
- Logged in with GitHub

---

## Step 1: Go to Render Dashboard

1. Open https://dashboard.render.com
2. Make sure you're logged in
3. You should see the main dashboard

---

## Step 2: Create New PostgreSQL Database

### 2.1: Click New Database
1. Click the **"New +"** button (top-right corner)
2. From the dropdown menu, select **"PostgreSQL"**

### 2.2: Configure Database Settings

You'll see the "Create PostgreSQL" form. Fill in these details:

#### Basic Information

| Field | What to Enter | Example |
|-------|---------------|---------|
| **Name** | Database service name | `quotation-db` or `quotation-database` |
| **Database** | Database name (optional) | `quotation_db` (or leave default) |
| **User** | Username (optional) | `quotation_user` (or leave default) |
| **Region** | Choose closest region | **Singapore** (for Asia) or **Oregon** (USA) |

**Region Selection Tips:**
- 🌏 **Singapore** - Best for Asia/Australia
- 🇺🇸 **Oregon (US West)** - Best for US West Coast
- 🇺🇸 **Ohio (US East)** - Best for US East Coast
- 🇪🇺 **Frankfurt** - Best for Europe

#### PostgreSQL Version
- Select: **PostgreSQL 16** (latest stable) or **PostgreSQL 15**
- Recommended: Use latest version

#### Instance Type (Free vs Paid)

**Free Tier ($0/month):**
- ✅ 256 MB RAM
- ✅ 1 GB Storage
- ✅ Good for development/testing
- ⚠️ Database expires after 90 days of inactivity
- ⚠️ Limited connections (20 max)

**Starter ($7/month):**
- ✅ 256 MB RAM
- ✅ 1 GB Storage
- ✅ No expiration
- ✅ More reliable
- ✅ Automatic backups

**Standard ($20/month):**
- ✅ 2 GB RAM
- ✅ 10 GB Storage
- ✅ Better performance
- ✅ More connections

**For this project:** Select **Free** to start

---

## Step 3: Create Database

1. Review all settings
2. Click **"Create Database"** button (bottom of page)
3. Wait 1-2 minutes for provisioning

**What happens:**
- Render provisions PostgreSQL instance
- Creates database with your chosen name
- Generates connection credentials
- Sets up internal networking

---

## Step 4: Get Database Connection Details

Once created, you'll see the database dashboard. Here's what you need:

### 4.1: Find Connection Information

Scroll down to **"Connections"** section. You'll see:

#### Internal Database URL
```
postgres://user:password@host:5432/database
```
- Use this for services **within Render** (backend web service)
- Faster and free
- No bandwidth charges

#### External Database URL
```
postgresql://user:password@external-host.render.com:5432/database
```
- Use this for connections **from outside Render** (local development)
- Slower (public internet)
- May have bandwidth costs

### 4.2: Copy Your Connection String

**For Backend Deployment on Render:**
```
Copy the "Internal Database URL"
```

**For Local Development:**
```
Copy the "External Database URL"
```

**Example Connection String:**
```
postgresql://quotation_user:abc123xyz456@dpg-xxxxxxx.singapore-postgres.render.com/quotation_db
```

**Parts Explained:**
- `quotation_user` - Username
- `abc123xyz456` - Password (auto-generated)
- `dpg-xxxxxxx.singapore-postgres.render.com` - Host
- `quotation_db` - Database name

⚠️ **IMPORTANT:** Keep this connection string safe! Treat it like a password.

---

## Step 5: Save Connection Details

### 5.1: Create a Safe Note

Copy these details somewhere safe (password manager, encrypted note):

```
Database Name: quotation_db
Username: quotation_user
Password: [auto-generated-password]
Host: dpg-xxxxx.singapore-postgres.render.com
Port: 5432
Region: Singapore

Internal URL: postgres://user:pass@internal-host/db
External URL: postgresql://user:pass@external-host.render.com/db
```

### 5.2: Add to Your Backend .env File (Local Testing)

Open: `backend/.env`

Add or update:
```env
# Render Database (for local testing with Render DB)
DATABASE_URL=postgresql://your-user:your-password@external-host.render.com/your-db

# Keep local database for backup
DB_USER=postgres
DB_HOST=localhost
DB_NAME=quotation_db
DB_PASSWORD=Dilmah@456
DB_PORT=5432
```

---

## Step 6: Initialize Database

Your database is now **created but empty**. You need to add tables and data.

### Option A: From Your Local Machine

```bash
# Navigate to backend folder
cd backend

# Make sure DATABASE_URL is in .env file
# Then run initialization script
node init-render-database.js
```

**This will:**
- Create all tables (users, quotations, customers, machines, etc.)
- Add default users (admin, sales, engineer)
- Add default machines (CNC Lathe, CNC Milling, etc.)
- Add auxiliary costs and customers

### Option B: After Deploying Backend to Render

1. Deploy your backend to Render (follow deployment guide)
2. Visit: `https://your-backend.onrender.com/setup-db`
3. Should see: `{"status": "success", "message": "Database initialized"}`

---

## Step 7: Test Database Connection

### Test from Local Machine

```bash
cd backend
node test-render-db.js
```

**Expected Output:**
```
=== Testing Render Database Connection ===

✓ DATABASE_URL environment variable found
✓ Successfully connected to Render database!

Database Information:
  Version: PostgreSQL 16.x
  Database: quotation_db
  User: quotation_user

✓ Existing Tables: 8
  - users
  - machines
  - customers
  ...
```

---

## Step 8: Connect Backend to Database

### 8.1: For Local Development

Your backend is already configured! Just add DATABASE_URL to `.env`

### 8.2: For Production (Backend on Render)

When you deploy backend to Render:

1. Go to your backend web service
2. Click **"Environment"** tab
3. Click **"Add Environment Variable"**
4. Add:
   ```
   Key: DATABASE_URL
   Value: [Click "Link to Database" and select your PostgreSQL database]
   ```
5. Render automatically fills in the Internal Database URL
6. Save and redeploy

---

## Step 9: Verify Database is Working

### Check Database Status

In Render dashboard → Your PostgreSQL database:

- **Status:** Should show green "Available"
- **Connection Count:** Shows active connections
- **Storage Used:** Shows current usage

### Check from Backend

Once backend is connected:
```bash
# Test health endpoint
curl https://your-backend.onrender.com/health

# Should return:
# {"status": "healthy", "database": "connected"}
```

---

## Database Management

### View Database Info

In Render dashboard:
- **Info tab:** Database details, connection strings
- **Metrics tab:** CPU, memory, storage usage graphs
- **Logs tab:** PostgreSQL logs
- **Backups tab:** Automatic backups (paid plans)
- **Settings tab:** Upgrade plan, delete database

### Access Database via PSQL (Optional)

Using external URL:
```bash
psql "postgresql://user:pass@external-host.render.com:5432/database"
```

### Connect with Database Tools

Use external URL with:
- **pgAdmin** - PostgreSQL GUI tool
- **DBeaver** - Universal database tool
- **TablePlus** - Modern database GUI
- **DataGrip** - JetBrains database IDE

**Connection Settings:**
- Host: `external-host.render.com`
- Port: `5432`
- Database: `quotation_db`
- Username: `quotation_user`
- Password: `[your-password]`
- SSL: **Required** (enable SSL mode)

---

## Troubleshooting

### Database Creation Failed
- **Check:** Render service status
- **Try:** Different region
- **Verify:** Account has database quota available

### Can't Connect from Local Machine
- **Use:** External Database URL (not internal)
- **Check:** Firewall allows outbound port 5432
- **Verify:** SSL is enabled in connection

### Connection Timeout
- **Check:** Database is "Available" status
- **Verify:** Not in maintenance window
- **Try:** Different network (could be ISP blocking)

### "Password authentication failed"
- **Double-check:** Connection string is correct
- **Copy-paste:** Don't type manually (special characters)
- **Verify:** Username and password match dashboard

### Database Full
- **Free tier:** 1 GB limit
- **Check:** Metrics tab for storage usage
- **Solution:** Upgrade plan or clean up data

---

## Database Limits

### Free Plan
- ✅ 256 MB RAM
- ✅ 1 GB Storage
- ✅ 20 Connections
- ⚠️ 90-day expiration if inactive
- ⚠️ Shared resources

### Starter Plan ($7/month)
- ✅ 256 MB RAM
- ✅ 1 GB Storage
- ✅ 20 Connections
- ✅ No expiration
- ✅ Daily backups

### Standard Plan ($20/month)
- ✅ 2 GB RAM
- ✅ 10 GB Storage
- ✅ 100 Connections
- ✅ Daily backups
- ✅ Better performance

---

## Best Practices

### Security
- ✅ Never commit connection strings to Git
- ✅ Use environment variables
- ✅ Rotate passwords periodically
- ✅ Enable SSL for all connections

### Performance
- ✅ Use Internal URL for backend on Render
- ✅ Close database connections properly
- ✅ Use connection pooling
- ✅ Monitor slow queries

### Backups
- ✅ Enable automatic backups (paid plans)
- ✅ Test restore procedure
- ✅ Export data regularly for local backup
- ✅ Keep critical data in multiple locations

---

## Quick Reference

### Your New Database Details

Fill this in after creation:

```
✅ Database Created!

Name:     ___________________________
Region:   ___________________________
Version:  PostgreSQL __.__
Plan:     Free / Starter / Standard

Internal URL: postgres://_______________________________________
External URL: postgresql://____________________________________

Status: ✅ Available
```

### Next Steps

1. ✅ Database created
2. [ ] Connection string saved safely
3. [ ] Added to backend .env file
4. [ ] Database initialized (tables created)
5. [ ] Connection tested successfully
6. [ ] Backend connected and working

---

## Need Help?

- **Render Docs:** https://render.com/docs/databases
- **PostgreSQL Docs:** https://www.postgresql.org/docs/
- **Support:** https://render.com/support
- **Community:** https://community.render.com

---

**Congratulations! Your PostgreSQL database is ready!** 🎉

Next: Deploy your backend and connect it to this database!
