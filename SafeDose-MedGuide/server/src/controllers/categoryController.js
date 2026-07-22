const Category = require('../models/Category');
const { sendSuccess, sendError } = require('../utils/apiResponse');

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    return sendSuccess(res, 'Categories fetched successfully', { categories });
  } catch (error) { return sendError(res, error.message); }
};

exports.getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return sendError(res, 'Category not found', 404);
    return sendSuccess(res, 'Category fetched successfully', { category });
  } catch (error) { return sendError(res, error.message); }
};

exports.createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    return sendSuccess(res, 'Category created successfully', { category }, 201);
  } catch (error) { return sendError(res, error.message); }
};

exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) return sendError(res, 'Category not found', 404);
    return sendSuccess(res, 'Category updated successfully', { category });
  } catch (error) { return sendError(res, error.message); }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!category) return sendError(res, 'Category not found', 404);
    return sendSuccess(res, 'Category deleted successfully');
  } catch (error) { return sendError(res, error.message); }
};
