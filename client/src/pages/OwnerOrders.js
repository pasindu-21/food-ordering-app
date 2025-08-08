import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box, Container, Grid, Card, CardContent, CardActions, Typography, Button, Chip,
  Stack, CircularProgress, Snackbar, Alert, Accordion, AccordionSummary, AccordionDetails,
  List, ListItem, ListItemText, TextField, InputAdornment, useMediaQuery
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SearchIcon from '@mui/icons-material/Search';
import { useTheme } from '@mui/material/styles';

const timeSlots = ['Breakfast', 'Lunch', 'Dinner'];
const locations = ['A', 'B', 'C', 'D'];

// Enhanced time slot display with better mobile formatting
const TIME_SLOT_DISPLAY = {
  Breakfast: 'Breakfast - 8.00 A.M',
  Lunch: 'Lunch - 12.00 P.M',
  Dinner: 'Dinner - 8.00 P.M'
};

const TIME_SLOT_DISPLAY_MOBILE = {
  Breakfast: 'Breakfast (8 AM)',
  Lunch: 'Lunch (12 PM)', 
  Dinner: 'Dinner (8 PM)'
};

const OwnerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [search, setSearch] = useState("");
  
  const theme = useTheme();
  // Add mobile responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const isDark = theme.palette.mode === 'dark';

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    setIsLoading(true);
    const token = sessionStorage.getItem('token');
    axios.get('http://localhost:5000/api/orders/my', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setOrders(res.data))
      .catch(() => setSnackbar({ open: true, message: 'Failed to fetch orders', severity: 'error' }))
      .finally(() => setIsLoading(false));
  };

  const updateOrderStatus = (orderId, status) => {
    const token = sessionStorage.getItem('token');
    axios.put(`http://localhost:5000/api/orders/${orderId}/status`, { status }, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setOrders(prevOrders => prevOrders.map(order => 
          order._id === orderId ? { ...order, status: res.data.status } : order
        ));
        setSnackbar({ open: true, message: `Order status updated to ${status}!`, severity: 'success' });
      })
      .catch(() => setSnackbar({ open: true, message: 'Failed to update status', severity: 'error' }));
  };

  const getStatusChipColor = status => {
    switch (status) {
      case 'pending': return 'warning';
      case 'accepted': return 'info';
      case 'completed': return 'success';
      case 'rejected': return 'error';
      case 'expired': return 'default';
      default: return 'default';
    }
  };

  // Enhanced filter with better search functionality
  const filteredOrders = orders.filter(order => {
    if (!search) return true;
    const name = order.user?.name?.toLowerCase() || "";
    const email = order.user?.email?.toLowerCase() || "";
    const phone = order.user?.phone?.toLowerCase() || "";
    const shopName = order.shop?.shopName?.toLowerCase() || "";
    return name.includes(search.toLowerCase()) || 
           email.includes(search.toLowerCase()) || 
           phone.includes(search.toLowerCase()) ||
           shopName.includes(search.toLowerCase());
  });

  // Summary preparation with same logic
  const summary = timeSlots.reduce((acc, slot) => {
    acc[slot] = locations.reduce((locAcc, loc) => {
      locAcc[loc] = {};
      return locAcc;
    }, {});
    return acc;
  }, {});

  orders
    .filter(order => ['accepted', 'completed'].includes(order.status))
    .forEach(order => {
      const slot = order.timeSlot;
      const loc = order.location;
      if (timeSlots.includes(slot) && locations.includes(loc)) {
        order.items.forEach(item => {
          summary[slot][loc][item.name] = (summary[slot][loc][item.name] || 0) + item.qty;
        });
      }
    });

  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress size={isMobile ? 40 : 60} />
        <Typography 
          variant="h6" 
          color="text.secondary"
          sx={{ fontSize: isMobile ? '1rem' : '1.25rem' }}
        >
          Loading Orders...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      bgcolor: 'background.default', 
      minHeight: '100vh', 
      py: isMobile ? 2 : 4,
      px: isMobile ? 1 : 0
    }}>
      <Container maxWidth="lg">
        {/* Enhanced Header */}
        <Typography 
          variant={isMobile ? "h5" : "h4"} 
          fontWeight="bold" 
          color="primary.main" 
          align="center" 
          mb={isMobile ? 3 : 4}
          sx={{
            fontSize: isMobile ? '1.5rem' : '2rem',
            lineHeight: 1.2
          }}
        >
          Manage Today's Orders
        </Typography>

        {/* Enhanced Summary Cards with Mobile Layout */}
        <Grid
          container
          spacing={isMobile ? 2 : 3}
          justifyContent="center"
          alignItems="stretch"
          sx={{ mb: isMobile ? 3 : 4, maxWidth: 1200, mx: 'auto' }}
        >
          {timeSlots.map(slot => (
            <Grid
              item
              xs={12}        // Full width on mobile
              sm={6}         // 2 columns on tablet
              md={4}         // 3 columns on desktop
              key={slot}
              sx={{ display: 'flex', justifyContent: 'center' }}
            >
              <Card sx={{ 
                borderRadius: isMobile ? 2 : 3, 
                boxShadow: theme.shadows[isMobile ? 2 : 4], 
                width: '100%', 
                maxWidth: isMobile ? '100%' : 370,
                border: isDark ? `1px solid ${theme.palette.divider}` : 'none'
              }}>
                <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
                  <Typography 
                    variant={isMobile ? "subtitle1" : "h6"} 
                    fontWeight={700} 
                    gutterBottom
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: isMobile ? '1rem' : '1.25rem'
                    }}
                  >
                    <AccessTimeIcon sx={{ 
                      mr: 1, 
                      color: 'primary.main',
                      fontSize: isMobile ? '1.2rem' : '1.5rem'
                    }} />
                    {isMobile ? TIME_SLOT_DISPLAY_MOBILE[slot] : TIME_SLOT_DISPLAY[slot]}
                  </Typography>
                  {locations.map(loc => (
                    <Accordion 
                      key={loc} 
                      sx={{ 
                        boxShadow: 'none', 
                        borderBottom: '1px solid ' + theme.palette.divider,
                        '&:before': { display: 'none' } // Remove default MUI accordion border
                      }}
                    >
                      <AccordionSummary 
                        expandIcon={<ExpandMoreIcon />} 
                        sx={{ 
                          p: isMobile ? 0.5 : 1,
                          minHeight: isMobile ? 40 : 48
                        }}
                      >
                        <LocationOnIcon sx={{ 
                          mr: 1, 
                          color: 'secondary.main',
                          fontSize: isMobile ? '1rem' : '1.2rem'
                        }} />
                        <Typography 
                          fontWeight={500}
                          sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
                        >
                          Location {loc}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails sx={{ p: isMobile ? 0.5 : 1 }}>
                        {Object.keys(summary[slot][loc]).length === 0 ? (
                          <Typography 
                            color="text.secondary"
                            sx={{ 
                              fontSize: isMobile ? '0.8rem' : '0.875rem',
                              fontStyle: 'italic'
                            }}
                          >
                            No items for this location.
                          </Typography>
                        ) : (
                          <List dense>
                            {Object.entries(summary[slot][loc]).map(([item, qty]) => (
                              <ListItem key={item} disablePadding>
                                <ListItemText 
                                  primary={`${item}: ${qty}`}
                                  primaryTypographyProps={{
                                    fontSize: isMobile ? '0.8rem' : '0.875rem'
                                  }}
                                />
                              </ListItem>
                            ))}
                          </List>
                        )}
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Enhanced Search Filter */}
        <Box sx={{ 
          maxWidth: isMobile ? '100%' : 400, 
          mx: 'auto', 
          mb: isMobile ? 3 : 4,
          px: isMobile ? 1 : 0
        }}>
          <TextField
            placeholder={isMobile ? "Search orders..." : "Search by customer name, email, or phone"}
            variant="outlined"
            value={search}
            onChange={e => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="primary" />
                </InputAdornment>
              ),
            }}
            fullWidth
            size={isMobile ? "small" : "medium"}
            sx={{
              bgcolor: theme.palette.background.paper,
              borderRadius: isMobile ? 1 : 2,
              boxShadow: theme.shadows[1],
              '& .MuiOutlinedInput-root': {
                fontSize: isMobile ? '0.875rem' : '1rem'
              }
            }}
          />
        </Box>

        {/* Enhanced Orders Section Header */}
        <Typography 
          variant={isMobile ? "h6" : "h5"} 
          fontWeight={600} 
          mb={isMobile ? 2 : 3}
          sx={{
            fontSize: isMobile ? '1.25rem' : '1.5rem',
            px: isMobile ? 1 : 0
          }}
        >
          All Today's Orders ({filteredOrders.length})
        </Typography>

        {/* Enhanced Orders Grid */}
        <Grid container spacing={isMobile ? 2 : 3}>
          {filteredOrders.length === 0 ? (
            <Grid item xs={12}>
              <Card sx={{ 
                p: isMobile ? 3 : 4, 
                textAlign: 'center',
                borderRadius: isMobile ? 2 : 3
              }}>
                <Typography 
                  color="text.secondary" 
                  sx={{ 
                    fontSize: isMobile ? '1rem' : '1.125rem',
                    mb: 1
                  }}
                >
                  {search ? `No orders found for "${search}".` : "No orders found for today."}
                </Typography>
                {search && (
                  <Button 
                    variant="outlined" 
                    onClick={() => setSearch('')}
                    sx={{ mt: 2 }}
                    size={isMobile ? "small" : "medium"}
                  >
                    Clear Search
                  </Button>
                )}
              </Card>
            </Grid>
          ) : (
            filteredOrders.map(order => (
              <Grid 
                item 
                xs={12}       // Full width on mobile
                sm={12}       // Full width on small tablets  
                md={6}        // 2 columns on medium screens
                lg={4}        // 3 columns on large screens
                key={order._id}
              >
                <Card sx={{
                  borderRadius: isMobile ? 2 : 3,
                  boxShadow: theme.shadows[isMobile ? 2 : 3],
                  backgroundColor: theme.palette.background.paper,
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  border: isDark ? `1px solid ${theme.palette.divider}` : 'none'
                }}>
                  <CardContent sx={{ flexGrow: 1, p: isMobile ? 1.5 : 2 }}>
                    {/* Order Header */}
                    <Stack 
                      direction="row" 
                      justifyContent="space-between" 
                      alignItems="flex-start" 
                      mb={isMobile ? 1.5 : 2}
                      spacing={1}
                    >
                      <Typography 
                        variant={isMobile ? "subtitle1" : "h6"} 
                        fontWeight={600}
                        sx={{ 
                          fontSize: isMobile ? '1rem' : '1.25rem',
                          lineHeight: 1.2,
                          flex: 1
                        }}
                      >
                        {order.shop?.shopName}
                      </Typography>
                      <Chip 
                        label={order.status} 
                        color={getStatusChipColor(order.status)} 
                        size="small" 
                        sx={{ 
                          textTransform: 'capitalize',
                          fontSize: isMobile ? '0.7rem' : '0.75rem',
                          height: isMobile ? 24 : 32
                        }} 
                      />
                    </Stack>

                    {/* Customer Info */}
                    <Stack spacing={isMobile ? 0.5 : 1} mb={isMobile ? 1.5 : 2}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <PersonIcon 
                          color="action" 
                          sx={{ fontSize: isMobile ? '1rem' : '1.2rem' }}
                        />
                        <Typography 
                          variant="body2"
                          sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem' }}
                        >
                          {order.user?.name} ({order.user?.email})
                        </Typography>
                      </Stack>
                      
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <PhoneIcon 
                          color="action" 
                          sx={{ fontSize: isMobile ? '1rem' : '1.2rem' }}
                        />
                        <Typography 
                          variant="body2"
                          sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem' }}
                        >
                          {order.user?.phone || 'N/A'}
                        </Typography>
                      </Stack>

                      <Stack direction="row" alignItems="center" spacing={1}>
                        <ReceiptLongIcon 
                          color="action" 
                          sx={{ fontSize: isMobile ? '1rem' : '1.2rem' }}
                        />
                        <Typography 
                          variant="body2" 
                          fontWeight={500}
                          sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem' }}
                        >
                          Total: Rs.{order.total}
                        </Typography>
                      </Stack>
                    </Stack>

                    {/* Location and Time */}
                    <Stack spacing={isMobile ? 0.5 : 1} mb={isMobile ? 1.5 : 2}>
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          fontSize: isMobile ? '0.8rem' : '0.875rem'
                        }}
                      >
                        <LocationOnIcon 
                          sx={{ 
                            mr: 0.5,
                            fontSize: isMobile ? '1rem' : '1.2rem'
                          }} 
                        />
                        Location: {order.location}
                      </Typography>
                      
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          fontSize: isMobile ? '0.8rem' : '0.875rem'
                        }}
                      >
                        <AccessTimeIcon 
                          sx={{ 
                            mr: 0.5,
                            fontSize: isMobile ? '1rem' : '1.2rem'
                          }} 
                        />
                        {isMobile 
                          ? TIME_SLOT_DISPLAY_MOBILE[order.timeSlot] || order.timeSlot || 'Not Specified'
                          : TIME_SLOT_DISPLAY[order.timeSlot] || order.timeSlot || 'Not Specified'
                        }
                      </Typography>
                    </Stack>

                    {/* Items List */}
                    <Typography 
                      variant="subtitle2" 
                      fontWeight={600} 
                      mb={1}
                      sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
                    >
                      Items:
                    </Typography>
                    <Stack spacing={isMobile ? 0.3 : 0.5}>
                      {order.items.map((item, idx) => (
                        <Typography 
                          key={idx} 
                          variant="body2"
                          sx={{ 
                            fontSize: isMobile ? '0.8rem' : '0.875rem',
                            pl: 1,
                            borderLeft: `2px solid ${theme.palette.primary.main}`,
                            backgroundColor: isDark ? 'action.hover' : 'grey.50',
                            py: 0.5,
                            px: 1,
                            borderRadius: 1
                          }}
                        >
                          {`${item.name} x${item.qty}`}
                        </Typography>
                      ))}
                    </Stack>
                  </CardContent>

                  {/* Enhanced Action Buttons */}
                  <CardActions sx={{ 
                    p: isMobile ? 1.5 : 2, 
                    bgcolor: theme.palette.background.default,
                    borderTop: `1px solid ${theme.palette.divider}`
                  }}>
                    {order.status === 'pending' && (
                      <Stack 
                        direction={isMobile ? "column" : "row"} 
                        spacing={1} 
                        width="100%"
                      >
                        <Button 
                          fullWidth 
                          variant="contained" 
                          color="success" 
                          startIcon={<CheckCircleOutlineIcon />} 
                          onClick={() => updateOrderStatus(order._id, 'accepted')}
                          size={isMobile ? "small" : "medium"}
                          sx={{ 
                            fontSize: isMobile ? '0.8rem' : '0.875rem',
                            py: isMobile ? 1 : 1.2
                          }}
                        >
                          Accept
                        </Button>
                        <Button 
                          fullWidth 
                          variant="outlined" 
                          color="error" 
                          startIcon={<HighlightOffIcon />} 
                          onClick={() => updateOrderStatus(order._id, 'rejected')}
                          size={isMobile ? "small" : "medium"}
                          sx={{ 
                            fontSize: isMobile ? '0.8rem' : '0.875rem',
                            py: isMobile ? 1 : 1.2
                          }}
                        >
                          Reject
                        </Button>
                      </Stack>
                    )}
                    
                    {order.status === 'accepted' && (
                      <Button 
                        fullWidth 
                        variant="contained" 
                        color="primary" 
                        startIcon={<TaskAltIcon />} 
                        onClick={() => updateOrderStatus(order._id, 'completed')}
                        size={isMobile ? "small" : "medium"}
                        sx={{ 
                          fontSize: isMobile ? '0.8rem' : '0.875rem',
                          py: isMobile ? 1 : 1.2
                        }}
                      >
                        Mark Completed
                      </Button>
                    )}
                    
                    {['rejected', 'completed', 'expired'].includes(order.status) && (
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          width: '100%', 
                          textAlign: 'center',
                          fontSize: isMobile ? '0.8rem' : '0.875rem',
                          fontStyle: 'italic',
                          py: 1
                        }}
                      >
                        Order {order.status}
                      </Typography>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Container>

      {/* Enhanced Snackbar */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })} 
        anchorOrigin={{ 
          vertical: isMobile ? 'top' : 'bottom', 
          horizontal: 'center' 
        }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity} 
          sx={{ 
            width: '100%',
            fontSize: isMobile ? '0.8rem' : '0.875rem'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OwnerOrders;
