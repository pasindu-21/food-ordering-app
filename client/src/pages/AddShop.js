import React, { useState } from 'react';
import axios from 'axios';
import {
  Box, Paper, Typography, TextField, IconButton, Stack, Divider, Alert,
  Button, Stepper, Step, StepLabel, Fade, useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';

const steps = ['Shop Details', 'Menu Items', 'Review & Submit'];

const AddShop = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeStep, setActiveStep] = useState(0);

  const [shopName, setShopName] = useState('');
  const [menuItems, setMenuItems] = useState([
    { name: '', price: '', breakfastQty: '', lunchQty: '', dinnerQty: '' }
  ]);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState({ type: '', message: '' });

  const nextStep = () => setActiveStep((s) => Math.min(s + 1, steps.length - 1));
  const prevStep = () => setActiveStep((s) => Math.max(s - 1, 0));

  // Validation
  const validateStep = () => {
    let errorBag = {};
    if (activeStep === 0) {
      if (!shopName.trim() || shopName.length < 3)
        errorBag.shopName = 'Enter at least 3 characters for the shop name.';
    }
    if (activeStep === 1) {
      menuItems.forEach((item, i) => {
        if (!item.name.trim()) errorBag[`itemName${i}`] = 'Name required';
        if (!item.price || parseFloat(item.price) <= 0) errorBag[`itemPrice${i}`] = 'Valid price required';
      });
    }
    setErrors(errorBag);
    return Object.keys(errorBag).length === 0;
  };

  const handleAddItem = () =>
    setMenuItems([...menuItems, { name: '', price: '', breakfastQty: '', lunchQty: '', dinnerQty: '' }]);

  const handleRemoveItem = (idx) => {
    if (menuItems.length === 1) return;
    setMenuItems(menuItems.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx, field, val) => {
    setMenuItems(menuItems.map((item, i) => i === idx ? { ...item, [field]: val } : item));
    setErrors((prev) => ({ ...prev, [`item${field.charAt(0).toUpperCase() + field.slice(1)}${idx}`]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ type: '', message: '' });
    if (!validateStep()) return;

    try {
      const token = sessionStorage.getItem('token');
      await axios.post('http://localhost:5000/api/shops', {
        shopName,
        menuItems: menuItems.map(({ name, price, ...qtys }) => ({
          name, price: Number(price), ...Object.fromEntries(Object.entries(qtys).map(([k, v]) => [k, Number(v || 0)]))
        }))
      }, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      setAlert({ type: 'success', message: 'Shop successfuly Create!' });
      setActiveStep(2);
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.msg || 'Failed to add shop.' });
    }
  };

  return (
    <Box minHeight="100vh" py={isMobile ? 2 : 6} px={isMobile ? 1 : 0}
         sx={{ bgcolor: isDark ? 'background.default' : '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.3s' }}>
      <Paper elevation={10} sx={{
        maxWidth: 580,
        width: '100%',
        p: { xs: 2, sm: 4 },
        borderRadius: 5,
        bgcolor: isDark ? 'background.paper' : '#fff',
        boxShadow: isDark ? '0 4px 32px #171f2a88' : '0 4px 32px #90caf988'
      }}>
        <Stack spacing={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <RestaurantMenuIcon color="primary" sx={{ fontSize: 33 }} />
            <Typography variant="h5" fontWeight={800} fontFamily="'Poppins', sans-serif">
              Add New Shop
            </Typography>
          </Box>

          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
            {steps.map(label => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {alert.message && (
            <Fade in><Alert severity={alert.type}>{alert.message}</Alert></Fade>
          )}

          <form onSubmit={handleSubmit} autoComplete="off">
            {activeStep === 0 && (
              <Fade in>
                <Stack spacing={2}>
                  <TextField
                    label="Shop Name"
                    value={shopName}
                    onChange={e => setShopName(e.target.value)}
                    required
                    inputProps={{ style: { fontSize: 18 } }}
                    error={!!errors.shopName}
                    helperText={errors.shopName}
                    fullWidth
                    InputLabelProps={{ style: { fontWeight: 600 } }}
                    variant="outlined"
                  />
                  <Button type="button" variant="contained" color="primary"
                          size="large"
                          sx={{ fontWeight: 700, mt: 1, py: 2, borderRadius: 3 }}
                          onClick={() => validateStep() && nextStep()}>
                    Next
                  </Button>
                </Stack>
              </Fade>
            )}

            {activeStep === 1 && (
              <Fade in>
                <Stack spacing={2}>
                  {menuItems.map((item, idx) => (
                    <Paper key={idx} sx={{
                      p: 2,
                      bgcolor: isDark ? 'grey.900' : 'grey.100',
                      borderRadius: 2,
                      border: errors[`itemName${idx}`] || errors[`itemPrice${idx}`] ? '2px solid #f4433640' : '2px solid transparent',
                      transition: 'border 0.15s'
                    }}>
                      <Stack direction="row" gap={1} alignItems="center" justifyContent="space-between">
                        <TextField label="Food Name" value={item.name}
                                   onChange={e => handleItemChange(idx, 'name', e.target.value)}
                                   required
                                   error={!!errors[`itemName${idx}`]}
                                   helperText={errors[`itemName${idx}`]}
                                   size="small"
                                   sx={{ flex: 2 }}
                                   InputLabelProps={{ style: { fontWeight: 600 } }}
                                   variant="outlined"
                        />
                        <TextField label="Price" type="number" inputProps={{ min: 1 }}
                                   value={item.price}
                                   onChange={e => handleItemChange(idx, 'price', e.target.value)}
                                   required
                                   error={!!errors[`itemPrice${idx}`]}
                                   helperText={errors[`itemPrice${idx}`]}
                                   size="small"
                                   sx={{ flex: 1 }}
                                   variant="outlined"
                        />
                        <IconButton aria-label="Remove menu item" color="error"
                                    onClick={() => handleRemoveItem(idx)}
                                    disabled={menuItems.length === 1}
                                    sx={{
                                      height: 41, width: 41,
                                      ml: 1, borderRadius: '50%'
                                    }}>
                          <RemoveCircleIcon fontSize="medium" />
                        </IconButton>
                      </Stack>
                      <Stack direction="row" spacing={1} mt={1}>
                        <TextField
                          label="Breakfast Qty" type="number"
                          inputProps={{ min: 0 }} value={item.breakfastQty}
                          onChange={e => handleItemChange(idx, 'breakfastQty', e.target.value)}
                          size="small" sx={{ flex: 1 }} variant="outlined"
                        />
                        <TextField
                          label="Lunch Qty" type="number"
                          inputProps={{ min: 0 }} value={item.lunchQty}
                          onChange={e => handleItemChange(idx, 'lunchQty', e.target.value)}
                          size="small" sx={{ flex: 1 }} variant="outlined"
                        />
                        <TextField
                          label="Dinner Qty" type="number"
                          inputProps={{ min: 0 }} value={item.dinnerQty}
                          onChange={e => handleItemChange(idx, 'dinnerQty', e.target.value)}
                          size="small" sx={{ flex: 1 }} variant="outlined"
                        />
                      </Stack>
                    </Paper>
                  ))}
                  <Button
                    onClick={handleAddItem}
                    startIcon={<AddCircleIcon />}
                    color="secondary"
                    variant="outlined"
                    sx={{ fontWeight: 700, my: 1 }}
                  >
                    Add Menu Item
                  </Button>
                  <Stack direction="row" spacing={2} justifyContent="space-between">
                    <Button
                      type="button"
                      startIcon={<ArrowBackIcon />}
                      variant="contained"
                      color="grey"
                      sx={{ fontWeight: 700, py: 1.1, borderRadius: 2 }}
                      onClick={prevStep}
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      variant="contained"
                      color="primary"
                      sx={{ fontWeight: 700, py: 1.1, borderRadius: 2 }}
                      onClick={() => validateStep() && nextStep()}
                    >
                      Review
                    </Button>
                  </Stack>
                </Stack>
              </Fade>
            )}

            {activeStep === 2 && (
              <Fade in>
                <Stack spacing={2} alignItems="center" textAlign="center">
                  <CheckCircleRoundedIcon color="success" sx={{ fontSize: 50, mb: 1 }} />
                  <Typography variant="h6" fontWeight={700}>
                    Confirm and Add Shop
                  </Typography>
                  <Typography variant="body1">
                    <b>Shop Name:</b> {shopName}<br />
                    <b>Menu Items:</b>
                  </Typography>
                  <ul style={{ textAlign: 'left', width: '100%', fontSize: 17 }}>
                    {menuItems.map((item, idx) => (
                      <li key={idx}>
                        {item.name} – Rs.{item.price} <span style={{ color: theme.palette.text.secondary, fontSize: 15 }}>
                        (B: {item.breakfastQty || 0}, L: {item.lunchQty || 0}, D: {item.dinnerQty || 0})
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Divider />
                  <Stack direction="row" spacing={2} justifyContent="center">
                    <Button
                      type="button"
                      variant="outlined"
                      color="secondary"
                      onClick={prevStep}
                    >Back</Button>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      sx={{ fontWeight: 700, minWidth: 110 }}
                    >
                      Confirm & Save
                    </Button>
                  </Stack>
                </Stack>
              </Fade>
            )}
          </form>
        </Stack>
      </Paper>
    </Box>
  );
};

export default AddShop;
