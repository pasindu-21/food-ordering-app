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
} from '@mui/material';

import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';

const Footer = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      component="footer"
      sx={{
        width: '100%',
        bgcolor: isDark ? '#494949ff' : '#d5d5d5ff',
        color: isDark ? '#fcf5f5' : '#555',
        pt: 2,
        pb: 1,
        px: 2,
        textAlign: 'center',
        borderTop: `1px solid ${isDark ? '#333' : '#ddd'}`,
      }}
    >
      <Stack
        direction={isMobile ? 'column' : 'row'}
        spacing={2}
        alignItems="center"
        justifyContent="center"
        sx={{ mb: 1 }}
      >
        <Link href="/privacy" underline="hover" color="inherit" sx={{ fontSize: 13 }}>
          Privacy
        </Link>
        <Link href="/about" underline="hover" color="inherit" sx={{ fontSize: 13 }}>
          About Us
        </Link>
        <Link href="/contact" underline="hover" color="inherit" sx={{ fontSize: 13 }}>
          Contact
        </Link>
      </Stack>

      <Stack direction="row" justifyContent="center" spacing={1}>
        <IconButton
          size="small"
          href="https://facebook.com"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ color: isDark ? '#888' : '#333', '&:hover': { color: theme.palette.primary.main } }}
        >
          <FacebookIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ color: isDark ? '#888' : '#333', '&:hover': { color: theme.palette.primary.main } }}
        >
          <InstagramIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          href="https://twitter.com"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ color: isDark ? '#888' : '#333', '&:hover': { color: theme.palette.primary.main } }}
        >
          <TwitterIcon fontSize="small" />
        </IconButton>
      </Stack>

      <Divider sx={{ my: 1, opacity: 0.3 }} />

      <Typography variant="caption" sx={{ fontSize: 12, color: isDark ? '#fcf5f5' : '#777' }}>
        © {new Date().getFullYear()} FoodHub. All rights reserved.
      </Typography>
    </Box>
  );
};

export default Footer;
