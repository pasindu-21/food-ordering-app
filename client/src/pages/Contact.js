import React, { useState } from 'react';
import { Container, Typography, Box, Grid, Stack, Button, Fade, TextField, useTheme } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SendIcon from '@mui/icons-material/Send';

function Contact() {
  const theme = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission (replace with actual API call if needed)
    console.log('Form submitted:', { name, email, message });
    setSubmitted(true);
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: { xs: 4, md: 6 } }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: 250, md: 350 },
          backgroundImage: 'url(https://source.unsplash.com/random/1600x900/?contact-us)',
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
              Contact UniFood
            </Typography>
            <Typography variant="h6" sx={{ maxWidth: 700, mx: 'auto', textShadow: '1px 1px 4px rgba(0,0,0,0.7)' }}>
              We're Here to Help – Reach Out for Support, Feedback, or Partnerships
            </Typography>
          </Stack>
        </Fade>
      </Box>

      <Container maxWidth="lg">
        {/* Contact Details Section */}
        <Fade in timeout={1200}>
          <Grid container spacing={4} sx={{ mb: 8 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="h4" fontWeight={700} color="primary.main" gutterBottom>
                Get in Touch
              </Typography>
              <Stack spacing={3}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <EmailIcon sx={{ color: 'primary.main', fontSize: 40 }} />
                  <Box>
                    <Typography variant="h6" fontWeight={600}>Email</Typography>
                    <Typography>support@unifood.com</Typography>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center">
                  <PhoneIcon sx={{ color: 'primary.main', fontSize: 40 }} />
                  <Box>
                    <Typography variant="h6" fontWeight={600}>Phone</Typography>
                    <Typography>+94 11 123 4567</Typography>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center">
                  <LocationOnIcon sx={{ color: 'primary.main', fontSize: 40 }} />
                  <Box>
                    <Typography variant="h6" fontWeight={600}>Address</Typography>
                    <Typography>UniFood HQ, University Campus, Colombo, Sri Lanka</Typography>
                  </Box>
                </Stack>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h4" fontWeight={700} color="primary.main" gutterBottom>
                Send Us a Message
              </Typography>
              <form onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  <TextField label="Your Name" variant="outlined" fullWidth required />
                  <TextField label="Your Email" type="email" variant="outlined" fullWidth required />
                  <TextField label="Message" multiline rows={4} variant="outlined" fullWidth required />
                  <Button variant="contained" color="primary" type="submit" endIcon={<SendIcon />} sx={{ alignSelf: 'flex-start' }}>
                    Send Message
                  </Button>
                </Stack>
              </form>
            </Grid>
          </Grid>
        </Fade>

        {/* Map Section (Optional - Embed Google Map) */}
        <Fade in timeout={1600}>
          <Box sx={{ mb: 8 }}>
            <Typography variant="h4" fontWeight={700} color="primary.main" align="center" gutterBottom>
              Find Us
            </Typography>
            <Box sx={{ height: 300, borderRadius: 3, overflow: 'hidden', boxShadow: theme.shadows[6] }}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.902976871!2d79.858682!3d6.902207!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae2593cfeccee13%3A0x2c7a7e6e5d0e7d!2sUniversity%20of%20Colombo!5e0!3m2!1sen!2slk!4v1690000000000!5m2!1sen!2slk"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="UniFood Location Map"
              ></iframe>
            </Box>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}

export default Contact;
