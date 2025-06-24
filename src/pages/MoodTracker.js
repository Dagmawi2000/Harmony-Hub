import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  IconButton,
  AppBar,
  Toolbar,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  SentimentVerySatisfied as HappyIcon,
  SentimentDissatisfied as SadIcon,
  SentimentVeryDissatisfied as StressedIcon,
  SentimentSatisfied as CalmIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { db } from '../config/firebase';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const MotionBox = motion(Box);

const moods = [
  { value: 'happy', icon: <HappyIcon />, label: 'Happy' },
  { value: 'sad', icon: <SadIcon />, label: 'Sad' },
  { value: 'stressed', icon: <StressedIcon />, label: 'Stressed' },
  { value: 'calm', icon: <CalmIcon />, label: 'Calm' },
];

function MoodTracker() {
  const [selectedMood, setSelectedMood] = useState('');
  const [moodNote, setMoodNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [moodHistory, setMoodHistory] = useState([]);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchMoodHistory();
  }, []);

  const fetchMoodHistory = async () => {
    try {
      const q = query(
        collection(db, 'users', currentUser.uid, 'moods'),
        orderBy('timestamp', 'desc'),
        where('timestamp', '>=', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
      );
      const querySnapshot = await getDocs(q);
      const moods = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMoodHistory(moods.reverse());
    } catch (error) {
      console.error('Error fetching mood history:', error);
    }
  };

  const handleMoodChange = (event, newMood) => {
    setSelectedMood(newMood);
  };

  const handleSaveMood = async () => {
    if (!selectedMood) return;

    setIsSaving(true);
    try {
      await addDoc(collection(db, 'users', currentUser.uid, 'moods'), {
        mood: selectedMood,
        note: moodNote,
        timestamp: serverTimestamp(),
      });
      setSelectedMood('');
      setMoodNote('');
      fetchMoodHistory();
    } catch (error) {
      console.error('Error saving mood:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const chartData = {
    labels: moodHistory.map((entry) =>
      new Date(entry.timestamp?.toDate()).toLocaleDateString()
    ),
    datasets: [
      {
        label: 'Mood',
        data: moodHistory.map((entry) => {
          const moodValues = { happy: 4, calm: 3, sad: 2, stressed: 1 };
          return moodValues[entry.mood] || 0;
        }),
        borderColor: '#87CEEB',
        backgroundColor: 'rgba(135, 206, 235, 0.5)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Mood History (Last 7 Days)',
        font: {
          family: 'Playfair Display',
        },
      },
    },
    scales: {
      y: {
        min: 0,
        max: 4,
        ticks: {
          stepSize: 1,
          callback: (value) => {
            const labels = ['', 'Stressed', 'Sad', 'Calm', 'Happy'];
            return labels[value];
          },
        },
      },
    },
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
            Mood Tracker
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          {/* Mood Input */}
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
                }}
              >
                <Typography
                  variant="h5"
                  component="h2"
                  sx={{ mb: 3, fontFamily: 'Playfair Display' }}
                >
                  How are you feeling?
                </Typography>
                <ToggleButtonGroup
                  value={selectedMood}
                  exclusive
                  onChange={handleMoodChange}
                  sx={{ mb: 3 }}
                >
                  {moods.map((mood) => (
                    <ToggleButton
                      key={mood.value}
                      value={mood.value}
                      sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                        py: 2,
                      }}
                    >
                      {mood.icon}
                      <Typography variant="body2">{mood.label}</Typography>
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
                <TextField
                  multiline
                  rows={3}
                  placeholder="Add a note about your mood..."
                  value={moodNote}
                  onChange={(e) => setMoodNote(e.target.value)}
                  sx={{ mb: 3 }}
                />
                <Button
                  variant="contained"
                  onClick={handleSaveMood}
                  disabled={isSaving || !selectedMood}
                >
                  {isSaving ? 'Saving...' : 'Save Mood'}
                </Button>
              </Paper>
            </MotionBox>
          </Grid>

          {/* Mood History Chart */}
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
                  Mood History
                </Typography>
                <Box sx={{ flex: 1, minHeight: 300 }}>
                  <Line data={chartData} options={chartOptions} />
                </Box>
              </Paper>
            </MotionBox>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default MoodTracker; 