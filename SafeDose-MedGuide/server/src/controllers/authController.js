const User = require('../models/User');
const Role = require('../models/Role');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const RoleRequest = require('../models/RoleRequest');

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, username, requestedRole, notes } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return sendError(res, 'Please fill in all required fields (First Name, Last Name, Email, Password)', 400);
    }
    
    const cleanEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) return sendError(res, 'Email address is already registered', 400);
    
    if (username && username.trim()) {
      const existingUsername = await User.findOne({ username: username.trim() });
      if (existingUsername) return sendError(res, 'Username is already taken', 400);
    }
    
    // Always assign standard 'user' role by default upon registration
    let defaultRole = await Role.findOne({ name: 'user' });
    if (!defaultRole) {
      defaultRole = await Role.create({ name: 'user', description: 'Standard User' });
    }
    
    const defaultUsername = (username && username.trim()) 
      ? username.trim() 
      : (cleanEmail.includes('@') ? cleanEmail.split('@')[0] : `user_${Date.now()}`);

    const user = await User.create({ 
      username: defaultUsername, 
      firstName: firstName.trim(), 
      lastName: lastName.trim(), 
      email: cleanEmail, 
      password, 
      phone: phone || '', 
      role: defaultRole._id 
    });

    let createdRoleRequest = null;

    // Check if user submitted a request for an elevated role (pharmacist or admin)
    if (requestedRole && ['pharmacist', 'admin'].includes(requestedRole.toLowerCase())) {
      const docs = [];
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          docs.push({
            originalName: file.originalname,
            filename: file.filename,
            path: `/uploads/documents/${file.filename}`,
            mimetype: file.mimetype,
            size: file.size
          });
        });
      } else {
        // If requesting an elevated role without documents, reject registration
        await User.findByIdAndDelete(user._id);
        return sendError(res, `Requesting '${requestedRole}' role requires uploading supporting verification documents.`, 400);
      }

      createdRoleRequest = await RoleRequest.create({
        user: user._id,
        requestedRole: requestedRole.toLowerCase(),
        documents: docs,
        notes: notes || '',
        status: 'pending'
      });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    const userData = await User.findById(user._id).populate('role');
    
    return sendSuccess(res, createdRoleRequest 
      ? 'Registration successful! Your role verification request has been submitted for Admin approval.' 
      : 'Registration successful!', 
      {
        user: { 
          _id: userData._id, 
          username: userData.username, 
          firstName: userData.firstName, 
          lastName: userData.lastName, 
          email: userData.email, 
          phone: userData.phone, 
          role: userData.role, 
          avatar: userData.avatar, 
          createdAt: userData.createdAt 
        },
        accessToken, 
        refreshToken,
        roleRequest: createdRoleRequest
      }, 
      201
    );
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
      user: { _id: user._id, username: user.username || user.email.split('@')[0], firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone, role: user.role, avatar: user.avatar, createdAt: user.createdAt },
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
