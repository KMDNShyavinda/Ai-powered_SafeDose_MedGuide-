const User = require('../models/User');
const Role = require('../models/Role');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');
const { sendSuccess, sendError } = require('../utils/apiResponse');

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, roleName } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return sendError(res, 'Email already registered', 400);
    const assignRole = roleName || 'user';
    const role = await Role.findOne({ name: assignRole });
    if (!role) return sendError(res, 'Invalid role specified', 400);
    const user = await User.create({ firstName, lastName, email, password, phone, role: role._id });
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    const userData = await User.findById(user._id).populate('role');
    return sendSuccess(res, 'Registration successful', {
      user: { _id: userData._id, firstName: userData.firstName, lastName: userData.lastName, email: userData.email, phone: userData.phone, role: userData.role, avatar: userData.avatar },
      accessToken, refreshToken,
    }, 201);
  } catch (error) { return sendError(res, error.message); }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password').populate('role');
    if (!user) return sendError(res, 'Invalid email or password', 401);
    if (!user.isActive) return sendError(res, 'Account has been deactivated. Contact admin.', 401);
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return sendError(res, 'Invalid email or password', 401);
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    return sendSuccess(res, 'Login successful', {
      user: { _id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone, role: user.role, avatar: user.avatar },
      accessToken, refreshToken,
    });
  } catch (error) { return sendError(res, error.message); }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('role');
    return sendSuccess(res, 'User profile fetched', { user });
  } catch (error) { return sendError(res, error.message); }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return sendError(res, 'Current password is incorrect', 400);
    user.password = newPassword;
    await user.save();
    return sendSuccess(res, 'Password changed successfully');
  } catch (error) { return sendError(res, error.message); }
};

exports.logout = async (req, res) => { return sendSuccess(res, 'Logged out successfully'); };
