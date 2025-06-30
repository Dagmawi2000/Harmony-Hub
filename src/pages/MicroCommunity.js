import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import CommunityList from '../components/CommunityList';
import ReflectionPost from '../components/ReflectionPost';

const MotionBox = motion(Box);

function MicroCommunity() {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6">Please log in to access the community.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ fontFamily: 'Playfair Display', mb: 4, textAlign: 'center' }}>
          Micro Community
        </Typography>
        <Grid container spacing={4}>
          {/* Community List and Info */}
          <Grid item xs={12} md={4}>
            <MotionBox
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <CommunityList />
            </MotionBox>
          </Grid>
          {/* Reflections and Posts */}
          <Grid item xs={12} md={8}>
            <MotionBox
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ReflectionPost />
            </MotionBox>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default MicroCommunity; 
