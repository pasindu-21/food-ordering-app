const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const Shop = require('../models/Shop');

// 1. User: Place order (with location, item status)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'user') return res.status(403).json({ msg: 'Only users can place orders.' });
    const { shopId, items, location } = req.body;
    if (!shopId || !items || !Array.isArray(items) || items.length === 0 || !location) {
      return res.status(400).json({ msg: 'Invalid order data.' });
    }
    const shop = await Shop.findById(shopId);
    if (!shop) return res.status(404).json({ msg: 'Shop not found.' });

    // Add status: "pending" to each item
    const itemsWithStatus = items.map(item => ({
      ...item,
      status: 'pending'
    }));

    // Calculate total
    let total = 0;
    items.forEach(item => { total += item.price * item.qty; });

    const order = await Order.create({
      user: req.user._id,
      shop: shopId,
      items: itemsWithStatus,
      total,
      location
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
    const orders = await Order.find({ user: req.user._id }).populate('shop', 'shopName');
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error.' });
  }
});

// 3. Owner: Get orders for their shop(s)
router.get('/my', auth, async (req, res) => {
  try {
    if (req.user.role !== 'owner') return res.status(403).json({ msg: 'Only owners can view orders.' });
    const shops = await Shop.find({ owner: req.user._id });
    const shopIds = shops.map(s => s._id);
    const orders = await Order.find({ shop: { $in: shopIds } })
      .populate('user', 'name email')
      .populate('shop', 'shopName');
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error.' });
  }
});

// 4. Owner: Update status of a single item in an order (egg restriction)
router.put('/:orderId/item/:itemIndex/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'owner')
      return res.status(403).json({ msg: 'Only owners can update orders.' });
    const { status } = req.body;
    const { orderId, itemIndex } = req.params;
    const order = await Order.findById(orderId).populate('shop');
    if (!order) return res.status(404).json({ msg: 'Order not found.' });
    if (!order.shop.owner.equals(req.user._id))
      return res.status(403).json({ msg: 'Not your shop.' });

    const item = order.items[itemIndex];
    if (!item) return res.status(404).json({ msg: 'Order item not found.' });

    // Egg accept restriction
    if (item.name.toLowerCase() === "egg" && status === 'accepted') {
      // Check if already accepted for this location
      const alreadyAccepted = await Order.findOne({
        _id: { $ne: order._id },
        shop: order.shop._id,
        location: order.location,
        "items": { $elemMatch: { name: { $regex: /^egg$/i }, status: 'accepted' } }
      });
      if (alreadyAccepted) {
        return res.status(400).json({ msg: 'Already accepted an egg order for this location.' });
      }
    }

    item.status = status;
    await order.save();
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error.' });
  }
});

// 4b. Owner: Update order status (accept/reject/complete) - FIXED
router.put('/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'owner') return res.status(403).json({ msg: 'Only owners can update orders.' });
    const { status } = req.body;
    const order = await Order.findById(req.params.id).populate('shop');
    if (!order) return res.status(404).json({ msg: 'Order not found.' });
    if (!order.shop.owner.equals(req.user._id)) return res.status(403).json({ msg: 'Not your shop.' });
    order.status = status; // "accepted", "rejected", "completed"
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ msg: 'Server error.' });
  }
});

// 5. User: Edit their own order (only if pending)
router.put('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ msg: 'Order not found.' });
    if (!order.user.equals(req.user._id)) return res.status(403).json({ msg: 'Not your order.' });
    if (order.status !== 'pending') return res.status(400).json({ msg: 'Cannot edit order after it is processed.' });

    // Update allowed fields (e.g., items)
    order.items = req.body.items || order.items;
    // Recalculate total
    order.total = order.items.reduce((sum, item) => sum + item.price * item.qty, 0);
    await order.save();
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error.' });
  }
});

// 6. User: Cancel their own order (only if pending)
router.patch('/:id/cancel', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ msg: 'Order not found.' });
    if (!order.user.equals(req.user._id)) return res.status(403).json({ msg: 'Not your order.' });
    if (order.status !== 'pending') return res.status(400).json({ msg: 'Cannot cancel order after it is processed.' });

    order.status = 'cancelled';
    await order.save();
    res.json({ msg: 'Order cancelled.', order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error.' });
  }
});
// 7. DELETE Order (User or Admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ msg: 'Order not found' });

    // Authorization check
    if (req.user.role !== 'admin' && !order.user.equals(req.user._id)) {
      return res.status(403).json({ msg: 'Not authorized to delete this order' });
    }

    await order.deleteOne();
    res.json({ msg: 'Order deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});
module.exports = router;
