// src/pages/DailyReports.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box, Container, Typography, Card, CardContent, CircularProgress,
  Accordion, AccordionSummary, AccordionDetails, List, ListItem, ListItemIcon, ListItemText,
  Divider, Grid, Snackbar, Alert
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EventNoteIcon from '@mui/icons-material/EventNote';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const DailyReports = () => {
  const [summaries, setSummaries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });

  useEffect(() => {
    const fetchSummaries = async () => {
      setIsLoading(true);
      const token = sessionStorage.getItem('token');
      try {
        const res = await axios.get('http://localhost:5000/api/reports/daily', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSummaries(res.data);
      } catch (error) {
        setSnackbar({ open: true, message: 'Failed to fetch daily reports', severity: 'error' });
        console.error("Failed to fetch summaries", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSummaries();
  }, []);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="md">
        <Typography variant="h4" fontWeight="bold" color="primary.main" align="center" mb={4}>
          Daily Sales Reports
        </Typography>
        {summaries.length === 0 ? (
          <Typography align="center" color="text.secondary" sx={{ mt: 5 }}>No daily reports found yet.</Typography>
        ) : (
          summaries.map(summary => (
            <Card key={summary._id} sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <CalendarTodayIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight={600} color="primary.main">
                    Report for: {new Date(summary.date).toLocaleDateString()}
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <Box textAlign="center">
                      <PointOfSaleIcon color="success" sx={{ fontSize: 40 }} />
                      <Typography variant="h6">Rs. {summary.totalSales ? summary.totalSales.toFixed(2) : '0.00'}</Typography>
                      <Typography color="text.secondary">Total Sales</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box textAlign="center">
                      <ShoppingCartIcon color="info" sx={{ fontSize: 40 }} />
                      <Typography variant="h6">{summary.totalOrders || 0}</Typography>
                      <Typography color="text.secondary">Total Completed Orders</Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Accordion sx={{ '&:before': { display: 'none' }, boxShadow: 'none', border: '1px solid #e0e0e0' }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <EventNoteIcon color="action" sx={{ mr: 1 }} />
                    <Typography fontWeight={500}>Item-wise Summary</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {summary.itemSummary && Object.keys(summary.itemSummary).length > 0 ? (
                      <List dense>
                        {Object.entries(summary.itemSummary).map(([item, qty]) => (
                          <ListItem key={item}>
                            <ListItemIcon><ShoppingCartIcon fontSize="small" /></ListItemIcon>
                            <ListItemText primary={`${item}: ${qty} units sold`} />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>No item details for this day.</Typography>
                    )}
                  </AccordionDetails>
                </Accordion>
              </CardContent>
            </Card>
          ))
        )}
      </Container>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DailyReports;
