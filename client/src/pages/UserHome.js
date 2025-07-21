import React from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Box,
} from '@mui/material';
import { Fastfood, ListAlt } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(8),
  borderRadius: 16,
  boxShadow: theme.shadows[10],
  transition: 'transform 0.3s',
  '&:hover': {
    transform: 'translateY(-5px)'
  },
  // DARK MODE: use a dark gradient, otherwise use your old gradient
  background:
    theme.palette.mode === 'dark'
      ? 'linear-gradient(145deg, #232323, #111418 90%)'
      : 'linear-gradient(145deg, #f5f5f5, #ffffff)'
}));

const ActionButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(2),
  margin: theme.spacing(1),
  borderRadius: 12,
  textTransform: 'none',
  fontSize: '1.1rem',
  transition: 'all 0.3s',
  '&:hover': {
    transform: 'scale(1.05)'
  }
}));

const UserHome = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <StyledCard>
        <CardContent>
          <Box textAlign="center" mb={4}>
            <Typography
              variant="h3"
              component="h1"
              gutterBottom
              color="primary.main"
              sx={{
                fontWeight: 700,
                textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              Welcome to FoodHub 🍔
            </Typography>

            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ mb: 4 }}
            >
              Discover delicious meals from your favorite local restaurants
            </Typography>

            <Grid container spacing={3} justifyContent="center">
              <Grid item xs={12} sm={6} md={5}>
                <ActionButton
                  fullWidth
                  variant="contained"
                  color="primary"
                  startIcon={<Fastfood sx={{ fontSize: 30 }} />}
                  onClick={() => navigate('/shops')}
                  sx={{ py: 2 }}
                >
                  Explore Restaurants
                </ActionButton>
              </Grid>
              <Grid item xs={12} sm={6} md={5}>
                <ActionButton
                  fullWidth
                  variant="outlined"
                  color="secondary"
                  startIcon={<ListAlt sx={{ fontSize: 30 }} />}
                  onClick={() => navigate('/my-orders')}
                  sx={{ py: 2 }}
                >
                  View My Orders
                </ActionButton>
              </Grid>
            </Grid>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 4 }}
            >
              Join over 50,000 satisfied food lovers!
            </Typography>
          </Box>
        </CardContent>
      </StyledCard>
    </Container>
  );
};

export default UserHome;
