// server/controllers/adminController.js

const User = require('../models/User');
const Shop = require('../models/Shop');
const Order = require('../models/Order');

// Get system-wide statistics
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalShops = await Shop.countDocuments();
    const totalOrders = await Order.countDocuments();
    res.json({ totalUsers, totalShops, totalOrders });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// <<<<---- NEW: Update a user's role ---->>>>
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const userIdToUpdate = req.params.id;

    // Security: Admin cannot change their own role
    if (req.user.id === userIdToUpdate) {
      return res.status(400).json({ msg: "You cannot change your own role." });
    }

    const user = await User.findById(userIdToUpdate);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    user.role = role;
    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// <<<<---- NEW: Delete a user ---->>>>
exports.deleteUser = async (req, res) => {
  try {
    const userIdToDelete = req.params.id;

    // Security: Admin cannot delete their own account
    if (req.user.id === userIdToDelete) {
      return res.status(400).json({ msg: "You cannot delete your own account." });
    }

    const user = await User.findById(userIdToDelete);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Optional: Add logic here to handle user's shops/orders before deleting
    await user.deleteOne();
    res.json({ msg: 'User removed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
