import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Box,
  Paper,
  TextField,
  Snackbar,
  Alert
} from '@mui/material';
import { Fastfood, ListAlt } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // Import useAuth (updated from AuthContext)

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

// Updated UserProfile component with fetching from DB
const UserProfile = () => {
  const theme = useTheme();
  const { user, updateUser } = useAuth(); // Use global context
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setLoading(false);
    } else {
      setLoading(true);
      // Fetch if not available
      fetchUser();
    }
  }, [user]);

  const fetchUser = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      updateUser(res.data); // Update global context
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to load profile from database', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setSnackbar({ open: true, message: 'Name cannot be empty', severity: 'error' });
      return;
    }
    setLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      const res = await axios.patch('http://localhost:5000/api/users/profile', { name: name.trim(), phone: phone.trim() }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      updateUser(res.data); // Update global context
      setSnackbar({ open: true, message: 'Profile updated successfully', severity: 'success' });
      setEditMode(false);
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to update profile', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Typography>Loading profile...</Typography>;
  }

  if (!user) {
    return <Typography>Failed to load profile.</Typography>;
  }

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 4, mt: 4, bgcolor: theme.palette.background.paper, maxWidth: 400, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>My Profile</Typography>
      <TextField
        label="Name"
        value={name || ''} // Fix: fallback to empty string
        onChange={e => setName(e.target.value)}
        fullWidth
        margin="normal"
        disabled={!editMode}
      />
      <TextField
        label="Email"
        value={user.email || ''} // Fix: fallback to empty string
        fullWidth
        margin="normal"
        disabled
      />
      <TextField
        label="Phone Number"
        value={phone || ''} // Fix: fallback to empty string
        onChange={e => setPhone(e.target.value)}
        fullWidth
        margin="normal"
        disabled={!editMode}
      />
      <Box sx={{ mt: 2, textAlign: 'right' }}>
        {editMode ? (
          <>
            <Button variant="outlined" onClick={() => setEditMode(false)} sx={{ mr: 1 }}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </>
        ) : (
          <Button variant="contained" color="primary" onClick={() => setEditMode(true)}>
            Edit Profile
          </Button>
        )}
      </Box>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

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

      {/* Added User Profile section below the main card */}
      <UserProfile />
    </Container>
  );
};

export default UserHome;
