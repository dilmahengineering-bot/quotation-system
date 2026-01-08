# Troubleshooting Guide

Quick solutions to common issues with the Quotation Management System.

## 🔴 Installation Issues

### Problem: "Node.js is not installed"
**Symptoms:**
- Installation script fails immediately
- Command `node --version` not found

**Solutions:**
1. Install Node.js from https://nodejs.org/
2. Download LTS version (recommended)
3. Restart terminal after installation
4. Verify: `node --version` and `npm --version`

### Problem: "PostgreSQL is not installed"
**Symptoms:**
- Cannot find `psql` command
- Database creation fails

**Solutions:**

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Windows:**
- Download from https://www.postgresql.org/download/windows/
- Run installer
- Remember password you set during installation

### Problem: "npm install" fails
**Symptoms:**
- Errors during dependency installation
- Permission denied errors

**Solutions:**

**For permission errors (Linux/Mac):**
```bash
# Fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

**For network errors:**
```bash
# Clear npm cache
npm cache clean --force

# Use different registry
npm config set registry https://registry.npmjs.org/

# Try install again
npm install
```

**For specific package errors:**
```bash
# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Problem: Database schema initialization fails
**Symptoms:**
- Error when running schema.sql
- Tables not created

**Solutions:**
```bash
# 1. Drop and recreate database
dropdb -U postgres quotation_db
createdb -U postgres quotation_db

# 2. Run schema with verbose output
psql -U postgres -d quotation_db -f backend/database/schema.sql -a

# 3. Check for specific errors
psql -U postgres -d quotation_db -c "\dt"

# 4. Verify sample data
psql -U postgres -d quotation_db -c "SELECT * FROM machines;"
```

## 🔴 Backend Issues

### Problem: "Cannot connect to database"
**Symptoms:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solutions:**

**Check PostgreSQL is running:**
```bash
# Linux
sudo systemctl status postgresql
sudo systemctl start postgresql

# macOS
brew services list
brew services start postgresql@15

# Windows
services.msc (look for postgresql service)
```

**Verify database exists:**
```bash
psql -U postgres -l
```

**Check credentials in .env:**
```bash
cd backend
cat .env

# Should show:
DB_USER=postgres
DB_HOST=localhost
DB_NAME=quotation_db
DB_PASSWORD=your_password
DB_PORT=5432
```

**Test connection manually:**
```bash
psql -U postgres -d quotation_db -c "SELECT 1;"
```

### Problem: "Port 5000 already in use"
**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solutions:**

**Option 1: Change port**
```bash
# Edit backend/.env
PORT=5001

# Update frontend/.env
REACT_APP_API_URL=http://localhost:5001/api
```

**Option 2: Kill process using port**
```bash
# Linux/Mac
lsof -ti:5000 | xargs kill -9

# Windows
netstat -ano | findstr :5000
taskkill /PID <process_id> /F
```

### Problem: Backend starts but crashes immediately
**Symptoms:**
- Server starts then exits
- Errors in console

**Solutions:**

**Check logs:**
```bash
cd backend
npm start

# Look for error messages
```

**Common fixes:**
```bash
# 1. Verify all dependencies installed
npm install

# 2. Check syntax errors
npm run test

# 3. Verify database connection
psql -U postgres -d quotation_db -c "\dt"

# 4. Check environment variables
cat .env
```

### Problem: API endpoints return 500 errors
**Symptoms:**
- Frontend shows errors
- Backend console shows stack traces

**Solutions:**

**Check specific endpoint:**
```bash
curl http://localhost:5000/api/machines
```

**Enable detailed logging:**
```javascript
// Add to backend/server.js
app.use((err, req, res, next) => {
  console.error('ERROR:', err.message);
  console.error('STACK:', err.stack);
  res.status(500).json({ error: err.message });
});
```

**Common causes:**
1. Database connection lost
2. Invalid SQL queries
3. Missing required fields
4. Data type mismatches

## 🔴 Frontend Issues

### Problem: "Module not found" errors
**Symptoms:**
```
Module not found: Can't resolve 'react-router-dom'
```

**Solutions:**
```bash
cd frontend

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Install specific missing package
npm install react-router-dom axios

# Clear cache
npm cache clean --force
```

### Problem: Frontend won't start
**Symptoms:**
- `npm start` fails
- Port 3000 errors

**Solutions:**

**Check Node version:**
```bash
node --version
# Should be 14 or higher
```

**Change port:**
```bash
# Create .env.local in frontend/
echo "PORT=3001" > .env.local
```

**Kill existing process:**
```bash
# Linux/Mac
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <process_id> /F
```

### Problem: "Proxy error" when calling API
**Symptoms:**
```
Proxy error: Could not proxy request /api/...
```

**Solutions:**

**Verify backend is running:**
```bash
curl http://localhost:5000/health
```

**Check .env configuration:**
```bash
cd frontend
cat .env

# Should show:
REACT_APP_API_URL=http://localhost:5000/api
```

**Add CORS headers to backend:**
```javascript
// backend/server.js
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

### Problem: Components not rendering
**Symptoms:**
- Blank page
- Console errors
- React warnings

**Solutions:**

**Check browser console (F12):**
- Look for JavaScript errors
- Check network tab for failed requests
- Verify API responses

**Common fixes:**
```javascript
// 1. Check imports
import React from 'react';

// 2. Verify exports
export default ComponentName;

// 3. Check props
console.log('Props:', this.props);

