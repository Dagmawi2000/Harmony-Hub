import React, { useState } from 'react';
import { Box, Typography, TextField, Button, List, ListItem, ListItemText, IconButton, Chip } from '@mui/material';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import { useAuth } from '../contexts/AuthContext';

const EMOJIS = ['👍', '❤️', '😊', '🎉', '🙏'];

function ReflectionPost() {
  const { currentUser } = useAuth();
  const [reflection, setReflection] = useState('');
  const [posts, setPosts] = useState([]);

  const handlePost = () => {
    if (!reflection.trim()) return;
    setPosts([
      ...posts,
      {
        id: Date.now(),
        user: currentUser.email,
        text: reflection,
        reactions: {},
        comments: [],
      },
    ]);
    setReflection('');
  };

  const handleReact = (postId, emoji) => {
    setPosts(posts.map(post =>
      post.id === postId
        ? {
            ...post,
            reactions: {
              ...post.reactions,
              [emoji]: (post.reactions[emoji] || 0) + 1,
            },
          }
        : post
    ));
  };

  const handleComment = (postId, comment) => {
    setPosts(posts.map(post =>
      post.id === postId
        ? {
            ...post,
            comments: [...post.comments, { user: currentUser.email, text: comment }],
          }
        : post
    ));
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ fontFamily: 'Playfair Display', mb: 2 }}>
        Reflections
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          label="Write a reflection..."
          value={reflection}
          onChange={e => setReflection(e.target.value)}
        />
        <Button variant="contained" onClick={handlePost}>Post</Button>
      </Box>
      <List>
        {posts.map(post => (
          <ListItem key={post.id} alignItems="flex-start" sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
            <Typography variant="subtitle2" sx={{ color: 'primary.main' }}>{post.user}</Typography>
            <ListItemText primary={post.text} />
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              {EMOJIS.map(emoji => (
                <Chip
                  key={emoji}
                  icon={<EmojiEmotionsIcon />}
                  label={`${emoji} ${post.reactions[emoji] || ''}`}
                  onClick={() => handleReact(post.id, emoji)}
                  size="small"
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Box>
            {/* Threaded comments (stub) */}
            <Box sx={{ mt: 2, width: '100%' }}>
              <Typography variant="body2" sx={{ mb: 1 }}>Comments:</Typography>
              <CommentInput onAdd={comment => handleComment(post.id, comment)} />
              <List sx={{ pl: 2 }}>
                {post.comments.map((c, i) => (
                  <ListItem key={i}>
                    <Typography variant="caption" sx={{ color: 'primary.main', mr: 1 }}>{c.user}:</Typography>
                    <ListItemText primary={c.text} />
                  </ListItem>
                ))}
              </List>
            </Box>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

function CommentInput({ onAdd }) {
  const [comment, setComment] = useState('');
  return (
    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
      <TextField
        size="small"
        label="Add a comment..."
        value={comment}
        onChange={e => setComment(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && comment.trim()) {
            onAdd(comment);
            setComment('');
          }
        }}
      />
      <Button onClick={() => { if (comment.trim()) { onAdd(comment); setComment(''); } }} variant="outlined" size="small">Add</Button>
    </Box>
  );
}

export default ReflectionPost; 