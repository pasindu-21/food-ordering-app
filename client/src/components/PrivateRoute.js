// src/components/PrivateRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = sessionStorage.getItem('token');
  const location = useLocation();

  if (!token) {
    // Pass a state message to the login page
    return <Navigate to="/" replace state={{ from: location, msg: 'Please login first!' }} />;
  }
  return children;
};

export default PrivateRoute;
