const mongoose = require('mongoose');

const drugInteractionSchema = new mongoose.Schema({
  drugA: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
  drugB: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
  severity: { type: String, enum: ['minor', 'moderate', 'major', 'contraindicated'], required: true },
  description: { type: String, required: true },
  mechanism: { type: String, default: '' },
  clinicalEffect: { type: String, default: '' },
  management: { type: String, default: '' },
  evidenceLevel: { type: String, enum: ['established', 'probable', 'suspected', 'possible'], default: 'established' },
}, { timestamps: true });

drugInteractionSchema.index({ drugA: 1, drugB: 1 }, { unique: true });

module.exports = mongoose.model('DrugInteraction', drugInteractionSchema);
