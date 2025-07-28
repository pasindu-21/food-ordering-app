import React from 'react';
import { Container, Typography, Box, Grid, Stack, Button, Fade, Divider, List, ListItem, ListItemIcon, ListItemText, useTheme } from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import SchoolIcon from '@mui/icons-material/School';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import GroupIcon from '@mui/icons-material/Group';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';

function About() {
  const theme = useTheme();

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: { xs: 4, md: 6 } }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: 300, md: 400 },
          backgroundImage: 'url(https://source.unsplash.com/random/1600x900/?campus-food-delivery)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          textAlign: 'center',
          mb: 6,
          borderRadius: { xs: 0, md: 3 },
          overflow: 'hidden',
          boxShadow: theme.shadows[10]
        }}
      >
        <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', bgcolor: 'rgba(0, 0, 0, 0.5)' }} />
        <Fade in timeout={1000}>
          <Stack spacing={2} sx={{ zIndex: 1, px: 3 }}>
            <Typography variant="h3" fontWeight={800} sx={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}>
              About UniFood
            </Typography>
            <Typography variant="h6" sx={{ maxWidth: 700, mx: 'auto', textShadow: '1px 1px 4px rgba(0,0,0,0.7)' }}>
              Empowering Campus Life with Seamless Food Ordering and Delivery
            </Typography>
            <Button variant="contained" color="secondary" size="large" startIcon={<RestaurantIcon />} href="/order" sx={{ mt: 2, px: 4, borderRadius: 99 }}>
              Start Ordering
            </Button>
          </Stack>
        </Fade>
      </Box>

      <Container maxWidth="lg">
        {/* Our Story Section */}
        <Fade in timeout={1200}>
          <Grid container spacing={4} sx={{ mb: 8, alignItems: 'center' }}>
            <Grid item xs={12} md={6}>
              <Typography variant="h4" fontWeight={700} color="primary.main" gutterBottom>
                Our Story
              </Typography>
              <Divider sx={{ width: 80, borderBottomWidth: 3, mb: 3, borderColor: 'primary.main' }} />
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
                UniFood was founded in 2023 by a group of university students who understood the struggles of campus life – long lines at canteens, limited options, and the hassle of coordinating meals between classes. Starting as a simple app to connect students with local shops, we've grown into a full-fledged platform serving thousands across campuses.
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                Today, UniFood partners with trusted vendors to deliver fresh meals to locations A, B, C, and D – making sure you never miss a bite, whether it's breakfast, lunch, or dinner.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: theme.shadows[6] }}>
                <img src="https://source.unsplash.com/random/600x400/?students-food" alt="UniFood team on campus" style={{ width: '100%', display: 'block' }} />
              </Box>
            </Grid>
          </Grid>
        </Fade>

        {/* Mission & Values Section */}
        <Fade in timeout={1600}>
          <Box sx={{ mb: 8 }}>
            <Typography variant="h4" fontWeight={700} color="primary.main" align="center" gutterBottom>
              Our Mission & Values
            </Typography>
            <Divider sx={{ width: 100, mx: 'auto', borderBottomWidth: 3, mb: 4, borderColor: 'primary.main' }} />
            <Grid container spacing={4}>
              <Grid item xs={12} sm={4}>
                <Stack alignItems="center" spacing={2} sx={{ textAlign: 'center' }}>
                  <SchoolIcon sx={{ fontSize: 60, color: 'primary.main' }} />
                  <Typography variant="h6" fontWeight={600}>Student-Centric</Typography>
                  <Typography>Designed for busy campus life with easy ordering and time slots.</Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Stack alignItems="center" spacing={2} sx={{ textAlign: 'center' }}>
                  <DeliveryDiningIcon sx={{ fontSize: 60, color: 'primary.main' }} />
                  <Typography variant="h6" fontWeight={600}>Fast & Reliable</Typography>
                  <Typography>Quick deliveries to A, B, C, D locations with real-time tracking.</Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Stack alignItems="center" spacing={2} sx={{ textAlign: 'center' }}>
                  <GroupIcon sx={{ fontSize: 60, color: 'primary.main' }} />
                  <Typography variant="h6" fontWeight={600}>Community Focused</Typography>
                  <Typography>Supporting local shops and fostering campus connections.</Typography>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </Fade>

        {/* Why Choose UniFood Section */}
        <Fade in timeout={2000}>
          <Box sx={{ mb: 8 }}>
            <Typography variant="h4" fontWeight={700} color="primary.main" align="center" gutterBottom>
              Why Choose UniFood?
            </Typography>
            <Divider sx={{ width: 100, mx: 'auto', borderBottomWidth: 3, mb: 4, borderColor: 'primary.main' }} />
            <List sx={{ maxWidth: 800, mx: 'auto' }}>
              <ListItem>
                <ListItemIcon><RestaurantIcon color="primary" /></ListItemIcon>
                <ListItemText primary="Diverse Menu Options" secondary="From quick snacks to full meals, customized for your schedule." />
              </ListItem>
              <ListItem>
                <ListItemIcon><SchoolIcon color="primary" /></ListItemIcon>
                <ListItemText primary="Campus Integration" secondary="Seamless ordering from any location with real-time updates." />
              </ListItem>
              <ListItem>
                <ListItemIcon><GroupIcon color="primary" /></ListItemIcon>
                <ListItemText primary="Secure & User-Friendly" secondary="Easy payments, order history, and admin tools for shop owners." />
              </ListItem>
            </List>
          </Box>
        </Fade>

        {/* Contact Us Section */}
        <Fade in timeout={2400}>
          <Box sx={{ textAlign: 'center', py: 4, bgcolor: 'primary', borderRadius: 3 }}>
            <Typography variant="h4" fontWeight={700} color="secondary.main" gutterBottom> {/* FIXED: Changed color to secondary.main */}
              Get in Touch
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
              Questions or feedback? We're here to help. Reach out via email or phone.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <Button variant="outlined" color="" startIcon={<EmailIcon />} href="mailto:support@unifood.com" aria-label="Email us">
                support@unifood.com
              </Button>
              <Button variant="outlined" color="primary" startIcon={<PhoneIcon />} href="tel:+1234567890" aria-label="Call us">
                +1 (234) 567-890
              </Button>
            </Stack>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default About;
