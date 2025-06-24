import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, List, ListItem, ListItemText, IconButton, Chip, Avatar } from '@mui/material';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, doc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';

const EMOJIS = ['👍', '❤️', '😊', '🎉', '🙏'];

function ReflectionPost() {
  const { currentUser } = useAuth();
  const [reflection, setReflection] = useState('');
  const [posts, setPosts] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [loading, setLoading] = useState(false);

  // Get the first community the user is a member of
  useEffect(() => {
    fetchUserCommunities();
  }, [currentUser]);

  // Listen to posts for the selected community
  useEffect(() => {
    if (selectedCommunity) {
      const unsubscribe = listenToPosts(selectedCommunity.id);
      return () => unsubscribe();
    }
  }, [selectedCommunity]);

  const fetchUserCommunities = async () => {
    try {
      const { getDocs, collection } = await import('firebase/firestore');
      const querySnapshot = await getDocs(collection(db, 'groups'));
      const userCommunities = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(group => group.members && group.members.includes(currentUser.uid));
      
      if (userCommunities.length > 0) {
        setSelectedCommunity(userCommunities[0]);
      }
    } catch (error) {
      console.error('Error fetching user communities:', error);
    }
  };

  const listenToPosts = (communityId) => {
    const postsQuery = query(
      collection(db, 'posts'),
      where('communityId', '==', communityId),
      orderBy('timestamp', 'desc')
    );

    return onSnapshot(postsQuery, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(postsData);
    });
  };

  const handlePost = async () => {
    if (!reflection.trim() || !selectedCommunity) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'posts'), {
        text: reflection,
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email?.split('@')[0],
        userEmail: currentUser.email,
        communityId: selectedCommunity.id,
        communityName: selectedCommunity.name,
        reactions: {},
        comments: [],
        timestamp: serverTimestamp(),
      });
      setReflection('');
    } catch (error) {
      console.error('Error posting reflection:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReact = async (postId, emoji) => {
    try {
      const postRef = doc(db, 'posts', postId);
      const currentReactions = posts.find(p => p.id === postId)?.reactions || {};
      const newCount = (currentReactions[emoji] || 0) + 1;
      
      await updateDoc(postRef, {
        [`reactions.${emoji}`]: newCount
      });
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const handleComment = async (postId, comment) => {
    if (!comment.trim()) return;
    
    try {
      const postRef = doc(db, 'posts', postId);
      const newComment = {
        user: currentUser.displayName || currentUser.email?.split('@')[0],
        userEmail: currentUser.email,
        text: comment,
        timestamp: serverTimestamp(),
      };
      
      await updateDoc(postRef, {
        comments: arrayUnion(newComment)
      });
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  if (!selectedCommunity) {
    return (
      <Box>
        <Typography variant="h6" sx={{ fontFamily: 'Playfair Display', mb: 2 }}>
          Reflections
        </Typography>
        <Typography color="text.secondary">
          Join a community to start sharing reflections!
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ fontFamily: 'Playfair Display', mb: 2 }}>
        Reflections - {selectedCommunity.name}
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          label="Write a reflection..."
          value={reflection}
          onChange={e => setReflection(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handlePost();
            }
          }}
        />
        <Button 
          variant="contained" 
          onClick={handlePost}
          disabled={loading || !reflection.trim()}
        >
          {loading ? 'Posting...' : 'Post'}
        </Button>
      </Box>
      <List>
        {posts.map(post => (
          <ListItem key={post.id} alignItems="flex-start" sx={{ flexDirection: 'column', alignItems: 'flex-start', mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, width: '100%' }}>
              <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'primary.main' }}>
                {post.userName?.charAt(0)?.toUpperCase()}
              </Avatar>
              <Typography variant="subtitle2" sx={{ color: 'primary.main', fontWeight: 600 }}>
                {post.userName}
              </Typography>
              <Typography variant="caption" sx={{ ml: 'auto', color: 'text.secondary' }}>
                {post.timestamp?.toDate?.() ? 
                  new Date(post.timestamp.toDate()).toLocaleDateString() : 
                  'Just now'
                }
              </Typography>
            </Box>
            <ListItemText primary={post.text} sx={{ mb: 1 }} />
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              {EMOJIS.map(emoji => (
                <Chip
                  key={emoji}
                  icon={<EmojiEmotionsIcon />}
                  label={`${emoji} ${post.reactions?.[emoji] || 0}`}
                  onClick={() => handleReact(post.id, emoji)}
                  size="small"
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Box>
            {/* Comments */}
            <Box sx={{ mt: 2, width: '100%' }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>Comments:</Typography>
              <CommentInput onAdd={comment => handleComment(post.id, comment)} />
              <List sx={{ pl: 0 }}>
                {post.comments?.map((comment, i) => (
                  <ListItem key={i} sx={{ pl: 0, py: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600, mr: 1 }}>
                        {comment.user}:
                      </Typography>
                      <Typography variant="body2">{comment.text}</Typography>
                    </Box>
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
  
  const handleSubmit = () => {
    if (comment.trim()) {
      onAdd(comment);
      setComment('');
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
      <TextField
        size="small"
        label="Add a comment..."
        value={comment}
        onChange={e => setComment(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && comment.trim()) {
            e.preventDefault();
            handleSubmit();
          }
        }}
        sx={{ flexGrow: 1 }}
      />
      <Button 
        onClick={handleSubmit} 
        variant="outlined" 
        size="small"
        disabled={!comment.trim()}
      >
        Add
      </Button>
    </Box>
  );
}

export default ReflectionPost; 
