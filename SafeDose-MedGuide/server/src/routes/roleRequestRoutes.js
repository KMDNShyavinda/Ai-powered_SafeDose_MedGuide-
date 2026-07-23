const express = require('express');
const router = express.Router();
const { getRoleRequests, approveRoleRequest, rejectRoleRequest, getUserRoleRequest } = require('../controllers/roleRequestController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.get('/', protect, roleCheck('admin'), getRoleRequests);
router.put('/:id/approve', protect, roleCheck('admin'), approveRoleRequest);
router.put('/:id/reject', protect, roleCheck('admin'), rejectRoleRequest);
router.get('/my-request', protect, getUserRoleRequest);

module.exports = router;
