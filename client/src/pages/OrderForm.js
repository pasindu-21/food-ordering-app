import React, { useState } from 'react';
import axios from 'axios';

const LOCATIONS = ['A', 'B', 'C', 'D'];

const OrderForm = ({ shop, onOrderPlaced }) => {
  const [items, setItems] = useState(shop.menuItems.map(item => ({ ...item, qty: 0 })));
  const [location, setLocation] = useState('A');
  const [loading, setLoading] = useState(false);

  const handleQtyChange = (index, value) => {
    const updated = [...items];
    updated[index].qty = Number(value);
    setItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const orderItems = items.filter(item => item.qty > 0).map(item => ({
      name: item.name,
      price: item.price,
      qty: item.qty
    }));
    if (orderItems.length === 0) {
      alert('Please select at least one item.');
      return;
    }
    setLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      await axios.post('http://localhost:5000/api/orders', {
        shopId: shop._id,
        items: orderItems,
        location // <-- send location
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Order placed!');
      if (onOrderPlaced) onOrderPlaced();
    } catch (err) {
      alert('Order failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h5>Order from {shop.shopName}</h5>
      <div className="mb-2">
        <label>Location: </label>
        <select value={location} onChange={e => setLocation(e.target.value)}>
          {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
        </select>
      </div>
      {items.map((item, idx) => (
        <div key={item.name} className="mb-2">
          <span>{item.name} (Rs.{item.price})</span>
          <input
            type="number"
            min="0"
            value={item.qty}
            onChange={e => handleQtyChange(idx, e.target.value)}
            style={{ width: '60px', marginLeft: '10px' }}
          />
        </div>
      ))}
      <button type="submit" className="btn btn-success mt-2" disabled={loading}>
        {loading ? 'Placing...' : 'Place Order'}
      </button>
    </form>
  );
};

export default OrderForm;
