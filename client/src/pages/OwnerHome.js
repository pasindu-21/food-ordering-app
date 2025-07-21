import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Button,
  Typography,
  Alert,
  Stack,
  Paper,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ListAltIcon from '@mui/icons-material/ListAlt';

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
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh',
        bgcolor: 'background.default', // Theme palette driven
        mt: isMobile ? 0 : 8,
        px: isMobile ? 1 : 0,
        transition: 'background 0.2s',
      }}
    >
      <Paper
        elevation={4}
        sx={{
          p: isMobile ? 2 : 5,
          minWidth: isMobile ? '90vw' : 350,
          width: isMobile ? '100%' : 400,
          bgcolor: 'background.paper', // Theme driven
          borderRadius: 4,
          boxShadow: theme.shadows[8]
        }}
      >
        <Typography
          variant={isMobile ? 'h5' : 'h4'}
          component="h2"
          gutterBottom
          sx={{ fontWeight: 'bold', color: 'primary.main', textAlign: 'center', mb: 2 }}
        >
          Owner Dashboard
        </Typography>
        <Stack spacing={2} direction="column" alignItems="center">
          {hasShop ? (
            <Alert severity="info" sx={{ width: '100%' }}>
              You already have a shop. You can manage it from here.
            </Alert>
          ) : (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddBusinessIcon />}
              onClick={() => navigate('/add-shop')}
              size="large"
              sx={{ width: '100%' }}
            >
              Add Your Shop
            </Button>
          )}

          <Button
            variant="outlined"
            color="secondary"
            startIcon={<StorefrontIcon />}
            component={Link}
            to="/my-shops"
            size="large"
            sx={{ width: '100%' }}
            disabled={!hasShop}
          >
            View My Shop
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
  );
};

export default OwnerHome;
