const Order = require('../models/Order');
const Shop = require('../models/Shop');

// 1. User: Place order
exports.createOrder = async (req, res) => {
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
      owner: shop.owner
    });

    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error.' });
  }
};

// 2. User: Get my orders
exports.getMyOrders = async (req, res) => {
  try {
    if (req.user.role !== 'user') return res.status(403).json({ msg: 'Only users can view their orders.' });
    const orders = await Order.find({ user: req.user._id }).populate('shop', 'shopName').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error.' });
  }
};

// 3. Owner: Get shop orders
exports.getOwnerOrders = async (req, res) => {
  try {
    if (req.user.role !== 'owner') return res.status(403).json({ msg: 'Only owners can view orders.' });

    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));

    const orders = await Order.find({
      owner: req.user._id,
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
};

// 4. Owner: Update order status
exports.updateOrderStatus = async (req, res) => {
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
};

// 5. User: Delete old order
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ msg: 'Order not found' });

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ msg: 'User not authorized to delete this order' });
    }
    if ((new Date() - new Date(order.createdAt)) < 24 * 60 * 60 * 1000) {
      return res.status(400).json({ msg: 'Recent orders cannot be deleted.' });
    }

    await order.deleteOne();
    res.json({ msg: 'Order removed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// 6. User: Cancel pending order
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ msg: 'Order not found' });

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ msg: 'Unauthorized' });
    }
    if (order.status !== 'pending') {
      return res.status(400).json({ msg: 'Cannot cancel this order now' });
    }

    order.status = 'cancelled';
    await order.save();
    res.json({ msg: 'Order cancelled', order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error.' });
  }
};
