// UserHome.js

import React from 'react';
import { useNavigate } from 'react-router-dom';

const UserHome = () => {
  const navigate = useNavigate();

  return (
    <div className="container mt-5">
      <h2>Welcome, Normal User</h2>
      <p>Here you can browse food shops and order meals.</p>
      <button className="btn btn-primary" onClick={() => navigate('/shops')}>
        View Shops
      </button>
    </div>
  );
};

export default UserHome;
