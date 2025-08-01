import React, { useContext } from 'react';
import { AppBar, Toolbar, Typography, Box, Button, IconButton, Tooltip } from '@mui/material';
import LogoutButton from './LogoutButton';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useColorMode } from '../context/ColorModeContext';
import { UserContext } from '../context/UserContext'; // New import

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, toggleColorMode } = useColorMode();
  const { user } = useContext(UserContext); // Use global user state

  // Auth page එකේ nav buttons hide කරන්න, ඒත් logo සහ dark mode keep කරන්න
  const isAuthPage = location.pathname === '/auth';

  const renderNavButtons = () => {
    if (isAuthPage) return null; // Auth page එකේ nav buttons hide කරන්න

    if (user?.role === 'admin') {
      return (
        <>
          <Button component={Link} to="/admin-dashboard" color="inherit">Admin Panel</Button>
          <LogoutButton />
        </>
      );
    } else if (user?.role === 'owner') {
      return (
        <>
          <Button component={Link} to="/owner-home" color="inherit">Home</Button>
          <Button component={Link} to="/my-shops" color="inherit">My Shop</Button>
          <Button component={Link} to="/owner-orders" color="inherit">Today's Orders</Button>
          <Button component={Link} to="/daily-reports" color="inherit">Daily Reports</Button>
          <LogoutButton />
        </>
      );
    } else if (user?.role === 'user') {
      return (
        <>
          <Button component={Link} to="/user-home" color="inherit">Home</Button>
          <Button component={Link} to="/shops" color="inherit">View Shops</Button>
          <Button component={Link} to="/my-orders" color="inherit">My Orders</Button>
          <LogoutButton />
        </>
      );
    } else {
      // Non-logged-in: Separate Login සහ Register buttons, "/auth" එකට link
      return (
        <>
          <Button component={Link} to="/auth" color="inherit">Login</Button>
          <Button component={Link} to="/auth" color="inherit">Register</Button>
        </>
      );
    }
  };

  const handleLogoClick = () => {
    if (user?.role === 'admin') navigate('/admin-dashboard');
    else if (user?.role === 'owner') navigate('/owner-home');
    else if (user?.role === 'user') navigate('/user-home');
    else navigate('/'); // Non-logged-in ට shops page එකට (default "/")
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
          {/* Dark mode button එක always visible, හැම page එකකම තියෙන්න */}
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
