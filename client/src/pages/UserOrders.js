// src/pages/UserOrders.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container, Grid, Typography, Box, List, ListItem, ListItemText, Avatar,
  Snackbar, Alert, CircularProgress, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton, Tooltip, Chip, Button, Card, CardContent, Divider,
  Tabs, Tab
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import PendingIcon from '@mui/icons-material/HourglassEmpty';
import StorefrontIcon from '@mui/icons-material/Storefront';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

// Helper function for status visualization
const getStatusProps = (status) => {
  switch (status) {
    case 'completed': return { label: 'Completed', color: 'success', icon: <CheckCircleOutlineIcon /> };
    case 'accepted': return { label: 'Accepted', color: 'info', icon: <CheckCircleOutlineIcon /> };
    case 'rejected': case 'cancelled': return { label: 'Rejected', color: 'error', icon: <ErrorOutlineIcon /> };
    case 'expired': return { label: 'Expired', color: 'default', icon: <ErrorOutlineIcon /> };
    default: return { label: 'Pending', color: 'warning', icon: <PendingIcon /> };
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

// TabPanel helper component
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} id={`order-tabpanel-${index}`} aria-labelledby={`order-tab-${index}`} {...other}>
      {value === index && (<Box sx={{ pt: 3 }}>{children}</Box>)}
    </div>
  );
}

// Reusable Order Card Component
const OrderCard = ({ order, onDeleteClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const statusProps = getStatusProps(order.status);
  return (
    <Card sx={{ mb: 2, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}><Box display="flex" alignItems="center"><Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}><StorefrontIcon /></Avatar><Box><Typography variant="h6" fontWeight="600">{order.shop?.shopName || 'N/A'}</Typography><Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><CalendarTodayIcon fontSize="inherit" /> {formatDate(order.createdAt)}</Typography></Box></Box></Grid>
          <Grid item xs={12} md={6} textAlign={{ xs: 'left', md: 'right' }}>
            {/* <<<<---- BUG FIX: Added onClick to the Chip ---->>>> */}
            <Chip onClick={() => {}} icon={statusProps.icon} label={statusProps.label} color={statusProps.color} size="small" sx={{ mb: 1, textTransform: 'capitalize', fontWeight: 500 }} />
            <Typography variant="h6" fontWeight="600">Total: Rs. {order.total.toFixed(2)}</Typography>
          </Grid>
        </Grid>
        <Divider sx={{ my: 2 }} />
        <Box><Button size="small" onClick={() => setIsExpanded(!isExpanded)}>{isExpanded ? 'Hide Items' : 'View Items'}</Button>{isExpanded && (<List dense sx={{ mt: 1, border: '1px solid #eee', borderRadius: 2, p: 1 }}>{order.items.map((item, idx) => (<ListItem key={idx} disablePadding><ListItemText primary={item.name} secondary={`Qty: ${item.qty} | Rs. ${item.price} each`} /><Typography variant="body2" fontWeight="500">Rs. {(item.price * item.qty).toFixed(2)}</Typography></ListItem>))}</List>)}</Box>
        {(new Date() - new Date(order.createdAt)) > 24 * 60 * 60 * 1000 && (<Box mt={2} textAlign="right"><Tooltip title="Delete this order permanently"><IconButton color="error" onClick={() => onDeleteClick(order._id)} size="small"><DeleteIcon /></IconButton></Tooltip></Box>)}
      </CardContent>
    </Card>
  );
};

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, orderId: null });
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = () => {
    setLoading(true);
    const token = sessionStorage.getItem('token');
    axios.get('http://localhost:5000/api/orders/my-orders', { headers: { Authorization: `Bearer ${token}` }})
      .then(res => { setOrders(res.data); setLoading(false); })
      .catch(() => { setSnackbar({ open: true, message: 'Failed to fetch orders', severity: 'error' }); setLoading(false); });
  };

  const deleteOrder = async (orderId) => {
    const token = sessionStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/api/orders/${orderId}`, { headers: { Authorization: `Bearer ${token}` }});
      setSnackbar({ open: true, message: 'Order deleted!', severity: 'success' });
      fetchOrders();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.msg || "Delete failed", severity: 'error' });
    } finally {
      setDeleteDialog({ open: false, orderId: null });
    }
  };

  const now = new Date();
  const recentOrders = orders.filter(order => (now - new Date(order.createdAt)) <= 24 * 60 * 60 * 1000).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const olderOrders = orders.filter(order => (now - new Date(order.createdAt)) > 24 * 60 * 60 * 1000).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const handleTabChange = (event, newValue) => { setTabIndex(newValue); };

  return (
    <Box sx={{ bgcolor: '#f4f6f8', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="md">
        <Typography variant="h4" gutterBottom fontWeight="700" color="primary.main" align="center">My Orders</Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
          Track the status of your recent and past orders.
        </Typography>
        {loading ? (<Box display="flex" justifyContent="center" mt={5}><CircularProgress /></Box>) : orders.length === 0 ? (<Typography align="center" mt={5}>You haven't placed any orders yet.</Typography>) : (
          <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabIndex} onChange={handleTabChange} aria-label="order tabs" centered>
                <Tab label={`Recent Orders (${recentOrders.length})`} id="order-tab-0" />
                <Tab label={`Past Orders (${olderOrders.length})`} id="order-tab-1" />
              </Tabs>
            </Box>
            <TabPanel value={tabIndex} index={0}>
              {recentOrders.length > 0 ? (recentOrders.map(order => <OrderCard key={order._id} order={order} onDeleteClick={(id) => setDeleteDialog({ open: true, orderId: id })} />)) : (<Typography align="center" mt={4} color="text.secondary">No orders in the last 24 hours.</Typography>)}
            </TabPanel>
            <TabPanel value={tabIndex} index={1}>
              {olderOrders.length > 0 ? (olderOrders.map(order => <OrderCard key={order._id} order={order} onDeleteClick={(id) => setDeleteDialog({ open: true, orderId: id })} />)) : (<Typography align="center" mt={4} color="text.secondary">You have no past orders.</Typography>)}
            </TabPanel>
          </Box>
        )}
        <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, orderId: null })}>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent><Typography>Are you sure you want to permanently delete this order? This action cannot be undone.</Typography></DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog({ open: false, orderId: null })}>Cancel</Button>
            <Button color="error" variant="contained" onClick={() => deleteOrder(deleteDialog.orderId)}>Delete</Button>
          </DialogActions>
        </Dialog>
        <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}><Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert></Snackbar>
      </Container>
    </Box>
  );
};

export default UserOrders;
