// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get } from 'firebase/database';

const firebaseConfig = {
  // Move to .env file
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase
let app;
let db;

try {
  app = initializeApp(firebaseConfig);
  db = getDatabase(app);
} catch (error) {
  console.error('Firebase initialization error:', error);
  // Fallback to local storage if Firebase fails
  db = {
    ref: (path) => ({
      get: async () => {
        try {
          const data = localStorage.getItem(path);
          return {
            exists: () => !!data,
            val: () => JSON.parse(data)
          };
        } catch {
          return { exists: () => false, val: () => null };
        }
      }
    })
  };
}

export { db, ref, get }; 