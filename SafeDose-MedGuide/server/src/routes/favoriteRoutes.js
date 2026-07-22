const express = require('express');
const router = express.Router();
const { getFavorites, addFavorite, removeFavorite, checkFavorite } = require('../controllers/favoriteController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getFavorites);
router.post('/', protect, addFavorite);
router.get('/check/:medicineId', protect, checkFavorite);
router.delete('/:medicineId', protect, removeFavorite);

module.exports = router;
