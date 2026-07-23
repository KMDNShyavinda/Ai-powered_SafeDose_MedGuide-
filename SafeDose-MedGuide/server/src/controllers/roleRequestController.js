const RoleRequest = require('../models/RoleRequest');
const User = require('../models/User');
const Role = require('../models/Role');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// Get all role requests (Admin only)
exports.getRoleRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query.status = status;
    }

    const requests = await RoleRequest.find(query)
      .populate('user', 'firstName lastName email username phone avatar role')
      .populate('reviewedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 'Role requests fetched successfully', { requests });
  } catch (error) {
    return sendError(res, error.message);
  }
};

// Approve role request (Admin only)
exports.approveRoleRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const roleRequest = await RoleRequest.findById(id);

    if (!roleRequest) {
      return sendError(res, 'Role request not found', 404);
    }

    if (roleRequest.status !== 'pending') {
      return sendError(res, `Role request is already ${roleRequest.status}`, 400);
    }

    // Find requested role in DB
    const targetRole = await Role.findOne({ name: roleRequest.requestedRole });
    if (!targetRole) {
      return sendError(res, `Target role '${roleRequest.requestedRole}' not found`, 404);
    }

    // Update User role
    await User.findByIdAndUpdate(roleRequest.user, { role: targetRole._id });

    // Update RoleRequest status
    roleRequest.status = 'approved';
    roleRequest.reviewedBy = req.user._id;
    roleRequest.reviewedAt = new Date();
    await roleRequest.save();

    const updatedRequest = await RoleRequest.findById(id)
      .populate('user', 'firstName lastName email username phone avatar role')
      .populate('reviewedBy', 'firstName lastName email');

    return sendSuccess(res, `Role request approved. User assigned role '${roleRequest.requestedRole}'`, { roleRequest: updatedRequest });
  } catch (error) {
    return sendError(res, error.message);
  }
};

// Reject role request (Admin only)
exports.rejectRoleRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    const roleRequest = await RoleRequest.findById(id);

    if (!roleRequest) {
      return sendError(res, 'Role request not found', 404);
    }

    if (roleRequest.status !== 'pending') {
      return sendError(res, `Role request is already ${roleRequest.status}`, 400);
    }

    roleRequest.status = 'rejected';
    roleRequest.rejectionReason = rejectionReason || 'Documentation did not meet verification criteria';
    roleRequest.reviewedBy = req.user._id;
    roleRequest.reviewedAt = new Date();
    await roleRequest.save();

    const updatedRequest = await RoleRequest.findById(id)
      .populate('user', 'firstName lastName email username phone avatar role')
      .populate('reviewedBy', 'firstName lastName email');

    return sendSuccess(res, 'Role request rejected successfully', { roleRequest: updatedRequest });
  } catch (error) {
    return sendError(res, error.message);
  }
};

// Get current user's role request
exports.getUserRoleRequest = async (req, res) => {
  try {
    const roleRequest = await RoleRequest.findOne({ user: req.user._id })
      .populate('user', 'firstName lastName email username role')
      .populate('reviewedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 'User role request status fetched', { roleRequest });
  } catch (error) {
    return sendError(res, error.message);
  }
};
