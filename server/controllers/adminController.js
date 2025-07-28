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
    console.error('Error in getStats:', err.message);
    res.status(500).send('Server Error');
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error('Error in getAllUsers:', err.message);
    res.status(500).send('Server Error');
  }
};

// <<<<---- නව ශ්‍රිතය: Update user details ---->>>>
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const userIdToUpdate = req.params.id;

    // පරිපාලකයාට තම ගිණුම සංස්කරණය කිරීම වැළැක්වීම
    if (req.user.id === userIdToUpdate) {
      return res.status(400).json({ msg: "You cannot edit your own account details." });
    }

    const user = await User.findById(userIdToUpdate);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // ක්ෂේත්‍ර යාවත්කාලීන කිරීම
    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;

    await user.save();
    
    // මුරපදය හැර යාවත්කාලීන වූ පරිශීලක දත්ත නැවත යැවීම
    const updatedUser = user.toObject();
    delete updatedUser.password;

    res.json({ msg: 'User updated successfully.', user: updatedUser });

  } catch (err) {
    console.error('Error in updateUser:', err.message);
    if (err.code === 11000) { // විද්‍යුත් තැපෑල දැනටමත් පවතීදැයි පරීක්ෂා කිරීම
        return res.status(400).json({ msg: 'Email already exists.' });
    }
    res.status(500).send('Server Error');
  }
};


// Suspend or Unsuspend a user
exports.suspendUser = async (req, res) => {
  try {
    const userIdToSuspend = req.params.id;
    if (req.user.id === userIdToSuspend) return res.status(400).json({ msg: "You cannot suspend your own account." });

    const user = await User.findById(userIdToSuspend);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    user.isSuspended = !user.isSuspended;
    await user.save();
    res.json({ msg: `User has been ${user.isSuspended ? 'suspended' : 'unsuspended'}.`, user });
  } catch (err) {
    console.error('Error in suspendUser:', err.message);
    res.status(500).send('Server Error');
  }
};

// Delete a user
exports.deleteUser = async (req, res) => {
  try {
    if (req.user.id === req.params.id) return res.status(400).json({ msg: "You cannot delete your own account." });
    
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    
    if (user.role === 'owner') {
      await Shop.deleteOne({ owner: req.params.id });
    }
    
    await user.deleteOne(); // findByIdAndDelete() is deprecated, use deleteOne() on the document
    res.json({ msg: 'User and associated data removed successfully.' });
  } catch (err) {
    console.error('Error in deleteUser:', err.message);
    res.status(500).send('Server Error');
  }
};
