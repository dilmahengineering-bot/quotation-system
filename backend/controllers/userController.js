const User = require('../models/User');

const userController = {
  // Get all users (admin only)
  async getAll(req, res) {
    try {
      const users = await User.getAll();
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get user by ID (admin only)
  async getById(req, res) {
    try {
      const user = await User.getById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Create user (admin only)
  async create(req, res) {
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

      const user = await User.create({ username, password, full_name, email, role });
      res.status(201).json(user);
    } catch (error) {
      console.error('Error creating user:', error);
      if (error.code === '23505') {
        return res.status(400).json({ error: 'Username or email already exists' });
      }
      res.status(500).json({ error: error.message });
    }
  },

  // Update user (admin only)
  async update(req, res) {
    try {
      const user = await User.update(req.params.id, req.body);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Disable user (admin only)
  async disable(req, res) {
    try {
      // Prevent disabling yourself
      if (req.params.id == req.user.user_id) {
        return res.status(400).json({ error: 'Cannot disable your own account' });
      }

      const user = await User.disable(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      console.error('Error disabling user:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Enable user (admin only)
  async enable(req, res) {
    try {
      const user = await User.enable(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      console.error('Error enabling user:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = userController;
