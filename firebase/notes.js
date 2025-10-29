// firebase/notes.js (add this function if missing)
import { doc, getDoc } from 'firebase/firestore';
import { db } from './config';

export const getNote = async (noteId) => {
  try {
    const noteRef = doc(db, 'notes', noteId);
    const noteDoc = await getDoc(noteRef);
    
    if (noteDoc.exists()) {
      return { id: noteDoc.id, ...noteDoc.data() };
    } else {
      throw new Error('Note not found');
    }
  } catch (error) {
    console.error('Error getting note:', error);
    throw error;
  }
};