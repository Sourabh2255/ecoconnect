const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const {
      fullName, email, phone, password, role,
      department, employeeId, zone,
      companyName, industryType, businessRegNum
    } = req.body;

    if (!fullName || !email || !password || !role) {
      return res.status(400).json({ message: 'Please provide name, email, password and role' });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'An account with this email already exists' });

    const user = await User.create({
      fullName, email, phone, password, role,
      department, employeeId, zone,
      companyName, industryType, businessRegNum
    });

    res.status(201).json({
      _id:         user._id,
      fullName:    user.fullName,
      email:       user.email,
      role:        user.role,
      ecoPoints:   user.ecoPoints,
      level:       user.level,
      companyName: user.companyName,
      department:  user.department,
      complianceScore: user.complianceScore,
      token:       generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const match = await user.matchPassword(password);
    if (!match) return res.status(401).json({ message: 'Invalid email or password' });

    res.json({
      _id:         user._id,
      fullName:    user.fullName,
      email:       user.email,
      role:        user.role,
      ecoPoints:   user.ecoPoints,
      level:       user.level,
      companyName: user.companyName,
      department:  user.department,
      complianceScore: user.complianceScore,
      token:       generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, (req, res) => res.json(req.user));

module.exports = router;
