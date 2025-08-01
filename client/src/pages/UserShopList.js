import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import OrderForm from './OrderForm';
import {
  Container, Grid, Card, CardMedia, CardContent, CardActions, Typography,
  Button, Box, List, ListItem, ListItemText, Dialog, DialogTitle,
  DialogContent, IconButton, DialogActions, Paper, Skeleton, InputBase
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PhoneIcon from '@mui/icons-material/Phone'; // New for phone display
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const placeholderImg =
  "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80";

const UserShopList = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialogShop, setOpenDialogShop] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [expandedShopId, setExpandedShopId] = useState(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    setLoading(true);
    axios.get("http://localhost:5000/api/shops/") // Updated endpoint - /public remove කළා
      .then(res => {
        setShops(res.data);
        setLoading(false);
        console.log('Shops loaded successfully:', res.data); // Debug log add කළා
      })
      .catch(err => {
        setShops([]);
        setLoading(false);
        console.error('Error fetching shops:', err); // Improved error handling
      });
  }, []);

  const filteredShops = shops.filter(shop =>
    shop.shopName.toLowerCase().includes(search.toLowerCase()) ||
    (shop.location && shop.location.toLowerCase().includes(search.toLowerCase()))
  );

  const handleOpenDialog = (shop) => {
    const token = sessionStorage.getItem('token');
    if (token) setOpenDialogShop(shop);
    else setIsLoginModalOpen(true);
  };

  const handleCloseDialog = () => setOpenDialogShop(null);
  const handleCloseLoginModal = () => setIsLoginModalOpen(false);
  const toggleExpand = (shopId) =>
    setExpandedShopId(expandedShopId === shopId ? null : shopId);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box textAlign="center" mb={4}>
        <Typography variant={isMobile ? "h5" : "h4"} fontWeight={700} display="inline-flex" alignItems="center" color="primary.main" gutterBottom>
          <StorefrontIcon fontSize="large" sx={{ mr: 1 }} />
          All Available Shops
        </Typography>
        <Typography color="text.secondary" mt={1}>
          Choose a shop to view menu and place your order.
        </Typography>
        {/* Search Bar */}
        <Paper
          sx={{
            mt: 3, p: '2px 8px', display: 'flex', alignItems: 'center', width: isMobile ? '100%' : 400,
            mx: 'auto', borderRadius: 3, bgcolor: theme.palette.action.hover, boxShadow: theme.shadows[1]
          }}
        >
          <SearchIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="Search shops..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="search shops"
          />
        </Paper>
      </Box>

      {loading ? (
        <Grid container spacing={isMobile ? 2 : 4}>
          {[1, 2, 3, 4, 5, 6].map(n => (
            <Grid item xs={12} sm={6} md={4} key={n}>
              <Card sx={{ p:0, borderRadius: 4 }}>
                <Skeleton variant="rectangular" height={170} sx={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }} />
                <CardContent>
                  <Skeleton variant="text" width={"60%"} />
                  <Skeleton variant="text" width={"45%"} />
                  <Skeleton variant="text" width={"80%"} />
                </CardContent>
                <CardActions>
                  <Skeleton variant="rectangular" width={"90%"} height={32} sx={{ borderRadius: 2 }} />
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : filteredShops.length === 0 ? (
        <Paper elevation={3} sx={{ p: 4, textAlign: "center", bgcolor: theme.palette.background.paper, borderRadius: 4 }}>
          <Typography variant="h6" color="text.secondary" sx={{mb:1}}>
            No shops are available at the moment.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={isMobile ? 2 : 4}>
          {filteredShops.map(shop => (
            <Grid item xs={12} sm={6} md={4} key={shop._id}>
              <Card
                elevation={6}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 4,
                  boxShadow: theme.shadows[isMobile ? 3 : 7],
                  transition: 'transform 0.22s, box-shadow 0.22s',
                  '&:hover': {
                    transform: 'scale(1.018)',
                    boxShadow: theme.shadows[13],
                  },
                }}
              >
                {/* Shop images: shop.image OR placeholder */}
                <CardMedia
                  component="img"
                  height="170"
                  image={shop.image || placeholderImg}
                  alt={shop.shopName}
                  sx={{ objectFit: "cover", borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
                />
                <CardContent sx={{ flexGrow: 1, p: isMobile ? 2 : 3 }}>
                  <Typography gutterBottom variant="h6" component="div" fontWeight={700}>
                    {shop.shopName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {shop.location ? `Location: ${shop.location}` : ''}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom display="flex" alignItems="center">
                    <PhoneIcon fontSize="small" sx={{ mr: 0.5 }} /> {/* New: Phone icon */}
                    Phone: {shop.phone || 'N/A'} {/* New: Phone display */}
                  </Typography>
                  {shop.owner && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <span style={{ color: theme.palette.primary.main, fontWeight: 600 }}>Owner:</span> {shop.owner.name}
                    </Typography>
                  )}
                  <Box sx={{ mt: 1 }}>
                    <Box sx={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                      <Typography variant="subtitle2" color="primary" fontWeight={600} gutterBottom>Menu</Typography>
                      {(shop.menuItems?.length > 3) && (
                        <Button size="small" color="primary" onClick={() => toggleExpand(shop._id)} endIcon={expandedShopId === shop._id ? <ExpandLessIcon /> : <ExpandMoreIcon />} sx={{textTransform:'none'}}>
                          {expandedShopId === shop._id ? "Show less" : "Show more"}
                        </Button>
                      )}
                    </Box>
                    <List dense sx={{ bgcolor: theme.palette.action.hover, borderRadius: 2, px: 1, py: 0.5, maxHeight: 160, overflow: 'auto' }}>
                      {(shop.menuItems && shop.menuItems.length > 0
                        ? expandedShopId === shop._id
                          ? shop.menuItems
                          : shop.menuItems.slice(0, 3)
                        : []
                      ).map(item => (
                        <ListItem key={item._id} sx={{ py: 0 }}>
                          <ListItemText
                            primary={
                              <Typography variant="body2" fontWeight={500}>
                                {item.name} <span style={{ color: theme.palette.text.secondary }}>- Rs.{item.price}</span>
                              </Typography>
                            }
                            secondary={
                              <Typography variant="caption" color="text.secondary">
                                (B:{item.breakfastQty}, L:{item.lunchQty}, D:{item.dinnerQty})
                              </Typography>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                    {shop.menuItems && shop.menuItems.length === 0 && (
                      <Typography variant="body2" color="text.secondary">
                        No menu items available.
                      </Typography>
                    )}
                  </Box>
                </CardContent>
                <CardActions sx={{ mt: 'auto', p: isMobile ? 1 : 2 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    size={isMobile ? "medium" : "large"}
                    sx={{
                      borderRadius: 99, fontWeight: 700,
                      transition:'transform 0.18s',
                      '&:active': { transform:'scale(0.97)' }
                    }}
                    onClick={() => handleOpenDialog(shop)}
                  >
                    Order
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={!!openDialogShop} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ m: 0, p: 2 }}>
          {openDialogShop?.shopName && `Order from ${openDialogShop.shopName}`}
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {openDialogShop && <OrderForm shop={openDialogShop} onOrderPlaced={handleCloseDialog} />}
        </DialogContent>
      </Dialog>

      <Dialog open={isLoginModalOpen} onClose={handleCloseLoginModal}>
        <DialogTitle>Login Required</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" sx={{mb:2}}>To place an order, you need to log in or create an account first.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseLoginModal}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => navigate('/auth')} // Updated to /auth - login page එකට direct යයි
            sx={{ fontWeight: 700, borderRadius: 99 }}
          >
            Login / Register
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserShopList;
