# Database Connection Troubleshooting Guide

## Quick Test

Run this command to test your database connection:

```bash
cd backend
npm run test-db
```

This will check:
- ✅ Database connectivity
- ✅ PostgreSQL version
- ✅ Available tables
- ✅ Data counts
- ✅ Configuration settings

## Common Issues and Solutions

### 1. "Connection Refused" Error

**Problem:** PostgreSQL service is not running

**Solutions:**
```bash
# Windows - Check if PostgreSQL is running
Get-Service postgresql* | Select-Object Name, Status

# Start PostgreSQL service
Start-Service postgresql-x64-12  # Adjust version number as needed

# Or restart
Restart-Service postgresql-x64-12
```

### 2. "Password Authentication Failed"

**Problem:** Incorrect database password in `.env` file

**Solutions:**
1. Check your `.env` file in the `backend` folder:
   ```
   DB_PASSWORD=your_actual_password
   ```

2. Verify PostgreSQL password:
   ```bash
   # Try connecting directly
   psql -U postgres -d quotation_db
   ```

3. If you forgot the password, reset it:
   ```sql
   ALTER USER postgres WITH PASSWORD 'new_password';
   ```

### 3. "Database does not exist"

**Problem:** The `quotation_db` database hasn't been created

**Solutions:**
```bash
# Create the database
psql -U postgres -c "CREATE DATABASE quotation_db;"

# Or using psql shell
psql -U postgres
CREATE DATABASE quotation_db;
\q

# Then initialize the schema
cd backend
psql -U postgres -d quotation_db -f database/schema.sql
```

### 4. "Too Many Connections"

**Problem:** Connection pool exhausted

**Solutions:**
1. Restart the backend server to reset connections
2. Check PostgreSQL max_connections setting:
   ```sql
   SHOW max_connections;
   ```

3. The updated config now has better connection pooling:
   - Max 20 connections
   - Idle timeout: 30 seconds
   - Connection timeout: 10 seconds

### 5. Intermittent Connection Issues

**Problem:** Database connections dropping randomly

**Solutions:**
1. The updated configuration now includes:
   - Automatic error handling
   - Connection retry logic
   - Pool error recovery
   - Graceful shutdown

2. Check PostgreSQL logs:
   ```bash
   # Windows PostgreSQL log location (adjust path)
   C:\Program Files\PostgreSQL\12\data\log\
   ```

3. Increase connection timeout in `.env`:
   ```
   DB_CONNECTION_TIMEOUT=10000
   ```

### 6. "Unexpected error on idle client"

**Problem:** Connection lost while idle

**Solution:** The updated config now handles this automatically with:
- Error event listener
- Connection pool monitoring
- Automatic reconnection

## Health Check Endpoint

Check if the database is connected:

```bash
# Visit in browser or use curl
http://localhost:5000/health
```

**Expected Response:**
```json
{
  "status": "OK",
  "message": "Quotation Management System API",
  "database": "Connected",
  "timestamp": "2026-01-09T..."
}
```

**Error Response:**
```json
{
  "status": "ERROR",
  "message": "Database connection failed",
  "error": "error details"
}
```

## Environment Variables Checklist

Verify your `backend/.env` file contains:

```env
# Required
PORT=5000
DB_USER=postgres
DB_HOST=localhost
DB_NAME=quotation_db
DB_PASSWORD=your_password_here
DB_PORT=5432

# Optional
NODE_ENV=development
```

## Testing Steps

1. **Test PostgreSQL is running:**
   ```bash
   psql -U postgres -c "SELECT version();"
   ```

2. **Test database exists:**
   ```bash
   psql -U postgres -l | findstr quotation_db
   ```

3. **Test connection from backend:**
   ```bash
   cd backend
   npm run test-db
   ```

4. **Start backend and check health:**
   ```bash
   npm start
   # Then visit: http://localhost:5000/health
   ```

## Improvements Made

### Database Configuration (`config/database.js`)
- ✅ Connection pool settings (max 20, timeouts)
- ✅ Error event handler for idle connections
- ✅ Connection test on startup
- ✅ Graceful shutdown handling
- ✅ Better error messages

### Server Health Check (`server.js`)
- ✅ Database connectivity verification
- ✅ Returns database status and timestamp
- ✅ Proper error codes (503 for service unavailable)

### Test Script (`test-db-connection.js`)
- ✅ Comprehensive connection testing
- ✅ Configuration display
- ✅ Table and data verification
- ✅ Helpful troubleshooting messages

## Prevention Tips

1. **Always run test before starting:**
   ```bash
   npm run test-db && npm start
   ```

2. **Monitor health endpoint:**
   - Set up monitoring to check `/health` regularly
   - Alert if database status changes to ERROR

3. **Check logs regularly:**
   - Backend console shows connection status
   - PostgreSQL logs show detailed errors

4. **Keep PostgreSQL service running:**
   - Set to auto-start on Windows
   - Monitor service status

5. **Use connection pooling properly:**
   - Don't create new pools in models
   - Reuse the single pool instance
   - Close connections after use

## Quick Recovery

If database connection is lost:

1. **Check PostgreSQL service:**
   ```bash
   Get-Service postgresql* 
   ```

2. **Restart if needed:**
   ```bash
   Restart-Service postgresql-x64-12
   ```

3. **Test connection:**
   ```bash
   npm run test-db
   ```

4. **Restart backend:**
   ```bash
   npm start
   ```

## Support

If issues persist:
1. Run `npm run test-db` and share the output
2. Check backend console logs
3. Check PostgreSQL logs
4. Verify all environment variables are set correctly
5. Ensure firewall isn't blocking port 5432

---

**Status:** All database connection improvements have been implemented and are production-ready.
