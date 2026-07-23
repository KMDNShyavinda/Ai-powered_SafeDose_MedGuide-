const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { register, login, getMe, changePassword, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

const { sendError } = require('../utils/apiResponse');

// Ensure documents upload directory exists
const docDir = path.join(__dirname, '../../uploads/documents');
if (!fs.existsSync(docDir)) {
  fs.mkdirSync(docDir, { recursive: true });
}

// Multer storage for role request verification documents
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, docDir),
  filename: (req, file, cb) => {
    const uniqueName = `doc-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|pdf|doc|docx/;
  const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = allowed.test(file.mimetype);
  if (extOk || mimeOk) {
    cb(null, true);
  } else {
    cb(new Error('Only document files (PDF, DOC, DOCX, JPG, PNG, WEBP) are allowed for verification.'), false);
  }
};

const uploadDocs = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit per document
});

const handleDocsUpload = (req, res, next) => {
  uploadDocs.array('documents', 5)(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        return sendError(res, `Document upload error: ${err.message}`, 400);
      }
      return sendError(res, err.message || 'Error processing document upload', 400);
    }
    next();
  });
};

router.post('/register', authLimiter, handleDocsUpload, register);
router.post('/login', authLimiter, login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePassword);

module.exports = router;
