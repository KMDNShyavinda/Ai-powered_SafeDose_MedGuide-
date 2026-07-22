const mongoose = require('mongoose');

const takenLogSchema = new mongoose.Schema({
  date: { type: String, required: true },
  time: { type: String, required: true },
  taken: { type: Boolean, default: false },
  takenAt: { type: Date },
}, { _id: true });

const medicationReminderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  prescriptionMedicine: { type: mongoose.Schema.Types.ObjectId, ref: 'PrescriptionMedicine' },
  prescription: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' },
  medicineName: { type: String, required: true },
  dosage: { type: String, default: '' },
  frequency: { type: String, default: '' },
  reminderTimes: [{ type: String }],
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  takenLog: [takenLogSchema],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

medicationReminderSchema.index({ user: 1, isActive: 1 });

module.exports = mongoose.model('MedicationReminder', medicationReminderSchema);
