const express = require('express');
const router = express.Router();
const { getStats, getPopularMedicines, getRecentActivity } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.get('/stats', protect, roleCheck('admin'), getStats);
router.get('/popular-medicines', protect, roleCheck('admin'), getPopularMedicines);
router.get('/recent-activity', protect, roleCheck('admin'), getRecentActivity);

module.exports = router;
