// server/routes/orderRoutes.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const Shop = require('../models/Shop');

// 1. User: Place order
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'user') return res.status(403).json({ msg: 'Only users can place orders.' });

    const { shopId, items, location } = req.body;
    if (!shopId || !items || !Array.isArray(items) || items.length === 0 || !location) {
      return res.status(400).json({ msg: 'Invalid order data.' });
    }

    const shop = await Shop.findById(shopId);
    if (!shop) return res.status(404).json({ msg: 'Shop not found.' });

    const itemsWithStatus = items.map(item => ({ ...item, status: 'pending' }));
    const total = items.reduce((sum, item) => sum + (item.price * item.qty), 0);

    const order = await Order.create({
      user: req.user._id,
      shop: shopId,
      items: itemsWithStatus,
      total,
      location,
      owner: shop.owner // Saving owner ID directly to the order
    });

    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error.' });
  }
});

// 2. User: Get my orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    if (req.user.role !== 'user') return res.status(403).json({ msg: 'Only users can view their orders.' });
    const orders = await Order.find({ user: req.user._id }).populate('shop', 'shopName').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error.' });
  }
});

// 3. Owner: Get orders for their shop(s) (TODAY's ACTIVE ORDERS ONLY)
router.get('/my', auth, async (req, res) => {
  try {
    if (req.user.role !== 'owner') return res.status(403).json({ msg: 'Only owners can view orders.' });
    
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));

    const orders = await Order.find({
      owner: req.user._id, // Filter by owner directly
      isArchived: false,
      createdAt: { $gte: startOfToday }
    })
    .populate('user', 'name email')
    .populate('shop', 'shopName')
    .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error.' });
  }
});

// 4. Owner: Update status of a single item in an order
router.put('/:orderId/item/:itemIndex/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'owner') return res.status(403).json({ msg: 'Only owners can update orders.' });
    
    const { status } = req.body;
    const { orderId, itemIndex } = req.params;

    const order = await Order.findById(orderId).populate('shop');
    if (!order) return res.status(404).json({ msg: 'Order not found.' });
    if (order.owner.toString() !== req.user._id.toString()) return res.status(403).json({ msg: 'Not your shop.' });

    const item = order.items[itemIndex];
    if (!item) return res.status(404).json({ msg: 'Order item not found.' });
    
    item.status = status;
    await order.save();
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error.' });
  }
});

// 4b. Owner: Update overall order status
router.put('/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'owner') return res.status(403).json({ msg: 'Only owners can update orders.' });
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ msg: 'Order not found.' });
    if (order.owner.toString() !== req.user._id.toString()) return res.status(403).json({ msg: 'Not your shop.' });

    order.status = status;
    await order.save();
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error.' });
  }
});

// ... (your other routes like cancel, edit, delete remain the same) ...

module.exports = router;
