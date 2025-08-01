// server/controllers/userController.js
const User = require('../models/User');

// Get user profile (fetch latest from DB)
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password'); // Exclude password
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Update user profile (name and phone)
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findById(req.user._id); // req.user from auth middleware
    if (!user) return res.status(404).json({ msg: 'User not found' });

    // Improved validation
    if (name) {
      const trimmedName = name.trim();
      if (trimmedName.length < 3) return res.status(400).json({ msg: 'Name must be at least 3 characters' });
      user.name = trimmedName;
    }
    if (phone) {
      const trimmedPhone = phone.trim();
      if (!/^0\d{9}$/.test(trimmedPhone)) return res.status(400).json({ msg: 'Invalid phone format (e.g., 0712345678)' });
      user.phone = trimmedPhone;
    }

    await user.save();
    res.json({ msg: 'Profile updated', user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};
