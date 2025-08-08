import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Box, Button, Typography, Alert, Stack, Card, CardContent, Fade,
  useMediaQuery, Backdrop, CircularProgress, Tooltip, Avatar, Container
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ListAltIcon from '@mui/icons-material/ListAlt';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const gradientBgLight = `linear-gradient(135deg, #e3f2fd 0%, #fce4ec 100%)`;
const gradientBgDark = `linear-gradient(135deg, #1a237e 0%, #263238 100%)`;

const OwnerHome = () => {
  const navigate = useNavigate();
  const [hasShop, setHasShop] = useState(false);
  const [loading, setLoading] = useState(true);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const isDark = theme.palette.mode === 'dark';

  // Pull user info from session
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) { 
      setLoading(false); 
      return; 
    }
    
    axios
      .get('http://localhost:5000/api/shops/my', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        setHasShop(res.data && res.data.length > 0);
        setLoading(false);
      })
      .catch(() => {
        setHasShop(false);
        setLoading(false);
      });
  }, []);

  // Generate avatar letter
  const getAvatarLetter = (name) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  return (
    <>
      {/* Enhanced Gradient Background */}
      <Box
        sx={{
          minHeight: '100vh',
          width: '100vw',
          position: 'fixed',
          zIndex: -1,
          left: 0,
          top: 0,
          background: isDark ? gradientBgDark : gradientBgLight,
          transition: 'background 0.3s ease-in-out'
        }}
      />

      

      {/* Enhanced Loading Backdrop */}
      <Backdrop 
        open={loading} 
        sx={{ 
          zIndex: 1200, 
          color: '#FFF',
          backdropFilter: 'blur(4px)'
        }}
      >
        <Stack alignItems="center" spacing={2}>
          <CircularProgress color="inherit" size={isMobile ? 40 : 60} />
          <Typography 
            variant="h6" 
            color="inherit"
            sx={{ fontSize: isMobile ? '1rem' : '1.25rem' }}
          >
            Loading Dashboard...
          </Typography>
        </Stack>
      </Backdrop>

      {/* Main Content Container */}
      <Container maxWidth="sm" sx={{ px: isMobile ? 1 : 2 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
          py={isMobile ? 2 : 4}
        >
          <Fade in={!loading} timeout={600}>
            <Card
              elevation={isDark ? 8 : 12}
              sx={{
                width: '100%',
                maxWidth: isMobile ? '100%' : 480,
                bgcolor: isDark ? 'background.paper' : '#fff',
                borderRadius: isMobile ? 3 : 6,
                px: isMobile ? 2 : 4,
                py: isMobile ? 3 : 4,
                boxShadow: isDark
                  ? '0 8px 40px 8px rgba(18, 18, 18, 0.6)'
                  : '0 8px 40px 8px rgba(64, 145, 220, 0.18)',
                transition: 'all 0.3s ease-in-out',
                position: 'relative',
                border: isDark ? `1px solid ${theme.palette.divider}` : 'none'
              }}
            >
              <CardContent sx={{ p: 0 }}>
                {/* Enhanced Header Section */}
                <Stack alignItems="center" spacing={isMobile ? 1 : 1.5} mb={isMobile ? 2 : 3}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: isMobile ? 1 : 1.5,
                      mb: 1
                    }}
                  >
                    <StorefrontIcon 
                      sx={{ 
                        fontSize: isMobile ? '2rem' : '2.5rem',
                        color: 'primary.main'
                      }} 
                    />
                    <Typography
                      variant={isMobile ? 'h5' : 'h4'}
                      fontFamily="'Poppins', sans-serif"
                      textAlign="center"
                      fontWeight={700}
                      color="primary.main"
                      sx={{
                        fontSize: isMobile ? '1.5rem' : '2rem',
                        lineHeight: 1.2
                      }}
                    >
                      Vendor Dashboard
                    </Typography>
                  </Box>

                  <Typography
                    variant={isMobile ? "body1" : "h6"}
                    color="text.secondary"
                    textAlign="center"
                    sx={{
                      fontSize: isMobile ? '0.95rem' : '1.1rem',
                      lineHeight: 1.4,
                      px: isMobile ? 1 : 0
                    }}
                  >
                    {user?.name && (
                      <span style={{ fontWeight: 600, color: theme.palette.primary.main }}>
                        Welcome, {user.name}!{' '}
                      </span>
                    )}
                    {hasShop
                      ? "Quick access to manage your shop."
                      : "Get started by creating your shop."}
                  </Typography>
                </Stack>

                {/* Enhanced Action Buttons Section */}
                <Fade in timeout={800}>
                  <Stack 
                    spacing={isMobile ? 2 : 2.5} 
                    alignItems="center" 
                    mt={isMobile ? 2 : 3}
                  >
                    {/* Success Alert for Existing Shop */}
                    {hasShop && (
                      <Alert
                        severity="success"
                        sx={{
                          width: '100%',
                          fontWeight: 'bold',
                          fontSize: isMobile ? '0.85rem' : '0.95rem',
                          bgcolor: isDark
                            ? 'rgba(56,142,60,0.15)'
                            : 'rgba(232,245,233,0.8)',
                          borderLeft: `4px solid ${theme.palette.success.main}`,
                          borderRadius: 2,
                          '& .MuiAlert-icon': {
                            fontSize: isMobile ? '1.2rem' : '1.5rem'
                          }
                        }}
                        icon={<StorefrontIcon />}
                      >
                        You already own a shop! Manage your business below.
                      </Alert>
                    )}

                    {/* Add Shop Button */}
                    {!hasShop && (
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={
                          <AddBusinessIcon 
                            sx={{ fontSize: isMobile ? '1.2rem' : '1.5rem' }} 
                          />
                        }
                        fullWidth
                        size={isMobile ? "medium" : "large"}
                        onClick={() => navigate('/add-shop')}
                        sx={{
                          py: isMobile ? 1.2 : 1.8,
                          fontWeight: '700',
                          fontSize: isMobile ? '0.95rem' : '1.1rem',
                          borderRadius: isMobile ? 2 : 3,
                          background: isDark
                            ? 'linear-gradient(90deg,#3949ab,#039be5)'
                            : 'linear-gradient(90deg,#64b5f6,#00c6ff)',
                          boxShadow: isDark
                            ? '0 4px 12px rgba(3, 155, 229, 0.4)'
                            : '0 4px 12px rgba(116, 185, 255, 0.5)',
                          color: '#fff',
                          transition: 'all 0.3s ease-in-out',
                          '&:hover': {
                            background: isDark
                              ? 'linear-gradient(90deg,#039be5,#3949ab)'
                              : 'linear-gradient(90deg,#00c6ff,#64b5f6)',
                            transform: 'translateY(-2px)',
                            boxShadow: isDark
                              ? '0 6px 16px rgba(3, 155, 229, 0.6)'
                              : '0 6px 16px rgba(116, 185, 255, 0.7)',
                          },
                          '&:active': {
                            transform: 'translateY(0px)'
                          }
                        }}
                      >
                        Add Your Shop
                      </Button>
                    )}

                    {/* View My Shop Button */}
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={
                        <StorefrontIcon 
                          sx={{ fontSize: isMobile ? '1.1rem' : '1.3rem' }} 
                        />
                      }
                      component={Link}
                      to="/my-shops"
                      fullWidth
                      size={isMobile ? "medium" : "large"}
                      disabled={!hasShop}
                      sx={{
                        py: isMobile ? 1.1 : 1.5,
                        borderRadius: isMobile ? 2 : 3,
                        fontWeight: 600,
                        fontSize: isMobile ? '0.9rem' : '1rem',
                        borderWidth: 2,
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                          borderWidth: 2,
                          transform: isMobile ? 'none' : 'translateY(-1px)',
                          boxShadow: `0 4px 12px ${theme.palette.primary.main}20`
                        },
                        '&:disabled': {
                          opacity: 0.5,
                          cursor: 'not-allowed'
                        }
                      }}
                    >
                      View My Shop
                    </Button>

                    {/* View Orders Button */}
                    <Button
                      variant="outlined"
                      color="info"
                      startIcon={
                        <ListAltIcon 
                          sx={{ fontSize: isMobile ? '1.1rem' : '1.3rem' }} 
                        />
                      }
                      onClick={() => navigate('/owner-orders')}
                      fullWidth
                      size={isMobile ? "medium" : "large"}
                      sx={{
                        py: isMobile ? 1.1 : 1.5,
                        borderRadius: isMobile ? 2 : 3,
                        fontWeight: 600,
                        fontSize: isMobile ? '0.9rem' : '1rem',
                        borderWidth: 2,
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                          borderWidth: 2,
                          transform: isMobile ? 'none' : 'translateY(-1px)',
                          boxShadow: `0 4px 12px ${theme.palette.info.main}20`
                        }
                      }}
                    >
                      View Orders
                    </Button>

                    {/* Additional Quick Stats or Info (Optional) */}
                    {hasShop && (
                      <Box
                        sx={{
                          width: '100%',
                          mt: isMobile ? 2 : 3,
                          p: isMobile ? 1.5 : 2,
                          bgcolor: isDark ? 'action.hover' : 'grey.50',
                          borderRadius: 2,
                          border: `1px solid ${theme.palette.divider}`
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          textAlign="center"
                          display="block"
                          sx={{ fontSize: isMobile ? '0.75rem' : '0.8rem' }}
                        >
                          💡 Tip: Keep your menu items updated to attract more customers!
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Fade>
              </CardContent>
            </Card>
          </Fade>
        </Box>
      </Container>
    </>
  );
};

export default OwnerHome;
