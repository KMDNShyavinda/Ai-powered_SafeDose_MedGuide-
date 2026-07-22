const User = require('../models/User');
const Medicine = require('../models/Medicine');
const Category = require('../models/Category');
const AIChatHistory = require('../models/AIChatHistory');
const SearchHistory = require('../models/SearchHistory');
const Favorite = require('../models/Favorite');
const { sendSuccess, sendError } = require('../utils/apiResponse');

exports.getStats = async (req, res) => {
  try {
    const [totalMedicines, totalUsers, totalCategories, totalChats, totalSearches, totalFavorites] = await Promise.all([
      Medicine.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: true }),
      Category.countDocuments({ isActive: true }),
      AIChatHistory.countDocuments(),
      SearchHistory.countDocuments(),
      Favorite.countDocuments(),
    ]);
    return sendSuccess(res, 'Dashboard stats fetched', { stats: { totalMedicines, totalUsers, totalCategories, totalChats, totalSearches, totalFavorites } });
  } catch (error) { return sendError(res, error.message); }
};

exports.getPopularMedicines = async (req, res) => {
  try {
    const popular = await Medicine.find({ isActive: true }).select('name genericName viewCount searchCount').sort({ viewCount: -1 }).limit(10);
    return sendSuccess(res, 'Popular medicines fetched', { medicines: popular });
  } catch (error) { return sendError(res, error.message); }
};

exports.getRecentActivity = async (req, res) => {
  try {
    const [recentUsers, recentSearches, categoryDistribution] = await Promise.all([
      User.find().populate('role').sort({ createdAt: -1 }).limit(5).select('firstName lastName email createdAt role'),
      SearchHistory.find().sort({ createdAt: -1 }).limit(10).select('query resultCount createdAt'),
      Category.find({ isActive: true }).select('name medicineCount icon').sort({ medicineCount: -1 }),
    ]);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const dailyRegistrations = await User.aggregate([{ $match: { createdAt: { $gte: sevenDaysAgo } } }, { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]);
    const dailySearches = await SearchHistory.aggregate([{ $match: { createdAt: { $gte: sevenDaysAgo } } }, { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]);
    const dailyChats = await AIChatHistory.aggregate([{ $match: { createdAt: { $gte: sevenDaysAgo } } }, { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]);
    return sendSuccess(res, 'Recent activity fetched', { recentUsers, recentSearches, categoryDistribution, dailyRegistrations, dailySearches, dailyChats });
  } catch (error) { return sendError(res, error.message); }
};
