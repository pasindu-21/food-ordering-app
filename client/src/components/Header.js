import React from 'react';
import { AppBar, Toolbar, Typography, Box, Button } from '@mui/material';
import LogoutButton from './LogoutButton';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  let user = null, role = null;
  try {
    user = JSON.parse(sessionStorage.getItem('user'));
    role = user?.role;
  } catch {
    role = null;
  }

  // Only show logout button if logged in (token exists)
  const token = sessionStorage.getItem('token');
  // Hide Logout button on AuthForm (login/register) page
  const isAuthPage = location.pathname === '/';

  let navButtons = [];
  if (role === 'owner') {
    navButtons = [
      { label: 'View My Shop', path: '/shops', active: location.pathname === '/shops' },
      { label: 'View Orders', path: '/owner-orders', active: location.pathname === '/owner-orders' }
    ];
  } else if (role === 'user') {
    navButtons = [
      { label: 'View Shops', path: '/shops', active: location.pathname === '/shops' },
      { label: 'View My Orders', path: '/my-orders', active: location.pathname === '/my-orders' }
    ];
  }

  return (
    <AppBar position="static" color="primary" elevation={2}>
      <Toolbar>
        <Typography
          variant="h6"
          sx={{ flexGrow: 1, fontWeight: 700, cursor: 'pointer' }}
          onClick={() => {
            if (role === 'owner') navigate('/owner-home');
            else if (role === 'user') navigate('/user-home');
            else navigate('/');
          }}
        >
          FoodHub
        </Typography>
        <Box>
          {navButtons.map(btn => (
            <Button
              key={btn.label}
              color="inherit"
              onClick={() => navigate(btn.path)}
              sx={{
                fontWeight: btn.active ? 700 : 400,
                borderBottom: btn.active ? '2px solid #fff' : 'none',
                borderRadius: 0,
                mx: 1
              }}
            >
              {btn.label}
            </Button>
          ))}
          {/* Show Logout only if logged in and not on AuthForm */}
          {token && !isAuthPage && <LogoutButton />}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
