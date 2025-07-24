import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import {
  Container, Grid, Paper, Typography, Box, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Tooltip, Dialog, DialogActions, DialogContent,
  DialogTitle, Button, TextField, Select, MenuItem, InputLabel, FormControl, Chip
} from '@mui/material';
import { PieChart, Pie, Legend, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import PeopleIcon from '@mui/icons-material/People';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DeleteIcon from '@mui/icons-material/Delete';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { useTheme } from '@mui/material/styles';


// Reusable Components
const StatCard = ({ title, value, icon, color }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const bgColor = isDark ? theme.palette.primary.dark : color;
  return (
    <Paper elevation={3} sx={{ p:3, display:'flex', alignItems:'center', borderRadius:3, height:'100%', bgcolor: theme.palette.background.paper }}>
      <Box sx={{ bgcolor: bgColor, borderRadius: '50%', p: 2, mr: 2, color: '#fff' }}>
        {icon}
      </Box>
      <Box>
        <Typography color="text.secondary">{title}</Typography>
        <Typography variant="h4" component="h2" fontWeight="bold" color="text.primary">{value}</Typography>
      </Box>
    </Paper>
  );
};


const CustomTooltip = ({ active, payload }) => {
  const theme = useTheme();
  if (active && payload && payload.length) {
    return (
      <Paper
        elevation={3}
        sx={{ 
          p: 1, 
          bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'rgba(255, 255, 255, 0.95)', 
          borderRadius: 2
        }}
      >
        <Typography variant="subtitle2" sx={{ color: theme.palette.text.primary }}>
          {`${payload[0].name}`}
        </Typography>
        <Typography variant="body2" color="primary" fontWeight="bold">
          {`Count: ${payload[0].value}`}
        </Typography>
      </Paper>
    );
  }
  return null;
};


const RoleChip = ({ role }) => {
  let color = 'default';
  if (role === 'admin') color = 'primary';
  else if (role === 'owner') color = 'secondary';
  return <Chip label={role.charAt(0).toUpperCase() + role.slice(1)} color={color} size="small" />;
};


const AdminDashboard = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [deleteUser, setDeleteUser] = useState(null);
  const adminName = JSON.parse(sessionStorage.getItem('user'))?.name || 'Admin';

  const fetchData = async () => {
    const token = sessionStorage.getItem('token');
    try {
      const [statsRes, usersRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/admin/users', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setError('');
    } catch (err) {
      console.error("Failed to fetch admin data:", err);
      setError('Failed to fetch admin data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
    if (!deleteUser) return;
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
    users.forEach(user => { if (roles[user.role] !== undefined) { roles[user.role]++; } });
    return [
      { name: 'Admins', value: roles.admin },
      { name: 'Owners', value: roles.owner },
      { name: 'Users', value: roles.user }
    ];
  }, [users]);

  // Dynamic chart colors for dark/light mode
  const COLORS = isDark
    ? ['#90caf9', '#f48fb1', '#80cbc4']  // lighter colors for dark bg
    : ['#1976d2', '#ed6c02', '#2e7d32']; // original colors for light bg

  if (loading) {
    return <Box display="flex" justifyContent="center" alignItems="center" sx={{ height: '100vh', bgcolor: theme.palette.background.default }}>
      <CircularProgress />
    </Box>;
  }

  return (
    <Box sx={{ 
      bgcolor: theme.palette.background.default, 
      minHeight: '100vh', 
      py: 4, 
      width: '100vw', 
      overflowX: 'hidden', 
      transition: 'background 0.3s' 
    }}>
      <Container maxWidth={false} disableGutters sx={{ width: '100vw !important' }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 1, pl: { xs: 2, md: 4 }, color: 'text.primary' }}>
          Welcome back, {adminName}!
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4, pl: { xs: 2, md: 4 } }}>
          Here's what's happening with your system today.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Grid container spacing={3} sx={{ mb: 4, px: { xs: 2, md: 50 } }}>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard title="Total Users" value={stats?.totalUsers || 0} icon={<PeopleIcon />} color={COLORS[0]} />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard title="Total Shops" value={stats?.totalShops || 0} icon={<StorefrontIcon />} color={COLORS[1]} />
          </Grid>
          <Grid item xs={12} sm={12} md={4}>
            <StatCard title="Total Orders" value={stats?.totalOrders || 0} icon={<ShoppingCartIcon />} color={COLORS[2]} />
          </Grid>
        </Grid>

        <Grid container spacing={3} alignItems="stretch" sx={{ px: { xs: 2, md: 10 } }}>
          <Grid item xs={12} lg={6}>
            <Paper elevation={isDark ? 2 : 3}
              sx={{ 
                width: '100%', 
                p: 10, 
                borderRadius: 10, 
                minHeight: 300, 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                bgcolor: theme.palette.background.paper,
                transition: "background 0.3s"
               }}>
              <Typography variant="h6" gutterBottom fontWeight="bold" color="text.primary">User Management</Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField 
                  label="Search by Name/Email" 
                  variant="outlined" 
                  size="small" 
                  fullWidth 
                  InputProps={{ sx: { bgcolor: theme.palette.background.default }}}
                  onChange={(e) => setSearchTerm(e.target.value)} 
                />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Role</InputLabel>
                  <Select value={roleFilter} label="Role" onChange={(e) => setRoleFilter(e.target.value)}>
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="owner">Owner</MenuItem>
                    <MenuItem value="user">User</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <TableContainer sx={{ flexGrow: 1, minHeight: '0', bgcolor: theme.palette.background.paper, borderRadius: 2, transition: "background 0.3s" }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow sx={{ 
                      '& .MuiTableCell-root': { fontWeight: 'bold', bgcolor: theme.palette.background.default, color: theme.palette.text.primary } 
                    }}>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow hover key={user._id}>
                        <TableCell sx={{ color: 'text.primary' }}>{user.name}</TableCell>
                        <TableCell sx={{ color: 'text.primary' }}>{user.email}</TableCell>
                        <TableCell><RoleChip role={user.role} /></TableCell>
                        <TableCell>
                          <Chip 
                            label={user.isSuspended ? 'Suspended' : 'Active'} 
                            color={user.isSuspended ? 'error' : 'success'} 
                            size="small" 
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title={user.isSuspended ? 'Unsuspend' : 'Suspend'}>
                            <IconButton onClick={() => handleSuspendUser(user)}>
                              {user.isSuspended ? <CheckCircleIcon color="success" /> : <BlockIcon color="warning" />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton color="error" onClick={() => handleOpenDelete(user)}><DeleteIcon /></IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} lg={6}>
            <Paper elevation={isDark ? 2 : 3}
              sx={{ 
                width: '170%', 
                p: 10, 
                borderRadius: 3, 
                minHeight: 200, 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                bgcolor: theme.palette.background.paper,
                transition: "background 0.3s"
              }}>
              <Typography variant="h6" gutterBottom fontWeight="bold" color="text.primary">User Roles Distribution</Typography>
              <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      innerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <Dialog open={!!deleteUser} onClose={handleCloseDelete} PaperProps={{ sx: { bgcolor: theme.palette.background.paper } }}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography color="text.primary">
            Are you sure you want to delete <strong>{deleteUser?.name}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete}>Cancel</Button>
          <Button onClick={handleDeleteUser} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
