import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          // Verify token is still valid
          const response = await authAPI.getProfile();
          setUser(response.data.user);
        } catch (err) {
          // Token invalid, clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (username, password) => {
    try {
      setError(null);
      const response = await authAPI.login({ username, password });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.error || err.response?.data?.message || 'Login failed';
      setError(message);
      return { success: false, message };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      await authAPI.changePassword({ currentPassword, newPassword });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Password change failed';
      return { success: false, message };
    }
  }, []);

  // Permission checking
  const hasRole = useCallback((roles) => {
    if (!user) return false;
    // Normalize role to lowercase for comparison
    const userRole = (user.role || '').toLowerCase();
    if (typeof roles === 'string') {
      return userRole === roles.toLowerCase();
    }
    return roles.map(r => r.toLowerCase()).includes(userRole);
  }, [user]);

  const hasPermission = useCallback((permission) => {
    if (!user) return false;
    
    const PERMISSIONS = {
      'users:read': ['admin'],
      'users:create': ['admin'],
      'users:update': ['admin'],
      'users:delete': ['admin'],
      'customers:read': ['admin', 'sales', 'technician', 'engineer', 'management'],
      'customers:create': ['admin', 'sales'],
      'customers:update': ['admin', 'sales'],
      'customers:delete': ['admin'],
      'machines:read': ['admin', 'sales', 'technician', 'engineer', 'management'],
      'machines:create': ['admin', 'engineer'],
      'machines:update': ['admin', 'engineer'],
      'machines:delete': ['admin'],
      'auxiliary:read': ['admin', 'sales', 'technician', 'engineer', 'management'],
      'auxiliary:create': ['admin', 'engineer'],
      'auxiliary:update': ['admin', 'engineer'],
      'auxiliary:delete': ['admin'],
      'quotations:read': ['admin', 'sales', 'technician', 'engineer', 'management'],
      'quotations:create': ['admin', 'sales', 'technician'],
      'quotations:update': ['admin', 'sales', 'technician', 'engineer'],
      'quotations:delete': ['admin'],
      'quotations:submit': ['admin', 'sales', 'technician'],
      'quotations:engineer_approve': ['admin', 'engineer'],
      'quotations:management_approve': ['admin', 'management'],
      'quotations:reject': ['admin', 'engineer', 'management'],
      'quotations:issue': ['admin', 'management'],
    };

    const allowedRoles = PERMISSIONS[permission] || [];
    // Normalize role to lowercase for comparison
    const userRole = (user.role || '').toLowerCase();
    return allowedRoles.includes(userRole);
  }, [user]);

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    changePassword,
    hasRole,
    hasPermission,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
