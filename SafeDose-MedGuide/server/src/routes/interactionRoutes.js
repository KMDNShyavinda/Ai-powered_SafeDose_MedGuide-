const express = require('express');
const router = express.Router();
const { getInteractions, getInteractionsByMedicine, checkInteraction, createInteraction, updateInteraction, deleteInteraction } = require('../controllers/interactionController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.get('/', protect, getInteractions);
router.get('/check', protect, checkInteraction);
router.get('/medicine/:medicineId', protect, getInteractionsByMedicine);
router.post('/', protect, roleCheck('admin', 'pharmacist'), createInteraction);
router.put('/:id', protect, roleCheck('admin', 'pharmacist'), updateInteraction);
router.delete('/:id', protect, roleCheck('admin'), deleteInteraction);

module.exports = router;
