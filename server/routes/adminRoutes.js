// server/routes/adminRoutes.js

const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth'); // Use our new admin middleware
const User = require('../models/User');
const Shop = require('../models/Shop');
const Order = require('../models/Order');

// @route   GET /api/admin/stats
// @desc    Get system-wide statistics (Admin only)
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalShops = await Shop.countDocuments();
    const totalOrders = await Order.countDocuments();
    res.json({ totalUsers, totalShops, totalOrders });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/admin/users
// @desc    Get all users (Admin only)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Don't send back the password
    res.json(users);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
