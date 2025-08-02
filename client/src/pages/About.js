import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Divider,
  Stack,
  Button,
  Card,
  CardContent,
  useTheme,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import GroupIcon from '@mui/icons-material/Group';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';

export default function About() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const sectionTitleStyle = {
    fontFamily: "'Playfair Display', serif",
    fontWeight: 700,
    fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
    color: isDark ? '#fff' : '#111',
    mb: 1.5,
  };

  const paragraphStyle = {
    fontFamily: "'Inter', sans-serif",
    color: isDark ? '#ccc' : '#555',
    lineHeight: 1.6,
    fontSize: '1rem',
  };

  const cardStyle = {
    textAlign: 'center',
    p: 3,
    boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.1)',
    borderRadius: 3,
    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: isDark ? '0 8px 30px rgba(0,0,0,0.6)' : '0 8px 30px rgba(0,0,0,0.2)',
    },
  };

  return (
    <Box sx={{ bgcolor: 'background.default', py: 6 }}>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box
          sx={{
            minHeight: 300,
            background: `url('https://source.unsplash.com/random/?food,campus') center/cover no-repeat`,
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 4,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(59, 58, 58, 0.6)',
              borderRadius: 3,
            },
          }}
        >
          <Box
            sx={{
              textAlign: 'center',
              color: '#fff',
              position: 'relative',
              zIndex: 1,
              maxWidth: 600,
              p: 2,
            }}
          >
            <Typography
              sx={{
                ...sectionTitleStyle,
                color: '#fff',
                fontSize: { xs: '2rem', md: '3.5rem' },
              }}
            >
              We’re simplifying campus food life
            </Typography>
            <Typography sx={{ ...paragraphStyle, color: '#f0f0f0', lineHeight: 1.6 }}>
              UniFood connects students with nearby food vendors. Order meals, skip queues, and enjoy
              convenience at your fingertips. We're here to make your busy student life a little
              easier.
            </Typography>
          </Box>
        </Box>

        {/* Our Story Section */}
        <Grid container spacing={4} alignItems="center" sx={{ mb: 6 }}>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                width: '100%',
                height: { xs: 200, md: 280 },
                borderRadius: 3,
                background: `url('https://source.unsplash.com/random/?students,canteen') center/cover no-repeat`,
                boxShadow: isDark
                  ? '0 6px 20px rgba(0,0,0,0.5)'
                  : '0 6px 20px rgba(0,0,0,0.1)',
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography sx={sectionTitleStyle}>Our Story</Typography>
            <Typography sx={paragraphStyle}>
              UniFood was born out of necessity by students who knew the pain of standing in long
              lines. We built a solution that made it easy to order food from your phone and get it
              delivered around campus. Our mission is to give students back their time and empower
              local food shops by connecting them with a vibrant community.
            </Typography>
          </Grid>
        </Grid>

        {/* What Makes Us Different Section */}
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography sx={{ ...sectionTitleStyle, mb: 1 }}>
            What Makes Us Different
          </Typography>
          <Typography sx={{ ...paragraphStyle, mb: 4, mx: 'auto', maxWidth: 500 }}>
            Our platform is built from the ground up with students and local vendors in mind. We
            focus on what truly matters to our community.
          </Typography>
          <Grid container spacing={3} justifyContent="center">
            {[
              {
                icon: <SchoolIcon sx={{ fontSize: 50 }} color="primary" />,
                title: 'Built for Students',
                desc: 'We prioritize student convenience, timing, and affordability. Our app is simple to use and designed for your busy schedule.',
              },
              {
                icon: <DeliveryDiningIcon sx={{ fontSize: 50 }} color="primary" />,
                title: 'Fast & Reliable Delivery',
                desc: 'We deliver to campus locations A, B, C, and D, always on time. Our dedicated delivery team ensures your food is fresh and hot.',
              },
              {
                icon: <GroupIcon sx={{ fontSize: 50 }} color="primary" />,
                title: 'Empowering Local Vendors',
                desc: 'We empower local food shops by connecting them directly with thousands of students, helping them grow their business.',
              },
            ].map(({ icon, title, desc }) => (
              <Grid item xs={12} sm={6} md={4} key={title}>
                <Card sx={cardStyle}>
                  <CardContent>
                    <Stack spacing={1.5} alignItems="center">
                      {icon}
                      <Typography variant="h6" fontWeight={600} mt={1.5}>
                        {title}
                      </Typography>
                      <Typography sx={{ color: isDark ? '#aaa' : '#666', fontSize: '0.95rem' }}>
                        {desc}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Contact Section */}
        <Box
          sx={{
            textAlign: 'center',
            py: 5,
            px: 3,
            background: isDark
              ? `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url('https://source.unsplash.com/random/?contact,email') center/cover no-repeat`
              : `linear-gradient(rgba(100, 100, 100, 0.53), rgba(125, 123, 123, 0.56)), url('https://source.unsplash.com/random/?contact,email') center/cover no-repeat`,
            borderRadius: 3,
          }}
        >
          <Typography sx={{ ...sectionTitleStyle, mb: 1 }}>Get in Touch</Typography>
          <Typography sx={{ ...paragraphStyle, mx: 'auto', mb: 3, maxWidth: 500 }}>
            We'd love to hear from you. Whether you have feedback, questions, or just want to say
            hi, feel free to reach out.
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
            divider={
              <Divider
                orientation="vertical"
                flexItem
                sx={{ display: { xs: 'none', sm: 'block' } }}
              />
            }
          >
            <Button
              variant="contained"
              size="medium"
              startIcon={<EmailIcon />}
              href="mailto:support@unifood.com"
              sx={{
                bgcolor: 'primary.main',
                color: '#fff',
                '&:hover': { bgcolor: 'primary.dark' },
              }}
            >
              support@unifood.com
            </Button>
            <Button
              variant="contained"
              size="medium"
              startIcon={<PhoneIcon />}
              href="tel:+1234567890"
              sx={{
                bgcolor: 'secondary.main',
                color: '#fff',
                '&:hover': { bgcolor: 'secondary.dark' },
              }}
            >
              +1 (234) 567-890
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
