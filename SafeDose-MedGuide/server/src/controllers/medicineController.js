const Medicine = require('../models/Medicine');
const Category = require('../models/Category');
const { sendSuccess, sendError } = require('../utils/apiResponse');

exports.getMedicines = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const { category, dosageForm, prescriptionRequired, sort } = req.query;
    const query = { isActive: true };
    if (category) query.category = category;
    if (dosageForm) query.dosageForm = dosageForm;
    if (prescriptionRequired !== undefined) query.prescriptionRequired = prescriptionRequired === 'true';
    let sortOption = { createdAt: -1 };
    if (sort === 'name') sortOption = { name: 1 };
    if (sort === 'popular') sortOption = { viewCount: -1 };
    if (sort === 'newest') sortOption = { createdAt: -1 };
    const total = await Medicine.countDocuments(query);
    const medicines = await Medicine.find(query).populate('category', 'name slug icon').populate('manufacturer', 'name country').skip(skip).limit(limit).sort(sortOption);
    return sendSuccess(res, 'Medicines fetched successfully', { medicines }, 200, { page, limit, total, pages: Math.ceil(total / limit) });
  } catch (error) { return sendError(res, error.message); }
};

exports.getMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id).populate('category', 'name slug icon').populate('manufacturer', 'name country website').populate('addedBy', 'firstName lastName');
    if (!medicine) return sendError(res, 'Medicine not found', 404);
    medicine.viewCount += 1;
    await medicine.save({ validateBeforeSave: false });
    return sendSuccess(res, 'Medicine fetched successfully', { medicine });
  } catch (error) { return sendError(res, error.message); }
};

exports.createMedicine = async (req, res) => {
  try {
    req.body.addedBy = req.user._id;
    
    // Clean up empty strings for optional ObjectId fields to avoid CastError
    if (req.body.manufacturer === '') {
      delete req.body.manufacturer;
    }
    if (req.body.category === '') {
      delete req.body.category;
    }

    const medicine = await Medicine.create(req.body);
    await Category.findByIdAndUpdate(medicine.category, { $inc: { medicineCount: 1 } });
    const populated = await Medicine.findById(medicine._id).populate('category', 'name slug icon').populate('manufacturer', 'name country');
    return sendSuccess(res, 'Medicine created successfully', { medicine: populated }, 201);
  } catch (error) { return sendError(res, error.message); }
};

exports.updateMedicine = async (req, res) => {
  try {
    // Clean up empty strings for optional ObjectId fields to avoid CastError
    if (req.body.manufacturer === '') {
      req.body.manufacturer = null;
    }
    if (req.body.category === '') {
      delete req.body.category;
    }

    const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('category', 'name slug icon').populate('manufacturer', 'name country');
    if (!medicine) return sendError(res, 'Medicine not found', 404);
    return sendSuccess(res, 'Medicine updated successfully', { medicine });
  } catch (error) { return sendError(res, error.message); }
};

exports.deleteMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!medicine) return sendError(res, 'Medicine not found', 404);
    await Category.findByIdAndUpdate(medicine.category, { $inc: { medicineCount: -1 } });
    return sendSuccess(res, 'Medicine deleted successfully');
  } catch (error) { return sendError(res, error.message); }
};

exports.getAllMedicinesAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { genericName: { $regex: search, $options: 'i' } },
        { brandName: { $regex: search, $options: 'i' } },
      ];
    }
    const total = await Medicine.countDocuments(query);
    const medicines = await Medicine.find(query).populate('category', 'name').populate('manufacturer', 'name').skip(skip).limit(limit).sort({ createdAt: -1 });
    return sendSuccess(res, 'All medicines fetched', { medicines }, 200, { page, limit, total, pages: Math.ceil(total / limit) });
  } catch (error) { return sendError(res, error.message); }
};
