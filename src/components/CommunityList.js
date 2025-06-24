import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, List, ListItem, ListItemText, Divider } from '@mui/material';
import { db } from '../config/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

function CommunityList() {
  const { currentUser } = useAuth();
  const [communities, setCommunities] = useState([]);
  const [myCommunities, setMyCommunities] = useState([]);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    const querySnapshot = await getDocs(collection(db, 'groups'));
    const all = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setCommunities(all);
    // Find my communities
    setMyCommunities(all.filter(g => g.members && g.members.includes(currentUser.uid)));
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await addDoc(collection(db, 'groups'), {
      name: newName,
      members: [currentUser.uid],
      createdAt: new Date(),
    });
    setNewName('');
    fetchCommunities();
  };

  const handleJoin = async (id) => {
    const groupRef = doc(db, 'groups', id);
    await updateDoc(groupRef, { members: arrayUnion(currentUser.uid) });
    fetchCommunities();
  };

  const handleLeave = async (id) => {
    const groupRef = doc(db, 'groups', id);
    await updateDoc(groupRef, { members: arrayRemove(currentUser.uid) });
    fetchCommunities();
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ fontFamily: 'Playfair Display', mb: 2 }}>
        My Communities
      </Typography>
      <List>
        {myCommunities.map((g) => (
          <ListItem key={g.id} secondaryAction={
            <Button color="error" onClick={() => handleLeave(g.id)} size="small">Leave</Button>
          }>
            <ListItemText primary={g.name} />
          </ListItem>
        ))}
      </List>
      <Divider sx={{ my: 2 }} />
      <Typography variant="h6" sx={{ fontFamily: 'Playfair Display', mb: 2 }}>
        All Communities
      </Typography>
      <List>
        {communities.map((g) => (
          <ListItem key={g.id} secondaryAction={
            g.members && g.members.includes(currentUser.uid) ? null :
              <Button color="primary" onClick={() => handleJoin(g.id)} size="small">Join</Button>
          }>
            <ListItemText primary={g.name} />
          </ListItem>
        ))}
      </List>
      <Divider sx={{ my: 2 }} />
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          size="small"
          label="New Community Name"
          value={newName}
          onChange={e => setNewName(e.target.value)}
        />
        <Button variant="contained" onClick={handleCreate}>Create</Button>
      </Box>
    </Box>
  );
}

export default CommunityList; 