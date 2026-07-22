const express = require('express');
const router = express.Router();
const { getUsers, getUser, updateUser, deleteUser, changeUserRole, updateProfile } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.put('/profile', protect, updateProfile);
router.get('/', protect, roleCheck('admin'), getUsers);
router.get('/:id', protect, roleCheck('admin'), getUser);
router.put('/:id', protect, roleCheck('admin'), updateUser);
router.delete('/:id', protect, roleCheck('admin'), deleteUser);
router.put('/:id/role', protect, roleCheck('admin'), changeUserRole);

module.exports = router;
