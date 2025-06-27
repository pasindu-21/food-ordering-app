// server/routes/reportRoutes.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const DailySummary = require('../models/DailySummary');

router.get('/daily', auth, async (req, res) => {
  try {
    const summaries = await DailySummary.find({ owner: req.user.id }).sort({ date: -1 });
    res.json(summaries);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
