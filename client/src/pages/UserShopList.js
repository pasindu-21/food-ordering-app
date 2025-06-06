import React, { useEffect, useState } from 'react';
import axios from 'axios';
import OrderForm from './OrderForm';
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const UserShopList = () => {
  const [shops, setShops] = useState([]);
  const [currentToken] = useState(sessionStorage.getItem('token'));
  const [openDialogShop, setOpenDialogShop] = useState(null); // holds shop object

  useEffect(() => {
    if (currentToken) {
      axios.get("http://localhost:5000/api/shops/all", {
        headers: { Authorization: `Bearer ${currentToken}` },
      }).then(res => setShops(res.data));
    }
  }, [currentToken]);

  const handleOpenDialog = (shop) => setOpenDialogShop(shop);
  const handleCloseDialog = () => setOpenDialogShop(null);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h2" gutterBottom>
        All Available Shops
      </Typography>
      <Grid container spacing={4}>
        {shops.length === 0 ? (
          <Grid item xs={12}>
            <Typography variant="body1">No shops found.</Typography>
          </Grid>
        ) : (
          shops.map(shop => (
            <Grid item xs={12} sm={6} md={4} key={shop._id}>
              <Card sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                flex: 1
              }}>
                <CardMedia
                  component="img"
                  height="160"
                  image="https://cdn.britannica.com/36/123536-050-95CB0C6E/Variety-fruits-vegetables.jpg"
                  alt={shop.shopName}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="div">
                    {shop.shopName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Location: {shop.location || 'N/A'}
                  </Typography>
                 {shop.owner && (
  <Typography variant="body2" color="text.secondary">
    Owner: {shop.owner.name}
  </Typography>
)}

                  <Box sx={{ mt: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Menu:
                    </Typography>
                    {shop.menuItems && shop.menuItems.length > 0 ? (
                      <List dense>
                        {shop.menuItems.map(item => (
                          <ListItem key={item._id} disablePadding>
                            <ListItemText
                              primary={`${item.name} - Rs.${item.price} (B:${item.breakfastQty}, L:${item.lunchQty}, D:${item.dinnerQty})`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No menu items available.
                      </Typography>
                    )}
                  </Box>
                </CardContent>
                <CardActions sx={{ mt: 'auto' }}>
                  <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    onClick={() => handleOpenDialog(shop)}
                  >
                    Order
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* OrderForm Dialog Popup */}
      <Dialog
        open={!!openDialogShop}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ m: 0, p: 2 }}>
          {openDialogShop?.shopName && `Order from ${openDialogShop.shopName}`}
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {openDialogShop &&
            <OrderForm
              shop={openDialogShop}
              onOrderPlaced={handleCloseDialog}
            />
          }
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default UserShopList;
