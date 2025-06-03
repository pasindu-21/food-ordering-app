import React from 'react';
import { Box, Link } from '@mui/material';
import { styled } from '@mui/material/styles';

const FooterBar = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(8),
  padding: theme.spacing(3, 2),
  background: 'linear-gradient(90deg, #e0e0e0 0%, #fafafa 100%)',
  textAlign: 'center',
  borderTop: `1px solid ${theme.palette.divider}`,
  color: theme.palette.text.secondary,
  fontSize: '1rem'
}));

const Footer = () => (
  <FooterBar>
    <span>
      &copy; {new Date().getFullYear()} FoodHub &middot;{' '}
      <Link href="https://mui.com/" target="_blank" rel="noopener" underline="hover">
        Built with Material-UI
      </Link>
    </span>
  </FooterBar>
);

export default Footer;
