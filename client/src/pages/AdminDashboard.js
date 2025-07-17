// src/pages/AdminDashboard.js

import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import {
  Container, Grid, Paper, Typography, Box, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Tooltip, Dialog, DialogActions, DialogContent,
  DialogTitle, Button, TextField, Select, MenuItem, InputLabel, FormControl, Chip
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import PeopleIcon from '@mui/icons-material/People';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DeleteIcon from '@mui/icons-material/Delete';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const StatCard = ({ title, value, icon, color }) => (
  <Paper elevation={3} sx={{ p: 3, display: 'flex', alignItems: 'center', borderRadius: 3 }}>
    <Box sx={{ bgcolor: color, borderRadius: '50%', p: 2, mr: 2, color: '#fff' }}>{icon}</Box>
    <Box>
      <Typography color="text.secondary">{title}</Typography>
      <Typography variant="h4" component="h2" fontWeight="bold">{value}</Typography>
    </Box>
  </Paper>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  
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

  const handleSuspendUser = async (user) => {
    if (window.confirm(`Are you sure you want to ${user.isSuspended ? 'unsuspend' : 'suspend'} ${user.name}?`)) {
      const token = sessionStorage.getItem('token');
      try {
        await axios.put(`http://localhost:5000/api/admin/users/${user._id}/suspend`, {}, { headers: { Authorization: `Bearer ${token}` } });
        fetchData();
      } catch (err) {
        alert(err.response?.data?.msg || 'Failed to update user status.');
      }
    }
  };

  const handleDeleteUser = async () => {
    const token = sessionStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${deleteUser._id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchData();
      handleCloseDelete();
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to delete user.');
    }
  };
  const handleOpenDelete = (user) => setDeleteUser(user);
  const handleCloseDelete = () => setDeleteUser(null);
  
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const chartData = useMemo(() => {
    const roles = { admin: 0, owner: 0, user: 0 };
    users.forEach(user => { roles[user.role]++; });
    return [
      { name: 'Admins', count: roles.admin, fill: '#8884d8' },
      { name: 'Owners', count: roles.owner, fill: '#82ca9d' },
      { name: 'Users', count: roles.user, fill: '#ffc658' },
    ];
  }, [users]);


  if (loading) return <Box display="flex" justifyContent="center" mt={5}><CircularProgress /></Box>;
  if (error) return <Container sx={{mt: 4}}><Alert severity="error">{error}</Alert></Container>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold" color="primary.main">Admin Dashboard</Typography>
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid item xs={12} md={7}>
          <Grid container spacing={3}>
            <Grid item xs={12}><StatCard title="Total Users" value={stats?.totalUsers || 0} icon={<PeopleIcon />} color="#1976d2" /></Grid>
            <Grid item xs={12} sm={6}><StatCard title="Total Shops" value={stats?.totalShops || 0} icon={<StorefrontIcon />} color="#ff9800" /></Grid>
            <Grid item xs={12} sm={6}><StatCard title="Total Orders" value={stats?.totalOrders || 0} icon={<ShoppingCartIcon />} color="#4caf50" /></Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>User Roles Distribution</Typography>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><RechartsTooltip />
                <Bar dataKey="count" onClick={() => {}} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
      <Typography variant="h5" gutterBottom fontWeight="bold">User Management</Typography>
      <Paper elevation={3} sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField label="Search by Name/Email" variant="outlined" size="small" fullWidth onChange={(e) => setSearchTerm(e.target.value)} />
          <FormControl size="small" sx={{minWidth: 120}}><InputLabel>Filter by Role</InputLabel>
            <Select value={roleFilter} label="Filter by Role" onChange={(e) => setRoleFilter(e.target.value)}>
              <MenuItem value="all">All</MenuItem><MenuItem value="admin">Admin</MenuItem><MenuItem value="owner">Owner</MenuItem><MenuItem value="user">User</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <TableContainer>
          <Table>
            <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Email</TableCell><TableCell>Role</TableCell><TableCell>Status</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user._id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    {/* <<<<---- FIX: Added onClick to the Chip component ---->>>> */}
                    <Chip label={user.isSuspended ? 'Suspended' : 'Active'} color={user.isSuspended ? 'warning' : 'success'} size="small" onClick={() => {}} />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title={user.isSuspended ? 'Unsuspend User' : 'Suspend User'}><IconButton onClick={() => handleSuspendUser(user)}>{user.isSuspended ? <CheckCircleIcon color="success" /> : <BlockIcon />}</IconButton></Tooltip>
                    <Tooltip title="Delete User"><IconButton color="error" onClick={() => handleOpenDelete(user)}><DeleteIcon /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <Dialog open={!!deleteUser} onClose={handleCloseDelete}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent><Typography>Are you sure you want to delete <strong>{deleteUser?.name}</strong>? This action cannot be undone.</Typography></DialogContent>
        <DialogActions><Button onClick={handleCloseDelete}>Cancel</Button><Button onClick={handleDeleteUser} color="error" variant="contained">Delete</Button></DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;
