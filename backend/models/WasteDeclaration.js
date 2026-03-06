const mongoose = require('mongoose');

const wasteDeclarationSchema = new mongoose.Schema({
  industry:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  collector:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  wasteCategory: { type: String, required: true },
  wasteSubType:  { type: String, default: '' },
  volumeKg:      { type: Number, required: true },
  packagingType: { type: String, default: 'Bagged' },
  hazardLevel:   { type: String, enum: ['none','low','medium','high'], default: 'none' },
  preferredDate: { type: Date },
  safetyDataSheet: { type: String, default: '' },
  notes:           { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending','confirmed','collected','certified'],
    default: 'pending'
  },
  qrCode:              { type: String },
  disposalCertificate: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('WasteDeclaration', wasteDeclarationSchema);
