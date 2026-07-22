const mongoose = require('mongoose');

const dosageGuideSchema = new mongoose.Schema({
  medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
  ageGroup: { type: String, enum: ['infant', 'child', 'adolescent', 'adult', 'elderly'], required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true },
  route: { type: String, enum: ['oral', 'topical', 'intravenous', 'intramuscular', 'subcutaneous', 'inhalation', 'rectal', 'nasal', 'ophthalmic', 'other'], default: 'oral' },
  duration: { type: String, default: '' },
  maxDailyDose: { type: String, default: '' },
  specialInstructions: { type: String, default: '' },
  foodInstructions: { type: String, default: 'Can be taken with or without food.' },
  missedDoseInstructions: { type: String, default: 'Take the missed dose as soon as you remember. Skip if it is almost time for the next dose.' },
}, { timestamps: true });

dosageGuideSchema.index({ medicine: 1, ageGroup: 1 });

module.exports = mongoose.model('DosageGuide', dosageGuideSchema);
