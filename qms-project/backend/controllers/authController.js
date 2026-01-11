const { User } = require('../models');
const { getSignedJwtToken } = require('../middleware/auth');

// @desc    Register user (Admin only can create users)
// @route   POST /api/auth/register
// @access  Private/Admin
exports.register = async (req, res) => {
  try {
    const { username, email, password, full_name, user_level } = req.body;

    // Only admin can create users
    if (req.user.user_level !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can create users'
      });
    }

    // Level restrictions: admin can create all, approver cannot create admin
    if (req.user.user_level === 'approver' && user_level === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Approvers cannot create admin users'
      });
    }

    const user = await User.create({
      username,
      email,
      password,
      full_name,
      user_level: user_level || 'user',
      created_by: req.user.user_id
    });

    res.status(201).json({
      success: true,
      data: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        user_level: user.user_level
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate email & password
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username and password'
      });
    }

    // Check for user
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive. Please contact administrator.'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Create token
    const token = getSignedJwtToken(user.user_id);

    res.status(200).json({
      success: true,
      token,
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        user_level: user.user_level
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.user_id, {
      attributes: { exclude: ['password'] }
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all users
// @route   GET /api/auth/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update user
// @route   PUT /api/auth/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email, user_level, is_active } = req.body;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    if (full_name) user.full_name = full_name;
    if (email) user.email = email;
    if (user_level) user.user_level = user_level;
    if (typeof is_active !== 'undefined') user.is_active = is_active;

    await user.save();

    res.status(200).json({
      success: true,
      data: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        user_level: user.user_level,
        is_active: user.is_active
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
