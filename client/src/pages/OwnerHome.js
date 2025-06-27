import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Material UI imports
import {
  Box,
  Button,
  Typography,
  Alert,
  Stack,
  Paper,
  useMediaQuery
} from '@mui/material';
import { useTheme, ThemeProvider, createTheme } from '@mui/material/styles';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ListAltIcon from '@mui/icons-material/ListAlt';

// Custom theme (You can move this to App.js if you want global theming)
const customTheme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#ff9800',
    },
    info: {
      main: '#00bcd4',
    },
    background: {
      default: '#f4f6f8',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial',
    fontWeightBold: 700,
  },
});

const OwnerHome = () => {
  const navigate = useNavigate();
  const [hasShop, setHasShop] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) return;
    axios
      .get('http://localhost:5000/api/shops/my', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setHasShop(res.data && res.data.length > 0);
      })
      .catch(() => setHasShop(false));
  }, []);

  return (
    <ThemeProvider theme={customTheme}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          mt: isMobile ? 2 : 8,
          px: isMobile ? 1 : 0,
        }}
      >
        <Paper
          elevation={4}
          sx={{
            p: isMobile ? 2 : 5,
            minWidth: isMobile ? '90vw' : 350,
            width: isMobile ? '100%' : 400,
            bgcolor: 'background.default',
          }}
        >
          <Typography
            variant={isMobile ? 'h5' : 'h4'}
            component="h2"
            gutterBottom
            sx={{ fontWeight: 'bold', color: 'primary.main' }}
          >
            Welcome, Shop Owner
          </Typography>
          <Stack spacing={2} direction="column" alignItems="center">
            {/* Only show if user does NOT have a shop */}
            {!hasShop && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddBusinessIcon />}
                onClick={() => navigate('/add-shop')}
                size="large"
                sx={{ width: '100%' }}
              >
                Add New Shop
              </Button>
            )}
            {/* Show info message if user already has a shop */}
            {hasShop && (
              <Alert severity="info" sx={{ width: '100%' }}>
                You already have a shop.
              </Alert>
            )}

            <Button
              variant="outlined"
              color="secondary"
              startIcon={<StorefrontIcon />}
              onClick={() => navigate('/shops')}
              size="large"
              sx={{ width: '100%' }}
            >
              View My Shops
            </Button>
            <Button
              variant="outlined"
              color="info"
              startIcon={<ListAltIcon />}
              onClick={() => navigate('/owner-orders')}
              size="large"
              sx={{ width: '100%' }}
            >
              View Orders
            </Button>
          </Stack>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default OwnerHome;
