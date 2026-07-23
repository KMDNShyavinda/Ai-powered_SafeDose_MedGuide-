const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, trim: true, unique: true, sparse: true },
  firstName: { type: String, required: [true, 'First name is required'], trim: true },
  lastName: { type: String, required: [true, 'Last name is required'], trim: true },
  email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'] },
  password: { type: String, required: [true, 'Password is required'], minlength: [6, 'Password must be at least 6 characters'], select: false },
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
  phone: { type: String, default: '' },
  avatar: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
