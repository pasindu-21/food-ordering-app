import React, { useEffect, useState } from 'react';
import axios from 'axios';
import OrderForm from './OrderForm';
import {
  Container,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box
} from '@mui/material';

const UserShopList = () => {
  const [shops, setShops] = useState([]);
  const [currentToken] = useState(sessionStorage.getItem('token'));
  const [showOrderForm, setShowOrderForm] = useState(null);

  useEffect(() => {
    if (currentToken) {
      axios.get("http://localhost:5000/api/shops/all", {
        headers: { Authorization: `Bearer ${currentToken}` },
      }).then(res => setShops(res.data));
    }
  }, [currentToken]);

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h2" gutterBottom>
        All Available Shops
      </Typography>
      {shops.length === 0 ? (
        <Typography variant="body1">No shops found.</Typography>
      ) : (
        shops.map(shop => (
          <Card key={shop._id} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h5" component="div" gutterBottom>
                {shop.shopName}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Location: {shop.location || 'N/A'}
              </Typography>
              {shop.owner && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Owner: {shop.owner.name} ({shop.owner.email})
                </Typography>
              )}

              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1">Menu:</Typography>
                {shop.menuItems && shop.menuItems.length > 0 ? (
                  <List dense>
                    {shop.menuItems.map(item => (
                      <React.Fragment key={item._id}>
                        <ListItem>
                          <ListItemText
                            primary={`${item.name} - Rs.${item.price}`}
                            secondary={`B: ${item.breakfastQty}, L: ${item.lunchQty}, D: ${item.dinnerQty}`}
                          />
                        </ListItem>
                        <Divider component="li" />
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">No menu items available.</Typography>
                )}
              </Box>
            </CardContent>
            <CardActions>
              <Button size="small" variant="contained" color="primary" onClick={() => setShowOrderForm(shop)}>
                Order
              </Button>
            </CardActions>
            {showOrderForm && showOrderForm._id === shop._id && (
              <Box sx={{ p: 2 }}>
                <OrderForm shop={shop} onOrderPlaced={() => setShowOrderForm(null)} />
              </Box>
            )}
          </Card>
        ))
      )}
    </Container>
  );
};

export default UserShopList;
