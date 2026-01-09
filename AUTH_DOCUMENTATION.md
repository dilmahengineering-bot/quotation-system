# Authentication System Documentation

## Overview

The Quotation Management System now includes a complete user authentication system with JWT (JSON Web Token) based authentication, role-based access control, and secure password management.

## Features

### ✅ User Authentication
- Traditional username/password login
- JWT token-based authentication
- Secure password hashing with bcrypt
- Token expiration (24 hours default)
- Automatic token refresh

### ✅ User Roles
- **Admin**: Full system access + user management
- **User**: Standard access to all features

### ✅ Security Features
- Password hashing with bcrypt (10 salt rounds)
- JWT tokens for stateless authentication
- Protected API endpoints
- Automatic token validation
- Session management
- CORS protection

### ✅ User Management (Admin Only)
- Create new users
- Update user information
- Disable/Enable users
- View all users
- Role assignment

## Default Credentials

### Admin Account
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: admin
- **Access**: Full system access + user management

### Regular User Account
- **Username**: `user`
- **Password**: `user123`
- **Role**: user
- **Access**: Standard features

**⚠️ IMPORTANT: Change these passwords immediately after first login!**

## Installation

### Dependencies Already Included

The following packages are added to `package.json`:
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT token generation/verification
- `express-validator` - Input validation

### Database Changes

The `users` table is automatically created when you run the schema:

```sql
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Usage

### Login Process

1. User enters username and password
2. Backend validates credentials
3. Backend generates JWT token
4. Token is stored in localStorage
5. Token is sent with all subsequent requests
6. User is redirected to dashboard

### Making Authenticated Requests

All API requests automatically include the JWT token:

```javascript
// Frontend automatically adds token
const response = await machineAPI.getAll();

// Token is added via axios interceptor
headers: {
  'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
}
```

### Token Storage

- **Storage**: localStorage
- **Keys**: 
  - `token` - JWT token
  - `user` - User information (JSON string)

### Logout Process

1. User clicks Logout button
2. Token and user data removed from localStorage
3. User redirected to login page
4. All protected routes become inaccessible

## API Endpoints

### Public Endpoints (No Authentication Required)

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": 1,
    "username": "admin",
    "full_name": "System Administrator",
    "email": "admin@company.com",
    "role": "admin"
  }
}
```

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "newuser",
  "password": "password123",
  "full_name": "New User",
  "email": "newuser@company.com",
  "role": "user"
}
```

### Protected Endpoints (Authentication Required)

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {token}
```

#### Change Password
```http
POST /api/auth/change-password
Authorization: Bearer {token}
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer {token}
```

### Admin-Only Endpoints

#### Get All Users
```http
GET /api/users
Authorization: Bearer {admin-token}
```

#### Create User
```http
POST /api/users
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "username": "johndoe",
  "password": "password123",
  "full_name": "John Doe",
  "email": "john@company.com",
  "role": "user"
}
```

#### Update User
```http
PUT /api/users/:id
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "full_name": "John Smith",
  "email": "johnsmith@company.com",
  "role": "admin"
}
```

#### Disable/Enable User
```http
PATCH /api/users/:id/disable
PATCH /api/users/:id/enable
Authorization: Bearer {admin-token}
```

## Frontend Components

### Login Component

Located at: `/components/Login.js`

Features:
- Username/password form
- Error handling
- Loading states
- Default credentials display
- Responsive design

### ProtectedRoute Component

Located at: `/components/ProtectedRoute.js`

Purpose: Wraps protected routes to enforce authentication

Usage:
```jsx
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
```

### Navigation Updates

The navbar now shows:
- Welcome message with user's name
- User role display
- Logout button

## Security Considerations

### Password Security

1. **Hashing**: All passwords are hashed using bcrypt
2. **Salt Rounds**: 10 (recommended for production)
3. **Never Stored**: Plain passwords are never stored
4. **Minimum Length**: 6 characters (configurable)

### Token Security

1. **Secret Key**: Stored in environment variable
2. **Expiration**: 24 hours (configurable)
3. **Algorithm**: HS256 (HMAC with SHA-256)
4. **Storage**: localStorage (consider httpOnly cookies for production)

