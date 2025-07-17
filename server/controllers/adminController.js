// server/controllers/adminController.js

const User = require('../models/User');
const Shop = require('../models/Shop');
const Order = require('../models/Order');

exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalShops = await Shop.countDocuments();
    const totalOrders = await Order.countDocuments();
    res.json({ totalUsers, totalShops, totalOrders });
  } catch (err) { res.status(500).send('Server Error'); }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) { res.status(500).send('Server Error'); }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (req.user.id === req.params.id) return res.status(400).json({ msg: "You cannot change your own role." });
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) { res.status(500).send('Server Error'); }
};

exports.deleteUser = async (req, res) => {
  try {
    if (req.user.id === req.params.id) return res.status(400).json({ msg: "You cannot delete your own account." });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    if (user.role === 'owner') await Shop.deleteOne({ owner: req.params.id });
    await user.deleteOne();
    res.json({ msg: 'User and associated data removed successfully.' });
  } catch (err) { res.status(500).send('Server Error'); }
};
