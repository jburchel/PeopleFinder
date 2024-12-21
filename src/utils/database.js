import { ref, get, set } from 'firebase/database';
import { db } from './firebase';

// Example database access function with error handling
export const fetchData = async (path) => {
  try {
    const dataRef = ref(db, path);
    const snapshot = await get(dataRef);
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  } catch (error) {
    console.error('Database access error:', error);
    throw new Error('Failed to fetch data');
  }
}; 