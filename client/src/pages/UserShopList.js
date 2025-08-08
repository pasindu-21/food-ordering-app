import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import OrderForm from './OrderForm';
import {
  Container, Grid, Card, CardMedia, CardContent, CardActions, Typography,
  Button, Box, List, ListItem, ListItemText, Dialog, DialogTitle,
  DialogContent, IconButton, DialogActions, Paper, Skeleton, InputBase,
  Rating, TextField, Divider, Snackbar, Alert, CircularProgress, Avatar
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import StarIcon from '@mui/icons-material/Star';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
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

  // Review states
  const [reviewDialog, setReviewDialog] = useState({ open: false, shopId: null });
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSnackbar, setReviewSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [reviewsData, setReviewsData] = useState({});
  const [reviewsPopup, setReviewsPopup] = useState({ open: false, shopId: null, shopName: '' });
  const [editReviewDialog, setEditReviewDialog] = useState({ open: false, reviewId: null, shopId: null, initialRating: 0, initialComment: '' });
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState({ open: false, reviewId: null, shopId: null });

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
      setReviewSnackbar({ open: true, message: 'Please select a rating', severity: 'error' });
      return;
    }
    if (comment.trim() === '') {
      setReviewSnackbar({ open: true, message: 'Comment cannot be empty', severity: 'error' });
      return;
    }
    if (comment.trim().length < 10) {
      setReviewSnackbar({ open: true, message: 'Comment must be at least 10 characters', severity: 'error' });
      return;
    }
    setReviewSubmitting(true);
    const token = sessionStorage.getItem('token');
    try {
      await axios.post('http://localhost:5000/api/reviews', { shopId: reviewDialog.shopId, rating, comment }, { headers: { Authorization: `Bearer ${token}` } });
      setReviewSnackbar({ open: true, message: 'Review submitted successfully!', severity: 'success' });
      setReviewDialog({ open: false });
      setRating(0);
      setComment('');
      fetchReviews(reviewDialog.shopId);
    } catch (err) {
      setReviewSnackbar({ open: true, message: 'Failed to submit review. Please try again.', severity: 'error' });
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleOpenEditReview = (review) => {
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
      setReviewSnackbar({ open: true, message: 'Please select a rating', severity: 'error' });
      return;
    }
    if (comment.trim() === '') {
      setReviewSnackbar({ open: true, message: 'Comment cannot be empty', severity: 'error' });
      return;
    }
    if (comment.trim().length < 10) {
      setReviewSnackbar({ open: true, message: 'Comment must be at least 10 characters', severity: 'error' });
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

  const handleDeleteReview = async () => {
    const token = sessionStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/api/reviews/${deleteConfirmDialog.reviewId}`, { headers: { Authorization: `Bearer ${token}` } });
      setReviewSnackbar({ open: true, message: 'Review deleted successfully!', severity: 'success' });
      setDeleteConfirmDialog({ open: false, reviewId: null, shopId: null });
      fetchReviews(deleteConfirmDialog.shopId);
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

  // Format date helper
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Recently';
    }
  };

  // Generate user avatar
  const generateAvatar = (name) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box textAlign="center" mb={4}>
        <Typography 
          variant={isMobile ? "h5" : "h4"} 
          fontWeight={700} 
          display="inline-flex" 
          alignItems="center" 
          color="primary.main" 
          gutterBottom
          sx={{
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 1 : 0
          }}
        >
          <StorefrontIcon fontSize={isMobile ? "medium" : "large"} sx={{ mr: isMobile ? 0 : 1 }} />
          Available Shops
        </Typography>
        <Typography 
          color="text.secondary" 
          mt={1} 
          sx={{ fontSize: isMobile ? '0.875rem' : 'large' }}
        >
          Choose a shop to view menu and place your order.
        </Typography>
        <Paper
          sx={{
            mt: 3, 
            p: '2px 8px', 
            display: 'flex', 
            alignItems: 'center', 
            width: isMobile ? '100%' : 400,
            mx: 'auto', 
            borderRadius: isMobile ? 2 : 3, 
            bgcolor: theme.palette.action.hover, 
            boxShadow: theme.shadows[1]
          }}
        >
          <SearchIcon sx={{ 
            mr: 1, 
            color: theme.palette.text.secondary,
            fontSize: isMobile ? '1.25rem' : undefined
          }} />
          <InputBase
            sx={{ ml: 1, flex: 1, fontSize: isMobile ? '0.875rem' : undefined }}
            placeholder={isMobile ? "Search..." : "Search shops..."}
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="search shops"
          />
        </Paper>
      </Box>

      {loading ? (
        <Grid container spacing={isMobile ? 2 : 4}>
          {[1, 2, 3, 4, 5, 6].map(n => (
            <Grid item xs={6} sm={6} md={4} key={n}>  {/* 2 per row on mobile */}
              <Card sx={{ p: 0, borderRadius: 4 }}>
                <Skeleton 
                  variant="rectangular" 
                  height={isMobile ? 120 : 170} 
                  sx={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }} 
                />
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
        <Paper elevation={3} sx={{ 
          p: isMobile ? 3 : 4, 
          textAlign: "center", 
          bgcolor: theme.palette.background.paper, 
          borderRadius: 4,
          mx: isMobile ? 1 : 0
        }}>
          <StorefrontIcon sx={{ 
            fontSize: isMobile ? 40 : 60, 
            color: 'text.secondary', 
            mb: 2 
          }} />
          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ mb: 1, fontSize: isMobile ? '1rem' : '1.25rem' }}
          >
            {search ? 'No shops found' : 'No shops are available at the moment.'}
          </Typography>
          {search && (
            <Button 
              variant="outlined" 
              onClick={() => setSearch('')}
              sx={{ mt: 2 }}
            >
              Clear Search
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={isMobile ? 2 : 4}>
          {filteredShops.map(shop => {
            const data = reviewsData[shop._id] || { averageRating: 0, reviews: [] };
            return (
              <Grid item xs={6} sm={6} md={4} key={shop._id}>  {/* 2 per row on mobile */}
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
                      transform: isMobile ? 'scale(1.01)' : 'scale(1.018)',
                      boxShadow: theme.shadows[isMobile ? 6 : 13],
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    height={isMobile ? "120" : "150"}
                    image={shop.image || placeholderImg}
                    alt={shop.shopName}
                    sx={{ objectFit: "cover", borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
                  />
                  <CardContent sx={{ flexGrow: 1, p: isMobile ? 1.5 : 3 }}>
                    <Typography 
                      gutterBottom 
                      variant="h6" 
                      component="div" 
                      fontWeight={700}
                      sx={{ 
                        fontSize: isMobile ? '0.9rem' : '1.25rem',
                        lineHeight: 1.2
                      }}
                    >
                      {shop.shopName}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      gutterBottom
                      sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}
                    >
                      {shop.location ? `📍 ${shop.location}` : ''}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      gutterBottom
                      sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}
                    >
                      📞 {shop.phone || 'N/A'}
                    </Typography>
                    
                    <Box sx={{ mt: 1 }}>
                      <Box sx={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        <Typography 
                          variant="subtitle2" 
                          color="primary" 
                          fontWeight={600} 
                          gutterBottom
                          sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem' }}
                        >
                          Menu
                        </Typography>
                        {(shop.menuItems?.length > (isMobile ? 2 : 3)) && (
                          <Button 
                            size="small" 
                            color="primary" 
                            onClick={() => toggleExpand(shop._id)} 
                            endIcon={expandedShopId === shop._id ? <ExpandLess /> : <ExpandMore />} 
                            sx={{
                              textTransform:'none',
                              fontSize: isMobile ? '0.7rem' : '0.875rem'
                            }}
                          >
                            {expandedShopId === shop._id ? (isMobile ? "Less" : "Show less") : (isMobile ? "More" : "Show more")}
                          </Button>
                        )}
                      </Box>
                      <List 
                        dense 
                        sx={{ 
                          bgcolor: theme.palette.action.hover, 
                          borderRadius: isMobile ? 1 : 2, 
                          px: isMobile ? 0.5 : 1, 
                          py: 0.5, 
                          maxHeight: isMobile ? 80 : 120, 
                          overflow: 'auto' 
                        }}
                      >
                        {(shop.menuItems && shop.menuItems.length > 0
                          ? expandedShopId === shop._id
                            ? shop.menuItems
                            : shop.menuItems.slice(0, isMobile ? 2 : 3)
                          : []
                        ).map(item => (
                          <ListItem key={item._id} sx={{ py: 0 }}>
                            <ListItemText
                              primary={
                                <Typography 
                                  variant="body2" 
                                  fontWeight={500}
                                  sx={{ fontSize: isMobile ? '0.7rem' : '0.875rem' }}
                                >
                                  {item.name} <span style={{ color: theme.palette.text.secondary }}>- Rs.{item.price}</span>
                                </Typography>
                              }
                              secondary={
                                <Typography 
                                  variant="caption" 
                                  color="primary.main" 
                                  fontWeight="bold"
                                  sx={{ fontSize: isMobile ? '0.65rem' : '0.75rem' }}
                                >
                                  Available: (B:{item.availableBreakfastQty || 0}, L:{item.availableLunchQty || 0}, D:{item.availableDinnerQty || 0})
                                </Typography>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                      {shop.menuItems && shop.menuItems.length === 0 && (
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{
                            fontSize: isMobile ? '0.75rem' : '0.875rem',
                            textAlign: 'center',
                            py: 2
                          }}
                        >
                          No menu items available.
                        </Typography>
                      )}
                    </Box>
                    <Divider sx={{ my: isMobile ? 1 : 2 }} />
                    <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ cursor: 'pointer' }} onClick={() => openReviewsPopup(shop._id, shop.shopName)}>
                      <Box display="flex" alignItems="center">
                        <StarIcon sx={{ 
                          color: 'gold', 
                          mr: 1,
                          fontSize: isMobile ? '0.875rem' : '1rem'
                        }} />
                        <Typography 
                          variant="subtitle2" 
                          color="secondary.main" 
                          fontWeight="bold"
                          sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}
                        >
                          Customer Reviews ({data.reviews.length})
                        </Typography>
                      </Box>
                    </Box>
                    <Box display="flex" alignItems="center" mt={1}>
                      <Rating 
                        value={parseFloat(data.averageRating)} 
                        readOnly 
                        precision={0.5}
                        size={isMobile ? "small" : "medium"}
                      />
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        ml={1}
                        sx={{ fontSize: isMobile ? '0.7rem' : '0.875rem' }}
                      >
                        {data.averageRating} / 5
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions sx={{ mt: 'auto', p: isMobile ? 1 : 2 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      size={isMobile ? "small" : "large"}
                      sx={{
                        borderRadius: isMobile ? 2 : 25, 
                        fontWeight: 700,
                        transition: 'transform 0.18s',
                        '&:active': { transform: 'scale(0.97)' },
                        fontSize: isMobile ? '0.8rem' : '1rem'
                      }}
                      onClick={() => handleOpenDialog(shop)}
                    >
                      Order
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Order Dialog */}
      <Dialog open={!!openDialogShop} onClose={handleCloseDialog} maxWidth="sm" fullWidth fullScreen={isMobile}>
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

      {/* Login Modal */}
      <Dialog open={isLoginModalOpen} onClose={handleCloseLoginModal} fullScreen={isMobile}>
        <DialogTitle>Login Required</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" sx={{mb:2}}>
            To place an order or write reviews, you need to log in or create an account first.
          </Typography>
        </DialogContent>
        <DialogActions sx={{
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 1 : 0,
          p: isMobile ? 2 : 1
        }}>
          <Button onClick={handleCloseLoginModal} fullWidth={isMobile}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => navigate('/auth')}
            sx={{ fontWeight: 700, borderRadius: isMobile ? 2 : 25 }}
            fullWidth={isMobile}
          >
            Login / Register
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Review Dialog */}
      <Dialog open={reviewDialog.open} onClose={() => setReviewDialog({ open: false })} maxWidth="sm" fullWidth fullScreen={isMobile}>
        <DialogTitle>Leave a Review</DialogTitle>
        <DialogContent>
          <Box mb={2}>
            <Typography variant="subtitle2" gutterBottom>Rating *</Typography>
            <Rating 
              value={rating} 
              onChange={(e, newValue) => setRating(newValue)} 
              precision={0.5}
              size={isMobile ? "medium" : "large"}
            />
          </Box>
          <TextField
            label="Your Review"
            multiline
            rows={isMobile ? 3 : 4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            fullWidth
            margin="normal"
            placeholder="Share your experience with this shop..."
            helperText={`${comment.length}/500 characters (minimum 10)`}
            inputProps={{ maxLength: 500 }}
            error={comment.length > 0 && comment.length < 10}
            size={isMobile ? "small" : "medium"}
          />
          {reviewSubmitting && <CircularProgress size={24} sx={{ mt: 1 }} />}
        </DialogContent>
        <DialogActions sx={{
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 1 : 0,
          p: isMobile ? 2 : 1
        }}>
          <Button onClick={() => setReviewDialog({ open: false })} fullWidth={isMobile}>Cancel</Button>
          <Button 
            onClick={handleSubmitReview} 
            variant="contained" 
            disabled={reviewSubmitting || rating === 0 || comment.trim().length < 10}
            fullWidth={isMobile}
          >
            {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Review Dialog */}
      <Dialog open={editReviewDialog.open} onClose={() => setEditReviewDialog({ open: false })} maxWidth="sm" fullWidth fullScreen={isMobile}>
        <DialogTitle>Edit Your Review</DialogTitle>
        <DialogContent>
          <Box mb={2}>
            <Typography variant="subtitle2" gutterBottom>Rating *</Typography>
            <Rating 
              value={rating} 
              onChange={(e, newValue) => setRating(newValue)} 
              precision={0.5}
              size={isMobile ? "medium" : "large"}
            />
          </Box>
          <TextField
            label="Your Review"
            multiline
            rows={isMobile ? 3 : 4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            fullWidth
            margin="normal"
            placeholder="Share your experience with this shop..."
            helperText={`${comment.length}/500 characters (minimum 10)`}
            inputProps={{ maxLength: 500 }}
            error={comment.length > 0 && comment.length < 10}
            size={isMobile ? "small" : "medium"}
          />
          {reviewSubmitting && <CircularProgress size={24} sx={{ mt: 1 }} />}
        </DialogContent>
        <DialogActions sx={{
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 1 : 0,
          p: isMobile ? 2 : 1
        }}>
          <Button onClick={() => setEditReviewDialog({ open: false })} fullWidth={isMobile}>Cancel</Button>
          <Button 
            onClick={handleSubmitEditReview} 
            variant="contained" 
            disabled={reviewSubmitting || rating === 0 || comment.trim().length < 10}
            fullWidth={isMobile}
          >
            {reviewSubmitting ? 'Updating...' : 'Update Review'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmDialog.open} onClose={() => setDeleteConfirmDialog({ open: false })} fullScreen={isMobile}>
        <DialogTitle>Delete Review</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this review? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions sx={{
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 1 : 0,
          p: isMobile ? 2 : 1
        }}>
          <Button onClick={() => setDeleteConfirmDialog({ open: false })} fullWidth={isMobile}>Cancel</Button>
          <Button onClick={handleDeleteReview} color="error" variant="contained" fullWidth={isMobile}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Enhanced Reviews Popup Dialog */}
      <Dialog 
        open={reviewsPopup.open} 
        onClose={closeReviewsPopup} 
        maxWidth="md" 
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: { borderRadius: isMobile ? 0 : 3 }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'primary.main', 
          color: 'white', 
          display: 'flex', 
          alignItems: 'center',
          p: isMobile ? 2 : 3
        }}>
          <StarIcon sx={{ mr: 1 }} />
          Reviews for {reviewsPopup.shopName}
          <IconButton
            aria-label="close"
            onClick={closeReviewsPopup}
            sx={{ position: 'absolute', right: 8, top: 8, color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {(() => {
            const currentReviews = reviewsData[reviewsPopup.shopId]?.reviews || [];
            const currentUserId = sessionStorage.getItem('userId');
            const isLoggedIn = !!sessionStorage.getItem('token');
            
            return currentReviews.length === 0 ? (
              <Box sx={{ p: isMobile ? 3 : 4, textAlign: 'center' }}>
                <PersonIcon sx={{ 
                  fontSize: isMobile ? 40 : 60, 
                  color: 'text.secondary', 
                  mb: 2 
                }} />
                <Typography 
                  variant={isMobile ? "h6" : "h5"} 
                  color="text.secondary" 
                  gutterBottom
                >
                  No reviews yet
                </Typography>
                <Typography 
                  color="text.secondary"
                  sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
                >
                  Be the first to share your experience!
                </Typography>
              </Box>
            ) : (
              <Box sx={{ 
                maxHeight: isMobile ? 'calc(100vh - 200px)' : 500, 
                overflowY: 'auto' 
              }}>
                {currentReviews.map((review, index) => {
                  const isOwnReview = isLoggedIn && currentUserId && String(review.user?._id) === String(currentUserId);
                  
                  return (
                    <Card 
                      key={review._id} 
                      variant="outlined" 
                      sx={{ 
                        m: isMobile ? 1 : 2, 
                        borderRadius: 2,
                        border: isOwnReview ? `2px solid ${theme.palette.primary.light}` : undefined,
                        bgcolor: isOwnReview ? 'primary.50' : 'background.paper'
                      }}
                    >
                      <CardContent>
                        <Box display="flex" alignItems="flex-start" mb={2}>
                          <Avatar 
                            sx={{ 
                              bgcolor: isOwnReview ? 'primary.main' : 'secondary.main', 
                              mr: isMobile ? 1 : 2,
                              width: isMobile ? 32 : 40,
                              height: isMobile ? 32 : 40,
                              fontSize: isMobile ? '0.875rem' : '1rem'
                            }}
                          >
                            {generateAvatar(review.user?.name)}
                          </Avatar>
                          <Box flex={1}>
                            <Box 
                              display="flex" 
                              alignItems={isMobile ? "flex-start" : "center"} 
                              justifyContent="space-between"
                              flexDirection={isMobile ? 'column' : 'row'}
                            >
                              <Typography 
                                variant="subtitle1" 
                                fontWeight="bold"
                                sx={{ fontSize: isMobile ? '0.9rem' : '1rem' }}
                              >
                                {review.user?.name || 'Anonymous'}
                                {isOwnReview && (
                                  <Typography 
                                    component="span" 
                                    variant="caption" 
                                    color="primary" 
                                    sx={{ ml: 1, fontSize: isMobile ? '0.7rem' : '0.75rem' }}
                                  >
                                    (Your review)
                                  </Typography>
                                )}
                              </Typography>
                              <Typography 
                                variant="caption" 
                                color="text.secondary"
                                sx={{ 
                                  fontSize: isMobile ? '0.7rem' : '0.75rem',
                                  mt: isMobile ? 0.5 : 0
                                }}
                              >
                                {formatDate(review.createdAt)}
                              </Typography>
                            </Box>
                            <Rating 
                              value={review.rating} 
                              readOnly 
                              size={isMobile ? "small" : "medium"} 
                              sx={{ my: 0.5 }} 
                            />
                            <Typography 
                              variant="body2" 
                              color="text.primary" 
                              sx={{ 
                                mt: 1,
                                fontSize: isMobile ? '0.8rem' : '0.875rem',
                                lineHeight: 1.5
                              }}
                            >
                              {review.comment}
                            </Typography>
                            
                            {/* Owner Replies */}
                            {review.replies?.map((reply, replyIndex) => (
                              <Box 
                                key={replyIndex} 
                                sx={{ 
                                  mt: 2, 
                                  ml: isMobile ? 1 : 3, 
                                  p: isMobile ? 1.5 : 2, 
                                  bgcolor: 'action.hover', 
                                  borderRadius: isMobile ? 1 : 2,
                                  borderLeft: `4px solid ${theme.palette.info.main}`
                                }}
                              >
                                <Box display="flex" alignItems="center" mb={1}>
                                  <Avatar sx={{ 
                                    bgcolor: 'info.main', 
                                    width: isMobile ? 20 : 24, 
                                    height: isMobile ? 20 : 24, 
                                    mr: 1, 
                                    fontSize: isMobile ? '0.675rem' : '0.875rem'
                                  }}>
                                    {generateAvatar(reply.owner?.name)}
                                  </Avatar>
                                  <Typography 
                                    variant="caption" 
                                    fontWeight="bold" 
                                    color="info.main"
                                    sx={{ fontSize: isMobile ? '0.7rem' : '0.75rem' }}
                                  >
                                    {reply.owner?.name} (Owner)
                                  </Typography>
                                  <Typography 
                                    variant="caption" 
                                    color="text.secondary" 
                                    sx={{ 
                                      ml: 'auto',
                                      fontSize: isMobile ? '0.65rem' : '0.7rem'
                                    }}
                                  >
                                    {formatDate(reply.createdAt)}
                                  </Typography>
                                </Box>
                                <Typography 
                                  variant="body2" 
                                  color="text.primary"
                                  sx={{ fontSize: isMobile ? '0.75rem' : '0.8rem' }}
                                >
                                  {reply.comment}
                                </Typography>
                              </Box>
                            )) || null}
                          </Box>
                        </Box>
                        
                        {/* Only show edit/delete for logged-in users' own reviews */}
                        {isLoggedIn && isOwnReview && (
                          <Box 
                            display="flex" 
                            justifyContent="flex-end" 
                            gap={1}
                            mt={2}
                            pt={2}
                            borderTop={1}
                            borderColor="divider"
                            flexDirection={isMobile ? 'column' : 'row'}
                          >
                            <Button 
                              size="small" 
                              variant="outlined"
                              startIcon={<EditIcon />}
                              onClick={() => handleOpenEditReview(review)}
                              sx={{ 
                                textTransform: 'none',
                                fontSize: isMobile ? '0.8rem' : '0.875rem',
                                borderRadius: 2
                              }}
                              fullWidth={isMobile}
                            >
                              Edit Review
                            </Button>
                            <Button 
                              size="small" 
                              color="error"
                              variant="outlined"
                              startIcon={<DeleteIcon />}
                              onClick={() => setDeleteConfirmDialog({ 
                                open: true, 
                                reviewId: review._id, 
                                shopId: reviewsPopup.shopId 
                              })}
                              sx={{ 
                                textTransform: 'none',
                                fontSize: isMobile ? '0.8rem' : '0.875rem',
                                borderRadius: 2
                              }}
                              fullWidth={isMobile}
                            >
                              Delete Review
                            </Button>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
            );
          })()}
        </DialogContent>
        <DialogActions sx={{ 
          p: isMobile ? 1.5 : 2, 
          bgcolor: 'action.hover',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 1 : 0
        }}>
          <Button 
            onClick={() => handleOpenReview(reviewsPopup.shopId)} 
            variant="contained"
            startIcon={<StarIcon />}
            sx={{ borderRadius: 2 }}
            fullWidth={isMobile}
          >
            Write a Review
          </Button>
          <Button 
            onClick={closeReviewsPopup} 
            sx={{ borderRadius: 2 }}
            fullWidth={isMobile}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for review feedback */}
      <Snackbar 
        open={reviewSnackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setReviewSnackbar({ ...reviewSnackbar, open: false })}
        anchorOrigin={{ 
          vertical: isMobile ? 'top' : 'bottom', 
          horizontal: 'center' 
        }}
      >
        <Alert 
          onClose={() => setReviewSnackbar({ ...reviewSnackbar, open: false })} 
          severity={reviewSnackbar.severity} 
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {reviewSnackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UserShopList;
