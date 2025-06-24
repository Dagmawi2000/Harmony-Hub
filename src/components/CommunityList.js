import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, List, ListItem, ListItemText, Divider, Chip, Avatar } from '@mui/material';
import { db } from '../config/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

function CommunityList() {
  const { currentUser } = useAuth();
  const [communities, setCommunities] = useState([]);
  const [myCommunities, setMyCommunities] = useState([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = listenToCommunities();
    return () => unsubscribe();
  }, [currentUser]);

  const listenToCommunities = () => {
    return onSnapshot(collection(db, 'groups'), (snapshot) => {
      const all = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCommunities(all);
      // Find my communities
      setMyCommunities(all.filter(g => g.members && g.members.includes(currentUser.uid)));
    });
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    
    setLoading(true);
    try {
      await addDoc(collection(db, 'groups'), {
        name: newName,
        members: [currentUser.uid],
        createdBy: currentUser.uid,
        createdAt: new Date(),
        memberCount: 1,
      });
      setNewName('');
    } catch (error) {
      console.error('Error creating community:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (id) => {
    try {
      const groupRef = doc(db, 'groups', id);
      await updateDoc(groupRef, { 
        members: arrayUnion(currentUser.uid),
        memberCount: (communities.find(g => g.id === id)?.memberCount || 0) + 1
      });
    } catch (error) {
      console.error('Error joining community:', error);
    }
  };

  const handleLeave = async (id) => {
    try {
      const groupRef = doc(db, 'groups', id);
      await updateDoc(groupRef, { 
        members: arrayRemove(currentUser.uid),
        memberCount: Math.max(0, (communities.find(g => g.id === id)?.memberCount || 1) - 1)
      });
    } catch (error) {
      console.error('Error leaving community:', error);
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ fontFamily: 'Playfair Display', mb: 2 }}>
        My Communities
      </Typography>
      {myCommunities.length === 0 ? (
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          You haven't joined any communities yet.
        </Typography>
      ) : (
        <List>
          {myCommunities.map((community) => (
            <ListItem 
              key={community.id} 
              sx={{ 
                mb: 1, 
                bgcolor: 'background.paper', 
                borderRadius: 1,
                flexDirection: 'column',
                alignItems: 'flex-start'
              }}
              secondaryAction={
                <Button 
                  color="error" 
                  onClick={() => handleLeave(community.id)} 
                  size="small"
                  variant="outlined"
                >
                  Leave
                </Button>
              }
            >
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 1 }}>
                <ListItemText 
                  primary={community.name}
                  secondary={`Created ${community.createdAt?.toDate?.() ? 
                    new Date(community.createdAt.toDate()).toLocaleDateString() : 
                    'Recently'
                  }`}
                />
                <Chip 
                  label={`${community.memberCount || community.members?.length || 0} members`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Box>
            </ListItem>
          ))}
        </List>
      )}
      
      <Divider sx={{ my: 3 }} />
      
      <Typography variant="h6" sx={{ fontFamily: 'Playfair Display', mb: 2 }}>
        All Communities
      </Typography>
      <List>
        {communities.map((community) => (
          <ListItem 
            key={community.id} 
            sx={{ 
              mb: 1, 
              bgcolor: 'background.paper', 
              borderRadius: 1,
              flexDirection: 'column',
              alignItems: 'flex-start'
            }}
            secondaryAction={
              community.members && community.members.includes(currentUser.uid) ? (
                <Chip label="Joined" color="success" size="small" />
              ) : (
                <Button 
                  color="primary" 
                  onClick={() => handleJoin(community.id)} 
                  size="small"
                  variant="contained"
                >
                  Join
                </Button>
              )
            }
          >
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 1 }}>
              <ListItemText 
                primary={community.name}
                secondary={`Created ${community.createdAt?.toDate?.() ? 
                  new Date(community.createdAt.toDate()).toLocaleDateString() : 
                  'Recently'
                }`}
              />
              <Chip 
                label={`${community.memberCount || community.members?.length || 0} members`}
                size="small"
                color="primary"
                variant="outlined"
              />
            </Box>
          </ListItem>
        ))}
      </List>
      
      <Divider sx={{ my: 3 }} />
      
      <Typography variant="h6" sx={{ fontFamily: 'Playfair Display', mb: 2 }}>
        Create New Community
      </Typography>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          size="small"
          label="Community Name"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && newName.trim()) {
              handleCreate();
            }
          }}
          sx={{ flexGrow: 1 }}
        />
        <Button 
          variant="contained" 
          onClick={handleCreate}
          disabled={loading || !newName.trim()}
        >
          {loading ? 'Creating...' : 'Create'}
        </Button>
      </Box>
    </Box>
  );
}

export default CommunityList; 
