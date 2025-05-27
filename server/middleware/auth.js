const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ msg: 'No token, authorization denied.' }); // Changed to 401 for clearer meaning
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ msg: 'User not found for this token.' });
    }
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ msg: 'Token is not valid.' }); // Changed to 401 for clearer meaning
  }
};

module.exports = auth;