const roleCheck = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ success: false, message: 'Access denied. No role assigned.' });
    }
    const userRole = req.user.role.name;
    if (!roles.includes(userRole)) {
      return res.status(403).json({ success: false, message: `Access denied. Required role: ${roles.join(' or ')}. Your role: ${userRole}.` });
    }
    next();
  };
};

module.exports = { roleCheck };
