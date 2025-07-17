// server/controllers/authController.js

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ... (register function remains the same) ...
exports.register = async (req, res) => { /* ... no changes here ... */ };

// Login a user
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });
    
    // <<<<---- NEW: Check if user is suspended ---->>>>
    if (user.isSuspended) {
      return res.status(403).json({ msg: "Your account has been suspended. Please contact an admin." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ token, user: { id: user._id, name: user.name, role: user.role, email: user.email } });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// ... (getUser function remains the same) ...
exports.getUser = async (req, res) => { /* ... no changes here ... */ };
