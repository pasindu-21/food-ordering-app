// server/models/DailySummary.js

const mongoose = require('mongoose');

const DailySummarySchema = new mongoose.Schema({
  date: { type: Date, required: true },
  totalSales: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  itemSummary: { type: Map, of: Number },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

// එක owner කෙනෙක්ට, එක දවසකට, එක summary එකයි තියෙන්න පුළුවන් කියලා ensure කරනවා
DailySummarySchema.index({ date: 1, owner: 1 }, { unique: true });

module.exports = mongoose.model('DailySummary', DailySummarySchema);
