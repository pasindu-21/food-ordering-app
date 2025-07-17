// src/pages/AdminDashboard.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container, Grid, Paper, Typography, Box, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Tooltip, Dialog, DialogActions, DialogContent,
  DialogTitle, Button
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
// <<<<---- EditIcon import එක අයින් කරා ---->>>>
import DeleteIcon from '@mui/icons-material/Delete';

// --- Reusable Components ---
const StatCard = ({ title, value, icon, color }) => (
  <Paper elevation={3} sx={{ p: 3, display: 'flex', alignItems: 'center', borderRadius: 3 }}>
    <Box sx={{ bgcolor: color, borderRadius: '50%', p: 2, mr: 2, color: '#fff' }}>{icon}</Box>
    <Box><Typography color="text.secondary">{title}</Typography><Typography variant="h4" component="h2" fontWeight="bold">{value}</Typography></Box>
  </Paper>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // <<<<---- Edit එකට අදාළ state අයින් කරා ---->>>>
  const [deleteUser, setDeleteUser] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    const token = sessionStorage.getItem('token');
    try {
      const [statsRes, usersRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/admin/users', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      setError('Failed to fetch admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);
  
  // <<<<---- Edit එකට අදාළ handler functions අයින් කරා ---->>>>

  const handleOpenDelete = (user) => setDeleteUser(user);
  const handleCloseDelete = () => setDeleteUser(null);

  const handleDeleteUser = async () => {
    const token = sessionStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${deleteUser._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
      handleCloseDelete();
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to delete user.');
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={5}><CircularProgress /></Box>;
  if (error) return <Container sx={{mt: 4}}><Alert severity="error">{error}</Alert></Container>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* --- Statistics Section --- */}
      <Typography variant="h4" gutterBottom fontWeight="bold" color="primary.main">Admin Dashboard</Typography>
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid item xs={12} sm={6} md={4}><StatCard title="Total Users" value={stats.totalUsers} icon={<PeopleIcon />} color="#1976d2" /></Grid>
        <Grid item xs={12} sm={6} md={4}><StatCard title="Total Shops" value={stats.totalShops} icon={<StorefrontIcon />} color="#ff9800" /></Grid>
        <Grid item xs={12} sm={6} md={4}><StatCard title="Total Orders" value={stats.totalOrders} icon={<ShoppingCartIcon />} color="#4caf50" /></Grid>
      </Grid>

      {/* --- User Management Section --- */}
      <Typography variant="h5" gutterBottom fontWeight="bold">User Management</Typography>
      <Paper elevation={3} sx={{ p: 2 }}>
        <TableContainer>
          <Table>
            <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Email</TableCell><TableCell>Role</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell align="right">
                    {/* <<<<---- Edit IconButton එක අයින් කරා ---->>>> */}
                    <Tooltip title="Delete User"><IconButton color="error" onClick={() => handleOpenDelete(user)}><DeleteIcon /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* <<<<---- Edit Dialog එක සම්පූර්ණයෙන්ම අයින් කරා ---->>>> */}
      
      {/* --- Dialog for Deleting User --- */}
      <Dialog open={!!deleteUser} onClose={handleCloseDelete}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent><Typography>Are you sure you want to delete <strong>{deleteUser?.name}</strong>? This action cannot be undone.</Typography></DialogContent>
        <DialogActions><Button onClick={handleCloseDelete}>Cancel</Button><Button onClick={handleDeleteUser} color="error" variant="contained">Delete</Button></DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;
