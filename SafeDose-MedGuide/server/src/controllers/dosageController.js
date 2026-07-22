const DosageGuide = require('../models/DosageGuide');
const { sendSuccess, sendError } = require('../utils/apiResponse');

exports.getDosagesByMedicine = async (req, res) => {
  try {
    const dosages = await DosageGuide.find({ medicine: req.params.medicineId }).populate('medicine', 'name genericName').sort({ ageGroup: 1 });
    return sendSuccess(res, 'Dosage guides fetched successfully', { dosages });
  } catch (error) { return sendError(res, error.message); }
};

exports.createDosage = async (req, res) => {
  try {
    const dosage = await DosageGuide.create(req.body);
    return sendSuccess(res, 'Dosage guide created successfully', { dosage }, 201);
  } catch (error) { return sendError(res, error.message); }
};

exports.updateDosage = async (req, res) => {
  try {
    const dosage = await DosageGuide.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!dosage) return sendError(res, 'Dosage guide not found', 404);
    return sendSuccess(res, 'Dosage guide updated successfully', { dosage });
  } catch (error) { return sendError(res, error.message); }
};

exports.deleteDosage = async (req, res) => {
  try {
    const dosage = await DosageGuide.findByIdAndDelete(req.params.id);
    if (!dosage) return sendError(res, 'Dosage guide not found', 404);
    return sendSuccess(res, 'Dosage guide deleted successfully');
  } catch (error) { return sendError(res, error.message); }
};
