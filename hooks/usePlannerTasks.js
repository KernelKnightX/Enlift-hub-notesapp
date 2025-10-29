// hooks/usePlannerTasks.js
import { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy,
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

export const usePlannerTasks = () => {
  const [tasksMap, setTasksMap] = useState({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Real-time listener for tasks
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const tasksRef = collection(db, 'tasks');
    const q = query(
      tasksRef, 
      where('userId', '==', user.uid),
      orderBy('date'),
      orderBy('time')
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const newTasksMap = {};
        
        querySnapshot.forEach((doc) => {
          const task = { id: doc.id, ...doc.data() };
          const dateKey = task.date;
          
          if (!newTasksMap[dateKey]) {
            newTasksMap[dateKey] = [];
          }
          newTasksMap[dateKey].push(task);
        });
        
        setTasksMap(newTasksMap);
        setLoading(false);
      },
      (error) => {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching tasks:', error);
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  // Add or update task
  const saveTask = async (dateKey, taskData) => {
    if (!user?.uid) return;

    try {
      const taskId =
        taskData.id || `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const taskRef = doc(db, 'tasks', taskId);
      
      await setDoc(
        taskRef,
        {
          ...taskData,
          id: taskId,
          userId: user.uid,
          date: dateKey,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        { merge: true }
      );

      return taskId;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error saving task:', error);
      }
      throw error;
    }
  };

  // Delete task
  const deleteTask = async (taskId) => {
    if (!user?.uid) return;

    try {
      const taskRef = doc(db, 'tasks', taskId);
      await deleteDoc(taskRef);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error deleting task:', error);
      }
      throw error;
    }
  };

  // Get upcoming tasks (for dashboard)
  const getUpcomingTasks = () => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const upcomingTasks = [];
    Object.keys(tasksMap).forEach((dateKey) => {
      const taskDate = new Date(dateKey);
      if (taskDate >= today && taskDate <= nextWeek) {
        tasksMap[dateKey].forEach((task) => {
          upcomingTasks.push({
            ...task,
            dateKey
          });
        });
      }
    });

    return upcomingTasks.sort((a, b) => {
      const dateCompare = new Date(a.date) - new Date(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.time.localeCompare(b.time);
    });
  };

  return {
    tasksMap,
    loading,
    saveTask,
    deleteTask,
    getUpcomingTasks
  };
};
