const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const User = require('../models/User');
const { PickupRequest, Notification, VehicleTracking } = require('../models/index');

const auth = [protect, authorize('garbage_collector')];

// PUT /api/collector/duty-toggle
router.put('/duty-toggle', ...auth, async (req, res) => {
  try {
    const { isOnDuty, lat, lng } = req.body;
    const updates = { isOnDuty };
    if (lat) updates.currentLat = lat;
    if (lng) updates.currentLng = lng;
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.json({ user, message: isOnDuty ? 'You are now on duty' : 'You are now off duty' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// PUT /api/collector/location
router.put('/location', ...auth, async (req, res) => {
  try {
    const { lat, lng, requestId } = req.body;
    await User.findByIdAndUpdate(req.user._id, { currentLat: lat, currentLng: lng });
    await VehicleTracking.create({ collectorId: req.user._id, requestId: requestId || null, lat, lng, zone: req.user.zone });
    res.json({ message: 'Location updated' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/collector/my-pickups
router.get('/my-pickups', ...auth, async (req, res) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const pickups = await PickupRequest.find({
      collectorId: req.user._id,
      status: { $in: ['confirmed', 'en-route'] },
    }).populate('citizenId', 'fullName phone email').sort({ scheduledDate: 1 });
    res.json(pickups);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// PUT /api/collector/pickup/:id/status
router.put('/pickup/:id/status', ...auth, async (req, res) => {
  try {
    const { status } = req.body;
    const pickup = await PickupRequest.findOneAndUpdate(
      { _id: req.params.id, collectorId: req.user._id },
      { status }, { new: true }
    ).populate('citizenId', 'fullName');

    if (!pickup) return res.status(404).json({ message: 'Pickup not found' });

    if (status === 'collected') {
      // Notify citizen
      await Notification.create({
        userId: pickup.citizenId._id,
        title: 'Pickup Completed!',
        message: 'Your waste has been collected. Thank you for using EcoConnect!',
        type: 'success', relatedId: pickup._id,
      });
      // Award points to citizen
      await User.findByIdAndUpdate(pickup.citizenId._id, { $inc: { ecoPoints: 20 } });

      // Notify officer
      const officer = await User.findOne({ role: 'government_officer', zone: req.user.zone });
      if (officer) {
        await Notification.create({
          userId: officer._id,
          title: 'Pickup Completed',
          message: `${req.user.fullName} completed pickup at ${pickup.address}`,
          type: 'info', relatedId: pickup._id,
        });
      }
    }

    res.json({ pickup, message: `Status updated to ${status}` });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/collector/profile
router.get('/profile', ...auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const completedToday = await PickupRequest.countDocuments({
      collectorId: req.user._id, status: 'collected', updatedAt: { $gte: today }
    });
    res.json({ ...user.toObject(), completedToday });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
