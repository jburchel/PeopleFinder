import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, remove } from 'firebase/database';
import { config } from './config.js';

// Initialize Firebase
const app = initializeApp(config.firebase);
const db = getDatabase(app);

export const firebaseDB = {
  async saveToTop100(peopleGroup) {
    // Implementation
  },
  
  async getTop100() {
    // Implementation
  },
  
  async removeFromTop100(id) {
    // Implementation
  }
}; 