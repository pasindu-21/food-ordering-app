// OwnerHome.js

import React from 'react';
import { useNavigate } from 'react-router-dom';

const OwnerHome = () => {
  const navigate = useNavigate();

  return (
    <div className="container mt-5">
      <h2>Welcome, Shop Owner</h2>
      <button className="btn btn-primary me-2" onClick={() => navigate('/add-shop')}>
        Add New Shop
      </button>
      <button className="btn btn-secondary" onClick={() => navigate('/shops')}>
        View My Shops
      </button>
    </div>
  );
};

export default OwnerHome;
