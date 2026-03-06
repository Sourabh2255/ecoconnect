const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const WasteDeclaration   = require('../models/WasteDeclaration');
const MarketplaceListing = require('../models/MarketplaceListing');
const User               = require('../models/User');
const Notification       = require('../models/Notification');

// ── Declare Waste ────────────────────────────────────────
router.post('/declare', protect, authorize('industry'), async (req, res) => {
  try {
    const { wasteCategory, wasteSubType, volumeKg, packagingType, hazardLevel, preferredDate, notes } = req.body;
    if (!wasteCategory || !volumeKg) return res.status(400).json({ message: 'wasteCategory and volumeKg are required' });

    const qrCode = `IND-${Date.now()}-${req.user._id.toString().slice(-6).toUpperCase()}`;
    const declaration = await WasteDeclaration.create({
      industry: req.user._id, wasteCategory, wasteSubType,
      volumeKg, packagingType, hazardLevel, preferredDate, notes, qrCode
    });

    await Notification.create({
      user: req.user._id,
      title: 'Waste Declaration Submitted',
      message: `Your declaration of ${volumeKg}kg ${wasteCategory} has been submitted. A collector will be assigned soon.`,
      type: 'pickup'
    });

    res.status(201).json(declaration);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── Get My Declarations ──────────────────────────────────
router.get('/declarations', protect, authorize('industry'), async (req, res) => {
  try {
    const declarations = await WasteDeclaration.find({ industry: req.user._id })
      .populate('collector', 'fullName')
      .sort({ createdAt: -1 });
    res.json(declarations);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── Create Marketplace Listing ───────────────────────────
router.post('/listing', protect, authorize('industry'), async (req, res) => {
  try {
    const { materialType, subType, quantityKg, pricePerKg, minOrderKg, location, description } = req.body;
    if (!materialType || !quantityKg || !pricePerKg) {
      return res.status(400).json({ message: 'materialType, quantityKg and pricePerKg are required' });
    }
    const listing = await MarketplaceListing.create({
      seller: req.user._id, materialType, subType,
      quantityKg, pricePerKg, minOrderKg, location, description
    });
    await listing.populate('seller', 'companyName');
    res.status(201).json(listing);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── Browse All Listings ──────────────────────────────────
router.get('/listings', protect, async (req, res) => {
  try {
    const { materialType, maxPrice, location } = req.query;
    const filter = { status: 'active' };
    if (materialType) filter.materialType = { $regex: materialType, $options: 'i' };
    if (maxPrice) filter.pricePerKg = { $lte: Number(maxPrice) };
    const listings = await MarketplaceListing.find(filter)
      .populate('seller', 'companyName location')
      .sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── My Listings ──────────────────────────────────────────
router.get('/my-listings', protect, authorize('industry'), async (req, res) => {
  try {
    const listings = await MarketplaceListing.find({ seller: req.user._id }).sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── Delete Listing ────────────────────────────────────────
router.delete('/listing/:id', protect, authorize('industry'), async (req, res) => {
  try {
    const listing = await MarketplaceListing.findOneAndDelete({ _id: req.params.id, seller: req.user._id });
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    res.json({ message: 'Listing deleted successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── ESG Data ─────────────────────────────────────────────
router.get('/esg', protect, authorize('industry'), async (req, res) => {
  try {
    const declarations = await WasteDeclaration.find({ industry: req.user._id });
    const total    = declarations.reduce((s, d) => s + d.volumeKg, 0);
    const recycled = declarations.filter(d => d.status === 'certified').reduce((s, d) => s + d.volumeKg, 0);
    const landfill = total - recycled;
    const rate     = total > 0 ? Math.round((recycled / total) * 100) : 0;
    const co2Saved = (recycled * 0.0035).toFixed(2); // approx tonnes CO2

    // Monthly breakdown (last 12 months)
    const now = new Date();
    const monthly = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const next = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const monthDecls = declarations.filter(x => new Date(x.createdAt) >= d && new Date(x.createdAt) < next);
      monthly.push({
        month: d.toLocaleString('default', { month: 'short' }),
        declared: monthDecls.reduce((s, x) => s + x.volumeKg, 0),
        recycled: monthDecls.filter(x => x.status === 'certified').reduce((s, x) => s + x.volumeKg, 0)
      });
    }

    res.json({
      totalWaste: total, recycledWaste: recycled, landfillWaste: landfill,
      recyclingRate: rate, co2Saved, complianceRate: req.user.complianceScore,
      totalDeclarations: declarations.length,
      monthly
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── Compliance Alerts ─────────────────────────────────────
router.get('/compliance', protect, authorize('industry'), async (req, res) => {
  try {
    const pending = await WasteDeclaration.find({ industry: req.user._id, status: 'pending' });
    const overdue = pending.filter(d => d.preferredDate && new Date(d.preferredDate) < new Date());
    const hazardous = pending.filter(d => d.hazardLevel === 'high' || d.hazardLevel === 'medium');
    const alerts = [];
    if (req.user.complianceScore >= 90) {
      alerts.push({ type: 'compliant', title: 'Compliance Score Excellent', message: `Score: ${req.user.complianceScore}% — You are in good standing.`, action: 'Download Certificate' });
    }
    overdue.forEach(d => alerts.push({
      type: 'warning', title: 'Overdue Pickup', message: `${d.wasteCategory} (${d.volumeKg}kg) pickup overdue since ${new Date(d.preferredDate).toDateString()}`, action: 'Schedule Now', declarationId: d._id
    }));
    hazardous.forEach(d => alerts.push({
      type: 'violation', title: 'Hazardous Waste Pending', message: `${d.wasteCategory} (${d.hazardLevel} hazard) awaiting certified collector.`, action: 'Track Status', declarationId: d._id
    }));
    if (alerts.length === 0) {
      alerts.push({ type: 'compliant', title: 'All Clear', message: 'No active compliance issues. Well done!', action: 'View ESG Report' });
    }
    res.json(alerts);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
