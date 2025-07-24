// src/pages/UserOrders.js

import React, { useEffect, useState, memo } from 'react';
import axios from 'axios';
import {
  Container, Typography, Box, List, ListItem, ListItemText,
  Snackbar, Alert, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton, Tooltip, Chip, Button, Paper, Divider,
  Tabs, Tab, Skeleton, Fade, Stepper, Step, StepLabel, Stack
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import PendingIcon from '@mui/icons-material/HourglassEmpty';
import StorefrontIcon from '@mui/icons-material/Storefront';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import InfoIcon from '@mui/icons-material/Info';
import SearchIcon from '@mui/icons-material/Search';
import InputBase from '@mui/material/InputBase';
import Collapse from '@mui/material/Collapse';
import { useTheme } from '@mui/material/styles';

const STATUS_STEPS = [
  { key: 'pending', label: 'Pending', icon: <PendingIcon /> },
  { key: 'accepted', label: 'Accepted', icon: <CheckCircleOutlineIcon /> },
  { key: 'completed', label: 'Completed', icon: <CheckCircleOutlineIcon /> },
  { key: 'rejected', label: 'Rejected', icon: <ErrorOutlineIcon /> },
  { key: 'cancelled', label: 'Cancelled', icon: <ErrorOutlineIcon /> },
  { key: 'expired', label: 'Expired', icon: <ErrorOutlineIcon /> }
];

const getStepperStep = (status) => {
  return {
    'pending': 0,
    'accepted': 1,
    'completed': 2,
    'rejected': 3,
    'cancelled': 4,
    'expired': 5
  }[status] || 0;
};

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
  const stepIndex = getStepperStep(order.status);

  // Highlight for rejected/cancelled
  const isBad = ['rejected', 'cancelled', 'expired'].includes(order.status);

  return (
    <Paper
      elevation={6}
      sx={{
        p: { xs: 2, sm: 3 },
        mb: 4,
        borderRadius: 4,
        position: "relative",
        background: isBad
          ? `linear-gradient(120deg,${theme.palette.error.light}11,${theme.palette.background.paper} 80%)`
          : theme.palette.background.paper,
        ...(isBad && { borderLeft: `5px solid ${theme.palette.error.main}` }),
        transition: "background 0.2s"
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <StorefrontIcon sx={{ mr: 1, color: "text.secondary", fontSize: 36 }} />
          <Typography variant="h6" fontWeight={700} noWrap>
            {order.shop?.shopName || "N/A"}
          </Typography>
        </Box>
        <Chip
          icon={icon}
          label={label}
          color={color}
          size="medium"
          sx={{
            cursor: "default",
            px: 2,
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: 1,
            ...(isBad && { border: `1.5px solid ${theme.palette.error.main}` })
          }}
        />
      </Stack>
      <Box sx={{ display: "flex", alignItems: "center", mt: 1, mb: 2 }}>
        <CalendarTodayIcon sx={{ mr: 1, fontSize: "small", color: "text.secondary" }} />
        <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
          {formatDate(order.createdAt)}
        </Typography>
        <Typography variant="h6" color="primary.main">
          Total: Rs. {order.total.toFixed(2)}
        </Typography>
      </Box>
      {/* Step Progress with Tooltips */}
      <Stepper
        activeStep={stepIndex < 3 ? stepIndex : 3}
        alternativeLabel
        sx={{ mb: 1.5 }}
      >
        {STATUS_STEPS.slice(0, 4).map((step, i) => (
          <Step key={step.key} completed={stepIndex > i}>
            <StepLabel
              icon={step.icon}
              optional={
                stepIndex === i ? (
                  <Tooltip title={label}>
                    <InfoIcon color={color !== "default" ? color : "action"} />
                  </Tooltip>
                ) : null
              }
            >
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {step.label}
              </Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>
      <Divider />
      <Button
        variant="text"
        size="small"
        onClick={() => setIsExpanded(!isExpanded)}
        sx={{
          mt: 2,
          textTransform: "uppercase",
          color: "primary.main",
          p: 0,
          fontWeight: 700,
          letterSpacing: 1,
        }}
      >
        {isExpanded ? "Hide Items" : "View Items"}
      </Button>
      <Collapse in={isExpanded}>
        <Fade in={isExpanded} timeout={300}>
          <Box sx={{ borderTop: `1px solid ${theme.palette.divider}`, pt: 2, mt: 2 }}>
            <List dense disablePadding>
              {order.items.map((item, idx) => (
                <ListItem key={idx} disableGutters>
                  <ListItemText
                    primary={item.name}
                    secondary={`Qty: ${item.qty} | Rs. ${item.price.toFixed(2)} each`}
                  />
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                    Rs. {(item.qty * item.price).toFixed(2)}
                  </Typography>
                </ListItem>
              ))}
            </List>
          </Box>
        </Fade>
      </Collapse>
      {/* Cancel/Delete Actions */}
      <Box mt={2} sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
        {order.status === "pending" && onCancelClick ? (
          <Tooltip title="Cancel this order">
            <Button
              color="error"
              variant="outlined"
              size="small"
              onClick={() => onCancelClick(order._id)}
              aria-label="Cancel order"
              sx={{ borderRadius: 40, px: 2 }}
            >
              Cancel
            </Button>
          </Tooltip>
        ) : null}
        {canDelete && onDeleteClick ? (
          <Tooltip title="Delete this order permanently">
            <IconButton
              color="error"
              onClick={() => onDeleteClick(order._id)}
              size="small"
              aria-label="Delete order"
              sx={{ borderRadius: 40 }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        ) : null}
      </Box>
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
  const [search, setSearch] = useState('');

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = () => {
    setLoading(true);
    const token = sessionStorage.getItem('token');
    if (!token) {
      setSnackbar({ open: true, message: 'No token found. Please login.', severity: 'error' });
      setLoading(false);
      return;
    }
    axios.get('http://localhost:5000/api/orders/my-orders', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { setOrders(res.data || []); })
      .catch(() => {
        setSnackbar({ open: true, message: 'Failed to fetch orders.', severity: 'error' });
      })
      .finally(() => setLoading(false));
  };

  const deleteOrder = async (orderId) => {
    const token = sessionStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/api/orders/${orderId}`, { headers: { Authorization: `Bearer ${token}` } });
      setSnackbar({ open: true, message: 'Order deleted!', severity: 'success' });
      fetchOrders();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.msg || "Delete failed", severity: 'error' });
    } finally { setDeleteDialog({ open: false, orderId: null }); }
  };

  const cancelOrder = async (orderId) => {
    const token = sessionStorage.getItem('token');
    try {
      await axios.patch(`http://localhost:5000/api/orders/${orderId}/cancel`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setSnackbar({ open: true, message: 'Order cancelled!', severity: 'success' });
      fetchOrders();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.msg || "Cancel failed", severity: 'error' });
    } finally { setCancelDialog({ open: false, orderId: null }); }
  };

  // Filter and sort orders with search bar
  const filteredOrders = orders
    .filter(o =>
      o.shop?.shopName?.toLowerCase().includes(search.toLowerCase()) || o.items?.some(i => i.name?.toLowerCase().includes(search.toLowerCase()))
    );
  const now = new Date();
  const recentOrders = filteredOrders.filter(order => (now - new Date(order.createdAt)) <= 24 * 60 * 60 * 1000).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const olderOrders = filteredOrders.filter(order => (now - new Date(order.createdAt)) > 24 * 60 * 60 * 1000).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const handleTabChange = (event, newValue) => setTabIndex(newValue);

  // Stats summary for orders
  const total = orders.length;
  const countByStatus = (status) => orders.filter(o => o.status === status).length;

  const renderSkeleton = () => (
    <>
      {[...Array(2)].map((_, idx) => (
        <Skeleton key={idx} variant="rectangular" height={180} sx={{ mb: 3, borderRadius: '13px' }} />
      ))}
    </>
  );

  // Empty state with image
  const renderEmptyState = (message) => (
    <Box textAlign="center" mt={5} p={3} sx={{ backgroundColor: theme.palette.background.paper, borderRadius: '13px' }}>
      <img
        src="https://assets9.lottiefiles.com/packages/lf20_qh5z2fdq.json.gif"
        alt="No orders"
        width={90}
        style={{ marginBottom: 12, filter: theme.palette.mode === "dark" ? "brightness(0.90)" : "none" }}
        onError={e => (e.target.style.display = "none")}
      />
      <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>{message}</Typography>
      <Typography variant="body2" color="text.secondary">Your orders will appear here after booking.</Typography>
    </Box>
  );

  return (
    <Box sx={{ bgcolor: theme.palette.background.default, minHeight: '100vh', py: { xs: 2, md: 4 } }}>
      <Container maxWidth="md">
        <Typography variant="h4" gutterBottom fontWeight="700" color="primary.main" align="center">
          My Orders
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 1 }}>
          Track your current and past orders, by shop and date.
        </Typography>
        {/* Order Stats Row */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <Chip icon={<CheckCircleOutlineIcon />} color="success" label={`Completed: ${countByStatus('completed')}`} sx={{ fontWeight:700 }}/>
          <Chip icon={<PendingIcon />} color="warning" label={`Pending: ${countByStatus('pending')}`} sx={{ fontWeight:700 }}/>
          <Chip icon={<ErrorOutlineIcon />} color="error" label={`Rejected/Cancelled: ${countByStatus('rejected')+countByStatus('cancelled')+countByStatus('expired')}`} sx={{ fontWeight:700 }}/>
          <Chip label={`Total: ${total}`} sx={{ fontWeight:700 }}/>
        </Box>
        {/* Search Orders */}
        <Paper
          sx={{
            mb: 4,
            p: '2px 8px',
            display: 'flex',
            alignItems: 'center',
            width: { xs: '100%', sm: 400 },
            mx: 'auto',
            borderRadius: 3,
            bgcolor: theme.palette.action.hover,
            boxShadow: theme.shadows[1]
          }}
        >
          <SearchIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="Search orders by shop/item..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="search orders"
          />
        </Paper>

        <Paper elevation={1} sx={{ mb: 3 }}>
          <Tabs value={tabIndex} onChange={handleTabChange} centered variant="fullWidth" indicatorColor="primary">
            <Tab label="Recent" />
            <Tab label="Past" />
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
