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
  Avatar,
  Grid,
  Alert,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  PhotoCamera as PhotoIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { db } from '../config/firebase';
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

const MotionBox = motion(Box);

function Profile() {
  const [displayName, setDisplayName] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { currentUser, updateUserProfile } = useAuth();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setDisplayName(data.displayName || '');
        setAvatar(data.avatar || null);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      // Update Firebase Auth profile
      await updateUserProfile({
        displayName,
        photoURL: avatar,
      });

      // Update Firestore user document
      await updateDoc(doc(db, 'users', currentUser.uid), {
        displayName,
        avatar,
        updatedAt: new Date(),
      });

      setSuccess('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        // Delete user document from Firestore
        await deleteDoc(doc(db, 'users', currentUser.uid));
        
        // Delete user authentication
        await currentUser.delete();
        
        navigate('/');
      } catch (error) {
        console.error('Error deleting account:', error);
        setError('Failed to delete account. Please try again.');
      }
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
            Profile
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
            <Grid container spacing={4}>
              {/* Avatar Section */}
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <Avatar
                    src={avatar}
                    sx={{
                      width: 150,
                      height: 150,
                      mb: 2,
                      bgcolor: 'primary.main',
                    }}
                  />
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="avatar-upload"
                    type="file"
                    onChange={handleAvatarChange}
                  />
                  <label htmlFor="avatar-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<PhotoIcon />}
                    >
                      Change Photo
                    </Button>
                  </label>
                </Box>
              </Grid>

              {/* Profile Information */}
              <Grid item xs={12} md={8}>
                <Typography
                  variant="h5"
                  component="h2"
                  sx={{ mb: 3, fontFamily: 'Playfair Display' }}
                >
                  Profile Information
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

                <TextField
                  fullWidth
                  label="Display Name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Email"
                  value={currentUser.email}
                  disabled
                  sx={{ mb: 2 }}
                />

                <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                  <Button
                    variant="contained"
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleDeleteAccount}
                  >
                    Delete Account
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </MotionBox>
      </Container>
    </Box>
  );
}

export default Profile; 