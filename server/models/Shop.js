// models/Shop.js
const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  breakfastQty: { type: Number, default: 0 },
  lunchQty: { type: Number, default: 0 },
  dinnerQty: { type: Number, default: 0 },
});

const shopSchema = new mongoose.Schema({
  shopName: { type: String, required: true },
  location: { type: String, default: 'N/A' },
  phone: { type: String, default: '' }, // New: Phone number field
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  menuItems: [menuItemSchema],
}, { timestamps: true });

module.exports = mongoose.model('Shop', shopSchema);
