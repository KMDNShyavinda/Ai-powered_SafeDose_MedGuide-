const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
  notes: { type: String, default: '' },
}, { timestamps: true });

favoriteSchema.index({ user: 1, medicine: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
