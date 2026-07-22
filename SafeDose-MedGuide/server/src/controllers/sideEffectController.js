const SideEffect = require('../models/SideEffect');
const { sendSuccess, sendError } = require('../utils/apiResponse');

exports.getSideEffectsByMedicine = async (req, res) => {
  try {
    const sideEffects = await SideEffect.find({ medicine: req.params.medicineId }).populate('medicine', 'name genericName').sort({ severity: -1 });
    return sendSuccess(res, 'Side effects fetched successfully', { sideEffects });
  } catch (error) { return sendError(res, error.message); }
};

exports.createSideEffect = async (req, res) => {
  try {
    const sideEffect = await SideEffect.create(req.body);
    return sendSuccess(res, 'Side effect created successfully', { sideEffect }, 201);
  } catch (error) { return sendError(res, error.message); }
};

exports.updateSideEffect = async (req, res) => {
  try {
    const sideEffect = await SideEffect.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!sideEffect) return sendError(res, 'Side effect not found', 404);
    return sendSuccess(res, 'Side effect updated successfully', { sideEffect });
  } catch (error) { return sendError(res, error.message); }
};

exports.deleteSideEffect = async (req, res) => {
  try {
    const sideEffect = await SideEffect.findByIdAndDelete(req.params.id);
    if (!sideEffect) return sendError(res, 'Side effect not found', 404);
    return sendSuccess(res, 'Side effect deleted successfully');
  } catch (error) { return sendError(res, error.message); }
};
