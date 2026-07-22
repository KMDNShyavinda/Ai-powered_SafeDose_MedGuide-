const mongoose = require('mongoose');

const manufacturerSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Manufacturer name is required'], unique: true, trim: true },
  country: { type: String, default: '' },
  website: { type: String, default: '' },
  contactEmail: { type: String, default: '' },
  logo: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Manufacturer', manufacturerSchema);
