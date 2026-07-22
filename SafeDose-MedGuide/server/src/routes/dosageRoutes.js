const express = require('express');
const router = express.Router();
const { getDosagesByMedicine, createDosage, updateDosage, deleteDosage } = require('../controllers/dosageController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.get('/medicine/:medicineId', protect, getDosagesByMedicine);
router.post('/', protect, roleCheck('admin', 'pharmacist'), createDosage);
router.put('/:id', protect, roleCheck('admin', 'pharmacist'), updateDosage);
router.delete('/:id', protect, roleCheck('admin'), deleteDosage);

module.exports = router;
