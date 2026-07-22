const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized. No token provided.' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).populate('role');
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }
    if (!req.user.isActive) {
      return res.status(401).json({ success: false, message: 'Account has been deactivated.' });
    }
    next();
  } catch (error) {
    console.error('JWT Verification Error:', error.message, error);
    return res.status(401).json({ success: false, message: 'Not authorized. Token is invalid or expired.' });
  }
};

const optionalProtect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next();
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).populate('role');
    next();
  } catch (error) {
    next();
  }
};

module.exports = { protect, optionalProtect };
