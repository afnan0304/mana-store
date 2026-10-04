const jwt = require('jsonwebtoken');
const { User, AuditLog } = require('../models');

/**
 * Handle user login
 * POST /api/v1/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Locate user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      return next(error);
    }

    // 2. Validate password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      return next(error);
    }

    // 3. Verify user is active
    if (!user.isActive) {
      const error = new Error('This account has been deactivated. Please contact an administrator.');
      error.statusCode = 403;
      return next(error);
    }

    // 4. Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email,
        username: user.username,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      }
    );

    // 5. Audit login
    await AuditLog.create({
      performedBy: user._id,
      action: 'USER_LOGIN',
      targetEntity: 'User',
      targetId: user._id,
      details: { email: user.email, role: user.role },
      ipAddress: req.ip || req.connection?.remoteAddress || '127.0.0.1',
      status: 'SUCCESS',
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user profile
 * GET /api/v1/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  getMe,
};
