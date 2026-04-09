const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { Notification } = require('../models/index');

// GET /api/notifications
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 }).limit(50);
    const unreadCount = await Notification.countDocuments({ userId: req.user._id, isRead: false });
    res.json({ notifications, unreadCount });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// PUT /api/notifications/mark-read
router.put('/mark-read', protect, async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// DELETE /api/notifications/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Notification deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
