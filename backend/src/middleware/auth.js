const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const db = require('../config/database');

// Verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, jwtConfig.secret);
    
    // Verify user still exists and is active
    const result = await db.query(
      'SELECT user_id, username, role, is_active FROM users WHERE user_id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found.' 
      });
    }

    if (!result.rows[0].is_active) {
      return res.status(403).json({ 
        success: false, 
        message: 'Account is disabled. Please contact administrator.' 
      });
    }

    req.user = {
      userId: decoded.userId,
      username: result.rows[0].username,
      role: result.rows[0].role
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired. Please login again.' 
      });
    }
    return res.status(403).json({ 
      success: false, 
      message: 'Invalid token.' 
    });
  }
};

// Role-based access control
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required.' 
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}` 
      });
    }

    next();
  };
};

// Permission definitions
const PERMISSIONS = {
  // User Management
  'users:read': ['Admin'],
  'users:create': ['Admin'],
  'users:update': ['Admin'],
  'users:delete': ['Admin'],
  
  // Customer Management
  'customers:read': ['Admin', 'Sales', 'Technician', 'Engineer', 'Management'],
  'customers:create': ['Admin', 'Sales'],
  'customers:update': ['Admin', 'Sales'],
  'customers:delete': ['Admin'],
  
  // Machine Management
  'machines:read': ['Admin', 'Sales', 'Technician', 'Engineer', 'Management'],
  'machines:create': ['Admin', 'Engineer'],
  'machines:update': ['Admin', 'Engineer'],
  'machines:delete': ['Admin'],
  
  // Auxiliary Costs Management
  'auxiliary:read': ['Admin', 'Sales', 'Technician', 'Engineer', 'Management'],
  'auxiliary:create': ['Admin', 'Engineer'],
  'auxiliary:update': ['Admin', 'Engineer'],
  'auxiliary:delete': ['Admin'],
  
  // Quotation Management
  'quotations:read': ['Admin', 'Sales', 'Technician', 'Engineer', 'Management'],
  'quotations:create': ['Admin', 'Sales', 'Technician'],
  'quotations:update': ['Admin', 'Sales', 'Technician', 'Engineer'],
  'quotations:delete': ['Admin'],
  'quotations:submit': ['Admin', 'Sales', 'Technician'],
  'quotations:engineer_approve': ['Admin', 'Engineer'],
  'quotations:management_approve': ['Admin', 'Management'],
  'quotations:reject': ['Admin', 'Engineer', 'Management'],
  'quotations:issue': ['Admin', 'Management']
};

// Check specific permission
const hasPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required.' 
      });
    }

    const allowedRoles = PERMISSIONS[permission] || [];
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Permission denied: ${permission}` 
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  authorize,
  hasPermission,
  PERMISSIONS
};
