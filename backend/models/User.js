const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['citizen', 'government_officer', 'garbage_collector', 'industry'], required: true },
  isEmailVerified: { type: Boolean, default: false },
  profilePhoto: { type: String, default: '' },
  address: { type: String, default: '' },
  // Citizen fields
  ecoPoints: { type: Number, default: 0 },
  level: { type: String, default: 'Eco Beginner' },
  loginStreak: { type: Number, default: 0 },
  lastLogin: { type: Date },
  cancellationsThisMonth: { type: Number, default: 0 },
  // Government/Collector fields
  zone: { type: String, default: '' },
  isOnDuty: { type: Boolean, default: false },
  vehicleNumber: { type: String, default: '' },
  currentLat: { type: Number, default: 18.5204 },
  currentLng: { type: Number, default: 73.8567 },
  // Industry fields
  companyName: { type: String, default: '' },
  gstNumber: { type: String, default: '' },
  industryType: { type: String, default: '' },
  acceptsWasteTypes: [{ type: String }],
  lat: { type: Number, default: 0 },
  lng: { type: Number, default: 0 },
  complianceScore: { type: Number, default: 100 },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
