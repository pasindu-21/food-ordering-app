// src/pages/UserShopList.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import OrderForm from './OrderForm';
import {
  Container, Grid, Card, CardMedia, CardContent, CardActions, Typography,
  Button, Box, List, ListItem, ListItemText, Dialog, DialogTitle,
  DialogContent, IconButton, DialogActions
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const UserShopList = () => {
  const [shops, setShops] = useState([]);
  const [openDialogShop, setOpenDialogShop] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetches shops using the public endpoint, no login needed.
    axios.get("http://localhost:5000/api/shops/public")
      .then(res => setShops(res.data))
      .catch(err => console.error("Failed to fetch shops:", err));
  }, []);

  const handleOpenDialog = (shop) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      // If logged in, open the order form
      setOpenDialogShop(shop);
    } else {
      // If not logged in, open the login prompt
      setIsLoginModalOpen(true);
    }
  };

  const handleCloseDialog = () => setOpenDialogShop(null);
  const handleCloseLoginModal = () => setIsLoginModalOpen(false);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h2" gutterBottom>
        All Available Shops
      </Typography>
      <Grid container spacing={4}>
        {shops.map(shop => (
          <Grid item xs={12} sm={6} md={4} key={shop._id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="160"
                image="https://cdn.britannica.com/36/123536-050-95CB0C6E/Variety-fruits-vegetables.jpg"
                alt={shop.shopName}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="div">{shop.shopName}</Typography>
                <Typography variant="body2" color="text.secondary">Location: {shop.location || 'N/A'}</Typography>
                {shop.owner && <Typography variant="body2" color="text.secondary">Owner: {shop.owner.name}</Typography>}
                <Box sx={{ mt: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Menu:</Typography>
                  {shop.menuItems && shop.menuItems.length > 0 ? (
                    <List dense>
                      {shop.menuItems.map(item => (
                        <ListItem key={item._id} disablePadding>
                          <ListItemText
                            primary={`${item.name} - Rs.${item.price}`}
                            secondary={`(B:${item.breakfastQty}, L:${item.lunchQty}, D:${item.dinnerQty})`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">No menu items available.</Typography>
                  )}
                </Box>
              </CardContent>
              <CardActions sx={{ mt: 'auto' }}>
                <Button variant="contained" color="primary" onClick={() => handleOpenDialog(shop)}>
                  Order
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* OrderForm Dialog (for logged-in users) */}
      <Dialog open={!!openDialogShop} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ m: 0, p: 2 }}>
          {openDialogShop?.shopName && `Order from ${openDialogShop.shopName}`}
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
          ><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>{openDialogShop && <OrderForm shop={openDialogShop} onOrderPlaced={handleCloseDialog} />}</DialogContent>
      </Dialog>
      
      {/* Login Prompt Dialog (for guests) */}
      <Dialog open={isLoginModalOpen} onClose={handleCloseLoginModal}>
        <DialogTitle>Login Required</DialogTitle>
        <DialogContent>
          <Typography>To place an order, you need to log in or create an account first.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseLoginModal}>Cancel</Button>
          
          {/* <<<<---- මෙන්න FIX එක: path එක '/' ලෙස වෙනස් කරා ---->>>> */}
          <Button variant="contained" onClick={() => navigate('/')}>
            Login / Register
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserShopList;
