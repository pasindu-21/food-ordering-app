import React from 'react';
import {
  Box,
  Typography,
  Link,
  IconButton,
  Stack,
  Divider,
  useTheme,
  useMediaQuery,
  Container,
} from '@mui/material';

import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';

const Footer = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      component="footer"
      sx={{
        width: '100%',
        bgcolor: isDark ? '#494949ff' : '#ffffffff',
        color: isDark ? '#fcf5f5' : '#091ceaff',
        pt: { xs: 2, sm: 3 }, // Responsive padding top
        pb: { xs: 1, sm: 2 }, // Responsive padding bottom
        px: { xs: 1, sm: 2 }, // Responsive horizontal padding
        textAlign: 'center',
        borderTop: `1px solid ${isDark ? '#333' : '#ddd'}`,
        mt: 'auto', // Push to bottom
      }}
    >
      <Container maxWidth="lg">
        {/* Navigation Links */}
        <Stack
          direction={isMobile ? 'column' : 'row'}
          spacing={isMobile ? 1 : 3}
          alignItems="center"
          justifyContent="center"
          sx={{ mb: 2 }}
          flexWrap="wrap"
        >
          <Link 
            href="/privacy" 
            underline="hover" 
            color="inherit" 
            sx={{ 
              fontSize: { xs: 12, sm: 13, md: 14 },
              '&:hover': { color: theme.palette.primary.main }
            }}
          >
            Privacy Policy
          </Link>
          <Link 
            href="/about" 
            underline="hover" 
            color="inherit" 
            sx={{ 
              fontSize: { xs: 12, sm: 13, md: 14 },
              '&:hover': { color: theme.palette.primary.main }
            }}
          >
            About Us
          </Link>
          <Link 
            href="/contact" 
            underline="hover" 
            color="inherit" 
            sx={{ 
              fontSize: { xs: 12, sm: 13, md: 14 },
              '&:hover': { color: theme.palette.primary.main }
            }}
          >
            Contact
          </Link>
          {!isMobile && (
            <>
            </>
          )}
        </Stack>

        {/* Social Media Icons */}
        <Stack 
          direction="row" 
          justifyContent="center" 
          spacing={isTablet ? 1 : 2}
          sx={{ mb: 2 }}
        >
          <IconButton
            size={isMobile ? "small" : "medium"}
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ 
              color: isDark ? '#888' : '#333', 
              '&:hover': { 
                color: '#1877F2', // Facebook blue
                transform: 'scale(1.1)',
                transition: 'all 0.2s ease'
              }
            }}
          >
            <FacebookIcon fontSize={isMobile ? "small" : "medium"} />
          </IconButton>
          <IconButton
            size={isMobile ? "small" : "medium"}
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ 
              color: isDark ? '#888' : '#333', 
              '&:hover': { 
                color: '#E4405F', // Instagram pink
                transform: 'scale(1.1)',
                transition: 'all 0.2s ease'
              }
            }}
          >
            <InstagramIcon fontSize={isMobile ? "small" : "medium"} />
          </IconButton>
          <IconButton
            size={isMobile ? "small" : "medium"}
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ 
              color: isDark ? '#888' : '#333', 
              '&:hover': { 
                color: '#1DA1F2', // Twitter blue
                transform: 'scale(1.1)',
                transition: 'all 0.2s ease'
              }
            }}
          >
            <TwitterIcon fontSize={isMobile ? "small" : "medium"} />
          </IconButton>
        </Stack>

        <Divider sx={{ my: 1.5, opacity: 0.3 }} />

        {/* Copyright */}
        <Typography 
          variant="caption" 
          sx={{ 
            fontSize: { xs: 11, sm: 12, md: 13 }, 
            color: isDark ? '#f4f4f4ff' : '#0d6477ff',
            opacity: 0.8
          }}
        >
          © {new Date().getFullYear()} Uni Food. All rights reserved. | Made with ❤️ in Sri Lanka
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
