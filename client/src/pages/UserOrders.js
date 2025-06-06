import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container, Grid, Typography, Box, List, ListItem, ListItemText, Avatar,
  Accordion, AccordionSummary, AccordionDetails, Snackbar, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Tooltip, Chip, Button
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const getStatusColor = (status) => {
  if (status === 'accepted') return 'success';
  if (status === 'completed') return 'primary';
  if (status === 'rejected' || status === 'cancelled') return 'error';
  return 'default';
};

const getStatusIcon = (status) => {
  if (status === 'completed' || status === 'accepted') return <CheckCircleOutlineIcon color="success" sx={{ mr: 1 }} />;
  if (status === 'rejected' || status === 'cancelled') return <ErrorOutlineIcon color="error" sx={{ mr: 1 }} />;
  return null;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleString();
};

const getShopInitials = (name) => {
  if (!name) return '';
  return name.split(' ').map(word => word[0]).join('').toUpperCase();
};

const canDeleteOrder = (createdAt) => {
  return (new Date() - new Date(createdAt)) > 24 * 60 * 60 * 1000;
};

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, orderId: null });

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = () => {
    setLoading(true);
    const token = sessionStorage.getItem('token');
    axios.get('http://localhost:5000/api/orders/my-orders', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      setOrders(res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))); // newest first
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  const deleteOrder = async (orderId) => {
    const token = sessionStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSnackbar({ open: true, message: 'Order deleted!', severity: 'success' });
      setDeleteDialog({ open: false, orderId: null });
      fetchOrders();
    } catch (err) {
      setSnackbar({ 
        open: true, 
        message: err.response?.data?.msg || "Delete failed", 
        severity: 'error' 
      });
      setDeleteDialog({ open: false, orderId: null });
    }
  };

  // Split orders
  const now = new Date();
  const recentOrders = orders.filter(order => (now - new Date(order.createdAt)) <= 24 * 60 * 60 * 1000);
  const olderOrders = orders.filter(order => (now - new Date(order.createdAt)) > 24 * 60 * 60 * 1000);

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>My Orders</Typography>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" sx={{ minHeight: 200 }}>
          <CircularProgress />
        </Box>
      ) : orders.length === 0 ? (
        <Typography>No orders yet.</Typography>
      ) : (
        <Grid container spacing={3}>
          {/* Recent Orders */}
          {recentOrders.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Recent Orders (Last 24 Hours)</Typography>
              {recentOrders.map(order => (
                <Accordion key={order._id}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box display="flex" alignItems="center" width="100%">
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                        {getShopInitials(order.shop?.shopName)}
                      </Avatar>
                      <Box flexGrow={1}>
                        <Typography variant="h6" sx={{ display: 'inline', mr: 1 }}>
                          {order.shop?.shopName}
                        </Typography>
                        <Chip
                          label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          color={getStatusColor(order.status)}
                          size="small"
                          sx={{ verticalAlign: 'middle' }}
                        />
                      </Box>
                      <Box textAlign="right">
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(order.createdAt)}
                        </Typography>
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box mb={1}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Location: {order.location}
                      </Typography>
                      <Typography variant="subtitle2" color="text.secondary">
                        Order ID: {order._id}
                      </Typography>
                    </Box>
                    {getStatusIcon(order.status)}
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Items:
                    </Typography>
                    <List dense>
                      {order.items.map((item, idx) => (
                        <ListItem key={idx} disablePadding>
                          <ListItemText
                            primary={`${item.name} x${item.qty}`}
                            secondary={`Rs.${item.price} each | Subtotal: Rs.${item.price * item.qty}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                    <Box mt={2}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Total: Rs.{order.total}
                      </Typography>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Grid>
          )}

          {/* Older Orders */}
          {olderOrders.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>Older Orders</Typography>
              {olderOrders.map(order => (
                <Accordion key={order._id}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box display="flex" alignItems="center" width="100%">
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                        {getShopInitials(order.shop?.shopName)}
                      </Avatar>
                      <Box flexGrow={1}>
                        <Typography variant="h6" sx={{ display: 'inline', mr: 1 }}>
                          {order.shop?.shopName}
                        </Typography>
                        <Chip
                          label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          color={getStatusColor(order.status)}
                          size="small"
                          sx={{ verticalAlign: 'middle' }}
                        />
                      </Box>
                      <Box textAlign="right">
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(order.createdAt)}
                        </Typography>
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box mb={1}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Location: {order.location}
                      </Typography>
                      <Typography variant="subtitle2" color="text.secondary">
                        Order ID: {order._id}
                      </Typography>
                    </Box>
                    {getStatusIcon(order.status)}
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Items:
                    </Typography>
                    <List dense>
                      {order.items.map((item, idx) => (
                        <ListItem key={idx} disablePadding>
                          <ListItemText
                            primary={`${item.name} x${item.qty}`}
                            secondary={`Rs.${item.price} each | Subtotal: Rs.${item.price * item.qty}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                    <Box mt={2}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Total: Rs.{order.total}
                      </Typography>
                    </Box>
                    <Box mt={2} textAlign="right">
                      <Tooltip title="Delete Order">
                        <IconButton
                          color="error"
                          onClick={() => setDeleteDialog({ open: true, orderId: order._id })}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Grid>
          )}
        </Grid>
      )}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, orderId: null })}
      >
        <DialogTitle>Delete Order</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to permanently delete this order?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, orderId: null })}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => deleteOrder(deleteDialog.orderId)}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Container>
  );
};

export default UserOrders;
