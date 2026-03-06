const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const PickupRequest = require('../models/PickupRequest');
const IssueReport   = require('../models/IssueReport');
const User          = require('../models/User');
const Notification  = require('../models/Notification');

// ── Get All Requests ─────────────────────────────────────
router.get('/requests', protect, authorize('government'), async (req, res) => {
  try {
    const { status, zone } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    const requests = await PickupRequest.find(filter)
      .populate('citizen', 'fullName phone email')
      .populate('collector', 'fullName')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── Assign Collector ─────────────────────────────────────
router.put('/request/:id/assign', protect, authorize('government'), async (req, res) => {
  try {
    const { collectorId } = req.body;
    if (!collectorId) return res.status(400).json({ message: 'collectorId is required' });

    const request = await PickupRequest.findByIdAndUpdate(
      req.params.id,
      { collector: collectorId, status: 'confirmed' },
      { new: true }
    ).populate('citizen', 'fullName').populate('collector', 'fullName');

    if (!request) return res.status(404).json({ message: 'Request not found' });

    // Notify the citizen
    await Notification.create({
      user:    request.citizen._id,
      title:   'Collector Assigned!',
      message: `${request.collector.fullName} has been assigned to your pickup.`,
      type:    'pickup'
    });

    res.json(request);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── Update Request Status ─────────────────────────────────
router.put('/request/:id/status', protect, authorize('government'), async (req, res) => {
  try {
    const { status } = req.body;
    const request = await PickupRequest.findByIdAndUpdate(
      req.params.id, { status }, { new: true }
    ).populate('citizen', 'fullName');

    if (status === 'collected') {
      await User.findByIdAndUpdate(request.citizen._id, { $inc: { ecoPoints: 20 } });
      await Notification.create({
        user:    request.citizen._id,
        title:   'Pickup Completed! 🎉',
        message: 'Your waste has been collected. You earned 20 Eco Points!',
        type:    'pickup'
      });
    }
    res.json(request);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── Get Fleet (all government collectors) ────────────────
router.get('/fleet', protect, authorize('government'), async (req, res) => {
  try {
    const collectors = await User.find({ role: 'government' }).select('-password');
    // Attach active requests count
    const fleet = await Promise.all(collectors.map(async (c) => {
      const active = await PickupRequest.countDocuments({ collector: c._id, status: { $in: ['confirmed','en-route'] } });
      const done   = await PickupRequest.countDocuments({ collector: c._id, status: 'collected' });
      return { ...c.toObject(), activeRequests: active, completedRequests: done };
    }));
    res.json(fleet);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── Analytics Dashboard ──────────────────────────────────
router.get('/analytics', protect, authorize('government'), async (req, res) => {
  try {
    const total      = await PickupRequest.countDocuments();
    const completed  = await PickupRequest.countDocuments({ status: 'collected' });
    const pending    = await PickupRequest.countDocuments({ status: 'pending' });
    const enRoute    = await PickupRequest.countDocuments({ status: 'en-route' });
    const confirmed  = await PickupRequest.countDocuments({ status: 'confirmed' });
    const complaints = await IssueReport.countDocuments();
    const resolved   = await IssueReport.countDocuments({ status: 'resolved' });
    const citizens   = await User.countDocuments({ role: 'citizen' });
    const collectors = await User.countDocuments({ role: 'government' });

    // Waste type breakdown
    const wasteTypes = await PickupRequest.aggregate([
      { $unwind: '$wasteTypes' },
      { $group: { _id: '$wasteTypes', count: { $sum: 1 } } }
    ]);

    // Daily pickups last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const dailyPickups = await PickupRequest.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      total, completed, pending, enRoute, confirmed, complaints, resolved,
      citizens, collectors,
      recyclingRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      complaintResolutionRate: complaints > 0 ? Math.round((resolved / complaints) * 100) : 0,
      wasteTypes, dailyPickups
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── Get Complaints ────────────────────────────────────────
router.get('/complaints', protect, authorize('government'), async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const complaints = await IssueReport.find(filter)
      .populate('citizen', 'fullName phone')
      .populate('assignedTo', 'fullName')
      .sort({ createdAt: -1 });
    // Mark escalated if open > 48 hours
    const withEscalation = complaints.map(c => ({
      ...c.toObject(),
      isEscalated: c.status !== 'resolved' &&
                   (Date.now() - new Date(c.createdAt).getTime()) > 48 * 3600 * 1000
    }));
    res.json(withEscalation);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── Resolve Complaint ─────────────────────────────────────
router.put('/complaint/:id/resolve', protect, authorize('government'), async (req, res) => {
  try {
    const complaint = await IssueReport.findByIdAndUpdate(
      req.params.id,
      { status: 'resolved', resolvedAt: new Date() },
      { new: true }
    ).populate('citizen', 'fullName');

    await Notification.create({
      user:    complaint.citizen._id,
      title:   'Issue Resolved ✅',
      message: `Your ${complaint.issueType} report has been resolved by the municipal team.`,
      type:    'report'
    });
    res.json(complaint);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── Assign Complaint ──────────────────────────────────────
router.put('/complaint/:id/assign', protect, authorize('government'), async (req, res) => {
  try {
    const { assignedTo } = req.body;
    const complaint = await IssueReport.findByIdAndUpdate(
      req.params.id,
      { assignedTo, status: 'assigned' },
      { new: true }
    );
    res.json(complaint);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
