const mongoose = require('mongoose');

const marketplaceListingSchema = new mongoose.Schema({
  seller:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  materialType: { type: String, required: true },
  subType:      { type: String, default: '' },
  quantityKg:   { type: Number, required: true },
  pricePerKg:   { type: Number, required: true },
  minOrderKg:   { type: Number, default: 10 },
  location:     { type: String, default: '' },
  description:  { type: String, default: '' },
  status:       { type: String, enum: ['active','sold','expired'], default: 'active' },
  expiresAt:    { type: Date },
  interestedBuyers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('MarketplaceListing', marketplaceListingSchema);
