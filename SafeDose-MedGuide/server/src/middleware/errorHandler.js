const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  console.error('Error:', err);

  if (err.name === 'CastError') {
    return res.status(404).json({ success: false, message: 'Resource not found' });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ success: false, message: `Duplicate value for ${field}. This ${field} already exists.` });
  }
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({ success: false, message: messages.join('. ') });
  }
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expired' });
  }
  res.status(err.statusCode || 500).json({ success: false, message: error.message || 'Internal Server Error' });
};

module.exports = { errorHandler };
