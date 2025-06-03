import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [editOrderId, setEditOrderId] = useState(null);
  const [editItems, setEditItems] = useState([]);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = () => {
    const token = sessionStorage.getItem('token');
    axios.get('http://localhost:5000/api/orders/my-orders', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setOrders(res.data));
  };

  const cancelOrder = async (orderId) => {
    const token = sessionStorage.getItem('token');
    try {
      await axios.patch(`http://localhost:5000/api/orders/${orderId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.msg || "Cancel failed");
    }
  };

  const startEdit = (order) => {
    setEditOrderId(order._id);
    setEditItems(order.items.map(item => ({ ...item })));
  };

  const handleQtyChange = (idx, value) => {
    const updated = [...editItems];
    updated[idx].qty = Number(value);
    setEditItems(updated);
  };

  const saveEdit = async () => {
    const token = sessionStorage.getItem('token');
    try {
      await axios.put(`http://localhost:5000/api/orders/${editOrderId}`, {
        items: editItems
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditOrderId(null);
      setEditItems([]);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.msg || "Edit failed");
    }
  };

  const cancelEdit = () => {
    setEditOrderId(null);
    setEditItems([]);
  };

  const getStatusColor = (status) => {
    if (status === 'accepted') return 'green';
    if (status === 'completed') return 'blue';
    if (status === 'rejected' || status === 'cancelled') return 'red';
    return 'gray';
  };

  return (
    <div className="container mt-5">
      <h4>My Orders</h4>
      {orders.length === 0 ? <p>No orders yet.</p> : (
        <ul>
          {orders.map(order => (
            <li key={order._id} style={{ marginBottom: '20px' }}>
              <b>{order.shop?.shopName}</b> - Rs.{order.total} - 
              <span style={{
                color: getStatusColor(order.status),
                fontWeight: 'bold',
                marginLeft: '8px'
              }}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
              <br />
              <b>Location:</b> {order.location}
              {editOrderId === order._id ? (
                <div>
                  {editItems.map((item, idx) => (
                    <div key={idx}>
                      {item.name} (Rs.{item.price}) x
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={e => handleQtyChange(idx, e.target.value)}
                        style={{ width: '60px', marginLeft: '10px' }}
                      />
                    </div>
                  ))}
                  <button className="btn btn-success btn-sm me-2" onClick={saveEdit}>Save</button>
                  <button className="btn btn-secondary btn-sm" onClick={cancelEdit}>Cancel</button>
                </div>
              ) : (
                <div>
                  <ul>
                    {order.items.map((item, idx) => (
                      <li key={idx}>
                        {item.name} x{item.qty}
                      </li>
                    ))}
                  </ul>
                  {/* Only show Edit/Cancel if order is pending */}
                  {order.status === 'pending' && (
                    <>
                      <button className="btn btn-primary btn-sm me-2" onClick={() => startEdit(order)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => cancelOrder(order._id)}>Cancel</button>
                    </>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserOrders;
