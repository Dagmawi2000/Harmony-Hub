import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDfqVj__UhhUj4DvVZlirMY97grWBghVaQ",
  authDomain: "harmony-hub-web.firebaseapp.com",
  projectId: "harmony-hub-web",
  storageBucket: "harmony-hub-web.firebasestorage.app",
  messagingSenderId: "552286400488",
  appId: "1:552286400488:web:3cfab69508f58c43cd3e5d",
  measurementId: "G-ZNNJMYDDPT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const realtimeDb = getDatabase(app);
const analytics = getAnalytics(app);

export { app, auth, db, realtimeDb, analytics }; 