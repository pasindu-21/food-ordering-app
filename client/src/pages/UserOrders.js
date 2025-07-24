// src/pages/UserOrders.js

import React, { useEffect, useState, memo } from 'react';
import axios from 'axios';
import {
  Container, Typography, Box, List, ListItem, ListItemText,
  Snackbar, Alert, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton, Tooltip, Chip, Button, Paper, Divider,
  Tabs, Tab, Skeleton, Fade
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import PendingIcon from '@mui/icons-material/HourglassEmpty';
import StorefrontIcon from '@mui/icons-material/Storefront';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import InfoIcon from '@mui/icons-material/Info';
import { useTheme } from '@mui/material/styles';

const getStatusProps = (status) => {
  switch (status) {
    case 'completed': return { label: 'Completed', color: 'success', icon: <CheckCircleOutlineIcon fontSize="inherit" /> };
    case 'accepted': return { label: 'Accepted', color: 'warning', icon: <CheckCircleOutlineIcon fontSize="inherit" /> };
    case 'rejected': return { label: 'Rejected', color: 'error', icon: <ErrorOutlineIcon fontSize="inherit" /> };
    case 'cancelled': return { label: 'Cancelled', color: 'error', icon: <ErrorOutlineIcon fontSize="inherit" /> };
    case 'expired': return { label: 'Expired', color: 'default', icon: <ErrorOutlineIcon fontSize="inherit" /> };
    default: return { label: 'Pending', color: 'warning', icon: <PendingIcon fontSize="inherit" /> };
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Invalid Date';
  return date.toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} id={`order-tabpanel-${index}`} aria-labelledby={`order-tab-${index}`} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const MemoizedOrderCard = memo(({ order, onDeleteClick, onCancelClick, canDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const theme = useTheme();
  const { label, color, icon } = getStatusProps(order.status);

  return (
    <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <StorefrontIcon sx={{ mr: 1, color: 'text.secondary' }} />
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {order.shop?.shopName || 'N/A'}
        </Typography>
        <Chip
          icon={icon}
          label={label}
          color={color}
          size="small"
          sx={{ cursor: 'default' }}
        />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <CalendarTodayIcon sx={{ mr: 1, fontSize: 'small', color: 'text.secondary' }} />
        <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
          {formatDate(order.createdAt)}
        </Typography>
        <Typography variant="h6" color="primary">
          Total: Rs. {order.total.toFixed(2)}
        </Typography>
      </Box>

      <Divider />

      <Button
        variant="text"
        size="small"
        onClick={() => setIsExpanded(!isExpanded)}
        sx={{ mt: 2, textTransform: 'uppercase', color: 'primary.main', p: 0 }}
      >
        {isExpanded ? 'Hide Items' : 'View Items'}
      </Button>

      {isExpanded && (
        <Fade in={isExpanded} timeout={300}>
          <Box sx={{ borderTop: `1px solid ${theme.palette.divider}`, pt: 2, mt: 2 }}>
            <List dense disablePadding>
              {order.items.map((item, index) => (
                <ListItem key={index} disableGutters>
                  <ListItemText
                    primary={item.name}
                    secondary={`Qty: ${item.qty} | Rs. ${item.price.toFixed(2)} each`}
                  />
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    Rs. {(item.qty * item.price).toFixed(2)}
                  </Typography>
                </ListItem>
              ))}
            </List>
          </Box>
        </Fade>
      )}

      {order.status === 'pending' && onCancelClick && (
        <Box mt={2} textAlign="right">
          <Tooltip title="Cancel this order">
            <Button color="error" variant="outlined" size="small" onClick={() => onCancelClick(order._id)} aria-label="Cancel order">Cancel</Button>
          </Tooltip>
        </Box>
      )}
      {canDelete && onDeleteClick && (
        <Box mt={2} textAlign="right">
          <Tooltip title="Delete this order permanently">
            <IconButton color="error" onClick={() => onDeleteClick(order._id)} size="small" aria-label="Delete order"><DeleteIcon /></IconButton>
          </Tooltip>
        </Box>
      )}
    </Paper>
  );
});

const UserOrders = () => {
  const theme = useTheme();
  const [orders, setOrders] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, orderId: null });
  const [cancelDialog, setCancelDialog] = useState({ open: false, orderId: null });
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    // *** මෙතන තමයි FIX එක ***
    // setIsLoading -> setLoading
    setLoading(true);
    const token = sessionStorage.getItem('token');
    if (!token) {
      setSnackbar({ open: true, message: 'No token found. Please login.', severity: 'error' });
      setLoading(false);
      return;
    }
    axios.get('http://localhost:5000/api/orders/my-orders', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { setOrders(res.data || []); })
      .catch((err) => {
        setSnackbar({ open: true, message: 'Failed to fetch orders.', severity: 'error' });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const deleteOrder = async (orderId) => {
    const token = sessionStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/api/orders/${orderId}`, { headers: { Authorization: `Bearer ${token}` } });
      setSnackbar({ open: true, message: 'Order deleted!', severity: 'success' });
      fetchOrders();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.msg || "Delete failed", severity: 'error' });
    } finally {
      setDeleteDialog({ open: false, orderId: null });
    }
  };

  const cancelOrder = async (orderId) => {
    const token = sessionStorage.getItem('token');
    try {
      await axios.patch(`http://localhost:5000/api/orders/${orderId}/cancel`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setSnackbar({ open: true, message: 'Order cancelled!', severity: 'success' });
      fetchOrders();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.msg || "Cancel failed", severity: 'error' });
    } finally {
      setCancelDialog({ open: false, orderId: null });
    }
  };

  const now = new Date();
  const recentOrders = orders.filter(order => (now - new Date(order.createdAt)) <= 24 * 60 * 60 * 1000).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const olderOrders = orders.filter(order => (now - new Date(order.createdAt)) > 24 * 60 * 60 * 1000).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const handleTabChange = (event, newValue) => { setTabIndex(newValue); };

  const renderSkeleton = () => (
    <>
      {[...Array(3)].map((_, index) => (
        <Skeleton key={index} variant="rectangular" height={150} sx={{ mb: 3, borderRadius: '12px' }} />
      ))}
    </>
  );

  const renderEmptyState = (message) => (
    <Box textAlign="center" mt={5} p={3} sx={{ backgroundColor: theme.palette.background.paper, borderRadius: '12px' }}>
      <InfoIcon color="action" sx={{ fontSize: 48, mb: 2 }} />
      <Typography variant="h6" color="text.secondary">{message}</Typography>
    </Box>
  );

  return (
    <Box sx={{ bgcolor: theme.palette.background.default, minHeight: '100vh', py: { xs: 2, md: 4 } }}>
      <Container maxWidth="md">
        <Typography variant="h4" gutterBottom fontWeight="700" color="primary.main" align="center">
          My Orders
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Track the status of your recent and past orders.
        </Typography>

        <Paper elevation={1} sx={{ mb: 3 }}>
          <Tabs value={tabIndex} onChange={handleTabChange} centered variant="fullWidth" indicatorColor="primary">
            <Tab label={`Recent (${recentOrders.length})`} />
            <Tab label={`Past (${olderOrders.length})`} />
          </Tabs>
        </Paper>

        {loading ? (
          renderSkeleton()
        ) : (
          <>
            <TabPanel value={tabIndex} index={0}>
              {recentOrders.length > 0 ? (
                recentOrders.map(order => (
                  <MemoizedOrderCard
                    key={order._id}
                    order={order}
                    onCancelClick={(id) => setCancelDialog({ open: true, orderId: id })}
                    canDelete={false}
                  />
                ))
              ) : (
                renderEmptyState("No orders in the last 24 hours.")
              )}
            </TabPanel>
            <TabPanel value={tabIndex} index={1}>
              {olderOrders.length > 0 ? (
                olderOrders.map(order => (
                  <MemoizedOrderCard
                    key={order._id}
                    order={order}
                    onDeleteClick={(id) => setDeleteDialog({ open: true, orderId: id })}
                    canDelete={true}
                  />
                ))
              ) : (
                renderEmptyState("You have no past orders.")
              )}
            </TabPanel>
          </>
        )}

        {/* Dialogs & Snackbar */}
        <Dialog open={cancelDialog.open} onClose={() => setCancelDialog({ open: false, orderId: null })} TransitionComponent={Fade}>
          <DialogTitle>Confirm Cancel</DialogTitle>
          <DialogContent><Typography>Are you sure you want to cancel this order?</Typography></DialogContent>
          <DialogActions>
            <Button onClick={() => setCancelDialog({ open: false, orderId: null })}>No</Button>
            <Button color="error" variant="contained" onClick={() => cancelOrder(cancelDialog.orderId)}>Yes, Cancel</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, orderId: null })} TransitionComponent={Fade}>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent><Typography>Are you sure you want to permanently delete this order?</Typography></DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog({ open: false, orderId: null })}>Cancel</Button>
            <Button color="error" variant="contained" onClick={() => deleteOrder(deleteDialog.orderId)}>Delete</Button>
          </DialogActions>
        </Dialog>

        {snackbar.message && (
          <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} TransitionComponent={Fade}>
            <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>{snackbar.message}</Alert>
          </Snackbar>
        )}
      </Container>
    </Box>
  );
};

export default UserOrders;
