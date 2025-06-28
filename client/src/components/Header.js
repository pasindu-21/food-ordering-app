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
  
  // Don't show header on the initial auth page (login/register)
  if (location.pathname === '/') {
    return null;
  }

  const renderNavButtons = () => {
    if (role === 'owner') {
      // Owner Links
      return (
        <>
          <Button component={Link} to="/owner-home" color="inherit">Home</Button>
          
          {/* <<<<---- FIX: Button එකේ path එක '/my-shops' ලෙස වෙනස් කරා ---->>>> */}
          {/* දැන් මේක owner ගේ private shop list එකට යනවා */}
          <Button component={Link} to="/my-shops" color="inherit">My Shop</Button>
          
          <Button component={Link} to="/owner-orders" color="inherit">Today's Orders</Button>
          <Button component={Link} to="/daily-reports" color="inherit">Daily Reports</Button>
          <LogoutButton />
        </>
      );
    } else if (role === 'user') {
      // Logged-in User Links
      return (
        <>
          <Button component={Link} to="/user-home" color="inherit">Home</Button>
          <Button component={Link} to="/shops" color="inherit">View Shops</Button>
          <Button component={Link} to="/my-orders" color="inherit">My Orders</Button>
          <LogoutButton />
        </>
      );
    } else {
      // Guest Links (when on public pages like /shops)
      return (
        <Button component={Link} to="/" color="inherit">Login / Register</Button>
      );
    }
  };

  return (
    <AppBar position="static" color="primary" elevation={2}>
      <Toolbar>
        <Typography
          variant="h6"
          sx={{ flexGrow: 1, fontWeight: 700, cursor: 'pointer' }}
          onClick={() => {
            if (role === 'owner') navigate('/owner-home');
            else if (role === 'user') navigate('/user-home');
            else navigate('/shops'); // Guests go to the public shop list
          }}
        >
          FoodHub
        </Typography>
        <Box>{renderNavButtons()}</Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
