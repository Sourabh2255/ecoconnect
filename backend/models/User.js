const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName:        { type: String, required: [true,'Name is required'], trim: true },
  email:           { type: String, required: [true,'Email is required'], unique: true, lowercase: true, trim: true },
  phone:           { type: String, trim: true },
  password:        { type: String, required: [true,'Password is required'], minlength: 6 },
  role:            { type: String, enum: ['citizen','government','industry'], required: true },
  avatar:          { type: String, default: '' },
  // Citizen
  ecoPoints:       { type: Number, default: 0 },
  level:           { type: String, default: 'Eco Starter' },
  neighbourhood:   { type: String, default: '' },
  // Government
  department:      { type: String },
  employeeId:      { type: String },
  zone:            { type: String },
  // Industry
  companyName:     { type: String },
  industryType:    { type: String },
  businessRegNum:  { type: String },
  complianceScore: { type: Number, default: 100 },
  isActive:        { type: Boolean, default: true }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function(entered) {
  return await bcrypt.compare(entered, this.password);
};

userSchema.methods.getLevel = function() {
  const p = this.ecoPoints;
  if (p >= 5000) return 'Sustainability Champion';
  if (p >= 2000) return 'Eco Hero';
  if (p >= 1000) return 'Green Warrior';
  if (p >= 500)  return 'Recycler';
  return 'Eco Starter';
};

module.exports = mongoose.model('User', userSchema);
