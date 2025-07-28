import React from 'react';
import { Container, Typography, Box, Divider, Paper, useTheme } from '@mui/material';

function PrivacyPolicy() {
  const theme = useTheme();

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 5 }}>
      <Container maxWidth="md" sx={{ bgcolor: theme.palette.background.paper, p: 4, borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center" fontWeight="bold" color="primary.main">
          Privacy Policy
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <Typography variant="body1" paragraph>
          At UniFood, your privacy is of paramount importance to us. This Privacy Policy explains how we collect, use, and protect your personal information when you use our services.
        </Typography>

        <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mt: 3 }}>
          Information We Collect
        </Typography>
        <Typography variant="body1" paragraph>
          We collect personal information such as your name, contact details, delivery location, and payment information to process your orders efficiently and provide you with a personalized experience.
        </Typography>

        <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mt: 3 }}>
          How We Use Your Information
        </Typography>
        <Typography variant="body1" paragraph>
          Your information is used solely for processing orders, improving our services, communicating important updates, and ensuring secure transactions.
        </Typography>

        <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mt: 3 }}>
          Data Security
        </Typography>
        <Typography variant="body1" paragraph>
          We employ state-of-the-art security measures to protect your personal data from unauthorized access, alteration, or disclosure.
        </Typography>

        <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mt: 3 }}>
          Sharing Your Information
        </Typography>
        <Typography variant="body1" paragraph>
          We do not sell or rent your personal information to third parties. Your data may be shared with our trusted partners for order fulfillment only.
        </Typography>

        <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mt: 3 }}>
          Your Rights and Choices
        </Typography>
        <Typography variant="body1" paragraph>
          You have the right to access, modify, or delete your personal information at any time by contacting our support team.
        </Typography>

        <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mt: 3 }}>
          Changes to This Policy
        </Typography>
        <Typography variant="body1" paragraph>
          We may update this Privacy Policy from time to time. Any changes will be communicated via our platform.
        </Typography>

        <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mt: 3 }}>
          Contact Us
        </Typography>
        <Typography variant="body1" paragraph>
          If you have any questions about this Privacy Policy, please contact us at support@unifood.com.
        </Typography>
      </Container>
    </Box>
  );
}

export default PrivacyPolicy;
