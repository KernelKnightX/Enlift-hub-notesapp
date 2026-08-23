import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '@/firebase/config';

const MAX_VERSIONS = 20;

export async function bumpNoteStats(userId) {
  if (!userId) return;
  try {
    const statsRef = doc(db, 'users', userId, 'stats', 'summary');
    await setDoc(
      statsRef,
      {
        notesCreated: increment(1),
        notesThisWeek: increment(1),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.warn('[notes stats]', error.code || error.message);
  }
}

export async function saveSubjectNote({
  userId,
  subjectId,
  subjectName,
  noteId,
  content,
  previousContent,
  isNewNote,
}) {
  const payload = {
    userId,
    subjectId: String(subjectId),
    subjectName: subjectName || 'Subject',
    content,
    updatedAt: serverTimestamp(),
  };

  let savedId = noteId;

  if (noteId) {
    await updateDoc(doc(db, 'userNotes', noteId), payload);
  } else {
    const ref = await addDoc(collection(db, 'userNotes'), {
      ...payload,
      createdAt: serverTimestamp(),
    });
    savedId = ref.id;
    await bumpNoteStats(userId);
  }

  const contentChanged = content !== previousContent;
  if (savedId && contentChanged && content.trim()) {
    await addDoc(collection(db, 'userNotes', savedId, 'versions'), {
      content,
      createdAt: serverTimestamp(),
    });
    await pruneOldVersions(savedId);
  }

  return { noteId: savedId, isNewNote: isNewNote && !noteId };
}

async function pruneOldVersions(noteId) {
  try {
    const versionsRef = collection(db, 'userNotes', noteId, 'versions');
    const snap = await getDocs(query(versionsRef, orderBy('createdAt', 'desc')));
    const toDelete = snap.docs.slice(MAX_VERSIONS);
    await Promise.all(toDelete.map((d) => deleteDoc(d.ref)));
  } catch {
    // non-critical
  }
}

export async function listNoteVersions(noteId) {
  if (!noteId) return [];
  const snap = await getDocs(
    query(
      collection(db, 'userNotes', noteId, 'versions'),
      orderBy('createdAt', 'desc'),
      limit(MAX_VERSIONS)
    )
  );
  return snap.docs.map((d) => ({
    id: d.id,
    content: d.data().content || '',
    createdAt: d.data().createdAt,
  }));
}

export async function findUserNote(userId, subjectId) {
  const snap = await getDocs(
    query(
      collection(db, 'userNotes'),
      where('userId', '==', userId),
      where('subjectId', '==', String(subjectId)),
      limit(1)
    )
  );
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}
