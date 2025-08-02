// server/models/Review.js (updated with improvements)

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, maxlength: 500 }, // New: Max length for comment
  replies: [{ // New: Array of replies
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Shop owner
    comment: { type: String, required: true, maxlength: 500 }, // New: Max length for reply
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true }); // New: Enable automatic createdAt/updatedAt for the review

module.exports = mongoose.model('Review', reviewSchema);
