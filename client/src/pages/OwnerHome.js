import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const OwnerHome = () => {
  const navigate = useNavigate();
  const [hasShop, setHasShop] = useState(false);

  useEffect(() => {
    // Check if owner already has a shop
    const token = sessionStorage.getItem('token');
    if (!token) return;
    axios.get('http://localhost:5000/api/shops/my', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setHasShop(res.data && res.data.length > 0);
    })
    .catch(() => setHasShop(false));
  }, []);

  return (
    <div className="container mt-5">
      <h2>Welcome, Shop Owner</h2>
      <button
        className="btn btn-primary me-2"
        onClick={() => navigate('/add-shop')}
        disabled={hasShop} // Disable if already has a shop
      >
        Add New Shop
      </button>
      {hasShop && (
        <span className="text-danger ms-2">
          (You can only add one shop)
        </span>
      )}
      <button className="btn btn-secondary me-2" onClick={() => navigate('/shops')}>
        View My Shops
      </button>
      <button className="btn btn-info" onClick={() => navigate('/owner-orders')}>
        View Orders
      </button>
    </div>
  );
};

export default OwnerHome;
