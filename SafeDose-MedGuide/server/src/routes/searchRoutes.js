const express = require('express');
const router = express.Router();
const { searchMedicines, getSearchHistory, clearSearchHistory, getSuggestions } = require('../controllers/searchController');
const { protect, optionalProtect } = require('../middleware/auth');

router.get('/', optionalProtect, searchMedicines);
router.get('/suggestions', getSuggestions);
router.get('/history', protect, getSearchHistory);
router.delete('/history', protect, clearSearchHistory);

module.exports = router;
