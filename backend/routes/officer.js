const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const User = require('../models/User');
const { PickupRequest, IssueReport, WasteDeclaration, Notification, ESGReport } = require('../models/index');

const auth = [protect, authorize('government_officer')];

// GET /api/officer/dashboard
router.get('/dashboard', ...auth, async (req, res) => {
  try {
    const zone = req.user.zone;
    const today = new Date(); today.setHours(0, 0, 0, 0);

    const pendingRequests = await PickupRequest.countDocuments({ zone, status: 'pending' });
    const freeCollectors = await User.countDocuments({ role: 'garbage_collector', zone, isOnDuty: false });
    const completedToday = await PickupRequest.countDocuments({ zone, status: 'collected', updatedAt: { $gte: today } });
    const openComplaints = await IssueReport.countDocuments({ zone, status: { $in: ['open', 'in-progress'] } });

    res.json({ pendingRequests, freeCollectors, completedToday, openComplaints, zone });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/officer/requests
router.get('/requests', ...auth, async (req, res) => {
  try {
    const requests = await PickupRequest.find({ zone: req.user.zone })
      .populate('citizenId', 'fullName phone email')
      .populate('collectorId', 'fullName vehicleNumber')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/officer/free-collectors
router.get('/free-collectors', ...auth, async (req, res) => {
  try {
    const collectors = await User.find({ role: 'garbage_collector', zone: req.user.zone }).select('-password');
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const result = await Promise.all(collectors.map(async (c) => {
      const completedToday = await PickupRequest.countDocuments({ collectorId: c._id, status: 'collected', updatedAt: { $gte: today } });
      return { ...c.toObject(), completedToday };
    }));
    res.json(result);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// PUT /api/officer/request/:id/assign
router.put('/request/:id/assign', ...auth, async (req, res) => {
  try {
    const { collectorId } = req.body;
    const pickup = await PickupRequest.findOneAndUpdate(
      { _id: req.params.id, zone: req.user.zone },
      { collectorId, status: 'confirmed' }, { new: true }
    ).populate('citizenId', 'fullName').populate('collectorId', 'fullName');

    if (!pickup) return res.status(404).json({ message: 'Request not found' });

    await Notification.create({
      userId: pickup.citizenId._id,
      title: 'Pickup Confirmed!',
      message: `Your pickup has been assigned to ${pickup.collectorId.fullName}`,
      type: 'success', relatedId: pickup._id,
    });

    res.json({ pickup, message: 'Collector assigned successfully' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/officer/complaints
router.get('/complaints', ...auth, async (req, res) => {
  try {
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const complaints = await IssueReport.find({ zone: req.user.zone })
      .populate('reportedBy', 'fullName phone email')
      .populate('assignedTo', 'fullName')
      .sort({ createdAt: -1 });

    const withEscalation = complaints.map(c => ({
      ...c.toObject(),
      isEscalated: c.status !== 'resolved' && new Date(c.updatedAt) < fortyEightHoursAgo,
    }));
    res.json(withEscalation);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// PUT /api/officer/complaint/:id/assign
router.put('/complaint/:id/assign', ...auth, async (req, res) => {
  try {
    const { collectorId } = req.body;
    const complaint = await IssueReport.findByIdAndUpdate(
      req.params.id,
      { assignedTo: collectorId, status: 'in-progress' }, { new: true }
    );
    res.json(complaint);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// PUT /api/officer/complaint/:id/resolve
router.put('/complaint/:id/resolve', ...auth, async (req, res) => {
  try {
    const { resolveNotes } = req.body;
    const complaint = await IssueReport.findByIdAndUpdate(
      req.params.id,
      { status: 'resolved', resolveNotes: resolveNotes || '' }, { new: true }
    );
    res.json(complaint);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/officer/industry-requests
router.get('/industry-requests', ...auth, async (req, res) => {
  try {
    const declarations = await WasteDeclaration.find({ zone: req.user.zone })
      .populate('industryId', 'companyName email phone gstNumber')
      .populate('collectorId', 'fullName vehicleNumber')
      .sort({ createdAt: -1 });
    res.json(declarations);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// PUT /api/officer/industry-request/:id/assign
router.put('/industry-request/:id/assign', ...auth, async (req, res) => {
  try {
    const { collectorId } = req.body;
    const decl = await WasteDeclaration.findByIdAndUpdate(
      req.params.id, { collectorId, status: 'assigned' }, { new: true }
    );
    res.json(decl);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/officer/analytics
router.get('/analytics', ...auth, async (req, res) => {
  try {
    const zone = req.user.zone;
    const last7 = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0, 0, 0, 0);
      const dEnd = new Date(d); dEnd.setHours(23, 59, 59, 999);
      const count = await PickupRequest.countDocuments({ zone, createdAt: { $gte: d, $lte: dEnd } });
      last7.push({ date: d.toLocaleDateString('en-US', { weekday: 'short' }), pickups: count });
    }

    const wasteTypes = ['Organic', 'Recyclable', 'E-Waste', 'Hazardous', 'Bulky'];
    const breakdown = wasteTypes.map(type => ({ type, value: Math.floor(Math.random() * 40) + 10 }));

    res.json({ dailyPickups: last7, wasteBreakdown: breakdown, recyclingRate: 68, co2Saved: 1240 });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/officer/esg-reports
router.get('/esg-reports', ...auth, async (req, res) => {
  try {
    const reports = await ESGReport.find({ zone: req.user.zone })
      .populate('industryId', 'companyName email gstNumber')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
