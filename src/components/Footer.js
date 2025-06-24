import React from 'react';
import { Box, Typography, Link } from '@mui/material';

function Footer() {
  return (
    <Box sx={{ mt: 8, py: 3, bgcolor: 'rgba(245,245,245,0.95)', textAlign: 'center', borderTop: '1px solid #e0e0e0' }}>
      <Typography variant="body2" sx={{ color: '#888', fontFamily: 'Playfair Display', mb: 1 }}>
        © {new Date().getFullYear()} Harmony Hub
      </Typography>
      <Box>
        <Link href="/about" sx={{ mx: 1, color: 'primary.main', textDecoration: 'none', fontWeight: 500 }}>
          About
        </Link>
        |
        <Link href="mailto:dagmawiluleseged2000@gmail.com" sx={{ mx: 1, color: 'primary.main', textDecoration: 'none', fontWeight: 500 }}>
          Contact
        </Link>
      </Box>
    </Box>
  );
}

export default Footer; 