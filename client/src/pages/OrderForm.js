import React, { useState } from 'react';
import axios from 'axios';
import {
  Box, Typography, Button, TextField, MenuItem, Select, InputLabel, FormControl, Grid,
  Paper, List, ListItem, ListItemText, IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const LOCATIONS = ['A', 'B', 'C', 'D'];
const TIME_SLOTS = ['Breakfast', 'Lunch', 'Dinner']; // Time slots

const OrderForm = ({ shop, onOrderPlaced }) => {
  const [location, setLocation] = useState('A');
  const [timeSlot, setTimeSlot] = useState(''); // New time slot state
  const [selectedItem, setSelectedItem] = useState('');
  const [qty, setQty] = useState(1);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Add selected item+qty to order list
  const handleAddItem = () => {
    if (!selectedItem || qty <= 0) return;
    const itemObj = shop.menuItems.find(i => i.name === selectedItem);
    if (!itemObj) return;
    if (orderItems.some(i => i.name === selectedItem)) return;
    setOrderItems([...orderItems, { name: itemObj.name, price: itemObj.price, qty }]);
    setSelectedItem('');
    setQty(1);
  };

  // Remove item from order list
  const handleRemoveItem = (name) => {
    setOrderItems(orderItems.filter(i => i.name !== name));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (orderItems.length === 0 || !timeSlot) { // Time slot required
      alert('Please add at least one item and select a time slot.');
      return;
    }
    setLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      await axios.post('http://localhost:5000/api/orders', {
        shopId: shop._id,
        items: orderItems,
        location,
        timeSlot // Send time slot to backend
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Order placed!');
      if (onOrderPlaced) onOrderPlaced();
      setOrderItems([]);
      setSelectedItem('');
      setQty(1);
      setTimeSlot(''); // Reset time slot
    } catch (err) {
      alert('Order failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 2, mt: 2 }}>
      <form onSubmit={handleSubmit}>
        <Typography variant="h6" gutterBottom>
          Order from {shop.shopName}
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4} md={3}>
            <FormControl sx={{ minWidth: 140 }} size="small" fullWidth>
              <InputLabel id="location-label">Location</InputLabel>
              <Select
                labelId="location-label"
                id="location-select"
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
                id="time-slot-select"
                value={timeSlot}
                label="Time Slot"
                onChange={e => setTimeSlot(e.target.value)}
                required // Required field
              >
                {TIME_SLOTS.map(slot => (
                  <MenuItem key={slot} value={slot}>{slot}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4} md={4}>
            <FormControl sx={{ minWidth: 180 }} size="small" fullWidth>
              <InputLabel id="item-label">Item</InputLabel>
              <Select
                labelId="item-label"
                id="item-select"
                value={selectedItem}
                label="Item"
                onChange={e => setSelectedItem(e.target.value)}
              >
                {shop.menuItems.map(item => (
                  <MenuItem key={item.name} value={item.name}>
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
              inputProps={{ min: 1 }}
              value={qty}
              onChange={e => setQty(Number(e.target.value))}
              sx={{ width: 70 }}
              fullWidth={false}
            />
          </Grid>
          <Grid item xs={4} sm={2} md={1}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddItem}
              sx={{ width: '100%' }}
              disabled={!selectedItem || qty <= 0}
            >
              Add
            </Button>
          </Grid>
        </Grid>
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
                  secondary={`Rs.${item.price} each`}
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
          <Button
            type="submit"
            variant="contained"
            color="success"
            disabled={loading}
          >
            {loading ? 'Placing...' : 'Place Order'}
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default OrderForm;
