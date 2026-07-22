const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Medicine name is required'], trim: true },
  genericName: { type: String, required: [true, 'Generic name is required'], trim: true },
  brandName: { type: String, default: '' },
  description: { type: String, default: '' },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  manufacturer: { type: mongoose.Schema.Types.ObjectId, ref: 'Manufacturer' },
  dosageForm: { type: String, enum: ['tablet', 'capsule', 'syrup', 'injection', 'cream', 'drops', 'inhaler', 'patch', 'powder', 'ointment', 'gel', 'solution', 'suspension', 'other'], default: 'tablet' },
  strength: { type: String, default: '' },
  activeIngredients: [{ type: String }],
  usage: { type: String, default: '' },
  warnings: [{ type: String }],
  contraindications: [{ type: String }],
  storageConditions: { type: String, default: 'Store at room temperature, away from moisture and heat.' },
  prescriptionRequired: { type: Boolean, default: false },
  pregnancyWarning: { type: String, default: 'Consult your doctor before use during pregnancy.' },
  breastfeedingWarning: { type: String, default: 'Consult your doctor before use while breastfeeding.' },
  image: { type: String, default: '' },
  price: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  viewCount: { type: Number, default: 0 },
  searchCount: { type: Number, default: 0 },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

medicineSchema.index({ name: 'text', genericName: 'text', brandName: 'text', description: 'text' });
medicineSchema.index({ category: 1 });
medicineSchema.index({ manufacturer: 1 });

module.exports = mongoose.model('Medicine', medicineSchema);
