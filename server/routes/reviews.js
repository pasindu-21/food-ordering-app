const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');

const Review = require('../models/Review');
const auth = require('../middleware/auth');
const Shop = require('../models/Shop');

// Submit a new review: POST /reviews
router.post('/',
  auth,
  body('shopId').notEmpty().withMessage('Shop ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').isLength({ min: 3, max: 500 }).withMessage('Comment must be 3-500 characters long'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { shopId, rating, comment } = req.body;
    try {
      if (!mongoose.Types.ObjectId.isValid(shopId)) {
        return res.status(400).json({ message: 'Invalid Shop ID' });
      }
      const shop = await Shop.findById(shopId);
      if (!shop) {
        return res.status(404).json({ message: 'Shop not found' });
      }
      const review = new Review({ user: req.user._id, shop: shopId, rating, comment });
      await review.save();
      return res.status(201).json(review);
    } catch (err) {
      console.error('Error submitting review:', err);
      return res.status(500).json({ message: err.message });
    }
  });

// Update a review (user edits own review): PUT /reviews/:reviewId
router.put('/:reviewId',
  auth,
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').isLength({ min: 3, max: 500 }).withMessage('Comment must be 3-500 characters long'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    try {
      if (!mongoose.Types.ObjectId.isValid(reviewId)) {
        return res.status(400).json({ message: 'Invalid Review ID' });
      }
      const review = await Review.findById(reviewId);
      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }
      // Check if the authenticated user owns this review
      if (review.user.toString() !== req.user._id.toString()) {
        console.log(`Unauthorized edit attempt: User ${req.user._id} trying to edit review ${reviewId} owned by ${review.user}`);
        return res.status(403).json({ message: 'Not authorized to edit this review' });
      }
      review.rating = rating;
      review.comment = comment;
      await review.save();
      return res.json(review);
    } catch (err) {
      console.error('Error updating review:', err);
      return res.status(500).json({ message: err.message });
    }
  });

// Get reviews for a shop: GET /reviews/shop/:shopId
router.get('/shop/:shopId', async (req, res) => {
  const { shopId } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(shopId)) {
      return res.status(400).json({ message: 'Invalid Shop ID' });
    }
    const reviews = await Review.find({ shop: shopId })
      .populate('user', 'name')
      .populate('replies.owner', 'name');
    const averageRating = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;
    return res.json({ reviews, averageRating });
  } catch (err) {
    console.error('Error fetching reviews:', err);
    return res.status(500).json({ message: err.message });
  }
});

// Reply to a review: POST /reviews/:reviewId/reply
router.post('/:reviewId/reply',
  auth,
  body('comment').isLength({ min: 3 }).withMessage('Reply must be at least 3 characters'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { reviewId } = req.params;
    const { comment } = req.body;
    try {
      if (!mongoose.Types.ObjectId.isValid(reviewId)) {
        return res.status(400).json({ message: 'Invalid Review ID' });
      }
      const review = await Review.findById(reviewId);
      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }
      const shop = await Shop.findById(review.shop);
      if (!shop) {
        return res.status(404).json({ message: 'Shop not found' });
      }
      if (shop.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to reply to this review' });
      }
      review.replies.push({ owner: req.user._id, comment });
      await review.save();
      const populatedReview = await Review.findById(reviewId).populate('replies.owner', 'name');
      return res.json(populatedReview);
    } catch (err) {
      console.error('Error adding reply:', err);
      return res.status(500).json({ message: err.message });
    }
  });

// Update a reply (owner edits own reply): PUT /reviews/:reviewId/reply/:replyId
router.put('/:reviewId/reply/:replyId',
  auth,
  body('comment').isLength({ min: 3 }).withMessage('Reply must be at least 3 characters'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { reviewId, replyId } = req.params;
    const { comment } = req.body;
    try {
      if (!mongoose.Types.ObjectId.isValid(reviewId) || !mongoose.Types.ObjectId.isValid(replyId)) {
        return res.status(400).json({ message: 'Invalid ID' });
      }
      const review = await Review.findById(reviewId);
      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }
      const reply = review.replies.id(replyId);
      if (!reply) {
        return res.status(404).json({ message: 'Reply not found' });
      }
      if (reply.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to edit this reply' });
      }
      reply.comment = comment;
      await review.save();
      const populatedReview = await Review.findById(reviewId).populate('replies.owner', 'name');
      return res.json(populatedReview);
    } catch (err) {
      console.error('Error updating reply:', err);
      return res.status(500).json({ message: err.message });
    }
  });

// Delete a reply (owner deletes own reply): DELETE /reviews/:reviewId/reply/:replyId
router.delete('/:reviewId/reply/:replyId',
  auth,
  async (req, res) => {
    const { reviewId, replyId } = req.params;
    try {
      if (!mongoose.Types.ObjectId.isValid(reviewId) || !mongoose.Types.ObjectId.isValid(replyId)) {
        return res.status(400).json({ message: 'Invalid ID' });
      }
      const review = await Review.findById(reviewId);
      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }
      const reply = review.replies.id(replyId);
      if (!reply) {
        return res.status(404).json({ message: 'Reply not found' });
      }
      if (reply.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to delete this reply' });
      }
      review.replies.pull(replyId);
      await review.save();
      return res.json({ message: 'Reply deleted' });
    } catch (err) {
      console.error('Error deleting reply:', err);
      return res.status(500).json({ message: err.message });
    }
  });

// Delete a review (user deletes own review): DELETE /reviews/:reviewId
router.delete('/:reviewId',
  auth,
  async (req, res) => {
    const { reviewId } = req.params;
    try {
      if (!mongoose.Types.ObjectId.isValid(reviewId)) {
        return res.status(400).json({ message: 'Invalid Review ID' });
      }
      const review = await Review.findById(reviewId);
      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }
      // Only allow the review's user to delete
      if (review.user.toString() !== req.user._id.toString()) {
        console.log(`Unauthorized delete attempt: User ${req.user._id} trying to delete review ${reviewId} owned by ${review.user}`);
        return res.status(403).json({ message: 'Not authorized to delete this review' });
      }
      await Review.deleteOne({ _id: reviewId });
      return res.json({ message: 'Review deleted' });
    } catch (err) {
      console.error('Error deleting review:', err);
      return res.status(500).json({ message: err.message });
    }
  });

module.exports = router;
