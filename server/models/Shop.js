// models/Shop.js
const mongoose = require('mongoose');

// server/models/Shop.js - Update menu item schema
const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  
  // Total quantities set by owner
  breakfastQty: { type: Number, default: 0, min: 0 },
  lunchQty: { type: Number, default: 0, min: 0 },
  dinnerQty: { type: Number, default: 0, min: 0 },
  
  // Available quantities (auto-set to total quantities when created)
  availableBreakfastQty: { type: Number, default: 0, min: 0 },
  availableLunchQty: { type: Number, default: 0, min: 0 },
  availableDinnerQty: { type: Number, default: 0, min: 0 },
  
  isAvailable: { type: Boolean, default: true }
});

// Pre-save middleware to auto-set available quantities for new items
menuItemSchema.pre('save', function() {
  // If this is a new item being added
  if (this.isNew) {
    this.availableBreakfastQty = this.breakfastQty || 0;
    this.availableLunchQty = this.lunchQty || 0;
    this.availableDinnerQty = this.dinnerQty || 0;
  }
  
  // Update availability status
  this.isAvailable = (this.availableBreakfastQty > 0 || this.availableLunchQty > 0 || this.availableDinnerQty > 0);
});

const shopSchema = new mongoose.Schema({
  shopName: { type: String, required: true },
  location: { type: String, default: 'N/A' },
  phone: { type: String, default: '' }, // New: Phone number field
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  menuItems: [menuItemSchema],
}, { timestamps: true });

module.exports = mongoose.model('Shop', shopSchema);
