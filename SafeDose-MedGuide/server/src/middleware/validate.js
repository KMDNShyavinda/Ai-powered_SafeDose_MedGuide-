const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], { abortEarly: false });
    if (error) {
      const messages = error.details.map(detail => detail.message);
      return res.status(400).json({ success: false, message: 'Validation Error', errors: messages });
    }
    next();
  };
};

module.exports = { validate };
