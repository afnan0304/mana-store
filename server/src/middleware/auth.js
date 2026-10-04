const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Authentication Middleware: Validates Bearer token & attaches user to req.user
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const error = new Error('Authentication required. Missing or malformed Bearer token.');
      error.statusCode = 401;
      return next(error);
    }

    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      const error = new Error('JWT secret configuration is missing on server.');
      error.statusCode = 500;
      return next(error);
    }

    // Verify token
    const decoded = jwt.verify(token, jwtSecret);

    // Fetch user and verify active status
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user) {
      const error = new Error('Authentication failed. User no longer exists.');
      error.statusCode = 401;
      return next(error);
    }

    if (!user.isActive) {
      const error = new Error('Account has been deactivated. Please contact an administrator.');
      error.statusCode = 403;
      return next(error);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      error.statusCode = 401;
    }
    next(error);
  }
};

/**
 * Role-Based Access Control (RBAC) Guard
 * @param  {...string} roles Allowed roles (e.g. 'ADMIN', 'STOREKEEPER', 'VIEWER')
 */
const requireRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      const error = new Error('Authentication required before checking permissions.');
      error.statusCode = 401;
      return next(error);
    }

    if (!roles.includes(req.user.role)) {
      const error = new Error(
        `Forbidden: Role "${req.user.role}" does not have required access permissions (${roles.join(', ')}).`
      );
      error.statusCode = 403;
      return next(error);
    }

    next();
  };
};

module.exports = {
  authenticate,
  requireRoles,
};
