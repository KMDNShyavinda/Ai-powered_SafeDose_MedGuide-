const mongoose = require('mongoose');

const prescriptionMedicineSchema = new mongoose.Schema({
  prescription: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription', required: true },
  medicineName: { type: String, required: [true, 'Medicine name is required'], trim: true },
  dosage: { type: String, default: '' },
  frequency: { type: String, default: '' },
  duration: { type: String, default: '' },
  instructions: { type: String, default: '' },
  purpose: { type: String, default: '' },
  usage: { type: String, default: '' },
  sideEffects: [{ type: String }],
  warnings: [{ type: String }],
}, { timestamps: true });

prescriptionMedicineSchema.index({ prescription: 1 });

module.exports = mongoose.model('PrescriptionMedicine', prescriptionMedicineSchema);
