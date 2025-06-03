import React, { useEffect, useState } from 'react';
import axios from 'axios';

const OwnerOrders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = () => {
    const token = sessionStorage.getItem('token');
    axios.get('http://localhost:5000/api/orders/my', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setOrders(res.data));
  };

  const updateOrderStatus = (orderId, status) => {
    const token = sessionStorage.getItem('token');
    axios.put(`http://localhost:5000/api/orders/${orderId}/status`, { status }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(fetchOrders);
  };

  // ---- Location-wise item summary for accepted+completed orders only ----
  const locationItemTotals = {};
  orders
    .filter(order => order.status === 'accepted' || order.status === 'completed')
    .forEach(order => {
      const loc = order.location;
      if (!locationItemTotals[loc]) locationItemTotals[loc] = {};
      order.items.forEach(item => {
        if (!locationItemTotals[loc][item.name]) locationItemTotals[loc][item.name] = 0;
        locationItemTotals[loc][item.name] += item.qty;
      });
    });

  return (
    <div className="container mt-5">
      <h4>Order Summary by Location (Accepted + Completed Orders)</h4>
      <ul>
        {Object.entries(locationItemTotals).map(([loc, items]) => (
          <li key={loc}>
            <b>Location {loc}:</b>{" "}
            {Object.entries(items).map(([item, qty]) =>
              <span key={item} style={{ marginRight: 10 }}>{item}: {qty}</span>
            )}
          </li>
        ))}
      </ul>

      <h4 className="mt-4">Orders for My Shops</h4>
      {orders.length === 0 ? <p>No orders yet.</p> : (
        <ul>
          {orders.map(order => (
            <li key={order._id} style={{ marginBottom: '20px' }}>
              <b>{order.shop?.shopName}</b> - {order.user?.name} ({order.user?.email}) - Rs.{order.total} - <b>Status:</b> {order.status}
              <br />
              <b>Location:</b> {order.location}
              <ul>
                {order.items.map((item, idx) => (
                  <li key={idx}>{item.name} x{item.qty}</li>
                ))}
              </ul>
              {order.status === 'pending' && (
                <>
                  <button
                    className="btn btn-success btn-sm me-2"
                    onClick={() => updateOrderStatus(order._id, 'accepted')}
                  >
                    Accept
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => updateOrderStatus(order._id, 'rejected')}
                  >
                    Reject
                  </button>
                </>
              )}
              {order.status === 'accepted' && (
                <button className="btn btn-secondary btn-sm" onClick={() => updateOrderStatus(order._id, 'completed')}>Mark Completed</button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default OwnerOrders;
