const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createReminders,
  getMyReminders,
  getTodaySchedule,
  updateReminder,
  markTaken,
  deleteReminder,
} = require('../controllers/reminderController');

router.post('/create', protect, createReminders);
router.get('/', protect, getMyReminders);
router.get('/today', protect, getTodaySchedule);
router.put('/:id', protect, updateReminder);
router.put('/:id/taken', protect, markTaken);
router.delete('/:id', protect, deleteReminder);

module.exports = router;
