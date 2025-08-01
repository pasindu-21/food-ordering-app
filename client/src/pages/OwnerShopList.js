import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box, Container, Grid, Card, CardContent, CardActions, Typography, Button, TextField,
  IconButton, Stack, Divider, Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Snackbar, Alert
} from '@mui/material';
// 'useTheme' is no longer needed here if 'theme' variable is removed
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
import PhoneIcon from '@mui/icons-material/Phone'; // New for phone display

const OwnerShopList = () => {
  const [shops, setShops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentToken] = useState(sessionStorage.getItem('token'));
  const [editingShop, setEditingShop] = useState(null);
  const [formData, setFormData] = useState({ shopName: '', location: '', phone: '' }); // New: phone field

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

  useEffect(() => {
    fetchShops();
    // eslint-disable-next-line
  }, []);

  const fetchShops = () => {
    setIsLoading(true);
    if (currentToken) {
      axios.get("http://localhost:5000/api/shops/my", {
        headers: { Authorization: `Bearer ${currentToken}` },
      })
      .then(res => setShops(res.data))
      .catch(() => setSnackbar({ open: true, message: 'Failed to fetch shops', severity: 'error' }))
      .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  };

  // Shop edit handlers
  const handleEditClick = (shop) => {
    setEditingShop(shop._id);
    setFormData({ shopName: shop.shopName, location: shop.location || '', phone: shop.phone || '' }); // New: phone
  };

  const handleEditSave = async () => {
    if (!formData.shopName.trim()) return;
    await axios.put(`http://localhost:5000/api/shops/${editingShop}`, formData, {
      headers: { Authorization: `Bearer ${currentToken}` },
    });
    setEditingShop(null);
    setSnackbar({ open: true, message: 'Shop updated successfully!', severity: 'success' });
    fetchShops();
  };

  const handleEditCancel = () => {
    setEditingShop(null);
    setFormData({ shopName: '', location: '', phone: '' }); // New: phone
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

    await axios.put(`http://localhost:5000/api/shops/${currentShopId}`, {
      menuItemUpdate: {
        itemId: editingMenuItem._id,
        ...editingMenuItem
      }
    }, { headers: { Authorization: `Bearer ${currentToken}` } });

    handleCloseMenuEditDialog();
    setSnackbar({ open: true, message: 'Menu item updated!', severity: 'success' });
    fetchShops();
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

    await axios.put(`http://localhost:5000/api/shops/${shopIdForDelete}`, {
      menuItemDeleteId: itemToDelete._id
    }, { headers: { Authorization: `Bearer ${currentToken}` } });

    handleCloseMenuDeleteConfirm();
    setSnackbar({ open: true, message: 'Menu item deleted.', severity: 'info' });
    fetchShops();
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
    await axios.put(`http://localhost:5000/api/shops/${shop._id}`, {
      menuItems: updatedMenu
    }, { headers: { Authorization: `Bearer ${currentToken}` } });
    setNewMenuItem({ name: '', price: '', breakfastQty: '', lunchQty: '', dinnerQty: '' });
    setAddingItemInShop(null); // Hide form after adding
    setSnackbar({ open: true, message: 'New item added!', severity: 'success' });
    fetchShops();
  };

  // Shop delete confirmation dialog (existing)
  const handleDeleteShop = async () => {
    await axios.delete(`http://localhost:5000/api/shops/${deleteDialog.shopId}`, {
      headers: { Authorization: `Bearer ${currentToken}` }
    });
    setDeleteDialog({ open: false, shopId: null });
    setSnackbar({ open: true, message: 'Shop deleted successfully.', severity: 'info' });
    fetchShops();
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
            shops.map((shop) => (
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
                        <TextField label="Phone Number" name="phone" value={formData.phone} onChange={handleFormChange} fullWidth /> {/* New: Phone input */}
                      </Stack>
                    ) : (
                      <>
                        <Typography color="text.secondary" mb={1} fontSize={15}>Location: {shop.location}</Typography>
                        <Typography color="text.secondary" mb={1} fontSize={15}>Phone: {shop.phone || 'N/A'}</Typography> {/* New: Phone display */}
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
                                  <Chip onClick={() => {}} icon={<FreeBreakfastIcon sx={{ pointerEvents: 'none' }} fontSize="small" />} label={`B: ${item.breakfastQty}`} color="primary" size="small" sx={{ fontWeight: 500 }} />
                                  <Chip onClick={() => {}} icon={<LunchDiningIcon sx={{ pointerEvents: 'none' }} fontSize="small" />} label={`L: ${item.lunchQty}`} color="secondary" size="small" sx={{ fontWeight: 500 }} />
                                  <Chip onClick={() => {}} icon={<DinnerDiningIcon sx={{ pointerEvents: 'none' }} fontSize="small" />} label={`D: ${item.dinnerQty}`} color="success" size="small" sx={{ fontWeight: 500 }} />
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
                        <IconButton color="success" type="submit"><SaveIcon /></IconButton>
                        <IconButton color="secondary" onClick={() => setAddingItemInShop(null)}><CancelIcon /></IconButton>
                      </Box>
                    ) : (
                      <Button fullWidth variant="outlined" startIcon={<AddIcon />} onClick={() => setAddingItemInShop(shop._id)}>Add New Item</Button>
                    )}
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                    {editingShop === shop._id ? (
                      <>
                        <Button variant="contained" color="success" size="small" startIcon={<SaveIcon />} onClick={handleEditSave}>Save</Button>
                        <Button variant="outlined" color="secondary" size="small" startIcon={<CancelIcon />} onClick={handleEditCancel}>Cancel</Button>
                      </>
                    ) : (
                      <>
                        <Button variant="outlined" color="primary" size="small" startIcon={<EditIcon />} onClick={() => handleEditClick(shop)}>Edit Shop</Button>
                        <Button variant="outlined" color="error" size="small" startIcon={<DeleteIcon />} onClick={() => setDeleteDialog({ open: true, shopId: shop._id })}>Delete Shop</Button>
                      </>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
        {/* --- MENU ITEM EDIT DIALOG --- */}
        <Dialog open={isMenuEditDialogOpen} onClose={handleCloseMenuEditDialog}>
          <DialogTitle>Edit Menu Item</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1, minWidth: { xs: 'auto', sm: 400 } }}>
              <TextField label="Name" name="name" value={editingMenuItem?.name || ''} onChange={handleMenuEditFormChange} fullWidth />
              <TextField label="Price" name="price" type="number" value={editingMenuItem?.price || ''} onChange={handleMenuEditFormChange} fullWidth />
              <TextField label="Breakfast Qty" name="breakfastQty" type="number" value={editingMenuItem?.breakfastQty || ''} onChange={handleMenuEditFormChange} fullWidth />
              <TextField label="Lunch Qty" name="lunchQty" type="number" value={editingMenuItem?.lunchQty || ''} onChange={handleMenuEditFormChange} fullWidth />
              <TextField label="Dinner Qty" name="dinnerQty" type="number" value={editingMenuItem?.dinnerQty || ''} onChange={handleMenuEditFormChange} fullWidth />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseMenuEditDialog} color="secondary">Cancel</Button>
            <Button onClick={handleMenuItemSave} variant="contained" color="primary">Save Changes</Button>
          </DialogActions>
        </Dialog>

        {/* --- MENU ITEM DELETE CONFIRMATION DIALOG --- */}
        <Dialog open={isMenuDeleteConfirmOpen} onClose={handleCloseMenuDeleteConfirm}>
          <DialogTitle>Confirm Delete Menu Item</DialogTitle>
          <DialogContent><Typography>Are you sure you want to delete <strong>{itemToDelete?.name || 'this item'}</strong>? This action cannot be undone.</Typography></DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseMenuDeleteConfirm} color="secondary">Cancel</Button>
            <Button onClick={handleConfirmMenuItemDelete} color="error" variant="contained">Delete</Button>
          </DialogActions>
        </Dialog>

        {/* Delete Shop Dialog (existing) */}
        <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, shopId: null })}><DialogTitle>Delete Shop?</DialogTitle><DialogContent><Typography>Are you sure you want to delete this shop? This action cannot be undone.</Typography></DialogContent><DialogActions sx={{ p: 2 }}><Button onClick={() => setDeleteDialog({ open: false, shopId: null })} color="secondary">Cancel</Button><Button onClick={handleDeleteShop} color="error" variant="contained">Delete</Button></DialogActions></Dialog>

        {/* Snackbar for Notifications */}
        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default OwnerShopList;
