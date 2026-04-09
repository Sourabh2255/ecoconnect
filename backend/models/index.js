const mongoose = require('mongoose');

// EmailOTP
const emailOTPSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  lastSentAt: { type: Date, default: Date.now },
}, { timestamps: true });
const EmailOTP = mongoose.model('EmailOTP', emailOTPSchema);

// PickupRequest
const pickupRequestSchema = new mongoose.Schema({
  citizenId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  collectorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  wasteTypes: [{ type: String }],
  scheduledDate: { type: Date, required: true },
  timeSlot: { type: String, enum: ['morning', 'afternoon', 'evening'], required: true },
  address: { type: String, required: true },
  addressLat: { type: Number, default: 18.5204 },
  addressLng: { type: Number, default: 73.8567 },
  status: { type: String, enum: ['pending', 'confirmed', 'en-route', 'collected', 'cancelled'], default: 'pending' },
  qrCode: { type: String },
  photo: { type: String },
  specialInstructions: { type: String, default: '' },
  zone: { type: String, default: 'pune-north' },
  ecoPointsAwarded: { type: Boolean, default: false },
}, { timestamps: true });
const PickupRequest = mongoose.model('PickupRequest', pickupRequestSchema);

// WasteDeclaration (Industry)
const wasteDeclarationSchema = new mongoose.Schema({
  industryId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  collectorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  wasteCategory: { type: String, required: true },
  subType: { type: String, default: '' },
  volumeKg: { type: Number, required: true, min: 0.1 },
  hazardLevel: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'low' },
  preferredDate: { type: Date },
  pickupAddress: { type: String, required: true },
  ownerContact: { type: String },
  specialNotes: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'assigned', 'en-route', 'collected', 'certified'], default: 'pending' },
  qrCode: { type: String },
  zone: { type: String, default: 'pune-north' },
}, { timestamps: true });
const WasteDeclaration = mongoose.model('WasteDeclaration', wasteDeclarationSchema);

// MarketplaceListing
const marketplaceListingSchema = new mongoose.Schema({
  industryId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  wasteType: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, default: 'kg' },
  pricePerUnit: { type: Number, default: 0 },
  description: { type: String, default: '' },
  status: { type: String, enum: ['active', 'sold', 'expired'], default: 'active' },
  interestedParties: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });
const MarketplaceListing = mongoose.model('MarketplaceListing', marketplaceListingSchema);

// IssueReport
const issueReportSchema = new mongoose.Schema({
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  lat: { type: Number, default: 18.5204 },
  lng: { type: Number, default: 73.8567 },
  category: { type: String, default: 'general' },
  status: { type: String, enum: ['open', 'in-progress', 'resolved'], default: 'open' },
  zone: { type: String, default: 'pune-north' },
  photo: { type: String, default: '' },
  resolveNotes: { type: String, default: '' },
  ecoPointsAwarded: { type: Boolean, default: false },
}, { timestamps: true });
const IssueReport = mongoose.model('IssueReport', issueReportSchema);

// Notification
const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, default: 'info' },
  isRead: { type: Boolean, default: false },
  relatedId: { type: mongoose.Schema.Types.ObjectId },
}, { timestamps: true });
const Notification = mongoose.model('Notification', notificationSchema);

// VehicleTracking
const vehicleTrackingSchema = new mongoose.Schema({
  collectorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'PickupRequest' },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  zone: { type: String, default: 'pune-north' },
  timestamp: { type: Date, default: Date.now },
});
const VehicleTracking = mongoose.model('VehicleTracking', vehicleTrackingSchema);

// ESGReport
const esgReportSchema = new mongoose.Schema({
  industryId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  period: { type: String, required: true },
  totalWaste: { type: Number, default: 0 },
  recycledWaste: { type: Number, default: 0 },
  co2Saved: { type: Number, default: 0 },
  co2Emitted: { type: Number, default: 0 },
  recyclingRate: { type: Number, default: 0 },
  grade: { type: String, default: 'C' },
  score: { type: Number, default: 50 },
  zone: { type: String, default: 'pune-north' },
}, { timestamps: true });
const ESGReport = mongoose.model('ESGReport', esgReportSchema);

// DumpingGround
const dumpingGroundSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  totalCapacityTons: { type: Number, default: 100 },
  usedCapacityTons: { type: Number, default: 0 },
  wasteTypes: [{ type: String }],
  zone: { type: String, default: 'pune-north' },
  contactPhone: { type: String, default: '' },
  operatingHours: { type: String, default: '6 AM - 8 PM' },
}, { timestamps: true });
const DumpingGround = mongoose.model('DumpingGround', dumpingGroundSchema);

// IndustryTransferRequest
const transferRequestSchema = new mongoose.Schema({
  fromIndustry: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  toIndustry: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  wasteType: { type: String, required: true },
  quantity: { type: Number, required: true },
  description: { type: String, default: '' },
  proposedPrice: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
}, { timestamps: true });
const TransferRequest = mongoose.model('TransferRequest', transferRequestSchema);

module.exports = {
  EmailOTP,
  PickupRequest,
  WasteDeclaration,
  MarketplaceListing,
  IssueReport,
  Notification,
  VehicleTracking,
  ESGReport,
  DumpingGround,
  TransferRequest,
};
