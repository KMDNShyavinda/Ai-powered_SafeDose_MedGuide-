const express = require('express');
const router = express.Router();
const {
  getMedicines, getMedicine, createMedicine, updateMedicine, deleteMedicine, getAllMedicinesAdmin,
} = require('../controllers/medicineController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.get('/admin/all', protect, roleCheck('admin'), getAllMedicinesAdmin);
router.get('/', getMedicines);
router.get('/:id', getMedicine);
router.post('/', protect, roleCheck('admin', 'pharmacist'), createMedicine);
router.put('/:id', protect, roleCheck('admin', 'pharmacist'), updateMedicine);
router.delete('/:id', protect, roleCheck('admin'), deleteMedicine);

module.exports = router;
