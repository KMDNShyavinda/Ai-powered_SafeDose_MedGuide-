const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorName: { type: String, default: '' },
  hospitalName: { type: String, default: '' },
  prescriptionDate: { type: Date, default: Date.now },
  prescriptionImage: { type: String, default: '' },
  entryType: { type: String, enum: ['IMAGE', 'MANUAL'], required: true },
  analysisResult: { type: mongoose.Schema.Types.Mixed, default: null },
  status: { type: String, enum: ['pending', 'analyzed', 'failed'], default: 'pending' },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

prescriptionSchema.virtual('medicines', {
  ref: 'PrescriptionMedicine',
  localField: '_id',
  foreignField: 'prescription',
});

prescriptionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Prescription', prescriptionSchema);
