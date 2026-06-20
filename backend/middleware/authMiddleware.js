const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const protect = async (req, res, next) => {
  let token;

  // Check authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. Missing token.',
      errorCode: 'UNAUTHORIZED_ACCESS'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'pateri_smart_village_secret_key_2026_xyz');
    
    // Find user and attach to request
    req.user = await User.findById(decoded.id);
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
        errorCode: 'UNAUTHORIZED_ACCESS'
      });
    }
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token verification failed. Unauthorized access.',
      errorCode: 'UNAUTHORIZED_ACCESS'
    });
  }
};

// Middleware to optionally verify JWT token (doesn't fail if token missing)
const optionalProtect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'pateri_smart_village_secret_key_2026_xyz');
    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    // Fail silently on optional route, or let it pass as guest
    next();
  }
};

// Middleware to authorize specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roles.some(role => roles.includes(role))) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permissions to perform this action.',
        errorCode: 'FORBIDDEN_OPERATION'
      });
    }
    next();
  };
};

module.exports = { protect, optionalProtect, authorize };

