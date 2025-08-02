import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import OrderForm from './OrderForm';
import {
  Container, Grid, Card, CardMedia, CardContent, CardActions, Typography,
  Button, Box, List, ListItem, ListItemText, Dialog, DialogTitle,
  DialogContent, IconButton, DialogActions, Paper, Skeleton, InputBase,
  Rating, TextField, Divider, Snackbar, Alert, CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';

import StarIcon from '@mui/icons-material/Star';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const placeholderImg =
  "https://i.pinimg.com/1200x/71/50/03/715003052eb5c3f532ac8bca71324838.jpg";

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

  // Review add dialog state
  const [reviewDialog, setReviewDialog] = useState({ open: false, shopId: null });
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSnackbar, setReviewSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Reviews data state
  const [reviewsData, setReviewsData] = useState({});
  const [reviewsPopup, setReviewsPopup] = useState({ open: false, shopId: null, shopName: '' });

  // Edit review dialog state
  const [editReviewDialog, setEditReviewDialog] = useState({ open: false, reviewId: null, shopId: null, initialRating: 0, initialComment: '' });

  useEffect(() => {
    setLoading(true);
    axios.get("http://localhost:5000/api/shops/")
      .then(res => {
        setShops(res.data);
        res.data.forEach(shop => fetchReviews(shop._id));
        setLoading(false);
      })
      .catch(err => {
        setShops([]);
        setLoading(false);
        console.error('Error fetching shops:', err);
      });
  }, []);

  const fetchReviews = async (shopId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/reviews/shop/${shopId}`);
      setReviewsData((prev) => ({ ...prev, [shopId]: res.data }));
    } catch (err) {
      console.error(err);
    }
  };

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

  const handleOpenReview = (shopId) => {
    const token = sessionStorage.getItem('token');
    if (token) setReviewDialog({ open: true, shopId });
    else setIsLoginModalOpen(true);
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      setReviewSnackbar({ open: true, message: 'කරුණාකර rating එකක් තෝරන්න', severity: 'error' });
      return;
    }
    if (comment.trim() === '') {
      setReviewSnackbar({ open: true, message: 'Comment එක empty වෙන්න බෑ', severity: 'error' });
      return;
    }
    setReviewSubmitting(true);
    const token = sessionStorage.getItem('token');
    try {
      await axios.post('http://localhost:5000/api/reviews', { shopId: reviewDialog.shopId, rating, comment }, { headers: { Authorization: `Bearer ${token}` } });
      setReviewSnackbar({ open: true, message: 'Review submit වුණා!', severity: 'success' });
      setReviewDialog({ open: false });
      setRating(0);
      setComment('');
      fetchReviews(reviewDialog.shopId);
    } catch (err) {
      setReviewSnackbar({ open: true, message: 'Review submit කරන්න බැරි වුණා. ආයෙත් try කරන්න.', severity: 'error' });
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleOpenEditReview = (review) => {
    console.log('Opening edit for review ID:', review._id);
    console.log('Review user ID:', review.user?._id);
    console.log('Stored user ID:', sessionStorage.getItem('userId'));
    setEditReviewDialog({
      open: true,
      reviewId: review._id,
      shopId: reviewsPopup.shopId,
      initialRating: review.rating,
      initialComment: review.comment
    });
    setRating(review.rating);
    setComment(review.comment);
  };

  const handleSubmitEditReview = async () => {
    if (rating === 0) {
      setReviewSnackbar({ open: true, message: 'කරුණාකර rating එකක් තෝරන්න', severity: 'error' });
      return;
    }
    if (comment.trim() === '') {
      setReviewSnackbar({ open: true, message: 'Comment එක empty වෙන්න බෑ', severity: 'error' });
      return;
    }
    setReviewSubmitting(true);
    const token = sessionStorage.getItem('token');
    try {
      await axios.put(`http://localhost:5000/api/reviews/${editReviewDialog.reviewId}`, { rating, comment }, { headers: { Authorization: `Bearer ${token}` } });
      setReviewSnackbar({ open: true, message: 'Review updated successfully!', severity: 'success' });
      setEditReviewDialog({ open: false, reviewId: null, shopId: null, initialRating: 0, initialComment: '' });
      setRating(0);
      setComment('');
      fetchReviews(editReviewDialog.shopId);
    } catch (err) {
      console.error('Edit review error:', err);
      setReviewSnackbar({ open: true, message: 'Failed to update review', severity: 'error' });
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleDeleteReview = async (shopId, reviewId) => {
    const token = sessionStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/api/reviews/${reviewId}`, { headers: { Authorization: `Bearer ${token}` } });
      setReviewSnackbar({ open: true, message: 'Review deleted!', severity: 'success' });
      fetchReviews(shopId);
    } catch (err) {
      console.error('Delete review error:', err);
      setReviewSnackbar({ open: true, message: 'Failed to delete review', severity: 'error' });
    }
  };

  const openReviewsPopup = (shopId, shopName) => {
    setReviewsPopup({ open: true, shopId, shopName });
  };

  const closeReviewsPopup = () => {
    setReviewsPopup({ open: false, shopId: null, shopName: '' });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box textAlign="center" mb={4}>
        <Typography variant={isMobile ? "h5" : "h4"} fontWeight={700} display="inline-flex" alignItems="center" color="primary.main" gutterBottom>
          <StorefrontIcon fontSize="large" sx={{ mr: 1 }} />
          Available Shops
        </Typography>
        <Typography color="text.secondary" mt={1}fontSize="large">
          Choose a shop to view menu and place your order.
        </Typography>
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
          {filteredShops.map(shop => {
            const data = reviewsData[shop._id] || { averageRating: 0, reviews: [] };
            return (
              <Grid item xs={12} sm={6} md={4} key={shop._id}>
                <Card
                  elevation={6}
                  sx={{
                    height: '97%',
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
                  <CardMedia
                    component="img"
                    height="150"
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
                      
                      Mobile No: {shop.phone || 'N/A'}
                    </Typography>
                    
                    <Box sx={{ mt: 1 }}>
                      <Box sx={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        <Typography variant="subtitle2" color="primary" fontWeight={600} gutterBottom>Menu</Typography>
                        {(shop.menuItems?.length > 3) && (
                          <Button size="small" color="primary" onClick={() => toggleExpand(shop._id)} endIcon={expandedShopId === shop._id ? <ExpandLess /> : <ExpandMore />} sx={{textTransform:'none'}}>
                            {expandedShopId === shop._id ? "Show less" : "Show more"}
                          </Button>
                        )}
                      </Box>
                      <List dense sx={{ bgcolor: theme.palette.action.hover, borderRadius: 2, px: 1, py: 0.5, maxHeight: 120, overflow: 'auto' }}>
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
                    <Divider sx={{ my: 2 }} />
                    <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ cursor: 'pointer' }} onClick={() => openReviewsPopup(shop._id, shop.shopName)}>
                      <Box display="flex" alignItems="center">
                        <StarIcon sx={{ color: 'gold', mr: 1 }} />
                        <Typography variant="subtitle2" color="secondary.main" fontWeight="bold">
                          Customer Reviews ({data.reviews.length})
                        </Typography>
                      </Box>
                    </Box>
                    <Box display="flex" alignItems="center" mt={1}>
                      <Rating value={parseFloat(data.averageRating)} readOnly precision={0.5} />
                      <Typography variant="body2" color="text.secondary" ml={1}>
                        {data.averageRating} / 5
                      </Typography>
                    </Box>
                    <CardActions sx={{ mt: 'auto', p: isMobile ? 1 : 2 }}>
                    <Button
                      fullWidth
                      height
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
                  </CardContent>
                  
                </Card>
              </Grid>
            );
          })}
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
            onClick={() => navigate('/auth')}
            sx={{ fontWeight: 700, borderRadius: 99 }}
          >
            Login / Register
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Review Dialog */}
      <Dialog open={reviewDialog.open} onClose={() => setReviewDialog({ open: false })}>
        <DialogTitle>Leave a Review</DialogTitle>
        <DialogContent>
          <Rating value={rating} onChange={(e, newValue) => setRating(newValue)} precision={0.5} />
          <TextField
            label="Comment"
            multiline
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            fullWidth
            margin="normal"
          />
          {reviewSubmitting && <CircularProgress size={24} sx={{ mt: 1 }} />}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialog({ open: false })}>Cancel</Button>
          <Button onClick={handleSubmitReview} variant="contained" disabled={reviewSubmitting}>Submit</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Review Dialog */}
      <Dialog open={editReviewDialog.open} onClose={() => setEditReviewDialog({ open: false })}>
        <DialogTitle>Edit Your Review</DialogTitle>
        <DialogContent>
          <Rating value={rating} onChange={(e, newValue) => setRating(newValue)} precision={0.5} />
          <TextField
            label="Comment"
            multiline
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            fullWidth
            margin="normal"
          />
          {reviewSubmitting && <CircularProgress size={24} sx={{ mt: 1 }} />}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditReviewDialog({ open: false })}>Cancel</Button>
          <Button onClick={handleSubmitEditReview} variant="contained" disabled={reviewSubmitting}>Update</Button>
        </DialogActions>
      </Dialog>

      {/* Reviews Popup Dialog */}
      <Dialog open={reviewsPopup.open} onClose={closeReviewsPopup} maxWidth="md" fullWidth>
        <DialogTitle>
          Customer Reviews for {reviewsPopup.shopName}
          <IconButton
            aria-label="close"
            onClick={closeReviewsPopup}
            sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {(() => {
            const currentReviews = reviewsData[reviewsPopup.shopId]?.reviews || [];
            console.log('Reviews loaded:', currentReviews);
            console.log('Logged-in User ID:', sessionStorage.getItem('userId'));
            return currentReviews.length === 0 ? (
              <Typography color="text.secondary" align="center" sx={{ py: 2 }}>
                No reviews yet. Be the first!
              </Typography>
            ) : (
              <List sx={{ maxHeight: 400, overflowY: 'auto' }}>
                {currentReviews.map((review) => {
                  const isOwnReview = review.user?._id == sessionStorage.getItem('userId');
                  console.log(`Review ID: ${review._id}, User ID: ${review.user?._id}, Is own: ${isOwnReview}`);
                  return (
                    <ListItem key={review._id} sx={{ py: 1, borderBottom: '1px solid #eee' }}>
                      <ListItemText
                        primary={
                          <Typography variant="body2" fontWeight="bold">
                            {review.user?.name || 'Anonymous'}
                          </Typography>
                        }
                        secondary={
                          <span>
                            <Rating value={review.rating} readOnly size="small" />
                            <Typography component="span" variant="body2" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                              {review.comment}
                            </Typography>
                            {review.replies?.map((reply, index) => (
                              <Typography key={index} component="span" variant="body2" color="primary" sx={{ display: 'block', mt: 1, fontStyle: 'italic' }}>
                                Owner Reply: {reply.comment}
                              </Typography>
                            )) || null}
                          </span>
                        }
                      />
                      {isOwnReview && (
                        <>
                          <Button size="small" color="primary" onClick={() => handleOpenEditReview(review)} sx={{ mt: 1, ml: 1 }}>
                            Edit
                          </Button>
                          <Button size="small" color="error" onClick={() => handleDeleteReview(reviewsPopup.shopId, review._id)} sx={{ mt: 1, ml: 1 }}>
                            Delete
                          </Button>
                        </>
                      )}
                    </ListItem>
                  );
                })}
              </List>
            );
          })()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleOpenReview(reviewsPopup.shopId)} variant="outlined" color="primary">
            Add Review
          </Button>
          <Button onClick={closeReviewsPopup}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for review feedback */}
      <Snackbar open={reviewSnackbar.open} autoHideDuration={6000} onClose={() => setReviewSnackbar({ ...reviewSnackbar, open: false })}>
        <Alert onClose={() => setReviewSnackbar({ ...reviewSnackbar, open: false })} severity={reviewSnackbar.severity} sx={{ width: '100%' }}>
          {reviewSnackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UserShopList;
