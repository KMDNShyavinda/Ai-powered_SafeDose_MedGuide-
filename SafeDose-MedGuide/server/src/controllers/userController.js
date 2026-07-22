const User = require('../models/User');
const Role = require('../models/Role');
const { sendSuccess, sendError } = require('../utils/apiResponse');

exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const query = {};
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    const total = await User.countDocuments(query);
    const users = await User.find(query).populate('role').skip(skip).limit(limit).sort({ createdAt: -1 });
    return sendSuccess(res, 'Users fetched successfully', { users }, 200, { page, limit, total, pages: Math.ceil(total / limit) });
  } catch (error) { return sendError(res, error.message); }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('role');
    if (!user) return sendError(res, 'User not found', 404);
    return sendSuccess(res, 'User fetched successfully', { user });
  } catch (error) { return sendError(res, error.message); }
};

exports.updateUser = async (req, res) => {
  try {
    const { firstName, lastName, phone, isActive } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { firstName, lastName, phone, isActive }, { new: true, runValidators: true }).populate('role');
    if (!user) return sendError(res, 'User not found', 404);
    return sendSuccess(res, 'User updated successfully', { user });
  } catch (error) { return sendError(res, error.message); }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!user) return sendError(res, 'User not found', 404);
    return sendSuccess(res, 'User deactivated successfully');
  } catch (error) { return sendError(res, error.message); }
};

exports.changeUserRole = async (req, res) => {
  try {
    const { roleName } = req.body;
    const role = await Role.findOne({ name: roleName });
    if (!role) return sendError(res, 'Invalid role', 400);
    const user = await User.findByIdAndUpdate(req.params.id, { role: role._id }, { new: true }).populate('role');
    if (!user) return sendError(res, 'User not found', 404);
    return sendSuccess(res, 'User role updated successfully', { user });
  } catch (error) { return sendError(res, error.message); }
};

exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { firstName, lastName, phone }, { new: true, runValidators: true }).populate('role');
    return sendSuccess(res, 'Profile updated successfully', { user });
  } catch (error) { return sendError(res, error.message); }
};
