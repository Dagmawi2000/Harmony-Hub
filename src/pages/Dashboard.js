import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  IconButton,
} from '@mui/material';
import {
  SelfImprovement as MindfulnessIcon,
  Mood as MoodIcon,
  Groups as CommunityIcon,
  Person as ProfileIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const MotionCard = motion(Card);

const navigationCards = [
  {
    title: 'Daily Practice',
    description: 'Start your mindfulness journey',
    icon: <MindfulnessIcon sx={{ fontSize: 40 }} />,
    path: '/daily-practice',
    color: '#87CEEB',
  },
  {
    title: 'Mood Tracker',
    description: 'Track your emotional journey',
    icon: <MoodIcon sx={{ fontSize: 40 }} />,
    path: '/mood-tracker',
    color: '#FFE4B5',
  },
  {
    title: 'Micro-Community',
    description: 'Connect with your support group',
    icon: <CommunityIcon sx={{ fontSize: 40 }} />,
    path: '/community',
    color: '#5F9EA0',
  },
  {
    title: 'Profile',
    description: 'Manage your account',
    icon: <ProfileIcon sx={{ fontSize: 40 }} />,
    path: '/profile',
    color: '#FFB6C1',
  },
];

function Dashboard() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Welcome Message */}
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontFamily: 'Playfair Display',
              color: 'primary.main',
              mb: 2,
            }}
          >
            Welcome back, {currentUser?.email?.split('@')[0]}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Take a moment to check in with yourself today.
          </Typography>
        </Box>

        {/* Navigation Cards */}
        <Grid container spacing={4}>
          {navigationCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <MotionCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                sx={{
                  height: '100%',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                  },
                }}
              >
                <CardActionArea
                  onClick={() => navigate(card.path)}
                  sx={{ height: '100%' }}
                >
                  <CardContent
                    sx={{
                      p: 3,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                    }}
                  >
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        bgcolor: card.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2,
                        color: 'white',
                      }}
                    >
                      {card.icon}
                    </Box>
                    <Typography
                      gutterBottom
                      variant="h5"
                      component="h2"
                      sx={{ fontFamily: 'Playfair Display' }}
                    >
                      {card.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {card.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </MotionCard>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

export default Dashboard; 
