const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const { EmailOTP } = require('../models/index');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const getTransporter = () => nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const sendOTPEmail = async (email, otp, name) => {
  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"EcoConnect" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Email Verification - EcoConnect',
      html: `<div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;background:#f0fdf4;border-radius:12px">
        <h2 style="color:#16a34a">Welcome to EcoConnect, ${name}!</h2>
        <p>Your verification code is:</p>
        <div style="font-size:36px;font-weight:900;color:#14532d;letter-spacing:8px;padding:16px;background:#dcfce7;border-radius:8px;text-align:center">${otp}</div>
        <p style="color:#6b7280;font-size:14px">This code expires in 10 minutes. Do not share it with anyone.</p>
      </div>`,
    });
  } catch (e) { console.log('Email send failed (check env vars):', e.message); }
};

// Validation helpers
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePhone = (phone) => /^[6-9]\d{9}$/.test(phone);
const validatePassword = (pass) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(pass);
const validateName = (name) => /^[a-zA-Z\s]{2,50}$/.test(name);

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, phone, password, role, address, companyName, gstNumber, industryType, acceptsWasteTypes, lat, lng } = req.body;

    if (!validateName(fullName)) return res.status(400).json({ message: 'Invalid full name (2-50 letters only)' });
    if (!validateEmail(email)) return res.status(400).json({ message: 'Invalid email format' });
    if (!validatePhone(phone)) return res.status(400).json({ message: 'Phone must be 10 digits starting with 6-9' });
    if (!validatePassword(password)) return res.status(400).json({ message: 'Password must be 8+ chars with uppercase, lowercase, number' });
    if (!['citizen', 'industry'].includes(role)) return res.status(400).json({ message: 'Invalid role for self-registration' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const userData = { fullName, email, phone, password, role, address: address || '' };
    if (role === 'industry') {
      if (!gstNumber || !/^[A-Z0-9]{15}$/.test(gstNumber.toUpperCase())) return res.status(400).json({ message: 'Invalid GST number (15 alphanumeric chars)' });
      if (!address || address.length < 10) return res.status(400).json({ message: 'Address must be at least 10 characters' });
      userData.companyName = companyName || '';
      userData.gstNumber = gstNumber.toUpperCase();
      userData.industryType = industryType || '';
      userData.acceptsWasteTypes = acceptsWasteTypes || [];
      userData.lat = lat || 18.5204;
      userData.lng = lng || 73.8567;
    }

    const user = await User.create(userData);
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await EmailOTP.findOneAndUpdate({ email }, { otp, expiresAt, lastSentAt: new Date() }, { upsert: true, new: true });
    await sendOTPEmail(email, otp, fullName);

    res.status(201).json({ message: 'Registration successful. Check email for OTP.', userId: user._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/auth/verify-email
router.post('/verify-email', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const otpRecord = await EmailOTP.findOne({ email });
    if (!otpRecord) return res.status(400).json({ message: 'OTP not found. Request a new one.' });
    if (otpRecord.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
    if (new Date() > otpRecord.expiresAt) return res.status(400).json({ message: 'OTP expired. Request a new one.' });

    const user = await User.findOneAndUpdate({ email }, { isEmailVerified: true }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    await EmailOTP.deleteOne({ email });
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.json({ message: 'Email verified!', token, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/auth/resend-otp
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const existing = await EmailOTP.findOne({ email });
    if (existing && (Date.now() - new Date(existing.lastSentAt).getTime()) < 60000) {
      return res.status(429).json({ message: 'Please wait 60 seconds before requesting a new OTP' });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await EmailOTP.findOneAndUpdate({ email }, { otp, expiresAt, lastSentAt: new Date() }, { upsert: true });
    await sendOTPEmail(email, otp, user.fullName);

    res.json({ message: 'OTP resent to your email' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    if (!user.isEmailVerified) return res.status(401).json({ message: 'Please verify your email first' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    // Update login streak
    const now = new Date();
    const lastLogin = user.lastLogin ? new Date(user.lastLogin) : null;
    let streak = user.loginStreak || 0;
    if (lastLogin) {
      const daysDiff = Math.floor((now - lastLogin) / (1000 * 60 * 60 * 24));
      if (daysDiff === 1) streak += 1;
      else if (daysDiff > 1) streak = 1;
    } else { streak = 1; }

    let pointsToAdd = 3;
    if (streak % 7 === 0) pointsToAdd += 25;
    await User.findByIdAndUpdate(user._id, { lastLogin: now, loginStreak: streak, $inc: { ecoPoints: pointsToAdd } });

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
    const userObj = user.toObject();
    delete userObj.password;
    userObj.ecoPoints = (userObj.ecoPoints || 0) + pointsToAdd;

    res.json({ token, user: userObj });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No account with this email' });

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await EmailOTP.findOneAndUpdate({ email }, { otp, expiresAt, lastSentAt: new Date() }, { upsert: true });
    await sendOTPEmail(email, otp, user.fullName);

    res.json({ message: 'Password reset OTP sent to email' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!validatePassword(newPassword)) return res.status(400).json({ message: 'Password must be 8+ chars with uppercase, lowercase, number' });

    const otpRecord = await EmailOTP.findOne({ email });
    if (!otpRecord || otpRecord.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
    if (new Date() > otpRecord.expiresAt) return res.status(400).json({ message: 'OTP expired' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.password = newPassword;
    await user.save();
    await EmailOTP.deleteOne({ email });

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
