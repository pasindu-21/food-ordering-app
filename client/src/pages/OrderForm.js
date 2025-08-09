// components/OrderForm.jsx - Updated with selective quantity display
import React, { useState } from 'react';
import axios from 'axios';
import {
  Box, Typography, Button, TextField, MenuItem, Select, InputLabel, FormControl, Grid,
  Paper, List, ListItem, ListItemText, IconButton, Alert, Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import FreeBreakfastIcon from '@mui/icons-material/FreeBreakfast';
import LunchDiningIcon from '@mui/icons-material/LunchDining';
import DinnerDiningIcon from '@mui/icons-material/DinnerDining';

const LOCATIONS = ['Coral beauty', 'Silvertips', 'Cattelya', 'Blue sapphire'];
const TIME_SLOTS = [
  { value: 'Breakfast', label: 'Breakfast - 8.00 A.M' },
  { value: 'Lunch', label: 'Lunch - 12.00 P.M' },
  { value: 'Dinner', label: 'Dinner - 8.00 P.M' }
];

const OrderForm = ({ shop, onOrderPlaced }) => {
  const [location, setLocation] = useState('A');
  const [timeSlot, setTimeSlot] = useState('');
  const [selectedItem, setSelectedItem] = useState('');
  const [qty, setQty] = useState(1);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Helper function to get available quantity based on time slot
  const getAvailableQuantity = (item, timeSlot) => {
    switch(timeSlot) {
      case 'Breakfast': return item.availableBreakfastQty || 0;
      case 'Lunch': return item.availableLunchQty || 0;
      case 'Dinner': return item.availableDinnerQty || 0;
      default: return 0;
    }
  };

  // Filter available items based on selected time slot
  const getAvailableItems = () => {
    if (!timeSlot) return shop.menuItems || [];
    
    return (shop.menuItems || []).filter(item => {
      const availableQty = getAvailableQuantity(item, timeSlot);
      return availableQty > 0;
    });
  };

  // Get the selected item object
  const getSelectedItemObj = () => {
    if (!selectedItem) return null;
    return shop.menuItems.find(i => i.name === selectedItem);
  };

  const handleAddItem = () => {
    if (!selectedItem || !timeSlot || qty <= 0) {
      setError('Please select item, time slot and valid quantity.');
      return;
    }

    const itemObj = shop.menuItems.find(i => i.name === selectedItem);
    if (!itemObj) return;

    const availableQty = getAvailableQuantity(itemObj, timeSlot);
    if (qty > availableQty) {
      setError(`Only ${availableQty} items available for ${timeSlot}.`);
      return;
    }

    if (orderItems.some(i => i.name === selectedItem)) {
      setError('Item already added to order.');
      return;
    }

    setOrderItems([...orderItems, { 
      name: itemObj.name, 
      price: itemObj.price, 
      qty,
      availableQty 
    }]);
    setSelectedItem('');
    setQty(1);
    setError('');
  };

  const handleRemoveItem = (name) => {
    setOrderItems(orderItems.filter(i => i.name !== name));
  };

  const handleTimeSlotChange = (newTimeSlot) => {
    setTimeSlot(newTimeSlot);
    setSelectedItem(''); // Reset selected item when time slot changes
    setOrderItems([]); // Clear order items when changing time slot
    setError('');
  };

  const handleItemChange = (itemName) => {
    setSelectedItem(itemName);
    setQty(1); // Reset quantity when item changes
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (orderItems.length === 0) {
      setError('Please add at least one item.');
      return;
    }
    if (!timeSlot) {
      setError('Please select a time slot.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/orders', {
        shopId: shop._id,
        items: orderItems,
        location,
        timeSlot
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Order placed successfully! Quantities have been updated.');
      if (onOrderPlaced) onOrderPlaced();
      
      // Reset form
      setOrderItems([]);
      setSelectedItem('');
      setQty(1);
      setTimeSlot('');
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const availableItems = getAvailableItems();
  const selectedItemObj = getSelectedItemObj();

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 2, mt: 2 }}>
      <form onSubmit={handleSubmit}>
        <Typography variant="h6" gutterBottom>
          Order from {shop.shopName}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4} md={3}>
            <FormControl sx={{ minWidth: 140 }} size="small" fullWidth>
              <InputLabel id="location-label">Location</InputLabel>
              <Select
                labelId="location-label"
                value={location}
                label="Location"
                onChange={e => setLocation(e.target.value)}
              >
                {LOCATIONS.map(loc => (
                  <MenuItem key={loc} value={loc}>{loc}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4} md={3}>
            <FormControl sx={{ minWidth: 140 }} size="small" fullWidth>
              <InputLabel id="time-slot-label">Time Slot</InputLabel>
              <Select
                labelId="time-slot-label"
                value={timeSlot}
                label="Time Slot"
                onChange={e => handleTimeSlotChange(e.target.value)}
                required
              >
                {TIME_SLOTS.map(slot => (
                  <MenuItem key={slot.value} value={slot.value}>
                    {slot.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4} md={4}>
            <FormControl sx={{ minWidth: 180 }} size="small" fullWidth disabled={!timeSlot}>
              <InputLabel id="item-label">Item</InputLabel>
              <Select
                labelId="item-label"
                value={selectedItem}
                label="Item"
                onChange={e => handleItemChange(e.target.value)}
              >
                {availableItems.map(item => (
                  <MenuItem key={item._id} value={item.name}>
                    {item.name} (Rs.{item.price})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={8} sm={2} md={2}>
            <TextField
              label="Qty"
              type="number"
              size="small"
              inputProps={{ 
                min: 1, 
                max: selectedItemObj ? getAvailableQuantity(selectedItemObj, timeSlot) : 1 
              }}
              value={qty}
              onChange={e => setQty(Number(e.target.value))}
              sx={{ width: 70 }}
              disabled={!selectedItem}
            />
          </Grid>

          <Grid item xs={4} sm={2} md={1}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddItem}
              sx={{ width: '100%' }}
              disabled={!selectedItem || !timeSlot || qty <= 0}
            >
              Add
            </Button>
          </Grid>
        </Grid>

        {/* Show available quantity only for selected item */}
        {selectedItem && timeSlot && selectedItemObj && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'success.50', borderRadius: 1, border: '1px solid', borderColor: 'success.200' }}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="subtitle2" color="success.main">
                Available for {selectedItem}:
              </Typography>
              <Chip
                label={`${getAvailableQuantity(selectedItemObj, timeSlot)} items`}
                color="success"
                variant="filled"
                size="small"
                sx={{ fontWeight: 'bold' }}
              />
              <Typography variant="caption" color="text.secondary">
                at {timeSlot}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Show message when no items available for time slot */}
        {timeSlot && availableItems.length === 0 && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'warning.50', borderRadius: 1, border: '1px solid', borderColor: 'warning.200' }}>
            <Typography variant="body2" color="warning.main">
              No items are available for {timeSlot}. Please select a different time slot.
            </Typography>
          </Box>
        )}

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1">Order Items:</Typography>
          <List dense>
            {orderItems.map(item => (
              <ListItem
                key={item.name}
                secondaryAction={
                  <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveItem(item.name)}>
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={`${item.name} x${item.qty}`}
                  secondary={`Rs.${item.price} each - Total: Rs.${item.price * item.qty}`}
                />
              </ListItem>
            ))}
            {orderItems.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                No items added yet.
              </Typography>
            )}
          </List>
        </Box>

        <Box sx={{ mt: 2, textAlign: 'right' }}>
          <Typography variant="h6" gutterBottom>
            Total: Rs.{orderItems.reduce((sum, item) => sum + (item.price * item.qty), 0)}
          </Typography>
          <Button
            type="submit"
            variant="contained"
            color="success"
            disabled={loading || orderItems.length === 0}
          >
            {loading ? 'Placing...' : 'Place Order'}
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default OrderForm;
