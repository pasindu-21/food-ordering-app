import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = !!sessionStorage.getItem('token'); // Direct check every time

  console.log('PrivateRoute check - isAuthenticated:', isAuthenticated); // Debug

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location, msg: 'Please login first!' }} replace />;
  }

  return children;
};

export default PrivateRoute;
