import React, { useContext, useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  Button, 
  IconButton, 
  Tooltip,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import { useColorMode } from '../context/ColorModeContext';
import { UserContext } from '../context/UserContext';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, toggleColorMode } = useColorMode();
  const { user, logout } = useContext(UserContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthPage = location.pathname === '/auth';

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const getNavigationItems = () => {
    if (isAuthPage) return [];

    if (user?.role === 'admin') {
      return [
        { text: 'Admin Panel', path: '/admin-dashboard' },
        { text: 'Logout', action: handleLogout, isLogout: true }
      ];
    } else if (user?.role === 'owner') {
      return [
        { text: 'Home', path: '/owner-home' },
        { text: 'My Shop', path: '/my-shops' },
        { text: "Today's Orders", path: '/owner-orders' },
        { text: 'Daily Reports', path: '/daily-reports' },
        { text: 'Logout', action: handleLogout, isLogout: true }
      ];
    } else if (user?.role === 'user') {
      return [
        { text: 'Home', path: '/user-home' },
        { text: 'View Shops', path: '/shops' },
        { text: 'My Orders', path: '/my-orders' },
        { text: 'Logout', action: handleLogout, isLogout: true }
      ];
    } else {
      return [
        { text: 'Login', path: '/auth' },
        { text: 'Register', path: '/auth' }
      ];
    }
  };

  const navigationItems = getNavigationItems();

  const renderDesktopButtons = () => {
    if (isAuthPage || isMobile) return null;

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {navigationItems.map((item, index) => (
          item.isLogout ? (
            <Button
              key={index}
              variant="contained"
              color="error"
              onClick={item.action}
              sx={{ minWidth: 'auto' }}
            >
              {item.text}
            </Button>
          ) : (
            <Button
              key={index}
              component={Link}
              to={item.path}
              color="inherit"
              sx={{ whiteSpace: 'nowrap' }}
            >
              {item.text}
            </Button>
          )
        ))}
      </Box>
    );
  };

  const renderMobileDrawer = () => (
    <Drawer
      anchor="right"
      open={mobileMenuOpen}
      onClose={handleMobileMenuClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 250,
          bgcolor: theme.palette.mode === 'dark' ? '#333' : '#fff',
        },
      }}
    >
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Menu
        </Typography>
        <IconButton onClick={handleMobileMenuClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      
      <List>
        {navigationItems.map((item, index) => (
          <ListItem 
            key={index} 
            button 
            onClick={() => {
              if (item.isLogout) {
                item.action();
              } else {
                navigate(item.path);
                handleMobileMenuClose();
              }
            }}
            sx={{
              bgcolor: item.isLogout ? 'error.main' : 'transparent',
              color: item.isLogout ? 'white' : 'inherit',
              mb: item.isLogout ? 1 : 0,
              mx: item.isLogout ? 1 : 0,
              borderRadius: item.isLogout ? 1 : 0,
              '&:hover': {
                bgcolor: item.isLogout ? 'error.dark' : 'action.hover',
              }
            }}
          >
            <ListItemText 
              primary={item.text} 
              sx={{ 
                textAlign: item.isLogout ? 'center' : 'left',
                fontWeight: item.isLogout ? 600 : 400 
              }} 
            />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );

  const handleLogoClick = () => {
    if (user?.role === 'admin') navigate('/admin-dashboard');
    else if (user?.role === 'owner') navigate('/owner-home');
    else if (user?.role === 'user') navigate('/user-home');
    else navigate('/');
  };

  return (
    <>
      <AppBar position="static" color="primary" elevation={2}>
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
          {/* 🎯 Logo + Text Combination */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer', 
              flexGrow: 1,
              gap: { xs: 1, sm: 1.5 }
            }}
            onClick={handleLogoClick}
          >
            {/* Logo Image */}
            <img 
              src="/logo.jpg" 
              alt="Uni Food Logo"
              style={{
                height: isMobile ? '32px' : '40px', // Responsive height
                width: 'auto',
                borderRadius: '8px', // Rounded corners
                objectFit: 'contain'
              }}
            />
            
            {/* Company Name */}
            <Typography
              variant="h6"
              sx={{ 
                fontWeight: 700,
                fontSize: { xs: '1.1rem', sm: '1.25rem' },
                color: 'inherit'
              }}
            >
              Uni Food
            </Typography>
          </Box>
          
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {renderDesktopButtons()}
            
            {isMobile && !isAuthPage && navigationItems.length > 0 && (
              <IconButton 
                color="inherit" 
                onClick={handleMobileMenuToggle}
                sx={{ ml: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            
            <Tooltip title={mode === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}>
              <IconButton color="inherit" onClick={toggleColorMode}>
                <NightsStayIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>
      
      {isMobile && renderMobileDrawer()}
    </>
  );
};

export default Header;
