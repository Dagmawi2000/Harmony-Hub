import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, List, ListItem, ListItemText, IconButton, Chip, Avatar, Alert } from '@mui/material';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, doc, updateDoc, arrayUnion, serverTimestamp, getDocs } from 'firebase/firestore';

const EMOJIS = ['👍', '❤️', '😊', '🎉', '🙏'];

function ReflectionPost() {
  const { currentUser } = useAuth();
  const [reflection, setReflection] = useState('');
  const [posts, setPosts] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get the first community the user is a member of
  useEffect(() => {
    if (currentUser) {
      console.log('Current user:', currentUser.uid);
      fetchUserCommunities();
    }
  }, [currentUser]);

  // Listen to posts for the selected community
  useEffect(() => {
    if (!selectedCommunity || !selectedCommunity.id) {
      console.log('No community selected or missing id', selectedCommunity);
      return;
    }
    console.log('Listening to posts for community:', selectedCommunity.id);
    const unsubscribe = listenToPosts(selectedCommunity.id);
    return () => unsubscribe();
  }, [selectedCommunity]);

  const fetchUserCommunities = async () => {
    try {
      setError(null);
      console.log('Fetching user communities...');
      
      // Test database connection first
      try {
        const testQuery = await getDocs(collection(db, 'groups'));
        console.log('Database connection successful, found', testQuery.docs.length, 'groups');
      } catch (dbError) {
        console.error('Database connection failed:', dbError);
        setError('Database connection failed: ' + dbError.message);
        return;
      }
      
      const querySnapshot = await getDocs(collection(db, 'groups'));
      const userCommunities = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(group => group.members && group.members.includes(currentUser.uid));
      
      console.log('All groups:', querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      console.log('User communities:', userCommunities);
      
      if (userCommunities.length > 0) {
        setSelectedCommunity(userCommunities[0]);
        console.log('Selected community:', userCommunities[0]);
      } else {
        // If no communities exist, create a default one
        if (querySnapshot.docs.length === 0) {
          console.log('No communities exist, creating default community...');
          await createDefaultCommunity();
        } else {
          setSelectedCommunity(null);
          setError('You are not a member of any communities. Please join or create a community first.');
          console.log('No communities found for user');
        }
      }
    } catch (error) {
      console.error('Error fetching user communities:', error);
      setError('Error loading communities: ' + error.message);
    }
  };

  const createDefaultCommunity = async () => {
    try {
      const defaultCommunityData = {
        name: 'Welcome Community',
        members: [currentUser.uid],
        createdBy: currentUser.uid,
        createdAt: new Date(),
        memberCount: 1,
        description: 'A welcoming community for new members'
      };
      
      console.log('Creating default community with data:', defaultCommunityData);
      const docRef = await addDoc(collection(db, 'groups'), defaultCommunityData);
      console.log('Default community created with ID:', docRef.id);
      
      // Set the newly created community as selected
      setSelectedCommunity({ id: docRef.id, ...defaultCommunityData });
      
      // Create a test post to verify everything works
      setTimeout(() => {
        createTestPost(docRef.id);
      }, 1000);
    } catch (error) {
      console.error('Error creating default community:', error);
      setError('Error creating default community: ' + error.message);
    }
  };

  const createTestPost = async (communityId) => {
    try {
      const testPostData = {
        text: 'Welcome to the community! This is a test post to verify everything is working.',
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email?.split('@')[0],
        userEmail: currentUser.email,
        communityId: communityId,
        communityName: 'Welcome Community',
        reactions: {},
        comments: [],
        timestamp: serverTimestamp(),
      };
      
      console.log('Creating test post with data:', testPostData);
      const docRef = await addDoc(collection(db, 'posts'), testPostData);
      console.log('Test post created successfully with ID:', docRef.id);
    } catch (error) {
      console.error('Error creating test post:', error);
      setError('Error creating test post: ' + error.message);
    }
  };

  const listenToPosts = (communityId) => {
    console.log('Setting up listener for community:', communityId);
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
      console.log('Fetched posts:', postsData);
      setPosts(postsData);
    }, (error) => {
      console.error('Error listening to posts:', error);
      setError('Error loading posts: ' + error.message);
    });
  };

  const handlePost = async () => {
    if (!reflection.trim() || !selectedCommunity) {
      console.log('Cannot post: reflection empty or no community selected');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const postData = {
        text: reflection,
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email?.split('@')[0],
        userEmail: currentUser.email,
        communityId: selectedCommunity.id,
        communityName: selectedCommunity.name,
        reactions: {},
        comments: [],
        timestamp: serverTimestamp(),
      };
      
      console.log('Creating post with data:', postData);
      const docRef = await addDoc(collection(db, 'posts'), postData);
      console.log('Post created successfully with ID:', docRef.id);
      
      setReflection('');
    } catch (error) {
      console.error('Error posting reflection:', error);
      setError('Error creating post: ' + error.message);
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
        {error ? (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : (
          <Typography color="text.secondary">
            Join a community to start sharing reflections!
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ fontFamily: 'Playfair Display', mb: 2 }}>
        Reflections - {selectedCommunity?.name || 'No Community'}
      </Typography>
      
      {/* Debug Panel - Remove this in production */}
      {process.env.NODE_ENV === 'development' && (
        <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1, fontSize: '12px' }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Debug Info:</Typography>
          <div>User ID: {currentUser?.uid}</div>
          <div>Selected Community: {selectedCommunity?.id || 'None'}</div>
          <div>Posts Count: {posts.length}</div>
          <div>Loading: {loading ? 'Yes' : 'No'}</div>
          <div>Error: {error || 'None'}</div>
          {selectedCommunity && (
            <Button 
              size="small" 
              variant="outlined" 
              onClick={() => createTestPost(selectedCommunity.id)}
              sx={{ mt: 1 }}
            >
              Create Test Post
            </Button>
          )}
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
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
          disabled={loading || !reflection.trim() || !selectedCommunity}
        >
          {loading ? 'Posting...' : 'Post'}
        </Button>
      </Box>
      
      {posts.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">
            No posts yet. Be the first to share a reflection!
          </Typography>
        </Box>
      ) : (
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
      )}
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