### Production Recommendations

1. **Change JWT_SECRET**: Use a strong, random secret
```bash
# Generate secure secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

2. **Use HTTPS**: Always use HTTPS in production
3. **Token Refresh**: Implement refresh tokens for long sessions
4. **Rate Limiting**: Add rate limiting to login endpoint
5. **Account Lockout**: Implement after X failed attempts
6. **Password Policy**: Enforce strong passwords
7. **2FA**: Consider two-factor authentication

## Configuration

### Environment Variables

Add to `.env`:
```
JWT_SECRET=your-secret-key-change-this-in-production-min-32-chars
JWT_EXPIRES_IN=24h
```

### Changing Token Expiration

Modify in `.env`:
```
JWT_EXPIRES_IN=1h     # 1 hour
JWT_EXPIRES_IN=7d     # 7 days
JWT_EXPIRES_IN=30d    # 30 days
```

## Role-Based Access Control

### Implementing Custom Roles

1. Add role to database:
```sql
INSERT INTO users (username, password_hash, full_name, email, role)
VALUES ('manager', '$2a$10$...', 'Manager Name', 'manager@company.com', 'manager');
```

2. Create middleware:
```javascript
// backend/middleware/authMiddleware.js
isManager: (req, res, next) => {
  if (req.user.role !== 'manager' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
}
```

3. Use in routes:
```javascript
router.get('/reports', authMiddleware.verifyToken, authMiddleware.isManager, reportController.getAll);
```

## Troubleshooting

### "Invalid token" Error

**Cause**: Token expired or invalid

**Solution**:
1. Log out and log in again
2. Check JWT_SECRET matches between sessions
3. Verify token hasn't been tampered with

### "Access denied" Error

**Cause**: Missing or invalid token

**Solution**:
1. Ensure you're logged in
2. Check token is in localStorage
3. Verify API requests include Authorization header

### Password Change Fails

**Cause**: Current password incorrect

**Solution**:
1. Verify current password
2. Check password meets minimum requirements
3. Ensure new password is different from old

### Can't Login

**Cause**: Wrong credentials or account disabled

**Solution**:
1. Verify username and password
2. Check account is active (is_active = true)
3. Reset password if needed (admin function)

## Testing

### Test Login Flow

```bash
# 1. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Response contains token

# 2. Use token for protected endpoint
curl http://localhost:5000/api/machines \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test User Creation (Admin)

```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "username": "testuser",
    "password": "test123",
    "full_name": "Test User",
    "email": "test@company.com",
    "role": "user"
  }'
```

## Migration Guide

### For Existing Installations

1. **Update database schema:**
```bash
psql -U postgres -d quotation_db -c "
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
"
```

2. **Insert default users:**
```bash
psql -U postgres -d quotation_db -f backend/database/schema.sql
```

3. **Install dependencies:**
```bash
cd backend
npm install
```

4. **Update .env:**
```bash
echo "JWT_SECRET=your-secret-key-change-this" >> .env
echo "JWT_EXPIRES_IN=24h" >> .env
```

5. **Restart backend:**
```bash
npm start
```

6. **Frontend will now show login page**

## Best Practices

1. **Always use HTTPS** in production
2. **Change default passwords** immediately
3. **Use strong JWT_SECRET** (32+ characters)
4. **Implement password policies** (length, complexity)
5. **Log authentication attempts** for security auditing
6. **Implement rate limiting** on login endpoint
7. **Use refresh tokens** for better security
8. **Enable 2FA** for admin accounts
9. **Regular security audits**
10. **Keep dependencies updated**

## Future Enhancements

Potential additions:
- [ ] Password reset via email
- [ ] Two-factor authentication (2FA)
- [ ] OAuth integration (Google, Microsoft)
- [ ] Refresh token implementation
- [ ] Session management dashboard
- [ ] Login history tracking
- [ ] IP whitelisting
- [ ] Device management
- [ ] Remember me functionality
- [ ] Passwordless authentication

---

**Authentication system is ready to use!** 🔐

Secure your quotation management system with proper user authentication!
