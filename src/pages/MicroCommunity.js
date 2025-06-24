import React, { useState, useEffect, useRef } from 'react';
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
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Send as SendIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { db, realtimeDb } from '../config/firebase';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  ref,
  push,
  onValue,
  off,
  serverTimestamp as rtdbTimestamp,
} from 'firebase/database';
import { useAuth } from '../contexts/AuthContext';

const MotionBox = motion(Box);

function MicroCommunity() {
  const [groupInfo, setGroupInfo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [dailyPrompt, setDailyPrompt] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchGroupInfo();
    fetchDailyPrompt();
    setupChatListener();
    return () => {
      // Cleanup chat listener
      const chatRef = ref(realtimeDb, `chats/${groupInfo?.id}`);
      off(chatRef);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchGroupInfo = async () => {
    try {
      // In a real app, you would fetch the user's assigned group
      // For demo, we'll use a static group
      const groupDoc = await getDoc(doc(db, 'groups', 'demo-group'));
      if (groupDoc.exists()) {
        setGroupInfo(groupDoc.data());
      }
    } catch (error) {
      console.error('Error fetching group info:', error);
    }
  };

  const fetchDailyPrompt = async () => {
    try {
      const prompts = [
        'What made you smile today?',
        'What are you looking forward to?',
        'What\'s one thing you\'re grateful for?',
        'What\'s a small win you had today?',
        'What\'s something you learned recently?',
      ];
      const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
      setDailyPrompt(randomPrompt);
    } catch (error) {
      console.error('Error fetching daily prompt:', error);
    }
  };

  const setupChatListener = () => {
    const chatRef = ref(realtimeDb, `chats/${groupInfo?.id}`);
    onValue(chatRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messageList = Object.entries(data).map(([id, message]) => ({
          id,
          ...message,
        }));
        setMessages(messageList.sort((a, b) => a.timestamp - b.timestamp));
      }
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setIsSending(true);
    try {
      const chatRef = ref(realtimeDb, `chats/${groupInfo?.id}`);
      await push(chatRef, {
        text: newMessage,
        userId: currentUser.uid,
        userName: currentUser.email?.split('@')[0],
        timestamp: rtdbTimestamp(),
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
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
            Micro-Community
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          {/* Group Info and Daily Prompt */}
          <Grid item xs={12} md={4}>
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
                  height: '100%',
                }}
              >
                <Typography
                  variant="h5"
                  component="h2"
                  sx={{ mb: 3, fontFamily: 'Playfair Display' }}
                >
                  {groupInfo?.name || 'Your Group'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {groupInfo?.memberCount || 5} members
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography
                  variant="h6"
                  sx={{ mb: 2, fontFamily: 'Playfair Display' }}
                >
                  Daily Reflection
                </Typography>
                <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                  {dailyPrompt}
                </Typography>
              </Paper>
            </MotionBox>
          </Grid>

          {/* Chat Section */}
          <Grid item xs={12} md={8}>
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
                  Group Chat
                </Typography>
                <Box
                  sx={{
                    flex: 1,
                    overflowY: 'auto',
                    mb: 2,
                    maxHeight: '400px',
                  }}
                >
                  <List>
                    {messages.map((message) => (
                      <ListItem
                        key={message.id}
                        alignItems="flex-start"
                        sx={{
                          flexDirection:
                            message.userId === currentUser.uid
                              ? 'row-reverse'
                              : 'row',
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar>
                            <PersonIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={message.userName}
                          secondary={
                            <>
                              <Typography
                                component="span"
                                variant="body2"
                                color="text.primary"
                              >
                                {message.text}
                              </Typography>
                              <br />
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </>
                          }
                          sx={{
                            textAlign:
                              message.userId === currentUser.uid
                                ? 'right'
                                : 'left',
                          }}
                        />
                      </ListItem>
                    ))}
                    <div ref={messagesEndRef} />
                  </List>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <IconButton
                    color="primary"
                    onClick={handleSendMessage}
                    disabled={isSending || !newMessage.trim()}
                  >
                    <SendIcon />
                  </IconButton>
                </Box>
              </Paper>
            </MotionBox>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default MicroCommunity; 