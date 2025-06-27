// src/pages/OwnerOrders.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box, Container, Grid, Card, CardContent, CardActions, Typography, Button, Chip,
  Stack, CircularProgress, Snackbar, Alert, Accordion, AccordionSummary, AccordionDetails,
  List, ListItem, ListItemIcon, ListItemText
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

const OwnerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

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
    .then(() => {
      setSnackbar({ open: true, message: `Order status updated to ${status}!`, severity: 'success' });
      fetchOrders();
    })
    .catch(() => setSnackbar({ open: true, message: 'Failed to update status', severity: 'error' }));
  };

  const getStatusChipColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'accepted': return 'info';
      case 'completed': return 'success';
      case 'rejected': return 'error';
      case 'expired': return 'default'; // 'expired' status එකට color එක add කරා
      default: return 'default';
    }
  };

  // Location-wise item summary for today's active orders
  const locationItemTotals = orders
    .filter(order => order.status === 'accepted' || order.status === 'completed')
    .reduce((acc, order) => {
      const loc = order.location;
      if (!acc[loc]) acc[loc] = {};
      order.items.forEach(item => {
        acc[loc][item.name] = (acc[loc][item.name] || 0) + item.qty;
      });
      return acc;
    }, {});

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" fontWeight="bold" color="primary.main" align="center" mb={4}>
          Manage Today's Orders
        </Typography>

        {/* Order Summary Card for Today */}
        <Card sx={{ mb: 4, borderRadius: 3, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} mb={2}>Order Aggregation for Today</Typography>
            {Object.keys(locationItemTotals).length > 0 ? (
              Object.entries(locationItemTotals).map(([loc, items]) => (
                <Accordion key={loc} sx={{ '&:before': { display: 'none' }, boxShadow: 'none', border: '1px solid #e0e0e0' }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <LocationOnIcon color="action" sx={{ mr: 1 }} />
                    <Typography fontWeight={500}>Location: {loc}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List dense>
                      {Object.entries(items).map(([item, qty]) => (
                        <ListItem key={item} disablePadding>
                          <ListItemIcon><ShoppingCartIcon fontSize="small" /></ListItemIcon>
                          <ListItemText primary={`${item}: ${qty} units`} />
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              ))
            ) : (
              <Typography color="text.secondary">No accepted or completed orders to summarize for today.</Typography>
            )}
          </CardContent>
        </Card>

        {/* Individual Orders List for Today */}
        <Typography variant="h5" fontWeight={600} mb={2}>All Today's Orders</Typography>
        <Grid container spacing={3}>
          {orders.length === 0 ? (
            <Grid item xs={12}>
              <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>No orders found for today.</Typography>
            </Grid>
          ) : (
            orders.map(order => (
              <Grid item xs={12} md={6} lg={4} key={order._id}>
                <Card sx={{ borderRadius: 3, boxShadow: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h6" fontWeight={600}>{order.shop?.shopName}</Typography>
                      <Chip
                        label={order.status}
                        color={getStatusChipColor(order.status)}
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                        onClick={() => {}} // Dummy onClick to prevent MUI bug
                      />
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                       <PersonIcon color="action" fontSize="small" />
                       <Typography variant="body2">{order.user?.name} ({order.user?.email})</Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                       <ReceiptLongIcon color="action" fontSize="small" />
                       <Typography variant="body2" fontWeight={500}>Total: Rs.{order.total}</Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <LocationOnIcon fontSize="small" sx={{ mr: 0.5 }} />
                      Location: {order.location}
                    </Typography>

                    <Typography variant="subtitle2" fontWeight={600} mb={1}>Items:</Typography>
                    <List dense disablePadding>
                      {order.items.map((item, idx) => (
                        <ListItem key={idx} disablePadding>
                          <ListItemIcon sx={{ minWidth: 32 }}><ShoppingCartIcon fontSize="small" /></ListItemIcon>
                          <ListItemText primary={`${item.name} x${item.qty}`} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                  <CardActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                    {order.status === 'pending' && (
                      <Stack direction="row" spacing={1} width="100%">
                        <Button fullWidth variant="contained" color="success" startIcon={<CheckCircleOutlineIcon />} onClick={() => updateOrderStatus(order._id, 'accepted')}>Accept</Button>
                        <Button fullWidth variant="outlined" color="error" startIcon={<HighlightOffIcon />} onClick={() => updateOrderStatus(order._id, 'rejected')}>Reject</Button>
                      </Stack>
                    )}
                    {order.status === 'accepted' && (
                      <Button fullWidth variant="contained" color="primary" startIcon={<TaskAltIcon />} onClick={() => updateOrderStatus(order._id, 'completed')}>Mark Completed</Button>
                    )}
                    {['rejected', 'completed', 'expired'].includes(order.status) && (
                      <Typography variant="body2" color="text.secondary" sx={{ width: '100%', textAlign: 'center' }}>Order {order.status}</Typography>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Container>
      
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OwnerOrders;
