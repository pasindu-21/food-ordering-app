import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(!!sessionStorage.getItem('token'));

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    setIsAuthenticated(!!token); // Update state on mount
  }, []); // Empty dependency - run only once

  if (!isAuthenticated) {
    // Redirect to /auth with current location state
    return <Navigate to="/auth" state={{ from: location, msg: 'Please login first!' }} replace />;
  }

  return children;
};

export default PrivateRoute;
