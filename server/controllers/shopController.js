const Shop = require('../models/Shop');

// Get all shops (only for normal users)
exports.getAllShops = async (req, res) => {
  try {
    if (req.user.role !== 'user') {
      return res.status(403).json({ msg: 'Only users can access all shops.' });
    }

    const shops = await Shop.find().populate('owner', 'name email');
    res.json(shops);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error.' });
  }
};

// Get shops for the logged-in owner
exports.getMyShops = async (req, res) => {
  try {
    if (req.user.role !== 'owner') {
      return res.status(403).json({ msg: 'Only shop owners can view their shops.' });
    }

    const shops = await Shop.find({ owner: req.user._id }).populate('owner', 'name email');
    res.json(shops);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error.' });
  }
};

// Add a new shop (only for owners)
exports.addShop = async (req, res) => {
  try {
    if (req.user.role !== 'owner') {
      return res.status(403).json({ msg: 'Only owners can add shops.' });
    }

    const newShop = new Shop({
      shopName: req.body.shopName,
      location: req.body.location,
      owner: req.user._id,
    });

    await newShop.save();
    res.status(201).json(newShop);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error.' });
  }
};

// Update a shop (only for the owner of the shop)
exports.updateShop = async (req, res) => {
  try {
    if (req.user.role !== 'owner') {
      return res.status(403).json({ msg: 'Only owners can update shops.' });
    }

    const shop = await Shop.findById(req.params.id);
    if (!shop) return res.status(404).json({ msg: 'Shop not found.' });

    if (!shop.owner.equals(req.user._id)) {
      return res.status(403).json({ msg: 'You are not authorized to update this shop.' });
    }

    shop.shopName = req.body.shopName || shop.shopName;
    shop.location = req.body.location || shop.location;

    await shop.save();
    res.json(shop);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error.' });
  }
};

// Delete a shop (only for the owner of the shop)
exports.deleteShop = async (req, res) => {
  try {
    if (req.user.role !== 'owner') {
      return res.status(403).json({ msg: 'Only owners can delete shops.' });
    }

    const shop = await Shop.findById(req.params.id);
    if (!shop) return res.status(404).json({ msg: 'Shop not found.' });

    if (!shop.owner.equals(req.user._id)) {
      return res.status(403).json({ msg: 'You are not authorized to delete this shop.' });
    }

    await shop.deleteOne();
    res.json({ msg: 'Shop deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error.' });
  }
};
