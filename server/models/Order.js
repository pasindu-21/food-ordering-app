// server/models/Order.js

const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  name: String,
  price: Number,
  qty: Number,
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  items: [orderItemSchema],
  total: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled', 'expired'],
    default: 'pending'
  },
  location: { type: String, required: true },
  timeSlot: { type: String, enum: ['Breakfast', 'Lunch', 'Dinner'], required: true }, // Slot name
  slotTime: { type: String, required: true }, // New field for display time (e.g., '8.00 A.M')
  isArchived: {
    type: Boolean,
    default: false
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  // Automatically add `createdAt` and `updatedAt` fields
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
