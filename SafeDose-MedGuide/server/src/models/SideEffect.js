const mongoose = require('mongoose');

const sideEffectSchema = new mongoose.Schema({
  medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
  effect: { type: String, required: [true, 'Side effect name is required'] },
  severity: { type: String, enum: ['mild', 'moderate', 'severe', 'life-threatening'], required: true },
  frequency: { type: String, enum: ['very-common', 'common', 'uncommon', 'rare', 'very-rare'], default: 'common' },
  description: { type: String, default: '' },
  actionRequired: { type: String, default: 'Monitor and consult doctor if persistent.' },
}, { timestamps: true });

sideEffectSchema.index({ medicine: 1 });

module.exports = mongoose.model('SideEffect', sideEffectSchema);
