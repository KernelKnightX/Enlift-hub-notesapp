// Firebase Collections Structure and API Functions
// File: firebase/collections.js

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db } from './config';

// ===== ACTIVITY LOGGING SYSTEM =====
export const ActivityService = {
  // Log user activity
  async logActivity(userId, type, description, metadata = {}) {
    try {
      const activityRef = collection(db, 'activities');
      await addDoc(activityRef, {
        userId,
        type,
        description,
        metadata,
        timestamp: serverTimestamp(),
        createdAt: new Date(),
        sessionId: this.getSessionId()
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  },

  // Get user activities with real-time updates
  subscribeToActivities(userId, callback, limitCount = 10) {
    const activitiesRef = collection(db, 'activities');
    const q = query(
      activitiesRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    return onSnapshot(q, callback);
  },

  // Generate session ID for tracking user sessions
  getSessionId() {
    if (!window.sessionStorage.getItem('sessionId')) {
      window.sessionStorage.setItem('sessionId', Date.now().toString());
    }
    return window.sessionStorage.getItem('sessionId');
  },

  // Update study streak
  async updateStudyStreak(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const today = new Date().toDateString();
        const lastStudyDate = userData.lastStudyDate?.toDate?.()?.toDateString();
        
        if (lastStudyDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          
          let newStreak = 1;
          if (lastStudyDate === yesterday.toDateString()) {
            newStreak = (userData.studyStreak || 0) + 1;
          }
          
          await updateDoc(userRef, {
            studyStreak: newStreak,
            lastStudyDate: serverTimestamp(),
            totalStudyDays: increment(1)
          });
          
          return newStreak;
        }
      }
    } catch (error) {
      console.error('Error updating study streak:', error);
    }
  }
};

// ===== CURRENT AFFAIRS & STUDY MATERIALS =====
export const StudyMaterialService = {
  // Create study material
  async createStudyMaterial(materialData) {
    try {
      const materialsRef = collection(db, 'study_materials');
      const docRef = await addDoc(materialsRef, {
        ...materialData,
        createdAt: serverTimestamp(),
        isActive: true,
        viewCount: 0
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating study material:', error);
      throw error;
    }
  },

  // Get study materials by category
  async getStudyMaterialsByCategory(category, limitCount = 10) {
    try {
      const materialsRef = collection(db, 'study_materials');
      const q = query(
        materialsRef,
        where('category', '==', category),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching study materials:', error);
      return [];
    }
  },

  // Increment view count
  async incrementViewCount(materialId) {
    try {
      const materialRef = doc(db, 'study_materials', materialId);
      await updateDoc(materialRef, {
        viewCount: increment(1),
        lastViewed: serverTimestamp()
      });
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  },

  // Get trending materials
  async getTrendingMaterials(limitCount = 5) {
    try {
      const materialsRef = collection(db, 'study_materials');
      const q = query(
        materialsRef,
        where('isActive', '==', true),
        orderBy('viewCount', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching trending materials:', error);
      return [];
    }
  }
};

// ===== ENHANCED NOTES SERVICE =====
export const NotesService = {
  // Create note with category
  async createNote(userId, noteData) {
    try {
      const notesRef = collection(db, 'notes');
      const docRef = await addDoc(notesRef, {
        ...noteData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true,
        tags: noteData.tags || [],
        category: noteData.category || 'general'
      });

      // Log activity
      await ActivityService.logActivity(
        userId,
        'note_created',
        `Created note: ${noteData.title}`,
        { noteId: docRef.id, category: noteData.category }
      );

      return docRef.id;
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  },

  // Get notes by category with real-time updates
  subscribeToNotesByCategory(userId, category, callback) {
    const notesRef = collection(db, 'notes');
    let q;

    if (category === 'all') {
      q = query(
        notesRef,
        where('userId', '==', userId),
        where('isActive', '==', true),
        orderBy('updatedAt', 'desc')
      );
    } else {
      q = query(
        notesRef,
        where('userId', '==', userId),
        where('category', '==', category),
        where('isActive', '==', true),
        orderBy('updatedAt', 'desc')
      );
    }

    return onSnapshot(q, callback);
  },

  // Search notes
  async searchNotes(userId, searchTerm) {
    try {
      const notesRef = collection(db, 'notes');
      const q = query(
        notesRef,
        where('userId', '==', userId),
        where('isActive', '==', true)
      );
      
      const snapshot = await getDocs(q);
      const notes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Filter by search term (client-side search)
      return notes.filter(note => 
        note.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    } catch (error) {
      console.error('Error searching notes:', error);
      return [];
    }
  }
};

// ===== PLANNER SERVICE ENHANCEMENTS =====
export const PlannerService = {
  // Create task with enhanced metadata
  async createTask(userId, taskData) {
    try {
      const tasksRef = collection(db, 'tasks');
      const docRef = await addDoc(tasksRef, {
        ...taskData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        completed: false,
        completedAt: null,
        estimatedDuration: taskData.estimatedDuration || 60, // minutes
        actualDuration: null,
        category: taskData.category || 'study'
      });

      // Log activity
      await ActivityService.logActivity(
        userId,
        'task_created',
        `Created task: ${taskData.title}`,
        { 
          taskId: docRef.id, 
          priority: taskData.priority,
          category: taskData.category,
          dueDate: taskData.dateKey 
        }
      );

      // Update study streak
      await ActivityService.updateStudyStreak(userId);

      return docRef.id;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  // Complete task
  async completeTask(userId, taskId) {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        completed: true,
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Log activity
      const taskDoc = await getDoc(taskRef);
      if (taskDoc.exists()) {
        const taskData = taskDoc.data();
        await ActivityService.logActivity(
          userId,
          'task_completed',
          `Completed task: ${taskData.title}`,
          { taskId, category: taskData.category }
        );
      }

      // Update study streak
      await ActivityService.updateStudyStreak(userId);

    } catch (error) {
      console.error('Error completing task:', error);
      throw error;
    }
  },

  // Get productivity stats
  async getProductivityStats(userId, dateRange = 30) {
    try {
      const tasksRef = collection(db, 'tasks');
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - dateRange);

      const q = query(
        tasksRef,
        where('userId', '==', userId),
        where('createdAt', '>=', fromDate)
      );

      const snapshot = await getDocs(q);
      const tasks = snapshot.docs.map(doc => doc.data());

      const stats = {
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.completed).length,
        pendingTasks: tasks.filter(t => !t.completed).length,
        completionRate: 0,
        averageTasksPerDay: 0,
        categoryBreakdown: {},
        priorityBreakdown: { high: 0, medium: 0, low: 0 }
      };

      if (stats.totalTasks > 0) {
        stats.completionRate = Math.round((stats.completedTasks / stats.totalTasks) * 100);
        stats.averageTasksPerDay = Math.round(stats.totalTasks / dateRange);

        // Category breakdown
        tasks.forEach(task => {
          const category = task.category || 'general';
          stats.categoryBreakdown[category] = (stats.categoryBreakdown[category] || 0) + 1;
        });

        // Priority breakdown
        tasks.forEach(task => {
          const priority = task.priority || 'medium';
          stats.priorityBreakdown[priority]++;
        });
      }

      return stats;
    } catch (error) {
      console.error('Error getting productivity stats:', error);
      return null;
    }
  }
};


// ===== UPSC SPECIFIC SERVICES =====
export const UPSCService = {
  // Get current affairs by date range
  async getCurrentAffairs(dateRange = 7) {
    try {
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - dateRange);

      const materialsRef = collection(db, 'study_materials');
      const q = query(
        materialsRef,
        where('category', '==', 'current-affairs'),
        where('isActive', '==', true),
        where('createdAt', '>=', fromDate),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching current affairs:', error);
      return [];
    }
  },

  // Get syllabus by subject
  async getSyllabusBySubject(subject) {
    try {
      const syllabusRef = collection(db, 'syllabus');
      const q = query(
        syllabusRef,
        where('subject', '==', subject),
        where('isActive', '==', true)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching syllabus:', error);
      return [];
    }
  },

  // Track reading progress
  async updateReadingProgress(userId, materialId, progress) {
    try {
      const progressRef = collection(db, 'reading_progress');
      const q = query(
        progressRef,
        where('userId', '==', userId),
        where('materialId', '==', materialId)
      );

      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        // Create new progress record
        await addDoc(progressRef, {
          userId,
          materialId,
          progress,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } else {
        // Update existing progress
        const doc = snapshot.docs[0];
        await updateDoc(doc.ref, {
          progress,
          updatedAt: serverTimestamp()
        });
      }

      // Log activity if significant progress
      if (progress >= 100) {
        await ActivityService.logActivity(
          userId,
          'material_completed',
          `Completed reading material`,
          { materialId, progress }
        );
      }
    } catch (error) {
      console.error('Error updating reading progress:', error);
    }
  }
};

// ===== EXPORT ALL SERVICES =====
export {
  ActivityService,
  StudyMaterialService,
  NotesService,
  PlannerService,
  UPSCService
};

// ===== FIREBASE COLLECTIONS STRUCTURE =====
/*
COLLECTIONS STRUCTURE:

1. users/ - User profiles and settings
   - userId/
     - name, email, profileComplete, studyStreak, lastStudyDate, totalStudyDays
     - stickyNotes/ - User's sticky notes (subcollection)

2. activities/ - User activity logs
   - userId, type, description, metadata, timestamp, sessionId

3. tasks/ - Planner tasks
   - userId, title, dateKey, time, priority, completed, category, estimatedDuration

4. notes/ - Study notes
   - userId, title, content, category, tags, createdAt, updatedAt, isActive

5. study_materials/ - Current affairs and study content
   - title, content, category, uploadedBy, createdAt, isActive, viewCount

6. syllabus/ - UPSC syllabus content
   - subject, topic, subtopics, isActive

7. reading_progress/ - User reading progress tracking
   - userId, materialId, progress, createdAt, updatedAt

REQUIRED FIREBASE SECURITY RULES:
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // User subcollections
      match /{collection}/{document} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // Activities - users can only access their own
    match /activities/{document} {
      allow read, write: if request.auth != null && 
        (resource == null || resource.data.userId == request.auth.uid);
    }
    
    // Tasks - users can only access their own
    match /tasks/{document} {
      allow read, write: if request.auth != null && 
        (resource == null || resource.data.userId == request.auth.uid);
    }
    
    // Notes - users can only access their own
    match /notes/{document} {
      allow read, write: if request.auth != null && 
        (resource == null || resource.data.userId == request.auth.uid);
    }
    
    // Study materials - read for all authenticated users, write for admins
    match /study_materials/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Syllabus - read for all authenticated users
    match /syllabus/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Reading progress - users can only access their own
    match /reading_progress/{document} {
      allow read, write: if request.auth != null && 
        (resource == null || resource.data.userId == request.auth.uid);
    }
  }
}
*/