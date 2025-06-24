import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Link,
  Paper,
  Alert,
  IconButton,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import CloseIcon from '@mui/icons-material/Close';

const MotionBox = motion(Box);

function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signup } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    if (password.length < 6) {
      return setError('Password must be at least 6 characters long');
    }

    try {
      setError('');
      setLoading(true);
      const { user } = await signup(email, password);
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        displayName: user.displayName || '',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Signup error:', error);
      if (error.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Please sign in instead.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (error.code === 'auth/weak-password') {
        setError('Password is too weak. Please choose a stronger password.');
      } else if (error.code === 'auth/operation-not-allowed') {
        setError('Email/password accounts are not enabled. Please contact support.');
      } else {
        setError(`Failed to create account: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container maxWidth="sm">
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          {/* Close Button */}
          <IconButton
            aria-label="close"
            onClick={() => navigate('/')}
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              color: 'grey.500',
              zIndex: 2,
            }}
          >
            <CloseIcon fontSize="medium" />
          </IconButton>
          <Typography
            component="h1"
            variant="h4"
            sx={{
              mb: 3,
              fontFamily: 'Playfair Display',
              color: 'primary.main',
            }}
          >
            Create Account
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              sx={{ mb: 3 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                fontSize: '1.1rem',
                mb: 2,
              }}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Button>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link component={RouterLink} to="/login" color="primary">
                Sign In
              </Link>
            </Typography>
          </Box>
          {/* Back to Home link */}
          <Button
            variant="text"
            onClick={() => navigate('/')}
            sx={{ mt: 3, color: 'primary.main', textTransform: 'none' }}
            fullWidth
          >
            ← Back to Home
          </Button>
        </Paper>
      </MotionBox>
    </Container>
  );
}

export default SignUp; 
