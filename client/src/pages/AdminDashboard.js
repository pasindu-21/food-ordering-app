// src/pages/AdminDashboard.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Grid, Paper, Typography, Box, CircularProgress } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const StatCard = ({ title, value, icon, color }) => (
  <Paper elevation={3} sx={{ p: 3, display: 'flex', alignItems: 'center', borderRadius: 3 }}>
    <Box sx={{ bgcolor: color, borderRadius: '50%', p: 2, mr: 2, color: '#fff' }}>
      {icon}
    </Box>
    <Box>
      <Typography color="text.secondary">{title}</Typography>
      <Typography variant="h4" component="h2" fontWeight="bold">{value}</Typography>
    </Box>
  </Paper>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const token = sessionStorage.getItem('token');
      try {
        const res = await axios.get('http://localhost:5000/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
      } catch (error) {
        console.error("Failed to fetch admin stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold" color="primary.main">
        Admin Dashboard
      </Typography>
      {loading ? (
        <Box display="flex" justifyContent="center" mt={5}><CircularProgress /></Box>
      ) : stats ? (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard title="Total Users" value={stats.totalUsers} icon={<PeopleIcon />} color="#1976d2" />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard title="Total Shops" value={stats.totalShops} icon={<StorefrontIcon />} color="#ff9800" />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard title="Total Orders" value={stats.totalOrders} icon={<ShoppingCartIcon />} color="#4caf50" />
          </Grid>
          {/* You can add more components here to list users, shops etc. */}
        </Grid>
      ) : (
        <Typography color="error">Could not load dashboard data.</Typography>
      )}
    </Container>
  );
};

export default AdminDashboard;
