# Render Database Connection Guide

## Current Status

**Local Environment**: ✓ Connected to local PostgreSQL (quotation_db on localhost)  
**Render Database**: ⚠ Not configured yet

---

## How to Connect to Render Database

### Step 1: Get DATABASE_URL from Render

1. Go to https://dashboard.render.com
2. Log in with your GitHub account (dilmahengineering-bot)
3. Navigate to your **PostgreSQL database** service
4. Find the **"Internal Database URL"** or **"External Database URL"**
   
   Format: `postgres://username:password@host:port/database`
   
   Example: `postgres://quotation_user:abc123xyz@dpg-xxxxx.oregon-postgres.render.com:5432/quotation_db`

### Step 2: Test Render Connection Locally

Add to your `backend/.env` file:

```env
# Local database (keep for development)
PORT=5000
DB_USER=postgres
DB_HOST=localhost
DB_NAME=quotation_db
DB_PASSWORD=Dilmah@456
DB_PORT=5432

# Render database (add this line)
DATABASE_URL=postgres://your-username:your-password@host:port/database

NODE_ENV=development
JWT_SECRET=your-secret-key-change-this-in-production-min-32-chars
JWT_EXPIRES_IN=24h
```

### Step 3: Update Database Configuration

The `backend/config/database.js` should detect DATABASE_URL automatically:

```javascript
const { Pool } = require('pg');

const pool = new Pool(
  process.env.DATABASE_URL ? {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Required for Render
    }
  } : {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'quotation_db',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
  }
);

module.exports = pool;
```

### Step 4: Test Connection

Run the test script:

```bash
cd backend
node test-render-db.js
```

Expected output if successful:
```
✓ DATABASE_URL environment variable found
✓ Successfully connected to Render database!

Database Information:
  Version: PostgreSQL 15.x
  Database: quotation_db
  User: your_username

✓ Existing Tables: 8
  - auxiliary_costs
  - customers
  - machines
  - parts
  - quotations
  - users
  ...
```

### Step 5: Initialize Render Database Schema

If the database is empty (no tables), initialize it:

**Option A: Using backend script**
```bash
cd backend
node setup-db.js
```

**Option B: Via API endpoint** (after deploying to Render)
```
Visit: https://your-backend-name.onrender.com/setup-db
```

---

## Troubleshooting

### Error: "password authentication failed"

- Verify DATABASE_URL is correct (copy from Render dashboard)
- Check username and password in the connection string
- Ensure database is active (not paused)

### Error: "Connection timeout"

- Check if using **External Database URL** (required for local connections)
- Internal URL only works within Render services
- Verify firewall/network settings

### Error: "SSL connection required"

Add to database config:
```javascript
ssl: {
  rejectUnauthorized: false
}
```

### Error: "Database does not exist"

- Verify database name in DATABASE_URL matches created database
- Check Render dashboard for correct database name

---

## Deployment to Render

### Backend Environment Variables (in Render Dashboard)

Set these in **Backend Web Service → Environment**:

```
DATABASE_URL = <link to PostgreSQL database>
NODE_ENV = production
JWT_SECRET = <your-secure-secret-key-min-32-chars>
JWT_EXPIRES_IN = 24h
PORT = <automatically set by Render>
```

### Database Setup on Render

1. **Create PostgreSQL Database** on Render (Free tier available)
   - Name: `quotation-db`
   - Region: Choose closest to backend service

2. **Link Database to Backend**
   - In backend service settings
   - Add environment variable: DATABASE_URL
   - Select your PostgreSQL database from dropdown
   - Render automatically sets the connection string

3. **Initialize Database**
   - Deploy backend first
   - Visit: `https://your-backend.onrender.com/setup-db`
   - This creates all tables and seed data

4. **Verify Connection**
   - Visit: `https://your-backend.onrender.com/health`
   - Should return: `{"status": "healthy", "database": "connected"}`

---

## Testing Checklist

- [ ] DATABASE_URL added to .env
- [ ] test-render-db.js runs successfully
- [ ] All tables exist in Render database
- [ ] Users table has at least 3 default users
- [ ] Backend server connects on startup
- [ ] Health endpoint returns "connected"
- [ ] Can login with admin/admin123

---

## Quick Commands

**Test Render connection:**
```bash
cd backend
node test-render-db.js
```

**Initialize Render database:**
```bash
cd backend
DATABASE_URL="your-url" node setup-db.js
```

**Check tables:**
```bash
cd backend
node -e "require('dotenv').config(); const pool = require('./config/database'); pool.query('SELECT table_name FROM information_schema.tables WHERE table_schema = \\'public\\'').then(r => { console.log('Tables:', r.rows.map(t => t.table_name)); process.exit(0); });"
```

**Test login with Render DB:**
```bash
cd backend
DATABASE_URL="your-url" node test-login.js
```

---

## Need Help?

1. Check Render documentation: https://render.com/docs/databases
2. View backend logs in Render dashboard
3. Verify DATABASE_URL format is correct
4. Ensure database service is running (not paused)
5. Check if database needs initialization (no tables)

---

**Current Environment**: Local development (localhost)  
**To use Render**: Add DATABASE_URL to .env and restart backend