// 4. Verify state
console.log('State:', this.state);
```

### Problem: Calculations not working
**Symptoms:**
- Costs show as NaN
- Totals incorrect
- Real-time updates fail

**Solutions:**

**Debug calculations:**
```javascript
// Add to QuotationForm.js
const calculatePartCosts = (part) => {
  console.log('Part:', part);
  console.log('Operations:', part.operations);
  console.log('Machines:', machines);
  
  let operationsCost = 0;
  part.operations.forEach(operation => {
    const machine = machines.find(m => m.machine_id === parseInt(operation.machine_id));
    console.log('Machine:', machine);
    const cost = machine ? parseFloat(machine.hourly_rate) * parseFloat(operation.operation_time_hours || 0) : 0;
    console.log('Operation cost:', cost);
    operationsCost += cost;
  });
  
  return { operationsCost };
};
```

**Common issues:**
1. String vs number comparison
2. Missing parseFloat/parseInt
3. Undefined values
4. Division by zero

## 🔴 Database Issues

### Problem: "Permission denied for table"
**Symptoms:**
```
ERROR: permission denied for table machines
```

**Solutions:**
```sql
-- Connect as postgres user
psql -U postgres -d quotation_db

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_user;

-- Verify
\dt
```

### Problem: Foreign key constraint violations
**Symptoms:**
```
ERROR: insert or update on table violates foreign key constraint
```

**Solutions:**
```sql
-- Check related records exist
SELECT * FROM customers WHERE customer_id = 1;
SELECT * FROM machines WHERE machine_id = 1;

-- Verify constraint
\d+ quotations

-- Disable constraint temporarily (NOT recommended for production)
ALTER TABLE quotations DISABLE TRIGGER ALL;
-- ... perform operation ...
ALTER TABLE quotations ENABLE TRIGGER ALL;
```

### Problem: Duplicate key errors
**Symptoms:**
```
ERROR: duplicate key value violates unique constraint
```

**Solutions:**
```sql
-- Find duplicates
SELECT machine_name, COUNT(*)
FROM machines
GROUP BY machine_name
HAVING COUNT(*) > 1;

-- Reset sequence
SELECT setval('machines_machine_id_seq', (SELECT MAX(machine_id) FROM machines));
```

### Problem: Database is full
**Symptoms:**
- Slow queries
- Insert failures
- Out of disk space

**Solutions:**
```sql
-- Check database size
SELECT pg_size_pretty(pg_database_size('quotation_db'));

-- Check table sizes
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Vacuum database
VACUUM FULL;
```

## 🔴 CORS Issues

### Problem: "CORS policy" errors
**Symptoms:**
```
Access to fetch at 'http://localhost:5000/api/...' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

**Solutions:**

**Update backend CORS settings:**
```javascript
// backend/server.js
const cors = require('cors');

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

**For production:**
```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'https://yourdomain.com'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

## 🔴 Performance Issues

### Problem: Slow API responses
**Symptoms:**
- Requests take > 2 seconds
- Frontend feels sluggish

**Solutions:**

**Check database queries:**
```sql
-- Enable query logging
ALTER DATABASE quotation_db SET log_statement = 'all';

-- Check slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Add indexes
CREATE INDEX idx_quotations_customer ON quotations(customer_id);
CREATE INDEX idx_quotation_parts_quotation ON quotation_parts(quotation_id);
```

**Optimize backend:**
```javascript
// Use connection pooling
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### Problem: High memory usage
**Symptoms:**
- System slows down
- Out of memory errors

**Solutions:**

**Monitor Node.js memory:**
```bash
# Start with memory limit
node --max-old-space-size=4096 server.js
```

**Check for memory leaks:**
```javascript
// Add to server.js
setInterval(() => {
  const used = process.memoryUsage();
  console.log('Memory usage:', {
    rss: `${Math.round(used.rss / 1024 / 1024 * 100) / 100} MB`,
    heapTotal: `${Math.round(used.heapTotal / 1024 / 1024 * 100) / 100} MB`,
    heapUsed: `${Math.round(used.heapUsed / 1024 / 1024 * 100) / 100} MB`
  });
}, 60000); // Every minute
```

## 🔍 Debugging Tips

### Enable Debug Mode

**Backend:**
```bash
# Add to .env
NODE_ENV=development
DEBUG=*
```

**Frontend:**
```javascript
// Add to App.js
if (process.env.NODE_ENV === 'development') {
  console.log('Debug mode enabled');
}
```

### Check Logs

**Backend logs:**
```bash
cd backend
npm start 2>&1 | tee server.log
```

**Frontend logs:**
```bash
cd frontend
npm start 2>&1 | tee frontend.log
```

**Database logs:**
```bash
# Linux
tail -f /var/log/postgresql/postgresql-*.log

# macOS
tail -f /usr/local/var/log/postgres.log
```

### Use Browser DevTools

1. Open DevTools (F12)
2. Check Console tab for errors
3. Check Network tab for failed requests
4. Check Application tab for storage issues

### Test API Endpoints Directly

```bash
# Test with curl
curl -v http://localhost:5000/api/machines

# Test with httpie
http GET localhost:5000/api/machines

# Test with Postman
# Import collection from API_DOCUMENTATION.md
```

## 📞 Getting Help

If you're still stuck:

1. **Check the logs** - Most errors appear in console/logs
2. **Search the error** - Copy exact error message to Google
3. **Check GitHub Issues** - Someone may have same problem
4. **Review documentation** - README.md, API_DOCUMENTATION.md
5. **Ask for help** - Provide error logs and steps to reproduce

## 🔧 Reset Everything

If all else fails, complete reset:

```bash
# 1. Stop all processes
# Ctrl+C in terminals

# 2. Drop database
dropdb -U postgres quotation_db

# 3. Delete node_modules
rm -rf backend/node_modules backend/package-lock.json
rm -rf frontend/node_modules frontend/package-lock.json

# 4. Reinstall
./install.sh

# 5. Test
./start.sh
```

---

**Still having issues? Check the logs carefully - they usually tell you exactly what's wrong!**
