import { db } from './config';
import { 
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp 
} from 'firebase/firestore';

export const subscribeToPlannerTasks = (userId, callback) => {
  const tasksRef = collection(db, 'users', userId, 'tasks');
  const q = query(
    tasksRef,
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const tasks = [];
    snapshot.forEach((doc) => {
      tasks.push({
        id: doc.id,
        ...doc.data()
      });
    });
    callback(tasks);
  }, (error) => {
    console.error("Error listening to tasks:", error);
  });
};

export const addTask = async (userId, task) => {
  const tasksRef = collection(db, 'users', userId, 'tasks');
  return await addDoc(tasksRef, {
    ...task,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
};

export const updateTask = async (userId, taskId, updates) => {
  const taskRef = doc(db, 'users', userId, 'tasks', taskId);
  return await updateDoc(taskRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
};

export const deleteTask = async (userId, taskId) => {
  const taskRef = doc(db, 'users', userId, 'tasks', taskId);
  return await deleteDoc(taskRef);
};