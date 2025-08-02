import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box, Container, Grid, Card, CardContent, CardActions, Typography, Button, TextField,
  IconButton, Stack, Divider, Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Snackbar, Alert, List, ListItem, ListItemText, Rating
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import StorefrontIcon from '@mui/icons-material/Storefront';
import FreeBreakfastIcon from '@mui/icons-material/FreeBreakfast';
import LunchDiningIcon from '@mui/icons-material/LunchDining';
import DinnerDiningIcon from '@mui/icons-material/DinnerDining';
import Chip from '@mui/material/Chip';
import PhoneIcon from '@mui/icons-material/Phone';
import StarIcon from '@mui/icons-material/Star';
import CloseIcon from '@mui/icons-material/Close';

const OwnerShopList = () => {
  const [shops, setShops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentToken, setCurrentToken] = useState(sessionStorage.getItem('token'));
  const [editingShop, setEditingShop] = useState(null);
  const [formData, setFormData] = useState({ shopName: '', location: '', phone: '' });

  // State for menu item edit dialog
  const [isMenuEditDialogOpen, setIsMenuEditDialogOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState(null);
  const [currentShopId, setCurrentShopId] = useState(null);

  // State for menu item delete confirmation dialog
  const [isMenuDeleteConfirmOpen, setIsMenuDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [shopIdForDelete, setShopIdForDelete] = useState(null);

  // UX Improvement: State for Add Item form visibility
  const [addingItemInShop, setAddingItemInShop] = useState(null);

  const [newMenuItem, setNewMenuItem] = useState({
    name: '', price: '', breakfastQty: '', lunchQty: '', dinnerQty: ''
  });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, shopId: null }); // For shop delete confirm

  // UX Improvement: Snackbar state
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // New: Reviews state
  const [reviewsData, setReviewsData] = useState({});
  const [reviewsPopup, setReviewsPopup] = useState({ open: false, shopId: null, shopName: '' });

  // New: Reply inputs state (for new replies and editing)
  const [replyInputs, setReplyInputs] = useState({});

  // New: Edit reply dialog state
  const [editReplyDialog, setEditReplyDialog] = useState({ open: false, reviewId: null, replyId: null, initialComment: '' });

  // New: State for comment in edit reply dialog
  const [comment, setComment] = useState('');

  // New: Loading states for actions
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Refresh token from sessionStorage
    setCurrentToken(sessionStorage.getItem('token'));
    fetchShops();
    // eslint-disable-next-line
  }, []);

  const fetchShops = async () => {
    setIsLoading(true);
    const token = sessionStorage.getItem('token'); // Get latest token
    if (token) {
      try {
        const res = await axios.get("http://localhost:5000/api/shops/my", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setShops(res.data);
        res.data.forEach(shop => fetchReviews(shop._id)); // Fetch reviews for each shop
      } catch (err) {
        setSnackbar({ open: true, message: 'Failed to fetch shops', severity: 'error' });
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  };

  const fetchReviews = async (shopId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/reviews/shop/${shopId}`);
      setReviewsData((prev) => ({ ...prev, [shopId]: res.data }));
    } catch (err) {
      console.error(err);
    }
  };

  // Shop edit handlers
  const handleEditClick = (shop) => {
    setEditingShop(shop._id);
    setFormData({ shopName: shop.shopName, location: shop.location || '', phone: shop.phone || '' });
  };

  const handleEditSave = async () => {
    if (!formData.shopName.trim()) return;
    setIsSaving(true);
    const token = sessionStorage.getItem('token');
    try {
      await axios.put(`http://localhost:5000/api/shops/${editingShop}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackbar({ open: true, message: 'Shop updated successfully!', severity: 'success' });
      setEditingShop(null);
      fetchShops(); // Refresh list
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to update shop', severity: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditCancel = () => {
    setEditingShop(null);
    setFormData({ shopName: '', location: '', phone: '' });
  };

  // Menu Item Edit Dialog Handlers
  const handleOpenMenuEditDialog = (item, shopId) => {
    setEditingMenuItem({ ...item });
    setCurrentShopId(shopId);
    setIsMenuEditDialogOpen(true);
  };

  const handleCloseMenuEditDialog = () => {
    setIsMenuEditDialogOpen(false);
    setEditingMenuItem(null);
    setCurrentShopId(null);
  };

  const handleMenuEditFormChange = (e) => {
    setEditingMenuItem(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleMenuItemSave = async () => {
    if (!editingMenuItem || !currentShopId) return;
    setIsSaving(true);
    const token = sessionStorage.getItem('token');
    try {
      await axios.put(`http://localhost:5000/api/shops/${currentShopId}`, {
        menuItemUpdate: {
          itemId: editingMenuItem._id,
          ...editingMenuItem
        }
      }, { headers: { Authorization: `Bearer ${token}` } });
      setSnackbar({ open: true, message: 'Menu item updated!', severity: 'success' });
      handleCloseMenuEditDialog();
      fetchShops(); // Refresh
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to update menu item', severity: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // Menu Item Delete Confirmation Handlers
  const handleOpenMenuDeleteConfirm = (item, shopId) => {
    setItemToDelete(item);
    setShopIdForDelete(shopId);
    setIsMenuDeleteConfirmOpen(true);
  };

  const handleCloseMenuDeleteConfirm = () => {
    setIsMenuDeleteConfirmOpen(false);
    setItemToDelete(null);
    setShopIdForDelete(null);
  };

  const handleConfirmMenuItemDelete = async () => {
    if (!itemToDelete || !shopIdForDelete) return;
    setIsDeleting(true);
    const token = sessionStorage.getItem('token');
    try {
      await axios.put(`http://localhost:5000/api/shops/${shopIdForDelete}`, {
        menuItemDeleteId: itemToDelete._id
      }, { headers: { Authorization: `Bearer ${token}` } });
      setSnackbar({ open: true, message: 'Menu item deleted.', severity: 'info' });
      handleCloseMenuDeleteConfirm();
      fetchShops(); // Refresh
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to delete menu item', severity: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  // Add new menu item
  const handleAddMenuItem = async (shop) => {
    const updatedMenu = [
      ...shop.menuItems,
      {
        name: newMenuItem.name,
        price: Number(newMenuItem.price),
        breakfastQty: Number(newMenuItem.breakfastQty || 0),
        lunchQty: Number(newMenuItem.lunchQty || 0),
        dinnerQty: Number(newMenuItem.dinnerQty || 0)
      }
    ];
    setIsSaving(true);
    const token = sessionStorage.getItem('token');
    try {
      await axios.put(`http://localhost:5000/api/shops/${shop._id}`, {
        menuItems: updatedMenu
      }, { headers: { Authorization: `Bearer ${token}` } });
      setNewMenuItem({ name: '', price: '', breakfastQty: '', lunchQty: '', dinnerQty: '' });
      setAddingItemInShop(null);
      setSnackbar({ open: true, message: 'New item added!', severity: 'success' });
      fetchShops(); // Refresh
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to add menu item', severity: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // Shop delete confirmation dialog
  const handleDeleteShop = async () => {
    setIsDeleting(true);
    const token = sessionStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/api/shops/${deleteDialog.shopId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSnackbar({ open: true, message: 'Shop deleted successfully.', severity: 'info' });
      setDeleteDialog({ open: false, shopId: null });
      fetchShops(); // Refresh
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to delete shop', severity: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // New: Handle reply input change
  const handleReplyChange = (reviewId, value) => {
    setReplyInputs((prev) => ({ ...prev, [reviewId]: value }));
  };

  // New: Handle submit reply
  const handleSubmitReply = async (shopId, reviewId) => {
    const comment = replyInputs[reviewId] || '';
    if (comment.trim().length < 5) {
      setSnackbar({ open: true, message: 'Reply must be at least 5 characters', severity: 'error' });
      return;
    }
    setIsSaving(true);
    const token = sessionStorage.getItem('token');
    try {
      await axios.post(`http://localhost:5000/api/reviews/${reviewId}/reply`, { comment }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSnackbar({ open: true, message: 'Reply added successfully!', severity: 'success' });
      setReplyInputs((prev) => ({ ...prev, [reviewId]: '' })); // Clear input
      fetchReviews(shopId); // Refresh reviews
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to add reply', severity: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // New: Handle open edit reply
  const handleOpenEditReply = (reviewId, replyId, initialComment) => {
    setEditReplyDialog({ open: true, reviewId, replyId, initialComment });
    setComment(initialComment); // Set initial comment
  };

  // New: Handle submit edit reply
  const handleSubmitEditReply = async () => {
    if (comment.trim().length < 5) {
      setSnackbar({ open: true, message: 'Reply must be at least 5 characters', severity: 'error' });
      return;
    }
    setIsSaving(true);
    const token = sessionStorage.getItem('token');
    try {
      await axios.put(`http://localhost:5000/api/reviews/${editReplyDialog.reviewId}/reply/${editReplyDialog.replyId}`, { comment }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSnackbar({ open: true, message: 'Reply updated successfully!', severity: 'success' });
      setEditReplyDialog({ open: false, reviewId: null, replyId: null, initialComment: '' });
      fetchReviews(reviewsPopup.shopId);
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to update reply', severity: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // New: Handle delete reply
  const handleDeleteReply = async (shopId, reviewId, replyId) => {
    setIsDeleting(true);
    const token = sessionStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/api/reviews/${reviewId}/reply/${replyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSnackbar({ open: true, message: 'Reply deleted successfully!', severity: 'success' });
      fetchReviews(shopId);
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to delete reply', severity: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  // New: Handle delete review
  const handleDeleteReview = async (shopId, reviewId) => {
    setIsDeleting(true);
    const token = sessionStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/api/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSnackbar({ open: true, message: 'Review deleted successfully!', severity: 'success' });
      fetchReviews(shopId);
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to delete review', severity: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  // New: Open reviews popup
  const openReviewsPopup = (shopId, shopName) => {
    setReviewsPopup({ open: true, shopId, shopName });
  };

  // New: Close reviews popup
  const closeReviewsPopup = () => {
    setReviewsPopup({ open: false, shopId: null, shopName: '' });
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" fontWeight="bold" color="primary.main" align="center" mb={4}>
          My Shops
        </Typography>
        <Grid container spacing={3} justifyContent={shops.length === 1 ? "center" : "flex-start"}>
          {shops.length === 0 ? (
            <Grid item xs={12}>
              <Typography color="text.secondary" align="center">No shops found. You can add one from the owner home page.</Typography>
            </Grid>
          ) : (
            shops.map((shop) => {
              const data = reviewsData[shop._id] || { reviews: [], averageRating: 0 };
              return (
                <Grid item xs={12} sm={8} md={6} lg={4} key={shop._id}>
                  <Card
                    elevation={6}
                    sx={{
                      borderRadius: 3,
                      bgcolor: 'background.paper',
                      boxShadow: 3,
                      transition: '0.3s',
                      '&:hover': { boxShadow: 8, transform: 'translateY(-4px) scale(1.02)' }
                    }}
                  >
                    <Box sx={{ bgcolor: 'primary.main', color: '#fff', p: 2, borderTopLeftRadius: 12, borderTopRightRadius: 12, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <StorefrontIcon fontSize="medium" />
                      <Typography variant="h6" sx={{ flex: 1 }}>{shop.shopName}</Typography>
                    </Box>
                    <CardContent>
                      {editingShop === shop._id ? (
                        <Stack spacing={2} mb={2}>
                          <TextField label="Shop Name" name="shopName" value={formData.shopName} onChange={handleFormChange} fullWidth autoFocus required />
                          <TextField label="Location" name="location" value={formData.location} onChange={handleFormChange} fullWidth />
                          <TextField label="Phone Number" name="phone" value={formData.phone} onChange={handleFormChange} fullWidth />
                        </Stack>
                      ) : (
                        <>
                          <Typography color="text.secondary" mb={1} fontSize={15}>Location: {shop.location}</Typography>
                          <Typography color="text.secondary" mb={1} fontSize={15}>Phone: {shop.phone || 'N/A'}</Typography>
                        </>
                      )}
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="subtitle2" color="secondary.main" fontWeight="bold" mb={1}>
                        <RestaurantMenuIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                        Menu
                      </Typography>
                      <Stack spacing={1}>
                        {shop.menuItems && shop.menuItems.length > 0 ? (
                          shop.menuItems.map((item) => (
                            <Box key={item._id} display="flex" alignItems="center" gap={1}>
                              <Box flex={1} display="flex" alignItems="center" justifyContent="space-between" minWidth={0}>
                                <Box display="flex" alignItems="center" gap={1.5}>
                                  <Typography fontWeight={600} color="text.primary" sx={{ minWidth: { xs: 50, sm: 60 } }}>{item.name}</Typography>
                                  <Stack direction="row" spacing={0.5}>
                                    <Chip icon={<FreeBreakfastIcon fontSize="small" />} label={`B: ${item.breakfastQty}`} color="primary" size="small" sx={{ fontWeight: 500 }} />
                                    <Chip icon={<LunchDiningIcon fontSize="small" />} label={`L: ${item.lunchQty}`} color="secondary" size="small" sx={{ fontWeight: 500 }} />
                                    <Chip icon={<DinnerDiningIcon fontSize="small" />} label={`D: ${item.dinnerQty}`} color="success" size="small" sx={{ fontWeight: 500 }} />
                                  </Stack>
                                </Box>
                                <Typography fontWeight={600} color="success.main" sx={{ minWidth: 60, textAlign: 'right' }}>Rs.{item.price}</Typography>
                              </Box>
                              <IconButton color="primary" onClick={() => handleOpenMenuEditDialog(item, shop._id)}><EditIcon /></IconButton>
                              <IconButton color="error" onClick={() => handleOpenMenuDeleteConfirm(item, shop._id)}><DeleteIcon /></IconButton>
                            </Box>
                          ))
                        ) : (
                          <Typography color="text.secondary" sx={{ fontStyle: 'italic', my: 2 }}>No menu items yet.</Typography>
                        )}
                      </Stack>
                      <Divider sx={{ my: 2 }} />
                      {addingItemInShop === shop._id ? (
                        <Box component="form" onSubmit={(e) => { e.preventDefault(); handleAddMenuItem(shop); }} mt={1} display="flex" gap={1} flexWrap="wrap">
                          <TextField size="small" label="Item Name" value={newMenuItem.name} onChange={e => setNewMenuItem({ ...newMenuItem, name: e.target.value })} required sx={{ width: 100 }} autoFocus />
                          <TextField size="small" label="Price" type="number" value={newMenuItem.price} onChange={e => setNewMenuItem({ ...newMenuItem, price: e.target.value })} required sx={{ width: 70 }} />
                          <TextField size="small" label="B.Qty" type="number" value={newMenuItem.breakfastQty} onChange={e => setNewMenuItem({ ...newMenuItem, breakfastQty: e.target.value })} sx={{ width: 60 }} />
                          <TextField size="small" label="L.Qty" type="number" value={newMenuItem.lunchQty} onChange={e => setNewMenuItem({ ...newMenuItem, lunchQty: e.target.value })} sx={{ width: 60 }} />
                          <TextField size="small" label="D.Qty" type="number" value={newMenuItem.dinnerQty} onChange={e => setNewMenuItem({ ...newMenuItem, dinnerQty: e.target.value })} sx={{ width: 60 }} />
                          <IconButton color="success" type="submit" disabled={isSaving}><SaveIcon /></IconButton>
                          <IconButton color="secondary" onClick={() => setAddingItemInShop(null)} disabled={isSaving}><CancelIcon /></IconButton>
                        </Box>
                      ) : (
                        <Button fullWidth variant="outlined" startIcon={<AddIcon />} onClick={() => setAddingItemInShop(shop._id)}>Add New Item</Button>
                      )}
                      {/* New: Reviews summary - clickable to open popup */}
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
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                      {editingShop === shop._id ? (
                        <>
                          <Button variant="contained" color="success" size="small" startIcon={<SaveIcon />} onClick={handleEditSave} disabled={isSaving}>Save</Button>
                          <Button variant="outlined" color="secondary" size="small" startIcon={<CancelIcon />} onClick={handleEditCancel} disabled={isSaving}>Cancel</Button>
                        </>
                      ) : (
                        <>
                          <Button variant="outlined" color="primary" size="small" startIcon={<EditIcon />} onClick={() => handleEditClick(shop)}>Edit Shop</Button>
                          <Button variant="outlined" color="error" size="small" startIcon={<DeleteIcon />} onClick={() => setDeleteDialog({ open: true, shopId: shop._id })} disabled={isDeleting}>Delete Shop</Button>
                        </>
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              );
            })
          )}
        </Grid>

        {/* Shop Delete Confirmation Dialog */}
        <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, shopId: null })}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete this shop? This action cannot be undone.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog({ open: false, shopId: null })}>Cancel</Button>
            <Button onClick={handleDeleteShop} color="error" disabled={isDeleting}>Delete</Button>
          </DialogActions>
        </Dialog>

        {/* Menu Item Edit Dialog */}
        <Dialog open={isMenuEditDialogOpen} onClose={handleCloseMenuEditDialog}>
          <DialogTitle>Edit Menu Item</DialogTitle>
          <DialogContent>
            <TextField label="Name" name="name" value={editingMenuItem?.name || ''} onChange={handleMenuEditFormChange} fullWidth margin="dense" />
            <TextField label="Price" name="price" type="number" value={editingMenuItem?.price || ''} onChange={handleMenuEditFormChange} fullWidth margin="dense" />
            <TextField label="Breakfast Qty" name="breakfastQty" type="number" value={editingMenuItem?.breakfastQty || ''} onChange={handleMenuEditFormChange} fullWidth margin="dense" />
            <TextField label="Lunch Qty" name="lunchQty" type="number" value={editingMenuItem?.lunchQty || ''} onChange={handleMenuEditFormChange} fullWidth margin="dense" />
            <TextField label="Dinner Qty" name="dinnerQty" type="number" value={editingMenuItem?.dinnerQty || ''} onChange={handleMenuEditFormChange} fullWidth margin="dense" />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseMenuEditDialog}>Cancel</Button>
            <Button onClick={handleMenuItemSave} variant="contained" disabled={isSaving}>Save</Button>
          </DialogActions>
        </Dialog>

        {/* Menu Item Delete Confirmation Dialog */}
        <Dialog open={isMenuDeleteConfirmOpen} onClose={handleCloseMenuDeleteConfirm}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete "{itemToDelete?.name}"? This cannot be undone.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseMenuDeleteConfirm}>Cancel</Button>
            <Button onClick={handleConfirmMenuItemDelete} color="error" disabled={isDeleting}>Delete</Button>
          </DialogActions>
        </Dialog>

        {/* FIXED: Reviews Popup Dialog - Added safe access with default empty array */}
        <Dialog 
          open={reviewsPopup.open} 
          onClose={closeReviewsPopup} 
          fullWidth 
          maxWidth="md"
        >
          <DialogTitle>
            Reviews for {reviewsPopup.shopName}
            <IconButton onClick={closeReviewsPopup} sx={{ position: 'absolute', right: 8, top: 8 }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            {/* FIX: Use default empty array if reviewsData[shopId] or .reviews is undefined */}
            {(() => {
              const currentReviews = reviewsData[reviewsPopup.shopId]?.reviews || [];
              return currentReviews.length === 0 ? (
                <Typography>No reviews yet.</Typography>
              ) : (
                <List>
                  {currentReviews.map((review) => (
                    <ListItem key={review._id} divider>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center">
                            <Rating value={review.rating} readOnly size="small" />
                            <Typography ml={2}>{review.user?.name || 'Anonymous'}</Typography> {/* Safe access for user.name */}
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" color="text.primary">{review.comment}</Typography>
                            {/* Replies - Safe access */}
                            {review.replies?.map((reply) => (
                              <Box key={reply._id} mt={1} pl={2} borderLeft="2px solid grey">
                                <Typography variant="body2" color="text.secondary">{reply.comment}</Typography>
                                <Box display="flex" gap={1}>
                                  <IconButton size="small" onClick={() => handleOpenEditReply(review._id, reply._id, reply.comment)}><EditIcon fontSize="small" /></IconButton>
                                  <IconButton size="small" color="error" onClick={() => handleDeleteReply(reviewsPopup.shopId, review._id, reply._id)}><DeleteIcon fontSize="small" /></IconButton>
                                </Box>
                              </Box>
                            )) || null} {/* If no replies, show nothing */}
                            {/* Reply input */}
                            <Box mt={2} display="flex" alignItems="center">
                              <TextField
                                size="small"
                                placeholder="Add a reply..."
                                value={replyInputs[review._id] || ''}
                                onChange={(e) => handleReplyChange(review._id, e.target.value)}
                                fullWidth
                              />
                              <Button onClick={() => handleSubmitReply(reviewsPopup.shopId, review._id)}>Reply</Button>
                            </Box>
                          </>
                        }
                      />
                      <IconButton color="error" onClick={() => handleDeleteReview(reviewsPopup.shopId, review._id)}><DeleteIcon /></IconButton>
                    </ListItem>
                  ))}
                </List>
              );
            })()}
          </DialogContent>
          <DialogActions>
            <Button onClick={closeReviewsPopup}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* New: Edit Reply Dialog */}
        <Dialog open={editReplyDialog.open} onClose={() => setEditReplyDialog({ open: false })}>
          <DialogTitle>Edit Reply</DialogTitle>
          <DialogContent>
            <TextField
              label="Reply Comment"
              multiline
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              fullWidth
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditReplyDialog({ open: false })}>Cancel</Button>
            <Button onClick={handleSubmitEditReply} variant="contained" disabled={isSaving}>Update</Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for feedback */}
        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default OwnerShopList;
