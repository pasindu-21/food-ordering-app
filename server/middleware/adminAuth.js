// server/middleware/adminAuth.js

const jwt = require('jsonwebtoken');

// This middleware checks if the logged-in user is an admin
module.exports = function(req, res, next) {
  // First, use the standard auth middleware to decode the token and get the user
  require('./auth')(req, res, () => {
    // Then, check the user's role
    if (req.user && req.user.role === 'admin') {
      next(); // If user is admin, proceed to the next middleware/route handler
    } else {
      // If not an admin, send a 403 Forbidden error
      res.status(403).json({ msg: 'Access denied. Admin authorization required.' });
    }
  });
};
