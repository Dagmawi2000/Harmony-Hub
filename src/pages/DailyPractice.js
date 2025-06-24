import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  IconButton,
  AppBar,
  Toolbar,
  Grid,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Refresh as ResetIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

const MotionBox = motion(Box);

function DailyPractice() {
  const [breathingTime, setBreathingTime] = useState(60); // 60 seconds
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [gratitudeEntry, setGratitudeEntry] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    let timer;
    if (isBreathingActive && breathingTime > 0) {
      timer = setInterval(() => {
        setBreathingTime((prev) => prev - 1);
      }, 1000);
    } else if (breathingTime === 0) {
      setIsBreathingActive(false);
    }
    return () => clearInterval(timer);
  }, [isBreathingActive, breathingTime]);

  const handleBreathingToggle = () => {
    setIsBreathingActive(!isBreathingActive);
  };

  const handleResetBreathing = () => {
    setBreathingTime(60);
    setIsBreathingActive(false);
  };

  const handleSaveGratitude = async () => {
    if (!gratitudeEntry.trim()) return;

    setIsSaving(true);
    try {
      await addDoc(collection(db, 'users', currentUser.uid, 'gratitude'), {
        entry: gratitudeEntry,
        timestamp: serverTimestamp(),
      });
      setGratitudeEntry('');
    } catch (error) {
      console.error('Error saving gratitude entry:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Navigation Bar */}
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/dashboard')}
          >
            <BackIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, fontFamily: 'Playfair Display' }}
          >
            Daily Practice
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          {/* Breathing Exercise */}
          <Grid item xs={12} md={6}>
            <MotionBox
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <Typography
                  variant="h5"
                  component="h2"
                  sx={{ mb: 3, fontFamily: 'Playfair Display' }}
                >
                  Breathing Exercise
                </Typography>
                <Box
                  sx={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                  }}
                >
                  <CircularProgress
                    variant="determinate"
                    value={(breathingTime / 60) * 100}
                    size={200}
                    thickness={4}
                    sx={{ color: 'primary.main' }}
                  />
                  <Typography
                    variant="h4"
                    component="div"
                    sx={{
                      position: 'absolute',
                      fontFamily: 'Playfair Display',
                    }}
                  >
                    {breathingTime}s
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <IconButton
                    onClick={handleBreathingToggle}
                    color="primary"
                    size="large"
                  >
                    {isBreathingActive ? <PauseIcon /> : <PlayIcon />}
                  </IconButton>
                  <IconButton
                    onClick={handleResetBreathing}
                    color="primary"
                    size="large"
                  >
                    <ResetIcon />
                  </IconButton>
                </Box>
              </Paper>
            </MotionBox>
          </Grid>

          {/* Gratitude Journal */}
          <Grid item xs={12} md={6}>
            <MotionBox
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                }}
              >
                <Typography
                  variant="h5"
                  component="h2"
                  sx={{ mb: 3, fontFamily: 'Playfair Display' }}
                >
                  Gratitude Journal
                </Typography>
                <TextField
                  multiline
                  rows={4}
                  placeholder="What are you grateful for today?"
                  value={gratitudeEntry}
                  onChange={(e) => setGratitudeEntry(e.target.value)}
                  sx={{ mb: 3 }}
                />
                <Button
                  variant="contained"
                  onClick={handleSaveGratitude}
                  disabled={isSaving || !gratitudeEntry.trim()}
                  sx={{ mt: 'auto' }}
                >
                  {isSaving ? 'Saving...' : 'Save Entry'}
                </Button>
              </Paper>
            </MotionBox>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default DailyPractice; 