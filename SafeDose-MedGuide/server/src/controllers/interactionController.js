const DrugInteraction = require('../models/DrugInteraction');
const { sendSuccess, sendError } = require('../utils/apiResponse');

exports.getInteractions = async (req, res) => {
  try {
    const interactions = await DrugInteraction.find().populate('drugA', 'name genericName').populate('drugB', 'name genericName').sort({ severity: -1 });
    return sendSuccess(res, 'Drug interactions fetched successfully', { interactions });
  } catch (error) { return sendError(res, error.message); }
};

exports.getInteractionsByMedicine = async (req, res) => {
  try {
    const medicineId = req.params.medicineId;
    const interactions = await DrugInteraction.find({ $or: [{ drugA: medicineId }, { drugB: medicineId }] }).populate('drugA', 'name genericName').populate('drugB', 'name genericName');
    return sendSuccess(res, 'Drug interactions fetched', { interactions });
  } catch (error) { return sendError(res, error.message); }
};

exports.checkInteraction = async (req, res) => {
  try {
    const { drugs } = req.query;
    if (!drugs) return sendError(res, 'Please provide drug IDs', 400);
    const drugIds = drugs.split(',');
    const interactions = [];
    for (let i = 0; i < drugIds.length; i++) {
      for (let j = i + 1; j < drugIds.length; j++) {
        const found = await DrugInteraction.find({ $or: [{ drugA: drugIds[i], drugB: drugIds[j] }, { drugA: drugIds[j], drugB: drugIds[i] }] }).populate('drugA', 'name genericName').populate('drugB', 'name genericName');
        interactions.push(...found);
      }
    }
    return sendSuccess(res, 'Interaction check completed', { interactions });
  } catch (error) { return sendError(res, error.message); }
};

exports.createInteraction = async (req, res) => {
  try {
    const interaction = await DrugInteraction.create(req.body);
    const populated = await DrugInteraction.findById(interaction._id).populate('drugA', 'name genericName').populate('drugB', 'name genericName');
    return sendSuccess(res, 'Drug interaction created successfully', { interaction: populated }, 201);
  } catch (error) { return sendError(res, error.message); }
};

exports.updateInteraction = async (req, res) => {
  try {
    const interaction = await DrugInteraction.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('drugA', 'name genericName').populate('drugB', 'name genericName');
    if (!interaction) return sendError(res, 'Interaction not found', 404);
    return sendSuccess(res, 'Interaction updated successfully', { interaction });
  } catch (error) { return sendError(res, error.message); }
};

exports.deleteInteraction = async (req, res) => {
  try {
    const interaction = await DrugInteraction.findByIdAndDelete(req.params.id);
    if (!interaction) return sendError(res, 'Interaction not found', 404);
    return sendSuccess(res, 'Interaction deleted successfully');
  } catch (error) { return sendError(res, error.message); }
};
