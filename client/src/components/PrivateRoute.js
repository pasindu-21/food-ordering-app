// src/components/PrivateRoute.js

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = sessionStorage.getItem('token');
  const location = useLocation();

  if (!token) {
    // Login වෙලා නැත්නම්, default login page එකට redirect කරනවා
    return <Navigate to="/" replace state={{ from: location, msg: 'Please login first!' }} />;
  }
  return children;
};

export default PrivateRoute;
