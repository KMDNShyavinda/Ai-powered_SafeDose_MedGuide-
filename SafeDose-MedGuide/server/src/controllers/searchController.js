const Medicine = require('../models/Medicine');
const SearchHistory = require('../models/SearchHistory');
const { sendSuccess, sendError } = require('../utils/apiResponse');

exports.searchMedicines = async (req, res) => {
  try {
    const { q, category, dosageForm, prescriptionRequired } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const query = { isActive: true };
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { genericName: { $regex: q, $options: 'i' } },
        { brandName: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ];
    }
    if (category) query.category = category;
    if (dosageForm) query.dosageForm = dosageForm;
    if (prescriptionRequired !== undefined) query.prescriptionRequired = prescriptionRequired === 'true';
    const total = await Medicine.countDocuments(query);
    const medicines = await Medicine.find(query).populate('category', 'name slug icon').populate('manufacturer', 'name').skip(skip).limit(limit).sort({ viewCount: -1 });
    if (q && req.user) {
      await SearchHistory.create({ user: req.user._id, query: q, resultCount: total, filters: { category, dosageForm, prescriptionRequired } });
      if (medicines.length > 0) {
        const medicineIds = medicines.map(m => m._id);
        await Medicine.updateMany({ _id: { $in: medicineIds } }, { $inc: { searchCount: 1 } });
      }
    }
    return sendSuccess(res, 'Search results', { medicines }, 200, { page, limit, total, pages: Math.ceil(total / limit) });
  } catch (error) { return sendError(res, error.message); }
};

exports.getSearchHistory = async (req, res) => {
  try {
    const history = await SearchHistory.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(20);
    return sendSuccess(res, 'Search history fetched', { history });
  } catch (error) { return sendError(res, error.message); }
};

exports.clearSearchHistory = async (req, res) => {
  try {
    await SearchHistory.deleteMany({ user: req.user._id });
    return sendSuccess(res, 'Search history cleared');
  } catch (error) { return sendError(res, error.message); }
};

exports.getSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return sendSuccess(res, 'Suggestions', { suggestions: [] });
    const medicines = await Medicine.find({ isActive: true, $or: [{ name: { $regex: q, $options: 'i' } }, { genericName: { $regex: q, $options: 'i' } }] }).select('name genericName dosageForm strength').limit(8);
    return sendSuccess(res, 'Suggestions fetched', { suggestions: medicines });
  } catch (error) { return sendError(res, error.message); }
};
