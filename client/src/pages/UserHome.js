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
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Avatar
} from '@mui/material';
import { Fastfood, ListAlt, AccountCircle } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
  borderRadius: 16,
  boxShadow: theme.shadows[10],
  transition: 'transform 0.3s',
  minHeight: '70vh',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    transform: 'translateY(-5px)'
  },
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

const FooterSection = styled(Box)(({ theme }) => ({
  marginTop: 'auto',
  textAlign: 'center',
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.02)' 
    : 'rgba(0, 0, 0, 0.02)',
  borderRadius: '0 0 16px 16px'
}));

// UserProfile as a functional component for the dialog content
const UserProfileForm = ({ onClose }) => {
  const theme = useTheme();
  const { user, updateUser } = useAuth();
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
      fetchUser();
    }
  }, [user]);

  const fetchUser = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      updateUser(res.data);
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
      updateUser(res.data);
      setSnackbar({ open: true, message: 'Profile updated successfully', severity: 'success' });
      setEditMode(false);
      onClose(); // Close dialog after save
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
    <>
      <TextField
        label="Name"
        value={name || ''}
        onChange={e => setName(e.target.value)}
        fullWidth
        margin="normal"
        disabled={!editMode}
      />
      <TextField
        label="Email"
        value={user.email || ''}
        fullWidth
        margin="normal"
        disabled
      />
      <TextField
        label="Phone Number"
        value={phone || ''}
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
    </>
  );
};

// Main UserHome component
const UserHome = () => {
  const navigate = useNavigate();
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  const openProfileDialog = () => setProfileDialogOpen(true);
  const closeProfileDialog = () => setProfileDialogOpen(false);

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Container maxWidth="md" sx={{ flex: 1, display: 'flex', flexDirection: 'column', py: 2 }}>
        <StyledCard>
          <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Main Content Area */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              {/* Header Section with Profile Icon */}
              <Box textAlign="center" mb={4} position="relative">
                <IconButton
                  onClick={openProfileDialog}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    color: 'primary.main',
                    bgcolor: 'background.paper',
                    boxShadow: 2,
                    '&:hover': {
                      bgcolor: 'primary.light',
                      color: 'white'
                    }
                  }}
                >
                  <AccountCircle sx={{ fontSize: 40 }} />
                </IconButton>

                <Typography
                  variant="h3"
                  component="h1"
                  gutterBottom
                  color="primary.main"
                  sx={{
                    fontWeight: 700,
                    textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
                    mb: 2
                  }}
                >
                  Welcome to UniFood
                </Typography>

                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}
                >
                  Discover delicious meals from your favorite local restaurants and enjoy convenient food delivery
                </Typography>
              </Box>

              {/* Action Buttons Section */}
              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Grid container spacing={3} justifyContent="center" sx={{ maxWidth: 600 }}>
                  <Grid item xs={12} sm={6}>
                    <ActionButton
                      fullWidth
                      variant="contained"
                      color="primary"
                      startIcon={<Fastfood sx={{ fontSize: 30 }} />}
                      onClick={() => navigate('/shops')}
                      sx={{ 
                        py: 3,
                        minHeight: 80,
                        fontSize: '1.2rem',
                        fontWeight: 600
                      }}
                    >
                      View Available Shops
                    </ActionButton>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <ActionButton
                      fullWidth
                      variant="outlined"
                      color="secondary"
                      startIcon={<ListAlt sx={{ fontSize: 30 }} />}
                      onClick={() => navigate('/my-orders')}
                      sx={{ 
                        py: 3,
                        minHeight: 80,
                        fontSize: '1.2rem',
                        fontWeight: 600,
                        borderWidth: 2,
                        '&:hover': {
                          borderWidth: 2
                        }
                      }}
                    >
                      View My Orders
                    </ActionButton>
                  </Grid>
                </Grid>
              </Box>
            </Box>

            {/* Footer Section */}
            <FooterSection>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ 
                  fontWeight: 500,
                  fontSize: '1.1rem'
                }}
              >
                Thank you for choosing UniFood! 🍽️
              </Typography>
              <Typography
                variant="caption"
                color="text.disabled"
                sx={{ 
                  display: 'block',
                  mt: 1,
                  fontSize: '0.85rem'
                }}
              >
                Bringing delicious food to your doorstep
              </Typography>
            </FooterSection>
          </CardContent>
        </StyledCard>
      </Container>

      {/* Profile Popup Dialog */}
      <Dialog
        open={profileDialogOpen}
        onClose={closeProfileDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: 10
          }
        }}
      >
        <DialogTitle sx={{ 
          textAlign: 'center',
          fontWeight: 700,
          color: 'primary.main',
          borderBottom: 1,
          borderColor: 'divider'
        }}>
          My Profile
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <UserProfileForm onClose={closeProfileDialog} />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default UserHome;
