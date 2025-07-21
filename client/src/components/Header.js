import React from 'react';
import { AppBar, Toolbar, Typography, Box, Button, IconButton, Tooltip } from '@mui/material';
import LogoutButton from './LogoutButton';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useColorMode } from '../context/ColorModeContext';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, toggleColorMode } = useColorMode();

  let role = null;
  try {
    role = JSON.parse(sessionStorage.getItem('user'))?.role;
  } catch {
    role = null;
  }
  if (location.pathname === '/') return null;

  const renderNavButtons = () => {
    if (role === 'admin') {
      return (
        <>
          <Button component={Link} to="/admin-dashboard" color="inherit">Admin Panel</Button>
          <LogoutButton />
        </>
      );
    } else if (role === 'owner') {
      return (
        <>
          <Button component={Link} to="/owner-home" color="inherit">Home</Button>
          <Button component={Link} to="/my-shops" color="inherit">My Shop</Button>
          <Button component={Link} to="/owner-orders" color="inherit">Today's Orders</Button>
          <Button component={Link} to="/daily-reports" color="inherit">Daily Reports</Button>
          <LogoutButton />
        </>
      );
    } else if (role === 'user') {
      return (
        <>
          <Button component={Link} to="/user-home" color="inherit">Home</Button>
          <Button component={Link} to="/shops" color="inherit">View Shops</Button>
          <Button component={Link} to="/my-orders" color="inherit">My Orders</Button>
          <LogoutButton />
        </>
      );
    } else {
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
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, cursor: 'pointer', flexGrow: 1 }}
          onClick={handleLogoClick}
        >
          FoodHub
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {renderNavButtons()}
          <Tooltip title={mode === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}>
            <IconButton color="inherit" onClick={toggleColorMode}>
              {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
