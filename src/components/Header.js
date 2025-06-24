import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemText, Box, Button } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const NAV_LINKS = [
  { label: 'Daily Practice', path: '/daily-practice' },
  { label: 'Community', path: '/community' },
  { label: 'Mood Tracker', path: '/mood-tracker' },
];

function Header() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogoClick = () => {
    if (currentUser) {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  };

  const handleNavClick = (path) => {
    setDrawerOpen(false);
    navigate(path);
  };

  return (
    <AppBar position="static" color="transparent" elevation={0} sx={{ mb: 2 }}>
      <Toolbar>
        {/* Logo */}
        <Typography
          variant="h5"
          onClick={handleLogoClick}
          sx={{
            fontFamily: 'Playfair Display',
            fontWeight: 700,
            cursor: 'pointer',
            flexGrow: { xs: 1, md: 0 },
            fontSize: { xs: '1.3rem', md: '2rem' },
            userSelect: 'none',
            display: 'flex',
            alignItems: 'center',
            letterSpacing: 1,
          }}
        >
          <span role="img" aria-label="yoga" style={{ marginRight: 8, fontSize: '1.5em' }}>🧘</span> Harmony Hub
        </Typography>
        {/* Desktop Nav */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, ml: 4, flexGrow: 1 }}>
          {NAV_LINKS.map((link) => (
            <Button
              key={link.path}
              color="inherit"
              onClick={() => navigate(link.path)}
              sx={{ mx: 1, fontWeight: 500, color: location.pathname === link.path ? 'primary.main' : 'text.primary' }}
            >
              {link.label}
            </Button>
          ))}
        </Box>
        {/* Hamburger for Mobile */}
        <IconButton
          edge="end"
          color="inherit"
          aria-label="menu"
          onClick={() => setDrawerOpen(true)}
          sx={{ display: { xs: 'flex', md: 'none' }, ml: 'auto' }}
        >
          <MenuIcon />
        </IconButton>
        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        >
          <Box sx={{ width: 220 }} role="presentation">
            <List>
              {NAV_LINKS.map((link) => (
                <ListItem button key={link.path} onClick={() => handleNavClick(link.path)}>
                  <ListItemText primary={link.label} />
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>
      </Toolbar>
    </AppBar>
  );
}

export default Header; 