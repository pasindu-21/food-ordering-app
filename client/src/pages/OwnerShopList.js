import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box, Container, Grid, Card, CardContent, CardActions, Typography, Button, TextField,
  IconButton, Stack, Divider, Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Snackbar, Alert, List, ListItem, ListItemText, Rating, Avatar, Chip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
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
import PhoneIcon from '@mui/icons-material/Phone';
import StarIcon from '@mui/icons-material/Star';
import CloseIcon from '@mui/icons-material/Close';

const OwnerShopList = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [shops, setShops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingShop, setEditingShop] = useState(null);
  const [formData, setFormData] = useState({ shopName: '', location: '', phone: '' });

  // Menu edit dialog
  const [isMenuEditDialogOpen, setIsMenuEditDialogOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState(null);
  const [currentShopId, setCurrentShopId] = useState(null);

  // Menu delete confirm
  const [isMenuDeleteConfirmOpen, setIsMenuDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [shopIdForDelete, setShopIdForDelete] = useState(null);

  // Add item
  const [addingItemInShop, setAddingItemInShop] = useState(null);
  const [newMenuItem, setNewMenuItem] = useState({
    name: '', price: '', breakfastQty: '', lunchQty: '', dinnerQty: ''
  });

  // Shop delete dialog
  const [deleteDialog, setDeleteDialog] = useState({ open: false, shopId: null });

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Reviews
  const [reviewsData, setReviewsData] = useState({});
  const [reviewsPopup, setReviewsPopup] = useState({ open: false, shopId: null, shopName: '' });

  // Replies
  const [replyInputs, setReplyInputs] = useState({});
  const [editReplyDialog, setEditReplyDialog] = useState({ open: false, reviewId: null, replyId: null, initialComment: '' });
  const [comment, setComment] = useState('');

  // Loading flags
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchShops();
    // eslint-disable-next-line
  }, []);

  const fetchShops = async () => {
    setIsLoading(true);
    const token = sessionStorage.getItem('token');
    if (token) {
      try {
        const res = await axios.get("http://localhost:5000/api/shops/my", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setShops(res.data);
        res.data.forEach(shop => fetchReviews(shop._id));
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

  // Shop edit
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
      fetchShops();
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

  // Menu edit dialog
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
      await axios.put(`http://localhost:5000/api/shops/${currentShopId}/menu-items/${editingMenuItem._id}`, editingMenuItem, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSnackbar({ open: true, message: 'Menu item updated!', severity: 'success' });
      handleCloseMenuEditDialog();
      fetchShops();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to update menu item', severity: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // Menu delete
  const handleOpenMenuDeleteConfirm = (item, shopId) => {
    setItemToDelete(item._id);
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
      await axios.delete(`http://localhost:5000/api/shops/${shopIdForDelete}/menu-items/${itemToDelete}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSnackbar({ open: true, message: 'Menu item deleted.', severity: 'info' });
      handleCloseMenuDeleteConfirm();
      fetchShops();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to delete menu item', severity: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  // Add menu item
  const handleAddMenuItem = async (shop, menuItem) => {
    try {
      setIsSaving(true);
      const itemWithAvailableQty = {
        ...menuItem,
        availableBreakfastQty: parseInt(menuItem.breakfastQty) || 0,
        availableLunchQty: parseInt(menuItem.lunchQty) || 0,
        availableDinnerQty: parseInt(menuItem.dinnerQty) || 0
      };
      const token = sessionStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/shops/${shop._id}/menu-items`,
        itemWithAvailableQty,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShops(prev => prev.map(s => s._id === shop._id ? { ...s, menuItems: response.data.shop.menuItems } : s));
      setNewMenuItem({ name: '', price: '', breakfastQty: '', lunchQty: '', dinnerQty: '' });
      setAddingItemInShop(null);
      setSnackbar({ open: true, message: 'Menu item added successfully with available quantities!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.msg || 'Failed to add menu item', severity: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // Shop delete
  const handleDeleteShop = async () => {
    setIsDeleting(true);
    const token = sessionStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/api/shops/${deleteDialog.shopId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSnackbar({ open: true, message: 'Shop deleted successfully.', severity: 'info' });
      setDeleteDialog({ open: false, shopId: null });
      fetchShops();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to delete shop', severity: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  // Replies
  const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleReplyChange = (reviewId, value) => setReplyInputs(prev => ({ ...prev, [reviewId]: value }));
  const handleSubmitReply = async (shopId, reviewId) => {
    const text = replyInputs[reviewId] || '';
    if (text.trim().length < 5) {
      setSnackbar({ open: true, message: 'Reply must be at least 5 characters', severity: 'error' });
      return;
    }
    setIsSaving(true);
    const token = sessionStorage.getItem('token');
    try {
      await axios.post(`http://localhost:5000/api/reviews/${reviewId}/reply`, { comment: text }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSnackbar({ open: true, message: 'Reply added successfully!', severity: 'success' });
      setReplyInputs(prev => ({ ...prev, [reviewId]: '' }));
      fetchReviews(shopId);
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to add reply', severity: 'error' });
    } finally {
      setIsSaving(false);
    }
  };
  const handleOpenEditReply = (reviewId, replyId, initialComment) => {
    setEditReplyDialog({ open: true, reviewId, replyId, initialComment });
    setComment(initialComment);
  };
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

  // Reviews popup
  const openReviewsPopup = (shopId, shopName) => setReviewsPopup({ open: true, shopId, shopName });
  const closeReviewsPopup = () => setReviewsPopup({ open: false, shopId: null, shopName: '' });

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

        <Grid container spacing={3} justifyContent={shops.length === 1 ? 'center' : 'flex-start'}>
          {shops.length === 0 ? (
            <Grid item xs={12}>
              <Typography color="text.secondary" align="center">
                No shops found. You can add one from the owner home page.
              </Typography>
            </Grid>
          ) : (
            shops.map((shop) => {
              const data = reviewsData[shop._id] || { reviews: [], averageRating: 0 };
              return (
                <Grid item xs={12} sm={8} md={6} lg={4} key={shop._id}>
                  <Card
                    elevation={isDark ? 2 : 6}
                    sx={{
                      borderRadius: 3,
                      bgcolor: 'background.paper',
                      boxShadow: isDark ? theme.shadows[2] : theme.shadows[6],
                      transition: '0.3s',
                      border: isDark ? `1px solid ${theme.palette.divider}` : 'none',
                      '&:hover': {
                        boxShadow: isDark ? theme.shadows[6] : theme.shadows[12],
                        transform: 'translateY(-4px) scale(1.02)'
                      }
                    }}
                  >
                    <Box
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        p: 2,
                        borderTopLeftRadius: 12,
                        borderTopRightRadius: 12,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
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

                      <Divider sx={{ my: 1, borderColor: theme.palette.divider }} />

                      <Typography variant="subtitle2" color="secondary.main" fontWeight="bold" mb={1} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <RestaurantMenuIcon fontSize="small" />
                        Menu
                      </Typography>

                      <Stack spacing={1}>
                        {shop.menuItems && shop.menuItems.length > 0 ? (
                          shop.menuItems.map((item) => (
                            <Box key={item._id} display="flex" alignItems="center" gap={1}>
                              <Box flex={1} display="flex" alignItems="center" justifyContent="space-between" minWidth={0}>
                                <Box display="flex" alignItems="center" gap={1.5}>
                                  <Typography fontWeight={600} color="text.primary" sx={{ minWidth: { xs: 50, sm: 60 } }}>
                                    {item.name}
                                  </Typography>
                                  <Stack direction="column" spacing={0.5}>
                                    <Stack direction="row" spacing={0.5}>
                                      <Chip
                                        icon={<FreeBreakfastIcon fontSize="small" />}
                                        label={`B: ${item.breakfastQty || 0}`}
                                        color="primary"
                                        size="small"
                                        sx={{
                                          fontWeight: 500,
                                          bgcolor: isDark ? 'primary.dark' : undefined,
                                          color: isDark ? 'primary.contrastText' : undefined
                                        }}
                                      />
                                      <Chip
                                        icon={<LunchDiningIcon fontSize="small" />}
                                        label={`L: ${item.lunchQty || 0}`}
                                        color="secondary"
                                        size="small"
                                        sx={{
                                          fontWeight: 500,
                                          bgcolor: isDark ? 'secondary.dark' : undefined,
                                          color: isDark ? 'secondary.contrastText' : undefined
                                        }}
                                      />
                                      <Chip
                                        icon={<DinnerDiningIcon fontSize="small" />}
                                        label={`D: ${item.dinnerQty || 0}`}
                                        color="success"
                                        size="small"
                                        sx={{
                                          fontWeight: 500,
                                          bgcolor: isDark ? 'success.dark' : undefined,
                                          color: isDark ? 'success.contrastText' : undefined
                                        }}
                                      />
                                    </Stack>

                                    <Stack direction="row" spacing={0.5}>
                                      <Chip
                                        label={`Avail B: ${item.availableBreakfastQty || 0}`}
                                        variant="outlined"
                                        color="primary"
                                        size="small"
                                        sx={{
                                          fontWeight: 500,
                                          borderColor: theme.palette.primary.main
                                        }}
                                      />
                                      <Chip
                                        label={`Avail L: ${item.availableLunchQty || 0}`}
                                        variant="outlined"
                                        color="secondary"
                                        size="small"
                                        sx={{
                                          fontWeight: 500,
                                          borderColor: theme.palette.secondary.main
                                        }}
                                      />
                                      <Chip
                                        label={`Avail D: ${item.availableDinnerQty || 0}`}
                                        variant="outlined"
                                        color="success"
                                        size="small"
                                        sx={{
                                          fontWeight: 500,
                                          borderColor: theme.palette.success.main
                                        }}
                                      />
                                    </Stack>
                                  </Stack>
                                </Box>

                                <Typography fontWeight={600} color="success.main" sx={{ minWidth: 60, textAlign: 'right' }}>
                                  Rs.{item.price}
                                </Typography>
                              </Box>

                              <IconButton color="primary" onClick={() => handleOpenMenuEditDialog(item, shop._id)}>
                                <EditIcon />
                              </IconButton>
                              <IconButton color="error" onClick={() => handleOpenMenuDeleteConfirm(item, shop._id)}>
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          ))
                        ) : (
                          <Typography color="text.secondary" sx={{ fontStyle: 'italic', my: 2 }}>
                            No menu items yet.
                          </Typography>
                        )}
                      </Stack>

                      <Divider sx={{ my: 2, borderColor: theme.palette.divider }} />

                      {addingItemInShop === shop._id ? (
                        <Box
                          component="form"
                          onSubmit={(e) => { e.preventDefault(); handleAddMenuItem(shop, newMenuItem); }}
                          mt={1}
                          display="flex"
                          gap={1}
                          flexWrap="wrap"
                        >
                          <TextField size="small" label="Item Name" value={newMenuItem.name} onChange={e => setNewMenuItem({ ...newMenuItem, name: e.target.value })} required sx={{ width: 160 }} autoFocus />
                          <TextField size="small" label="Price" type="number" value={newMenuItem.price} onChange={e => setNewMenuItem({ ...newMenuItem, price: e.target.value })} required sx={{ width: 100 }} />
                          <TextField size="small" label="B.Qty" type="number" value={newMenuItem.breakfastQty} onChange={e => setNewMenuItem({ ...newMenuItem, breakfastQty: e.target.value })} sx={{ width: 90 }} />
                          <TextField size="small" label="L.Qty" type="number" value={newMenuItem.lunchQty} onChange={e => setNewMenuItem({ ...newMenuItem, lunchQty: e.target.value })} sx={{ width: 90 }} />
                          <TextField size="small" label="D.Qty" type="number" value={newMenuItem.dinnerQty} onChange={e => setNewMenuItem({ ...newMenuItem, dinnerQty: e.target.value })} sx={{ width: 90 }} />
                          <IconButton color="success" type="submit" disabled={isSaving}>
                            <SaveIcon />
                          </IconButton>
                          <IconButton color="secondary" onClick={() => setAddingItemInShop(null)} disabled={isSaving}>
                            <CancelIcon />
                          </IconButton>
                        </Box>
                      ) : (
                        <Button fullWidth variant="outlined" startIcon={<AddIcon />} onClick={() => setAddingItemInShop(shop._id)}>
                          Add New Item
                        </Button>
                      )}

                      <Divider sx={{ my: 2, borderColor: theme.palette.divider }} />

                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{ cursor: 'pointer' }}
                        onClick={() => openReviewsPopup(shop._id, shop.shopName)}
                      >
                        <Box display="flex" alignItems="center">
                          <StarIcon sx={{ color: isDark ? theme.palette.warning.light : 'gold', mr: 1 }} />
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
        <Dialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, shopId: null })}
          PaperProps={{
            sx: {
              bgcolor: 'background.paper',
              color: 'text.primary',
              borderRadius: 2,
              border: isDark ? `1px solid ${theme.palette.divider}` : 'none'
            }
          }}
        >
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
        <Dialog
          open={isMenuEditDialogOpen}
          onClose={handleCloseMenuEditDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              bgcolor: 'background.paper',
              color: 'text.primary',
              borderRadius: 2,
              border: isDark ? `1px solid ${theme.palette.divider}` : 'none'
            }
          }}
        >
          <DialogTitle>Edit Menu Item</DialogTitle>
          <DialogContent>
            <TextField label="Name" name="name" value={editingMenuItem?.name || ''} onChange={handleMenuEditFormChange} fullWidth margin="dense" />
            <TextField label="Price" name="price" type="number" value={editingMenuItem?.price || ''} onChange={handleMenuEditFormChange} fullWidth margin="dense" />

            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
              Total Quantities (Owner Sets):
            </Typography>
            <Box display="flex" gap={1}>
              <TextField
                label="Breakfast Qty"
                name="breakfastQty"
                type="number"
                value={editingMenuItem?.breakfastQty || ''}
                onChange={(e) => {
                  const newQty = parseInt(e.target.value) || 0;
                  setEditingMenuItem(prev => ({ ...prev, breakfastQty: newQty, availableBreakfastQty: newQty }));
                }}
                fullWidth
                margin="dense"
              />
              <TextField
                label="Lunch Qty"
                name="lunchQty"
                type="number"
                value={editingMenuItem?.lunchQty || ''}
                onChange={(e) => {
                  const newQty = parseInt(e.target.value) || 0;
                  setEditingMenuItem(prev => ({ ...prev, lunchQty: newQty, availableLunchQty: newQty }));
                }}
                fullWidth
                margin="dense"
              />
              <TextField
                label="Dinner Qty"
                name="dinnerQty"
                type="number"
                value={editingMenuItem?.dinnerQty || ''}
                onChange={(e) => {
                  const newQty = parseInt(e.target.value) || 0;
                  setEditingMenuItem(prev => ({ ...prev, dinnerQty: newQty, availableDinnerQty: newQty }));
                }}
                fullWidth
                margin="dense"
              />
            </Box>

            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, color: 'primary.main' }}>
              Currently Available:
            </Typography>
            <Box display="flex" gap={1}>
              <TextField label="Available Breakfast" value={editingMenuItem?.availableBreakfastQty || 0} InputProps={{ readOnly: true }} fullWidth margin="dense" variant="filled" />
              <TextField label="Available Lunch" value={editingMenuItem?.availableLunchQty || 0} InputProps={{ readOnly: true }} fullWidth margin="dense" variant="filled" />
              <TextField label="Available Dinner" value={editingMenuItem?.availableDinnerQty || 0} InputProps={{ readOnly: true }} fullWidth margin="dense" variant="filled" />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseMenuEditDialog}>Cancel</Button>
            <Button onClick={handleMenuItemSave} variant="contained" disabled={isSaving}>Save Changes</Button>
          </DialogActions>
        </Dialog>

        {/* Menu Item Delete Confirmation Dialog */}
        <Dialog
          open={isMenuDeleteConfirmOpen}
          onClose={handleCloseMenuDeleteConfirm}
          PaperProps={{
            sx: {
              bgcolor: 'background.paper',
              color: 'text.primary',
              borderRadius: 2,
              border: isDark ? `1px solid ${theme.palette.divider}` : 'none'
            }
          }}
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete this menu item? This cannot be undone.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseMenuDeleteConfirm}>Cancel</Button>
            <Button onClick={handleConfirmMenuItemDelete} color="error" disabled={isDeleting}>Delete</Button>
          </DialogActions>
        </Dialog>

        {/* Reviews Popup Dialog */}
        <Dialog
          open={reviewsPopup.open}
          onClose={closeReviewsPopup}
          fullWidth
          maxWidth="md"
          PaperProps={{
            sx: {
              bgcolor: 'background.paper',
              color: 'text.primary',
              borderRadius: 2,
              border: isDark ? `1px solid ${theme.palette.divider}` : 'none'
            }
          }}
        >
          <DialogTitle
            sx={{
              bgcolor: isDark ? theme.palette.primary.darker || theme.palette.primary.dark : 'primary.light',
              color: 'primary.contrastText',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <StarIcon sx={{ mr: 1 }} />
            Reviews for {reviewsPopup.shopName}
            <IconButton onClick={closeReviewsPopup} sx={{ position: 'absolute', right: 8, top: 8, color: 'primary.contrastText' }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ borderColor: theme.palette.divider }}>
            {(() => {
              const currentReviews = reviewsData[reviewsPopup.shopId]?.reviews || [];
              return currentReviews.length === 0 ? (
                <Typography variant="body1" align="center" color="text.secondary" sx={{ py: 4 }}>
                  No reviews yet. Encourage your customers to leave feedback!
                </Typography>
              ) : (
                <List disablePadding>
                  {currentReviews.map((review) => (
                    <Card
                      key={review._id}
                      variant="outlined"
                      sx={{
                        mb: 2,
                        borderRadius: 2,
                        bgcolor: 'background.default',
                        borderColor: theme.palette.divider
                      }}
                    >
                      <CardContent>
                        <Box display="flex" alignItems="center" mb={1}>
                          <Avatar sx={{ bgcolor: 'primary.main', mr: 1, color: 'primary.contrastText' }}>
                            {review.user?.name?.[0]?.toUpperCase() || 'A'}
                          </Avatar>
                          <Typography variant="subtitle1" fontWeight="bold">{review.user?.name || 'Anonymous'}</Typography>
                          <Typography variant="caption" color="text.secondary" ml={1}>
                            {new Date(review.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Rating value={review.rating} readOnly size="small" sx={{ mb: 1 }} />
                        <Typography variant="body2" color="text.primary" paragraph>{review.comment}</Typography>

                        {review.replies?.map((reply) => (
                          <Box
                            key={reply._id}
                            sx={{
                              ml: 4,
                              mb: 1,
                              p: 1.25,
                              bgcolor: isDark ? 'action.selected' : 'grey.100',
                              borderRadius: 1,
                              border: `1px solid ${theme.palette.divider}`
                            }}
                          >
                            <Box display="flex" alignItems="center" mb={0.5}>
                              <Avatar sx={{ bgcolor: 'secondary.main', color: 'secondary.contrastText', width: 24, height: 24, mr: 1 }}>
                                {reply.owner?.name?.[0]?.toUpperCase() || 'O'}
                              </Avatar>
                              <Typography variant="subtitle2">{reply.owner?.name || 'Owner'}</Typography>
                              <Typography variant="caption" color="text.secondary" ml={1}>
                                {new Date(reply.createdAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                            <Typography variant="body2">{reply.comment}</Typography>
                            <Box display="flex" gap={0.5} mt={0.5}>
                              <IconButton size="small" color="primary" onClick={() => handleOpenEditReply(review._id, reply._id, reply.comment)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton size="small" color="error" onClick={() => handleDeleteReply(reviewsPopup.shopId, review._id, reply._id)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>
                        )) || null}

                        <Box sx={{ ml: 4, mt: 1 }}>
                          <TextField
                            size="small"
                            placeholder="Add a reply..."
                            value={replyInputs[review._id] || ''}
                            onChange={(e) => handleReplyChange(review._id, e.target.value)}
                            fullWidth
                            multiline
                            rows={2}
                            variant="outlined"
                            sx={{ mb: 1 }}
                            helperText={`${replyInputs[review._id]?.length || 0}/200 characters`}
                            inputProps={{ maxLength: 200 }}
                          />
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleSubmitReply(reviewsPopup.shopId, review._id)}
                            disabled={isSaving || !replyInputs[review._id]?.trim()}
                          >
                            Post Reply
                          </Button>
                        </Box>
                      </CardContent>
                      <Divider sx={{ borderColor: theme.palette.divider }} />
                      <CardActions sx={{ justifyContent: 'flex-end' }}>
                        <Button
                          startIcon={<DeleteIcon />}
                          color="error"
                          size="small"
                          onClick={() => handleDeleteReview(reviewsPopup.shopId, review._id)}
                          disabled={isDeleting}
                        >
                          Delete
                        </Button>
                      </CardActions>
                    </Card>
                  ))}
                </List>
              );
            })()}
          </DialogContent>
          <DialogActions sx={{ bgcolor: isDark ? 'background.default' : 'action.hover', borderTop: `1px solid ${theme.palette.divider}` }}>
            <Button onClick={closeReviewsPopup} color="primary">Close</Button>
          </DialogActions>
        </Dialog>

        {/* Edit Reply Dialog */}
        <Dialog
          open={editReplyDialog.open}
          onClose={() => setEditReplyDialog({ open: false })}
          PaperProps={{
            sx: {
              bgcolor: 'background.paper',
              color: 'text.primary',
              borderRadius: 2,
              border: isDark ? `1px solid ${theme.palette.divider}` : 'none'
            }
          }}
        >
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

        {/* Snackbar */}
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
