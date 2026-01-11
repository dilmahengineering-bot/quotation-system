const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

const authController = {
  // User login
  async login(req, res) {
    try {
      const { username, password } = req.body;

      // Validate input
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }

      // Find user
      const user = await User.getByUsername(username);
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      // Verify password
      const isValidPassword = await User.verifyPassword(password, user.password_hash);
      
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      // Update last login
      await User.updateLastLogin(user.user_id);

      // Generate JWT token
      const token = jwt.sign(
        { 
          user_id: user.user_id,
          username: user.username,
          role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      // Return user info and token
      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          user_id: user.user_id,
          username: user.username,
          full_name: user.full_name,
          email: user.email,
          role: user.role,
          require_password_change: user.require_password_change || false
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed. Please try again.' });
    }
  },

  // User registration
  async register(req, res) {
    try {
      const { username, password, full_name, email, role } = req.body;

      // Validate input
      if (!username || !password || !full_name || !email) {
        return res.status(400).json({ 
          error: 'Username, password, full name, and email are required' 
        });
      }

      // Check if username exists
      const existingUser = await User.getByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }

      // Check if email exists
      const existingEmail = await User.getByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ error: 'Email already exists' });
      }

      // Validate password strength
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
      }

      // Create user
      const user = await User.create({
        username,
        password,
        full_name,
        email,
        role: role || 'user'
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed. Please try again.' });
    }
  },

  // Get current user info
  async getCurrentUser(req, res) {
    try {
      const user = await User.getById(req.user.user_id);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ user });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({ error: 'Failed to get user information' });
    }
  },

  // Change password
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ 
          error: 'Current password and new password are required' 
        });
      }

      // Validate new password strength
      const passwordValidation = User.validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        return res.status(400).json({ 
          error: passwordValidation.errors.join('. ')
        });
      }

      // Get user with password
      const user = await User.getByUsername(req.user.username);

      // Verify current password
      const isValidPassword = await User.verifyPassword(currentPassword, user.password_hash);
      
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      // Check if new password is same as current
      const isSamePassword = await User.verifyPassword(newPassword, user.password_hash);
      if (isSamePassword) {
        return res.status(400).json({ error: 'New password must be different from current password' });
      }

      // Change password and clear require_password_change flag
      await User.changePassword(req.user.user_id, newPassword, false);

      res.json({
        success: true,
        message: 'Password changed successfully'
      });

    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ error: 'Failed to change password' });
    }
  },

  // Logout (client-side token removal, but we can log it)
  async logout(req, res) {
    try {
      // In a more advanced system, you might want to blacklist the token
      res.json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Logout failed' });
    }
  }
};

module.exports = authController;
