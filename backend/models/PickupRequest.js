const mongoose = require('mongoose');
const pickupRequestSchema = new mongoose.Schema({
  citizen:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  collector:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  wasteTypes: [{ type: String, enum: ['organic','recyclable','e-waste','hazardous','bulky'] }],
  scheduledDate: { type: Date, required: true },
  timeSlot:   { type: String, enum: ['morning','afternoon','evening'], default: 'morning' },
  quantity:   { type: String, default: 'small' },
  address:    { type: String, required: true },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number]
  },
  specialInstructions: { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending','confirmed','en-route','collected','cancelled'],
    default: 'pending'
  },
  qrCode:           { type: String },
  ecoPointsAwarded: { type: Number, default: 0 },
  recurring:        { type: String, default: 'one-time' },
  rating:           { type: Number, min: 1, max: 5 },
  feedback:         { type: String }
}, { timestamps: true });
module.exports = mongoose.model('PickupRequest', pickupRequestSchema);