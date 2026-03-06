const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const PickupRequest = require('../models/PickupRequest');
const IssueReport   = require('../models/IssueReport');
const User          = require('../models/User');
const Notification  = require('../models/Notification');

// ── Schedule Pickup ─────────────────────────────────────
router.post('/pickup', protect, authorize('citizen'), async (req, res) => {
  try {
    const { wasteTypes, scheduledDate, timeSlot, quantity, address, specialInstructions, recurring } = req.body;
    if (!wasteTypes || !scheduledDate || !address)
      return res.status(400).json({ message: 'wasteTypes, scheduledDate and address are required' });

    const qrCode = `ECO-${Date.now()}-${req.user._id.toString().slice(-6).toUpperCase()}`;
    const pickup = await PickupRequest.create({
      citizen: req.user._id, wasteTypes, scheduledDate,
      timeSlot, quantity, address, specialInstructions, recurring, qrCode
    });

    // Award 5 eco points
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { ecoPoints: 5 } },
      { new: true }
    );
    await updatedUser.save();

    // Create notification
    await Notification.create({
      user: req.user._id,
      title: 'Pickup Scheduled!',
      message: `Your ${wasteTypes.join(', ')} pickup on ${new Date(scheduledDate).toDateString()} is confirmed.`,
      type: 'pickup'
    });

    res.status(201).json({ pickup, ecoPoints: updatedUser.ecoPoints });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── Get My Pickups ───────────────────────────────────────
router.get('/pickups', protect, authorize('citizen'), async (req, res) => {
  try {
    const pickups = await PickupRequest.find({ citizen: req.user._id })
      .populate('collector', 'fullName phone')
      .sort({ createdAt: -1 });
    res.json(pickups);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── Get Single Pickup ────────────────────────────────────
router.get('/pickup/:id', protect, authorize('citizen'), async (req, res) => {
  try {
    const pickup = await PickupRequest.findById(req.params.id)
      .populate('collector', 'fullName phone');
    if (!pickup) return res.status(404).json({ message: 'Pickup not found' });
    res.json(pickup);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── Cancel Pickup ────────────────────────────────────────
router.put('/pickup/:id/cancel', protect, authorize('citizen'), async (req, res) => {
  try {
    const pickup = await PickupRequest.findOneAndUpdate(
      { _id: req.params.id, citizen: req.user._id },
      { status: 'cancelled' },
      { new: true }
    );
    if (!pickup) return res.status(404).json({ message: 'Pickup not found' });
    res.json(pickup);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── Submit Issue Report ──────────────────────────────────
router.post('/report', protect, authorize('citizen'), async (req, res) => {
  try {
    const { issueType, address, severity, description } = req.body;
    if (!issueType) return res.status(400).json({ message: 'Issue type is required' });

    const report = await IssueReport.create({
      citizen: req.user._id, issueType, address, severity, description
    });

    // Award 10 eco points for reporting
    await User.findByIdAndUpdate(req.user._id, { $inc: { ecoPoints: 10 } });

    await Notification.create({
      user: req.user._id,
      title: 'Issue Reported',
      message: `Your ${issueType} report has been submitted and will be reviewed shortly.`,
      type: 'report'
    });

    res.status(201).json(report);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── Eco Points ───────────────────────────────────────────
router.get('/eco-points', protect, authorize('citizen'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('ecoPoints level fullName');
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── Leaderboard ──────────────────────────────────────────
router.get('/leaderboard', protect, async (req, res) => {
  try {
    const leaders = await User.find({ role: 'citizen' })
      .select('fullName ecoPoints level neighbourhood')
      .sort({ ecoPoints: -1 })
      .limit(20);
    res.json(leaders);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── Drop Points (static demo) ────────────────────────────
router.get('/drop-points', protect, async (req, res) => {
  res.json([
    { _id: '1', name: 'Green Hub Station', type: 'Recycling Center', accepts: ['Paper','Plastic','Glass','Metal'], distance: '0.8 km', address: 'MG Road, Sector 14', lat: 18.5204, lng: 73.8567, hours: '8AM - 8PM' },
    { _id: '2', name: 'E-Waste Collection Point', type: 'E-Waste Drop', accepts: ['Electronics','Batteries','Cables'], distance: '1.2 km', address: 'IT Park, Block C', lat: 18.5304, lng: 73.8467, hours: '9AM - 6PM' },
    { _id: '3', name: 'Municipal Composting Yard', type: 'Organic Waste', accepts: ['Food Waste','Garden Waste'], distance: '2.1 km', address: 'Civil Lines, Gate 2', lat: 18.5104, lng: 73.8667, hours: '7AM - 7PM' },
    { _id: '4', name: 'Hazardous Waste Facility', type: 'Hazardous', accepts: ['Chemicals','Paint','Oil'], distance: '3.5 km', address: 'Industrial Area, Zone 4', lat: 18.5004, lng: 73.8767, hours: '10AM - 5PM' }
  ]);
});

module.exports = router;
