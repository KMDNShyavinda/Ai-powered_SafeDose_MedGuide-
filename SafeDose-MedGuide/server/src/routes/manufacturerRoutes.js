const express = require('express');
const router = express.Router();
const { getManufacturers, getManufacturer, createManufacturer, updateManufacturer, deleteManufacturer } = require('../controllers/manufacturerController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.get('/', protect, getManufacturers);
router.get('/:id', protect, getManufacturer);
router.post('/', protect, roleCheck('admin'), createManufacturer);
router.put('/:id', protect, roleCheck('admin'), updateManufacturer);
router.delete('/:id', protect, roleCheck('admin'), deleteManufacturer);

module.exports = router;
