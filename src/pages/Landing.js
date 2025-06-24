import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Link,
  AppBar,
  Toolbar,
  Paper,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SpaIcon from '@mui/icons-material/Spa';
import MoodIcon from '@mui/icons-material/Mood';
import GroupsIcon from '@mui/icons-material/Groups';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const MotionBox = motion(Box);

const features = [
  {
    icon: <SpaIcon sx={{ fontSize: 40, color: '#7ea6e0' }} />,
    title: 'Daily Practice',
    desc: 'Guided breathing, gratitude journaling, and mindfulness routines.'
  },
  {
    icon: <MoodIcon sx={{ fontSize: 40, color: '#f7b267' }} />,
    title: 'Mood Tracker',
    desc: 'Track your mood and reflect on your emotional journey.'
  },
  {
    icon: <GroupsIcon sx={{ fontSize: 40, color: '#a3d9c9' }} />,
    title: 'Micro-Community',
    desc: 'Connect, share, and grow with supportive micro-communities.'
  },
  {
    icon: <AccountCircleIcon sx={{ fontSize: 40, color: '#b39ddb' }} />,
    title: 'Profile',
    desc: 'Personalize your experience and wellness journey.'
  }
];

const testimonials = [
  {
    quote: "Harmony Hub has transformed my daily routine. I feel more centered and connected.",
    author: "Sarah M.",
  },
  {
    quote: "The micro-community feature helped me find my support system. It's been life-changing.",
    author: "James K.",
  },
  {
    quote: "Finally, a wellness platform that feels personal and authentic.",
    author: "Emma R.",
  },
];

const heroVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 1 } }
};

const floatVariants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

function Landing() {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'transparent', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation Bar */}
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontFamily: 'Playfair Display' }}>
            Harmony Hub
          </Typography>
          <Link component={RouterLink} to="/about" color="inherit" sx={{ mx: 2 }}>
            About
          </Link>
          <Link component={RouterLink} to="/features" color="inherit" sx={{ mx: 2 }}>
            Features
          </Link>
          <Link component={RouterLink} to="/contact" color="inherit" sx={{ mx: 2 }}>
            Contact
          </Link>
          <Button
            component={RouterLink}
            to="/login"
            variant="contained"
            color="primary"
            sx={{ ml: 2 }}
          >
            Login
          </Button>
        </Toolbar>
      </AppBar>

      {/* Animated Hero Section */}
      <Box
        sx={{
          position: 'relative',
          pt: { xs: 8, md: 14 },
          pb: { xs: 6, md: 10 },
          background: 'linear-gradient(120deg, #e0e7ff 0%, #f5f5f5 100%)',
          overflow: 'hidden',
        }}
      >
        {/* Floating shapes for calming animation */}
        <motion.div
          variants={floatVariants}
          animate="animate"
          style={{
            position: 'absolute',
            top: 40,
            left: 60,
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'rgba(126, 166, 224, 0.18)',
            zIndex: 0,
            filter: 'blur(2px)',
          }}
        />
        <motion.div
          variants={floatVariants}
          animate="animate"
          style={{
            position: 'absolute',
            top: 120,
            right: 80,
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: 'rgba(163, 217, 201, 0.15)',
            zIndex: 0,
            filter: 'blur(2px)',
          }}
        />
        <motion.div
          variants={floatVariants}
          animate="animate"
          style={{
            position: 'absolute',
            bottom: 40,
            left: 120,
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'rgba(247, 178, 103, 0.13)',
            zIndex: 0,
            filter: 'blur(2px)',
          }}
        />
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <motion.div
            variants={heroVariants}
            initial="hidden"
            animate="visible"
          >
            <Typography
              variant="h2"
              sx={{
                fontFamily: 'Playfair Display',
                fontWeight: 700,
                color: '#3a3a3a',
                textAlign: 'center',
                mb: 2,
                fontSize: { xs: '2.2rem', md: '3.2rem' },
                letterSpacing: 1,
              }}
            >
              Welcome to Harmony Hub
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: '#5a6fcb',
                textAlign: 'center',
                mb: 4,
                fontWeight: 400,
                fontSize: { xs: '1.1rem', md: '1.5rem' },
              }}
            >
              Your personal wellness and micro-community platform
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
              <Button
                variant="contained"
                size="large"
                sx={{
                  bgcolor: '#6a7fdb',
                  color: 'white',
                  px: 4,
                  borderRadius: 3,
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  boxShadow: 2,
                  transition: 'background 0.3s',
                  '&:hover': { bgcolor: '#5a6fcb' },
                }}
                onClick={() => navigate('/signup')}
              >
                Get Started
              </Button>
              <Button
                variant="outlined"
                size="large"
                sx={{
                  color: '#6a7fdb',
                  borderColor: '#6a7fdb',
                  px: 4,
                  borderRadius: 3,
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  background: 'rgba(255,255,255,0.7)',
                  transition: 'border 0.3s',
                  '&:hover': { borderColor: '#5a6fcb', background: 'rgba(255,255,255,0.9)' },
                }}
                onClick={() => navigate('/login')}
              >
                Log In
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
        <Grid container spacing={4} justifyContent="center">
          {features.map((feature, idx) => (
            <Grid item xs={12} sm={6} md={3} key={feature.title}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: idx * 0.15 }}
                viewport={{ once: true }}
              >
                <Paper
                  elevation={3}
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    textAlign: 'center',
                    bgcolor: 'rgba(255,255,255,0.85)',
                    boxShadow: '0 4px 24px 0 rgba(106,127,219,0.07)',
                    minHeight: 220,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'box-shadow 0.3s',
                    '&:hover': {
                      boxShadow: '0 8px 32px 0 rgba(106,127,219,0.15)',
                    },
                  }}
                >
                  {feature.icon}
                  <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 700, color: '#3a3a3a' }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6a7fdb', fontWeight: 500 }}>
                    {feature.desc}
                  </Typography>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Testimonials Section */}
      <Box sx={{ py: 8, bgcolor: 'rgba(135, 206, 235, 0.1)', borderRadius: 4 }}>
        <Typography
          variant="h2"
          component="h2"
          sx={{
            textAlign: 'center',
            mb: 6,
            fontFamily: 'Playfair Display',
          }}
        >
          What Our Users Say
        </Typography>
        <Grid container spacing={4}>
          {testimonials.map((testimonial, index) => (
            <Grid item xs={12} md={4} key={index}>
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography
                      variant="body1"
                      sx={{ fontStyle: 'italic', mb: 2 }}
                    >
                      "{testimonial.quote}"
                    </Typography>
                    <Typography variant="subtitle1" color="primary">
                      - {testimonial.author}
                    </Typography>
                  </CardContent>
                </Card>
              </MotionBox>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}

export default Landing; 
