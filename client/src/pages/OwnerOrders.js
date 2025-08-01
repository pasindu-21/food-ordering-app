import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box, Container, Grid, Card, CardContent, CardActions, Typography, Button, Chip,
  Stack, CircularProgress, Snackbar, Alert, Accordion, AccordionSummary, AccordionDetails,
  List, ListItem, ListItemText, TextField, InputAdornment
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone'; // New for phone display
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SearchIcon from '@mui/icons-material/Search';
import { useTheme } from '@mui/material/styles';

const timeSlots = ['Breakfast', 'Lunch', 'Dinner'];
const locations = ['A', 'B', 'C', 'D'];

// New mapping for time slot display with times
const TIME_SLOT_DISPLAY = {
  Breakfast: 'Breakfast - 8.00 A.M',
  Lunch: 'Lunch - 12.00 P.M',
  Dinner: 'Dinner - 8.00 P.M'
};

const OwnerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [search, setSearch] = useState("");
  const theme = useTheme();

  useEffect(() => {
    fetchOrders(); // Only initial load, no auto refresh
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
        // Real-time local update: Find and update the order in local state
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

  // --- Filter orders for full orders list by name/email ---
  const filteredOrders = orders.filter(order => {
    if (!search) return true;
    const name = order.user?.name?.toLowerCase() || "";
    const email = order.user?.email?.toLowerCase() || "";
    return name.includes(search.toLowerCase()) || email.includes(search.toLowerCase());
  });

  // ---------------------- summary preparation -----------------------
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
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" fontWeight="bold" color="primary.main" align="center" mb={4}>
          Manage Today's Orders
        </Typography>

        {/* ---- CENTERED SUMMARY CARDS ---- */}
        <Grid
          container
          spacing={3}
          justifyContent="center"
          alignItems="stretch"
          sx={{ mb: 4, maxWidth: 1200, mx: 'auto' }}
        >
          {timeSlots.map(slot => (
            <Grid
              item
              xs={12}
              md={4}
              key={slot}
              sx={{ display: 'flex', justifyContent: 'center' }}
            >
              <Card sx={{ borderRadius: 3, boxShadow: theme.shadows[4], width: '100%', maxWidth: 370 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    <AccessTimeIcon sx={{ mr: 1, color: 'primary.main' }} />
                    {TIME_SLOT_DISPLAY[slot] || slot} {/* Updated: Show with time */}
                  </Typography>
                  {locations.map(loc => (
                    <Accordion key={loc} sx={{ boxShadow: 'none', borderBottom: '1px solid ' + theme.palette.divider }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ p: 1 }}>
                        <LocationOnIcon sx={{ mr: 1, color: 'secondary.main' }} />
                        <Typography fontWeight={500}>{loc}</Typography>
                      </AccordionSummary>
                      <AccordionDetails sx={{ p: 1 }}>
                        {Object.keys(summary[slot][loc]).length === 0 ? (
                          <Typography color="text.secondary">No items for this location.</Typography>
                        ) : (
                          <List dense>
                            {Object.entries(summary[slot][loc]).map(([item, qty]) => (
                              <ListItem key={item} disablePadding>
                                <ListItemText primary={`${item}: ${qty}`} />
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

        {/* ---- SEARCH FILTER for user name/email ---- */}
        <Box sx={{ maxWidth: 400, mx: 'auto', mb: 4 }}>
          <TextField
            placeholder="Search by customer name or email"
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
            autoFocus
            size="medium"
            sx={{
              bgcolor: theme.palette.background.paper,
              borderRadius: 2,
              boxShadow: theme.shadows[1]
            }}
          />
        </Box>

        {/* ---- ALL ORDERS SECTION ---- */}
        <Typography variant="h5" fontWeight={600} mb={2}>All Today's Orders</Typography>
        <Grid container spacing={3}>
          {filteredOrders.length === 0 ? (
            <Grid item xs={12}>
              <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>
                {search ? `No orders found for "${search}".` : "No orders found for today."}
              </Typography>
            </Grid>
          ) : (
            filteredOrders.map(order => (
              <Grid item xs={12} md={6} lg={4} key={order._id}>
                <Card sx={{
                  borderRadius: 3,
                  boxShadow: theme.shadows[3],
                  backgroundColor: theme.palette.background.paper,
                  height: '100%', display: 'flex', flexDirection: 'column'
                }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h6" fontWeight={600}>{order.shop?.shopName}</Typography>
                      <Chip label={order.status} color={getStatusChipColor(order.status)} size="small" sx={{ textTransform: 'capitalize' }} />
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                      <PersonIcon color="action" fontSize="small" />
                      <Typography variant="body2">{order.user?.name} ({order.user?.email})</Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                      <PhoneIcon color="action" fontSize="small" /> {/* New: Phone display */}
                      <Typography variant="body2">Phone: {order.user?.phone || 'N/A'}</Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                      <ReceiptLongIcon color="action" fontSize="small" />
                      <Typography variant="body2" fontWeight={500}>Total: Rs.{order.total}</Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationOnIcon fontSize="small" sx={{ mr: 0.5 }} />
                      Location: {order.location}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                      {TIME_SLOT_DISPLAY[order.timeSlot] || order.timeSlot || 'Not Specified'} {/* Updated: Show with time */}
                    </Typography>
                    <Typography variant="subtitle2" fontWeight={600} mb={1}>Items:</Typography>
                    <Stack spacing={0.5}>
                      {order.items.map((item, idx) => (
                        <Typography key={idx} variant="body2">{`${item.name} x${item.qty}`}</Typography>
                      ))}
                    </Stack>
                  </CardContent>
                  <CardActions sx={{ p: 2, bgcolor: theme.palette.background.default }}>
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
