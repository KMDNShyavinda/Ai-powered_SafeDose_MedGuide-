const express = require('express');
const router = express.Router();
const { getCategories, getCategory, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.get('/', getCategories);
router.get('/:id', getCategory);
router.post('/', protect, roleCheck('admin'), createCategory);
router.put('/:id', protect, roleCheck('admin'), updateCategory);
router.delete('/:id', protect, roleCheck('admin'), deleteCategory);

module.exports = router;
