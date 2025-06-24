import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  IconButton,
  AppBar,
  Toolbar,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
} from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { db } from '../config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

const MotionBox = motion(Box);

function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [privacyMode, setPrivacyMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const settingsDoc = await getDoc(doc(db, 'users', currentUser.uid, 'settings', 'preferences'));
      if (settingsDoc.exists()) {
        const data = settingsDoc.data();
        setNotifications(data.notifications ?? true);
        setPrivacyMode(data.privacyMode ?? false);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSettingChange = async (setting, value) => {
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      await updateDoc(doc(db, 'users', currentUser.uid, 'settings', 'preferences'), {
        [setting]: value,
        updatedAt: new Date(),
      });

      setSuccess('Settings updated successfully!');
    } catch (error) {
      console.error('Error updating settings:', error);
      setError('Failed to update settings. Please try again.');
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
            Settings
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography
              variant="h5"
              component="h2"
              sx={{ mb: 4, fontFamily: 'Playfair Display' }}
            >
              Preferences
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}

            {/* Notifications Settings */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, fontFamily: 'Playfair Display' }}>
                Notifications
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications}
                    onChange={(e) => {
                      setNotifications(e.target.checked);
                      handleSettingChange('notifications', e.target.checked);
                    }}
                    disabled={isSaving}
                  />
                }
                label="Daily Notifications"
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Receive daily reminders for your mindfulness practice and mood tracking.
              </Typography>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Privacy Settings */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontFamily: 'Playfair Display' }}>
                Privacy
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={privacyMode}
                    onChange={(e) => {
                      setPrivacyMode(e.target.checked);
                      handleSettingChange('privacyMode', e.target.checked);
                    }}
                    disabled={isSaving}
                  />
                }
                label="Privacy Mode"
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                When enabled, your activity status and last seen time will be hidden from other users.
              </Typography>
            </Box>
          </Paper>
        </MotionBox>
      </Container>
    </Box>
  );
}

export default Settings; 