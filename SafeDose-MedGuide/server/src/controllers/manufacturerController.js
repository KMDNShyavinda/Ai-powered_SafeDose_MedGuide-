const Manufacturer = require('../models/Manufacturer');
const { sendSuccess, sendError } = require('../utils/apiResponse');

exports.getManufacturers = async (req, res) => {
  try {
    const manufacturers = await Manufacturer.find().sort({ name: 1 });
    return sendSuccess(res, 'Manufacturers fetched successfully', { manufacturers });
  } catch (error) { return sendError(res, error.message); }
};

exports.getManufacturer = async (req, res) => {
  try {
    const manufacturer = await Manufacturer.findById(req.params.id);
    if (!manufacturer) return sendError(res, 'Manufacturer not found', 404);
    return sendSuccess(res, 'Manufacturer fetched successfully', { manufacturer });
  } catch (error) { return sendError(res, error.message); }
};

exports.createManufacturer = async (req, res) => {
  try {
    const manufacturer = await Manufacturer.create(req.body);
    return sendSuccess(res, 'Manufacturer created successfully', { manufacturer }, 201);
  } catch (error) { return sendError(res, error.message); }
};

exports.updateManufacturer = async (req, res) => {
  try {
    const manufacturer = await Manufacturer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!manufacturer) return sendError(res, 'Manufacturer not found', 404);
    return sendSuccess(res, 'Manufacturer updated successfully', { manufacturer });
  } catch (error) { return sendError(res, error.message); }
};

exports.deleteManufacturer = async (req, res) => {
  try {
    const manufacturer = await Manufacturer.findByIdAndDelete(req.params.id);
    if (!manufacturer) return sendError(res, 'Manufacturer not found', 404);
    return sendSuccess(res, 'Manufacturer deleted successfully');
  } catch (error) { return sendError(res, error.message); }
};
