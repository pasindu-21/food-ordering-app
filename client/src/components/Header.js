// src/components/Header.js

import React from 'react';
import { AppBar, Toolbar, Typography, Box, Button } from '@mui/material';
import LogoutButton from './LogoutButton';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  let role = null;
  try {
    role = JSON.parse(sessionStorage.getItem('user'))?.role;
  } catch {
    role = null;
  }
  
  if (location.pathname === '/') {
    return null;
  }

  const renderNavButtons = () => {
    // <<<<---- Admin Links ---->>>>
    if (role === 'admin') {
      return (
        <>
          <Button component={Link} to="/admin-dashboard" color="inherit">Admin Panel</Button>
          <LogoutButton />
        </>
      );
    } 
    // Owner Links
    else if (role === 'owner') {
      return (
        <>
          <Button component={Link} to="/owner-home" color="inherit">Home</Button>
          <Button component={Link} to="/my-shops" color="inherit">My Shop</Button>
          <Button component={Link} to="/owner-orders" color="inherit">Today's Orders</Button>
          <Button component={Link} to="/daily-reports" color="inherit">Daily Reports</Button>
          <LogoutButton />
        </>
      );
    } 
    // Logged-in User Links
    else if (role === 'user') {
      return (
        <>
          <Button component={Link} to="/user-home" color="inherit">Home</Button>
          <Button component={Link} to="/shops" color="inherit">View Shops</Button>
          <Button component={Link} to="/my-orders" color="inherit">My Orders</Button>
          <LogoutButton />
        </>
      );
    } 
    // Guest Links
    else {
      return (
        <Button component={Link} to="/" color="inherit">Login / Register</Button>
      );
    }
  };

  const handleLogoClick = () => {
    if (role === 'admin') navigate('/admin-dashboard');
    else if (role === 'owner') navigate('/owner-home');
    else if (role === 'user') navigate('/user-home');
    else navigate('/shops');
  };

  return (
    <AppBar position="static" color="primary" elevation={2}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700, cursor: 'pointer' }} onClick={handleLogoClick}>
          FoodHub
        </Typography>
        <Box>{renderNavButtons()}</Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
