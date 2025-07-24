import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Box, Button, Typography, Alert, Stack, Card, CardContent, Fade,
  useMediaQuery, Backdrop, CircularProgress, Tooltip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ListAltIcon from '@mui/icons-material/ListAlt';
 

const gradientBgLight = `linear-gradient(135deg, #e3f2fd 0%, #fce4ec 100%)`;
const gradientBgDark = `linear-gradient(135deg, #1a237e 0%, #263238 100%)`;

const OwnerHome = () => {
  const navigate = useNavigate();
  const [hasShop, setHasShop] = useState(false);
  const [loading, setLoading] = useState(true);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDark = theme.palette.mode === 'dark';

  // Optionally pull user name/avatar from session.
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) { setLoading(false); return; }
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

  return (
    <>
      {/* Gradient background */}
      <Box
        sx={{
          minHeight: '100vh',
          width: '100vw',
          position: 'fixed',
          zIndex: -1,
          left: 0,
          top: 0,
          background: isDark ? gradientBgDark : gradientBgLight,
          transition: 'background 0.3s'
        }}
      />

      {/* Account Avatar/top bar (optional, for context and profile access) */}
      <Box
        sx={{
          position: 'absolute',
          top: isMobile ? 8 : 16,
          right: isMobile ? 8 : 32,
          zIndex: 10,
        }}
      >
        <Tooltip title={user?.name || 'Account'}>
           
        </Tooltip>
      </Box>

      {/* Loader (stylish and theme-matched) */}
      <Backdrop open={loading} sx={{ zIndex: 1200, color: '#FFF' }}>
        <CircularProgress color="inherit" />
      </Backdrop>

      {/* Dashboard card area */}
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        px={isMobile ? 1 : 0}
      >
        <Fade in={!loading}>
          <Card
            elevation={10}
            sx={{
              minWidth: isMobile ? '98vw' : 440,
              maxWidth: 460,
              width: '100%',
              bgcolor: isDark ? 'background.paper' : '#fff',
              borderRadius: 6,
              px: isMobile ? 1.5 : 4,
              py: isMobile ? 2 : 4,
              boxShadow: isDark
                ? '0 6px 36px 6px #12121299'
                : '0 6px 36px 6px rgba(64, 145, 220, 0.18)',
              transition: 'background 0.3s',
              position: 'relative'
            }}
          >
            <CardContent sx={{ p: 0 }}>
              {/* Welcome & heading */}
              <Stack alignItems="center" spacing={0.5}>
                <Typography
                  variant={isMobile ? 'h6' : 'h4'}
                  fontFamily="'Poppins', sans-serif"
                  textAlign="center"
                  fontWeight={700}
                  color="primary.main"
                  gutterBottom
                  mb={1.5}
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <StorefrontIcon fontSize="large" color="primary" />
                  Owner Dashboard
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  textAlign="center"
                  mb={1.5}
                >
                  {user?.name ? `Welcome, ${user.name}! ` : null}
                  {hasShop
                    ? "Quick access to manage your shop."
                    : "Get started by creating your shop."}
                </Typography>
              </Stack>

              <Fade in timeout={500}>
                <Stack spacing={3} alignItems="center" mt={2}>
                  {/* Only shown if already has a shop */}
                  {hasShop ? (
                    <Alert
                      severity="success"
                      sx={{
                        width: '100%',
                        fontWeight: 'bold',
                        fontSize: isMobile ? '0.91rem' : '1.04rem',
                        bgcolor: isDark
                          ? 'rgba(56,142,60,0.15)'
                          : 'rgba(232,245,233,0.72)',
                        borderLeft: '4px solid #66bb6a',
                        mb: 2
                      }}
                      icon={<StorefrontIcon />}
                    >
                      🎉 You already own a shop! Manage your business below.
                    </Alert>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<AddBusinessIcon />}
                      fullWidth
                      size="large"
                      aria-label="Add your shop"
                      onClick={() => navigate('/add-shop')}
                      sx={{
                        py: 1.5,
                        fontWeight: '700',
                        fontSize: isMobile ? '1.03rem' : '1.12rem',
                        borderRadius: 3,
                        background: isDark
                          ? 'linear-gradient(90deg,#3949ab,#039be5)'
                          : 'linear-gradient(90deg,#64b5f6,#00c6ff)',
                        boxShadow: isDark
                          ? '0 2px 10px #039be588'
                          : '0 2px 10px 0 #74b9ff99',
                        color: '#fff',
                        transition: 'all 0.18s',
                        '&:hover': {
                          background: isDark
                            ? 'linear-gradient(90deg,#039be5,#3949ab)'
                            : 'linear-gradient(90deg,#00c6ff,#64b5f6)',
                          transform: 'scale(1.03)'
                        }
                      }}
                    >
                      Add Your Shop
                    </Button>
                  )}

                  {/* Manage Shop */}
                  <Button
                    variant="outlined"
                    color={isDark ? "primary" : "secondary"}
                    startIcon={<StorefrontIcon />}
                    component={Link}
                    to="/my-shops"
                    fullWidth
                    size="large"
                    aria-label="View my shop"
                    sx={{
                      py: 1.25,
                      borderRadius: 3,
                      fontWeight: 600,
                      fontSize: isMobile ? '1rem' : '1.08rem'
                    }}
                    disabled={!hasShop}
                  >
                    View My Shop
                  </Button>

                  {/* Orders */}
                  <Button
                    variant="outlined"
                    color="info"
                    startIcon={<ListAltIcon />}
                    onClick={() => navigate('/owner-orders')}
                    fullWidth
                    size="large"
                    aria-label="View orders"
                    sx={{
                      py: 1.25,
                      borderRadius: 3,
                      fontWeight: 600,
                      fontSize: isMobile ? '1rem' : '1.08rem'
                    }}
                  >
                    View Orders
                  </Button>
                </Stack>
              </Fade>
            </CardContent>
          </Card>
        </Fade>
      </Box>
    </>
  );
};

export default OwnerHome;
