const express = require('express');
const router = express.Router();
const { getSideEffectsByMedicine, createSideEffect, updateSideEffect, deleteSideEffect } = require('../controllers/sideEffectController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.get('/medicine/:medicineId', protect, getSideEffectsByMedicine);
router.post('/', protect, roleCheck('admin', 'pharmacist'), createSideEffect);
router.put('/:id', protect, roleCheck('admin', 'pharmacist'), updateSideEffect);
router.delete('/:id', protect, roleCheck('admin'), deleteSideEffect);

module.exports = router;
