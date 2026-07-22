const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth');
const {
  uploadPrescription,
  manualEntry,
  analyzePrescription,
  getHistory,
  getPrescriptionById,
  deletePrescription,
  chatAboutPrescription,
} = require('../controllers/prescriptionController');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads/prescriptions');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration for prescription images
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = `rx-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extOk = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = allowedTypes.test(file.mimetype.split('/')[1]);
  if (extOk && mimeOk) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG, and PDF files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Routes
router.post('/upload', protect, upload.single('prescriptionImage'), uploadPrescription);
router.post('/manual', protect, manualEntry);
router.post('/:id/analyze', protect, analyzePrescription);
router.get('/history', protect, getHistory);
router.get('/:id', protect, getPrescriptionById);
router.delete('/:id', protect, deletePrescription);
router.post('/:id/chat', protect, chatAboutPrescription);

module.exports = router;
