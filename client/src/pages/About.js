import React from 'react';
import { Container, Typography } from '@mui/material';

function About() {
  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>about us</Typography>
      <Typography>
        Details about unifood
      </Typography>
    </Container>
  );
}

export default About;
