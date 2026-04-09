const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const User = require('../models/User');
const { PickupRequest, VehicleTracking } = require('../models/index');

// Citizen: GET /api/tracker/:requestId
router.get('/:requestId', protect, async (req, res) => {
  try {
    const pickup = await PickupRequest.findById(req.params.requestId)
      .populate('collectorId', 'fullName phone vehicleNumber currentLat currentLng');

    if (!pickup) return res.status(404).json({ message: 'Pickup not found' });

    if (pickup.status === 'collected') {
      return res.json({ status: 'completed', message: 'Pickup has been completed' });
    }

    if (!['confirmed', 'en-route'].includes(pickup.status)) {
      return res.json({ status: pickup.status, message: 'Tracking not available yet' });
    }

    const collector = pickup.collectorId;
    let lat = collector?.currentLat || 18.5204;
    let lng = collector?.currentLng || 73.8567;

    // Simulate slight movement if demo
    lat += (Math.random() - 0.5) * 0.005;
    lng += (Math.random() - 0.5) * 0.005;

    const eta = Math.floor(5 + Math.random() * 25);

    res.json({
      status: pickup.status,
      collector: {
        name: collector?.fullName || 'Driver',
        phone: collector?.phone || '',
        vehicleNumber: collector?.vehicleNumber || 'MH12AB1234',
        lat, lng,
      },
      pickupAddress: { lat: pickup.addressLat, lng: pickup.addressLng, address: pickup.address },
      eta,
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Officer: GET /api/tracker/fleet/:zone
router.get('/fleet/:zone', protect, authorize('government_officer'), async (req, res) => {
  try {
    const collectors = await User.find({
      role: 'garbage_collector',
      zone: req.params.zone,
    }).select('fullName phone vehicleNumber currentLat currentLng isOnDuty');

    const result = collectors.map(c => ({
      _id: c._id,
      name: c.fullName,
      phone: c.phone,
      vehicleNumber: c.vehicleNumber,
      lat: (c.currentLat || 18.5204) + (Math.random() - 0.5) * 0.008,
      lng: (c.currentLng || 73.8567) + (Math.random() - 0.5) * 0.008,
      isOnDuty: c.isOnDuty,
    }));

    res.json(result);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Collector: PUT /api/tracker/location
router.put('/location', protect, authorize('garbage_collector'), async (req, res) => {
  try {
    const { lat, lng, requestId } = req.body;
    await User.findByIdAndUpdate(req.user._id, { currentLat: lat, currentLng: lng });
    if (requestId) {
      await VehicleTracking.create({ collectorId: req.user._id, requestId, lat, lng, zone: req.user.zone });
    }
    res.json({ message: 'Location updated' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
