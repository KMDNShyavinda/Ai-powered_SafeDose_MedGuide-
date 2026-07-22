const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Category name is required'], unique: true, trim: true },
  slug: { type: String, unique: true },
  description: { type: String, default: '' },
  icon: { type: String, default: '💊' },
  isActive: { type: Boolean, default: true },
  medicineCount: { type: Number, default: 0 },
}, { timestamps: true });

categorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model('Category', categorySchema);
