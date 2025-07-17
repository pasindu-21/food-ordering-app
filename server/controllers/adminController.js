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
  } catch (err) { res.status(500).send('Server Error'); }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) { res.status(500).send('Server Error'); }
};

// <<<<---- updateUserRole function එක සම්පූර්ණයෙන්ම අයින් කරා ---->>>>

// Delete a user
exports.deleteUser = async (req, res) => {
  try {
    if (req.user.id === req.params.id) return res.status(400).json({ msg: "You cannot delete your own account." });
    
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    
    if (user.role === 'owner') {
      await Shop.deleteOne({ owner: req.params.id });
    }
    
    await user.deleteOne();
    res.json({ msg: 'User and associated data removed successfully.' });
  } catch (err) { res.status(500).send('Server Error'); }
};
