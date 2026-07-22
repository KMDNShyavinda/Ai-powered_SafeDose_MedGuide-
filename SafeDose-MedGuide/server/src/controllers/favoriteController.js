const Favorite = require('../models/Favorite');
const { sendSuccess, sendError } = require('../utils/apiResponse');

exports.getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id }).populate({ path: 'medicine', populate: [{ path: 'category', select: 'name icon' }, { path: 'manufacturer', select: 'name' }] }).sort({ createdAt: -1 });
    return sendSuccess(res, 'Favorites fetched successfully', { favorites });
  } catch (error) { return sendError(res, error.message); }
};

exports.addFavorite = async (req, res) => {
  try {
    const { medicineId, notes } = req.body;
    const existing = await Favorite.findOne({ user: req.user._id, medicine: medicineId });
    if (existing) return sendError(res, 'Medicine already in favorites', 400);
    const favorite = await Favorite.create({ user: req.user._id, medicine: medicineId, notes });
    return sendSuccess(res, 'Added to favorites', { favorite }, 201);
  } catch (error) { return sendError(res, error.message); }
};

exports.removeFavorite = async (req, res) => {
  try {
    const favorite = await Favorite.findOneAndDelete({ user: req.user._id, medicine: req.params.medicineId });
    if (!favorite) return sendError(res, 'Favorite not found', 404);
    return sendSuccess(res, 'Removed from favorites');
  } catch (error) { return sendError(res, error.message); }
};

exports.checkFavorite = async (req, res) => {
  try {
    const favorite = await Favorite.findOne({ user: req.user._id, medicine: req.params.medicineId });
    return sendSuccess(res, 'Favorite status', { isFavorite: !!favorite });
  } catch (error) { return sendError(res, error.message); }
};
