# LOGIN FIX INSTRUCTIONS

The login is failing because the user passwords in the database need to be updated.

## Quick Fix Steps:

### Option 1: Using pgAdmin (Recommended)

1. **Open pgAdmin 4**
   - Find it in your Start Menu

2. **Connect to PostgreSQL**
   - Expand "Servers" → "PostgreSQL 12"
   - Enter your PostgreSQL password if prompted

3. **Open Query Tool**
   - Right-click on "quotation_db" database
   - Select "Query Tool"

4. **Run the Fix**
   - Open the file: `FIX_LOGIN.sql`
   - Copy ALL the content
   - Paste into pgAdmin Query Tool
   - Click the "Execute" button (Play icon) or press F5

5. **Verify Success**
   - You should see: "SELECT 2" at the bottom
   - And a table showing 2 users (admin and user)

6. **Try Login**
   - Go to: http://localhost:3000
   - Username: `admin`
   - Password: `admin123`

---

### Option 2: Using psql Command Line

If you know your PostgreSQL password:

```powershell
# Set your postgres password
$env:PGPASSWORD="YOUR_POSTGRES_PASSWORD"

# Run the fix
& "C:\Program Files\PostgreSQL\12\bin\psql.exe" -U postgres -d quotation_db -f FIX_LOGIN.sql
```

---

### Option 3: Manual Entry in pgAdmin

1. Open pgAdmin
2. Navigate to: quotation_db → Schemas → public → Tables → users
3. Right-click "users" → View/Edit Data → All Rows
4. Delete existing rows
5. Add new rows with these values:

**Admin User:**
- username: `admin`
- password_hash: `$2a$10$PcYWLHn3Sb4NirgFF/atyOo117yd1vqQ2jN3Rq9zzJ3hi3sERo84G`
- full_name: `System Administrator`
- email: `admin@company.com`
- role: `admin`
- is_active: `true`

**Regular User:**
- username: `user`
- password_hash: `$2a$10$DI5kYkb2I9jCr4eBruuJxeDmk/yypDzQusA69vzjf6DRx33JMT//W`
- full_name: `Regular User`
- email: `user@company.com`
- role: `user`
- is_active: `true`

---

## Login Credentials After Fix:

**Admin Account:**
- Username: `admin`
- Password: `admin123`

**User Account:**
- Username: `user`
- Password: `user123`

---

## Troubleshooting:

### If pgAdmin asks for a password:
This is the master PostgreSQL password set during installation. Common defaults:
- Try: `postgres`
- Try: `admin`
- Try: `Dilmail@456`
- Or check your PostgreSQL installation notes

### If the table doesn't exist:
Run the database schema first:
```powershell
& "C:\Program Files\PostgreSQL\12\bin\psql.exe" -U postgres -d quotation_db -f database/schema.sql
```

### Still not working?
Make sure:
1. PostgreSQL service is running
2. Database "quotation_db" exists
3. Backend server is running on port 5000
4. Frontend is accessible at http://localhost:3000
