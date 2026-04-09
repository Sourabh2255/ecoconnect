const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const User = require('../models/User');
const { WasteDeclaration, MarketplaceListing, ESGReport, TransferRequest, Notification } = require('../models/index');

const auth = [protect, authorize('industry')];

// POST /api/industry/declare
router.post('/declare', ...auth, async (req, res) => {
  try {
    const { wasteCategory, subType, volumeKg, hazardLevel, preferredDate, pickupAddress, ownerContact, specialNotes } = req.body;
    if (!wasteCategory || !volumeKg || !pickupAddress) return res.status(400).json({ message: 'Missing required fields' });
    if (volumeKg < 0.1) return res.status(400).json({ message: 'Volume must be at least 0.1 kg' });

    const qrCode = `IND-${Date.now()}-${req.user._id}`;
    const declaration = await WasteDeclaration.create({
      industryId: req.user._id,
      wasteCategory, subType: subType || '',
      volumeKg, hazardLevel: hazardLevel || 'low',
      preferredDate: preferredDate ? new Date(preferredDate) : null,
      pickupAddress, ownerContact: ownerContact || req.user.phone,
      specialNotes: specialNotes || '', qrCode,
      zone: 'pune-north',
    });

    res.status(201).json({ declaration, qrCode, message: 'Waste declaration submitted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/industry/declarations
router.get('/declarations', ...auth, async (req, res) => {
  try {
    const declarations = await WasteDeclaration.find({ industryId: req.user._id })
      .populate('collectorId', 'fullName vehicleNumber phone')
      .sort({ createdAt: -1 });
    res.json(declarations);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/industry/marketplace
router.get('/marketplace', protect, async (req, res) => {
  try {
    const { wasteType } = req.query;
    const filter = { status: 'active' };
    if (wasteType) filter.wasteType = wasteType;
    const listings = await MarketplaceListing.find(filter)
      .populate('industryId', 'companyName email phone address')
      .sort({ createdAt: -1 });
    res.json(listings);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/industry/marketplace
router.post('/marketplace', ...auth, async (req, res) => {
  try {
    const { title, wasteType, quantity, unit, pricePerUnit, description } = req.body;
    if (!title || !wasteType || !quantity) return res.status(400).json({ message: 'Missing required fields' });

    const listing = await MarketplaceListing.create({
      industryId: req.user._id,
      title, wasteType, quantity,
      unit: unit || 'kg',
      pricePerUnit: pricePerUnit || 0,
      description: description || '',
    });
    res.status(201).json(listing);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// PUT /api/industry/marketplace/:id
router.put('/marketplace/:id', ...auth, async (req, res) => {
  try {
    const listing = await MarketplaceListing.findOneAndUpdate(
      { _id: req.params.id, industryId: req.user._id },
      req.body, { new: true }
    );
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    res.json(listing);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// DELETE /api/industry/marketplace/:id
router.delete('/marketplace/:id', ...auth, async (req, res) => {
  try {
    await MarketplaceListing.findOneAndDelete({ _id: req.params.id, industryId: req.user._id });
    res.json({ message: 'Listing deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/industry/marketplace/:id/interest
router.post('/marketplace/:id/interest', protect, async (req, res) => {
  try {
    const listing = await MarketplaceListing.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { interestedParties: req.user._id } },
      { new: true }
    );
    res.json({ message: 'Interest expressed', listing });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/industry/nearby-industries
router.get('/nearby-industries', protect, async (req, res) => {
  try {
    const industries = await User.find({ role: 'industry', isEmailVerified: true })
      .select('companyName address lat lng acceptsWasteTypes phone industryType gstNumber');
    res.json(industries);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/industry/transfer-request
router.post('/transfer-request', ...auth, async (req, res) => {
  try {
    const { targetIndustryId, wasteType, quantity, description, proposedPrice } = req.body;
    const transfer = await TransferRequest.create({
      fromIndustry: req.user._id,
      toIndustry: targetIndustryId,
      wasteType, quantity,
      description: description || '',
      proposedPrice: proposedPrice || 0,
    });

    await Notification.create({
      userId: targetIndustryId,
      title: 'New Transfer Request',
      message: `${req.user.companyName} wants to transfer ${quantity} kg of ${wasteType}`,
      type: 'info', relatedId: transfer._id,
    });

    res.status(201).json(transfer);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/industry/transfer-requests
router.get('/transfer-requests', ...auth, async (req, res) => {
  try {
    const incoming = await TransferRequest.find({ toIndustry: req.user._id })
      .populate('fromIndustry', 'companyName email phone');
    const outgoing = await TransferRequest.find({ fromIndustry: req.user._id })
      .populate('toIndustry', 'companyName email phone');
    res.json({ incoming, outgoing });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// PUT /api/industry/transfer-request/:id
router.put('/transfer-request/:id', ...auth, async (req, res) => {
  try {
    const { status } = req.body;
    const transfer = await TransferRequest.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(transfer);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/industry/esg-report
router.get('/esg-report', ...auth, async (req, res) => {
  try {
    const declarations = await WasteDeclaration.find({ industryId: req.user._id });
    const totalWaste = declarations.reduce((s, d) => s + d.volumeKg, 0);
    const recycledWaste = declarations.filter(d => ['recyclable', 'organic'].includes(d.wasteCategory)).reduce((s, d) => s + d.volumeKg, 0);
    const recyclingRate = totalWaste > 0 ? Math.round((recycledWaste / totalWaste) * 100) : 0;
    const co2Saved = Math.round(recycledWaste * 0.5);
    const co2Emitted = Math.round((totalWaste - recycledWaste) * 0.3);

    let grade = 'F';
    if (recyclingRate >= 80) grade = 'A+';
    else if (recyclingRate >= 70) grade = 'A';
    else if (recyclingRate >= 60) grade = 'B';
    else if (recyclingRate >= 50) grade = 'C';
    else if (recyclingRate >= 30) grade = 'D';

    const report = { totalWaste, recycledWaste, co2Saved, co2Emitted, recyclingRate, grade, score: recyclingRate, declarationCount: declarations.length };

    const user = await User.findById(req.user._id).select('complianceScore companyName gstNumber industryType');
    res.json({ ...report, ...user.toObject() });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/industry/analytics
router.get('/analytics', ...auth, async (req, res) => {
  try {
    const declarations = await WasteDeclaration.find({ industryId: req.user._id }).sort({ createdAt: 1 });
    const monthly = {};
    declarations.forEach(d => {
      const key = new Date(d.createdAt).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      if (!monthly[key]) monthly[key] = { month: key, total: 0, recycled: 0 };
      monthly[key].total += d.volumeKg;
      if (['recyclable', 'organic'].includes(d.wasteCategory)) monthly[key].recycled += d.volumeKg;
    });
    res.json({ monthlyWaste: Object.values(monthly) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
