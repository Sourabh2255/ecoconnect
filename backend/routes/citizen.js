const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const User = require('../models/User');
const { PickupRequest, IssueReport, Notification, DumpingGround } = require('../models/index');

const auth = [protect, authorize('citizen')];

// GET /api/citizen/profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// PUT /api/citizen/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { fullName, phone, address, profilePhoto } = req.body;
    const updates = {};
    if (fullName) updates.fullName = fullName;
    if (phone) updates.phone = phone;
    if (address) updates.address = address;
    if (profilePhoto) updates.profilePhoto = profilePhoto;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');

    // Award profile completion points
    if (address && profilePhoto && phone) {
      const wasComplete = req.user.address && req.user.profilePhoto;
      if (!wasComplete) {
        await User.findByIdAndUpdate(req.user._id, { $inc: { ecoPoints: 15 } });
      }
    }
    res.json(user);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// PUT /api/citizen/change-password
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/citizen/pickup
router.post('/pickup', ...auth, async (req, res) => {
  try {
    const { wasteTypes, scheduledDate, timeSlot, address, addressLat, addressLng, photo, specialInstructions } = req.body;
    if (!wasteTypes || wasteTypes.length === 0) return res.status(400).json({ message: 'Select at least one waste type' });
    if (!scheduledDate || !timeSlot || !address) return res.status(400).json({ message: 'Missing required fields' });

    const qrCode = `ECO-${Date.now()}-${req.user._id}`;
    const pickup = await PickupRequest.create({
      citizenId: req.user._id,
      wasteTypes,
      scheduledDate: new Date(scheduledDate),
      timeSlot,
      address,
      addressLat: addressLat || 18.5204,
      addressLng: addressLng || 73.8567,
      photo: photo || '',
      specialInstructions: specialInstructions || '',
      qrCode,
      zone: req.user.zone || 'pune-north',
    });

    await User.findByIdAndUpdate(req.user._id, { $inc: { ecoPoints: 5 } });
    await Notification.create({
      userId: req.user._id,
      title: 'Pickup Scheduled',
      message: `Your pickup has been scheduled for ${new Date(scheduledDate).toLocaleDateString()}`,
      type: 'success',
      relatedId: pickup._id,
    });

    res.status(201).json({ pickup, qrCode, message: 'Pickup scheduled! +5 Eco Points earned.' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/citizen/pickups
router.get('/pickups', ...auth, async (req, res) => {
  try {
    const pickups = await PickupRequest.find({ citizenId: req.user._id })
      .populate('collectorId', 'fullName phone vehicleNumber currentLat currentLng')
      .sort({ createdAt: -1 });
    res.json(pickups);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// PUT /api/citizen/pickup/:id/cancel
router.put('/pickup/:id/cancel', ...auth, async (req, res) => {
  try {
    const pickup = await PickupRequest.findOne({ _id: req.params.id, citizenId: req.user._id });
    if (!pickup) return res.status(404).json({ message: 'Pickup not found' });
    if (['collected', 'cancelled'].includes(pickup.status)) return res.status(400).json({ message: 'Cannot cancel this pickup' });

    pickup.status = 'cancelled';
    await pickup.save();

    const user = await User.findById(req.user._id);
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const cancellationsThisMonth = await PickupRequest.countDocuments({
      citizenId: req.user._id, status: 'cancelled',
      updatedAt: { $gte: monthStart }
    });

    let pointDeduction = 0;
    if (cancellationsThisMonth > 3) pointDeduction = 5;
    await User.findByIdAndUpdate(req.user._id, { $inc: { ecoPoints: -pointDeduction }, cancellationsThisMonth });

    res.json({ message: 'Pickup cancelled', pointDeduction });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/citizen/report-issue
router.post('/report-issue', ...auth, async (req, res) => {
  try {
    const { title, description, location, lat, lng, category, photo } = req.body;
    if (!title || !description || !location) return res.status(400).json({ message: 'Missing required fields' });

    const issue = await IssueReport.create({
      reportedBy: req.user._id,
      title, description, location,
      lat: lat || 18.5204,
      lng: lng || 73.8567,
      category: category || 'general',
      photo: photo || '',
      zone: req.user.zone || 'pune-north',
    });

    await User.findByIdAndUpdate(req.user._id, { $inc: { ecoPoints: 10 } });
    res.status(201).json({ issue, message: '+10 Eco Points earned for reporting!' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/citizen/issues
router.get('/issues', ...auth, async (req, res) => {
  try {
    const issues = await IssueReport.find({ reportedBy: req.user._id }).sort({ createdAt: -1 });
    res.json(issues);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/classify (waste classifier)
router.post('/classify', protect, async (req, res) => {
  try {
    const categories = ['organic', 'recyclable', 'e-waste', 'hazardous', 'bulky'];
    const instructions = {
      organic: 'Compost at home or place in green bin. Avoid mixing with other waste.',
      recyclable: 'Clean before disposing. Place in blue recycling bin.',
      'e-waste': 'Do not bin! Take to designated e-waste collection center.',
      hazardous: 'Handle with care. Take to hazardous waste facility.',
      bulky: 'Schedule bulk pickup via EcoConnect app.',
    };
    const category = categories[Math.floor(Math.random() * categories.length)];
    const confidence = Math.floor(70 + Math.random() * 25);

    await User.findByIdAndUpdate(req.user._id, { $inc: { ecoPoints: 5 } });
    res.json({ category, confidence, disposalInstructions: instructions[category], pointsEarned: 5 });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/citizen/leaderboard
router.get('/leaderboard', protect, async (req, res) => {
  try {
    const { filter } = req.query;
    const top = await User.find({ role: 'citizen', isEmailVerified: true })
      .sort({ ecoPoints: -1 }).limit(20).select('fullName ecoPoints profilePhoto');

    const myRank = await User.countDocuments({ role: 'citizen', ecoPoints: { $gt: req.user.ecoPoints } }) + 1;
    res.json({ leaderboard: top, myRank, myPoints: req.user.ecoPoints });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/citizen/nearby-industries
router.get('/nearby-industries', protect, async (req, res) => {
  try {
    const industries = await User.find({ role: 'industry', isEmailVerified: true })
      .select('companyName address lat lng acceptsWasteTypes phone industryType');
    res.json(industries);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/citizen/dumping-grounds
router.get('/dumping-grounds', protect, async (req, res) => {
  try {
    const grounds = await DumpingGround.find({});
    res.json(grounds);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
