import React from 'react';
import { Container, Typography, Link } from '@mui/material';

function Contact() {
  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Contact</Typography>
      <Typography>
        Over Email: <Link href="mailto:info@foodhub.com">info@foodhub.com</Link>
      </Typography>
    </Container>
  );
}

export default Contact;
