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
} from "firebase/firestore";

import { db } from "./config";


// =========================================================
// ACTIVITY LOGGING SYSTEM
// =========================================================

export const ActivityService = {

  // -------------------------------------------------------
  // Log user activity
  // -------------------------------------------------------

  async logActivity(
    userId,
    type,
    description,
    metadata = {}
  ) {
    try {
      if (!userId) {
        console.warn(
          "logActivity: userId is missing"
        );
        return;
      }

      const activityRef = collection(
        db,
        "activities"
      );

      await addDoc(activityRef, {
        userId,
        type,
        description,
        metadata,
        timestamp: serverTimestamp(),
        createdAt: serverTimestamp(),
        sessionId: this.getSessionId(),
      });

    } catch (error) {
      console.error(
        "Error logging activity:",
        error
      );
    }
  },


  // -------------------------------------------------------
  // Get user activities with real-time updates
  // -------------------------------------------------------

  subscribeToActivities(
    userId,
    callback,
    limitCount = 10
  ) {
    const activitiesRef = collection(
      db,
      "activities"
    );

    const q = query(
      activitiesRef,
      where(
        "userId",
        "==",
        userId
      ),
      orderBy(
        "timestamp",
        "desc"
      ),
      limit(limitCount)
    );

    return onSnapshot(
      q,
      callback,
      (error) => {
        console.error(
          "Error subscribing to activities:",
          error
        );
      }
    );
  },


  // -------------------------------------------------------
  // Generate session ID
  // -------------------------------------------------------

  getSessionId() {

    if (
      typeof window === "undefined"
    ) {
      return null;
    }

    const existingSession =
      window.sessionStorage.getItem(
        "sessionId"
      );

    if (existingSession) {
      return existingSession;
    }

    const newSessionId =
      Date.now().toString();

    window.sessionStorage.setItem(
      "sessionId",
      newSessionId
    );

    return newSessionId;
  },


  // -------------------------------------------------------
  // Update study streak
  // -------------------------------------------------------

  async updateStudyStreak(userId) {

    try {

      // ---------------------------------------------------
      // Validate user ID
      // ---------------------------------------------------

      if (!userId) {
        console.warn(
          "updateStudyStreak: userId is missing"
        );

        return null;
      }


      // ---------------------------------------------------
      // Create user document reference
      // ---------------------------------------------------

      const userRef = doc(
        db,
        "users",
        userId
      );


      // ---------------------------------------------------
      // Get user document
      // ---------------------------------------------------

      const userDoc = await getDoc(
        userRef
      );


      if (!userDoc.exists()) {

        console.warn(
          `updateStudyStreak: users/${userId} does not exist`
        );

        return null;
      }


      const userData =
        userDoc.data();


      // ---------------------------------------------------
      // Get today's date
      // ---------------------------------------------------

      const now = new Date();

      const today = [
        now.getFullYear(),
        String(
          now.getMonth() + 1
        ).padStart(2, "0"),
        String(
          now.getDate()
        ).padStart(2, "0"),
      ].join("-");


      // ---------------------------------------------------
      // Get previous study date
      // ---------------------------------------------------

      let lastStudyDate =
        userData.lastStudyDate || null;


      // ---------------------------------------------------
      // Handle Firestore Timestamp
      // ---------------------------------------------------

      if (
        lastStudyDate &&
        typeof lastStudyDate.toDate ===
          "function"
      ) {

        const previousDate =
          lastStudyDate.toDate();

        lastStudyDate = [
          previousDate.getFullYear(),
          String(
            previousDate.getMonth() + 1
          ).padStart(2, "0"),
          String(
            previousDate.getDate()
          ).padStart(2, "0"),
        ].join("-");
      }


      // ---------------------------------------------------
      // Already updated today
      // ---------------------------------------------------

      if (
        lastStudyDate === today
      ) {

        console.log(
          "Study streak already updated today."
        );

        return Number(
          userData.studyStreak || 0
        );
      }


      // ---------------------------------------------------
      // Current streak values
      // ---------------------------------------------------

      const currentStreak =
        Number(
          userData.studyStreak || 0
        );

      const currentBestStreak =
        Number(
          userData.bestStreak || 0
        );


      // ---------------------------------------------------
      // Calculate yesterday
      // ---------------------------------------------------

      const yesterdayDate =
        new Date();

      yesterdayDate.setDate(
        yesterdayDate.getDate() - 1
      );

      const yesterday = [
        yesterdayDate.getFullYear(),
        String(
          yesterdayDate.getMonth() + 1
        ).padStart(2, "0"),
        String(
          yesterdayDate.getDate()
        ).padStart(2, "0"),
      ].join("-");


      // ---------------------------------------------------
      // Calculate new streak
      // ---------------------------------------------------

      let newStreak = 1;

      if (
        lastStudyDate === yesterday
      ) {
        newStreak =
          currentStreak + 1;
      }


      // ---------------------------------------------------
      // Calculate best streak
      // ---------------------------------------------------

      const newBestStreak =
        Math.max(
          currentBestStreak,
          newStreak
        );


      // ---------------------------------------------------
      // Update Firestore
      //
      // IMPORTANT:
      //
      // These fields MUST match your Firestore rules:
      //
      // studyStreak
      // bestStreak
      // lastStudyDate
      // streakUpdatedAt
      //
      // Do NOT add totalStudyDays here.
      // ---------------------------------------------------

      await updateDoc(
        userRef,
        {
          studyStreak:
            newStreak,

          bestStreak:
            newBestStreak,

          lastStudyDate:
            today,

          streakUpdatedAt:
            serverTimestamp(),
        }
      );


      // ---------------------------------------------------
      // Success
      // ---------------------------------------------------

      console.log(
        "Study streak updated successfully:",
        {
          userId,
          studyStreak: newStreak,
          bestStreak: newBestStreak,
          lastStudyDate: today,
        }
      );

      return newStreak;

    } catch (error) {

      console.error(
        "Error updating study streak:",
        error
      );

      return null;
    }
  },
};


// =========================================================
// CURRENT AFFAIRS & STUDY MATERIALS
// =========================================================

export const StudyMaterialService = {

  // -------------------------------------------------------
  // Create study material
  // -------------------------------------------------------

  async createStudyMaterial(
    materialData
  ) {

    try {

      const materialsRef =
        collection(
          db,
          "study_materials"
        );

      const docRef =
        await addDoc(
          materialsRef,
          {
            ...materialData,
            createdAt:
              serverTimestamp(),
            isActive: true,
            viewCount: 0,
          }
        );

      return docRef.id;

    } catch (error) {

      console.error(
        "Error creating study material:",
        error
      );

      throw error;
    }
  },


  // -------------------------------------------------------
  // Get study materials by category
  // -------------------------------------------------------

  async getStudyMaterialsByCategory(
    category,
    limitCount = 10
  ) {

    try {

      const materialsRef =
        collection(
          db,
          "study_materials"
        );

      const q = query(
        materialsRef,

        where(
          "category",
          "==",
          category
        ),

        where(
          "isActive",
          "==",
          true
        ),

        orderBy(
          "createdAt",
          "desc"
        ),

        limit(limitCount)
      );

      const snapshot =
        await getDocs(q);

      return snapshot.docs.map(
        (document) => ({
          id: document.id,
          ...document.data(),
        })
      );

    } catch (error) {

      console.error(
        "Error fetching study materials:",
        error
      );

      return [];
    }
  },


  // -------------------------------------------------------
  // Increment view count
  // -------------------------------------------------------

  async incrementViewCount(
    materialId
  ) {

    try {

      const materialRef =
        doc(
          db,
          "study_materials",
          materialId
        );

      const materialDoc =
        await getDoc(materialRef);

      if (!materialDoc.exists()) {
        return;
      }

      const currentCount =
        Number(
          materialDoc.data().viewCount || 0
        );

      await updateDoc(
        materialRef,
        {
          viewCount:
            currentCount + 1,

          lastViewed:
            serverTimestamp(),
        }
      );

    } catch (error) {

      console.error(
        "Error incrementing view count:",
        error
      );
    }
  },


  // -------------------------------------------------------
  // Get trending materials
  // -------------------------------------------------------

  async getTrendingMaterials(
    limitCount = 5
  ) {

    try {

      const materialsRef =
        collection(
          db,
          "study_materials"
        );

      const q = query(
        materialsRef,

        where(
          "isActive",
          "==",
          true
        ),

        orderBy(
          "viewCount",
          "desc"
        ),

        limit(limitCount)
      );

      const snapshot =
        await getDocs(q);

      return snapshot.docs.map(
        (document) => ({
          id: document.id,
          ...document.data(),
        })
      );

    } catch (error) {

      console.error(
        "Error fetching trending materials:",
        error
      );

      return [];
    }
  },
};


// =========================================================
// ENHANCED NOTES SERVICE
// =========================================================

export const NotesService = {

  // -------------------------------------------------------
  // Create note
  // -------------------------------------------------------

  async createNote(
    userId,
    noteData
  ) {

    try {

      const notesRef =
        collection(
          db,
          "notes"
        );

      const docRef =
        await addDoc(
          notesRef,
          {
            ...noteData,

            userId,

            createdAt:
              serverTimestamp(),

            updatedAt:
              serverTimestamp(),

            isActive: true,

            tags:
              noteData.tags || [],

            category:
              noteData.category ||
              "general",
          }
        );


      // Log activity

      await ActivityService.logActivity(
        userId,
        "note_created",
        `Created note: ${noteData.title}`,
        {
          noteId: docRef.id,
          category:
            noteData.category,
        }
      );


      return docRef.id;

    } catch (error) {

      console.error(
        "Error creating note:",
        error
      );

      throw error;
    }
  },


  // -------------------------------------------------------
  // Subscribe to notes by category
  // -------------------------------------------------------

  subscribeToNotesByCategory(
    userId,
    category,
    callback
  ) {

    const notesRef =
      collection(
        db,
        "notes"
      );

    let q;

    if (
      category === "all"
    ) {

      q = query(
        notesRef,

        where(
          "userId",
          "==",
          userId
        ),

        where(
          "isActive",
          "==",
          true
        ),

        orderBy(
          "updatedAt",
          "desc"
        )
      );

    } else {

      q = query(
        notesRef,

        where(
          "userId",
          "==",
          userId
        ),

        where(
          "category",
          "==",
          category
        ),

        where(
          "isActive",
          "==",
          true
        ),

        orderBy(
          "updatedAt",
          "desc"
        )
      );
    }

    return onSnapshot(
      q,
      callback,
      (error) => {
        console.error(
          "Error subscribing to notes:",
          error
        );
      }
    );
  },


  // -------------------------------------------------------
  // Search notes
  // -------------------------------------------------------

  async searchNotes(
    userId,
    searchTerm
  ) {

    try {

      const notesRef =
        collection(
          db,
          "notes"
        );

      const q = query(
        notesRef,

        where(
          "userId",
          "==",
          userId
        ),

        where(
          "isActive",
          "==",
          true
        )
      );

      const snapshot =
        await getDocs(q);

      const notes =
        snapshot.docs.map(
          (document) => ({
            id: document.id,
            ...document.data(),
          })
        );


      const term =
        String(
          searchTerm || ""
        ).toLowerCase();


      return notes.filter(
        (note) =>

          note.title
            ?.toLowerCase()
            .includes(term)

          ||

          note.content
            ?.toLowerCase()
            .includes(term)

          ||

          note.tags?.some(
            (tag) =>
              String(tag)
                .toLowerCase()
                .includes(term)
          )
      );

    } catch (error) {

      console.error(
        "Error searching notes:",
        error
      );

      return [];
    }
  },
};


// =========================================================
// PLANNER SERVICE
// =========================================================

export const PlannerService = {

  // -------------------------------------------------------
  // Create task
  // -------------------------------------------------------

  async createTask(
    userId,
    taskData
  ) {

    try {

      const tasksRef =
        collection(
          db,
          "tasks"
        );

      const docRef =
        await addDoc(
          tasksRef,
          {
            ...taskData,

            userId,

            createdAt:
              serverTimestamp(),

            updatedAt:
              serverTimestamp(),

            completed: false,

            completedAt: null,

            estimatedDuration:
              taskData.estimatedDuration ||
              60,

            actualDuration: null,

            category:
              taskData.category ||
              "study",
          }
        );


      // Log activity

      await ActivityService.logActivity(
        userId,
        "task_created",
        `Created task: ${taskData.title}`,
        {
          taskId: docRef.id,
          priority:
            taskData.priority,
          category:
            taskData.category,
          dueDate:
            taskData.dateKey,
        }
      );


      // Update study streak

      await ActivityService.updateStudyStreak(
        userId
      );


      return docRef.id;

    } catch (error) {

      console.error(
        "Error creating task:",
        error
      );

      throw error;
    }
  },


  // -------------------------------------------------------
  // Complete task
  // -------------------------------------------------------

  async completeTask(
    userId,
    taskId
  ) {

    try {

      const taskRef =
        doc(
          db,
          "tasks",
          taskId
        );


      await updateDoc(
        taskRef,
        {
          completed: true,

          completedAt:
            serverTimestamp(),

          updatedAt:
            serverTimestamp(),
        }
      );


      // Get task after update

      const taskDoc =
        await getDoc(
          taskRef
        );


      if (taskDoc.exists()) {

        const taskData =
          taskDoc.data();

        await ActivityService.logActivity(
          userId,
          "task_completed",
          `Completed task: ${taskData.title}`,
          {
            taskId,
            category:
              taskData.category,
          }
        );
      }


      // Update study streak

      await ActivityService.updateStudyStreak(
        userId
      );

    } catch (error) {

      console.error(
        "Error completing task:",
        error
      );

      throw error;
    }
  },


  // -------------------------------------------------------
  // Get productivity stats
  // -------------------------------------------------------

  async getProductivityStats(
    userId,
    dateRange = 30
  ) {

    try {

      const tasksRef =
        collection(
          db,
          "tasks"
        );

      const fromDate =
        new Date();

      fromDate.setDate(
        fromDate.getDate() -
          dateRange
      );


      const q = query(
        tasksRef,

        where(
          "userId",
          "==",
          userId
        ),

        where(
          "createdAt",
          ">=",
          fromDate
        )
      );


      const snapshot =
        await getDocs(q);

      const tasks =
        snapshot.docs.map(
          (document) =>
            document.data()
        );


      const stats = {
        totalTasks:
          tasks.length,

        completedTasks:
          tasks.filter(
            (task) =>
              task.completed
          ).length,

        pendingTasks:
          tasks.filter(
            (task) =>
              !task.completed
          ).length,

        completionRate: 0,

        averageTasksPerDay: 0,

        categoryBreakdown: {},

        priorityBreakdown: {
          high: 0,
          medium: 0,
          low: 0,
        },
      };


      if (
        stats.totalTasks > 0
      ) {

        stats.completionRate =
          Math.round(
            (
              stats.completedTasks /
              stats.totalTasks
            ) * 100
          );

        stats.averageTasksPerDay =
          Math.round(
            stats.totalTasks /
            dateRange
          );


        // Category breakdown

        tasks.forEach(
          (task) => {

            const category =
              task.category ||
              "general";

            stats.categoryBreakdown[
              category
            ] =
              (
                stats.categoryBreakdown[
                  category
                ] || 0
              ) + 1;
          }
        );


        // Priority breakdown

        tasks.forEach(
          (task) => {

            const priority =
              task.priority ||
              "medium";

            if (
              Object.prototype.hasOwnProperty.call(
                stats.priorityBreakdown,
                priority
              )
            ) {
              stats.priorityBreakdown[
                priority
              ]++;
            }
          }
        );
      }


      return stats;

    } catch (error) {

      console.error(
        "Error getting productivity stats:",
        error
      );

      return null;
    }
  },
};


// =========================================================
// UPSC SPECIFIC SERVICES
// =========================================================

export const UPSCService = {

  // -------------------------------------------------------
  // Get current affairs by date range
  // -------------------------------------------------------

  async getCurrentAffairs(
    dateRange = 7
  ) {

    try {

      const fromDate =
        new Date();

      fromDate.setDate(
        fromDate.getDate() -
          dateRange
      );


      const materialsRef =
        collection(
          db,
          "study_materials"
        );


      const q = query(
        materialsRef,

        where(
          "category",
          "==",
          "current-affairs"
        ),

        where(
          "isActive",
          "==",
          true
        ),

        where(
          "createdAt",
          ">=",
          fromDate
        ),

        orderBy(
          "createdAt",
          "desc"
        )
      );


      const snapshot =
        await getDocs(q);


      return snapshot.docs.map(
        (document) => ({
          id: document.id,
          ...document.data(),
        })
      );

    } catch (error) {

      console.error(
        "Error fetching current affairs:",
        error
      );

      return [];
    }
  },


  // -------------------------------------------------------
  // Get syllabus by subject
  // -------------------------------------------------------

  async getSyllabusBySubject(
    subject
  ) {

    try {

      const syllabusRef =
        collection(
          db,
          "syllabus"
        );


      const q = query(
        syllabusRef,

        where(
          "subject",
          "==",
          subject
        ),

        where(
          "isActive",
          "==",
          true
        )
      );


      const snapshot =
        await getDocs(q);


      return snapshot.docs.map(
        (document) => ({
          id: document.id,
          ...document.data(),
        })
      );

    } catch (error) {

      console.error(
        "Error fetching syllabus:",
        error
      );

      return [];
    }
  },


  // -------------------------------------------------------
  // Track reading progress
  // -------------------------------------------------------

  async updateReadingProgress(
    userId,
    materialId,
    progress
  ) {

    try {

      const progressRef =
        collection(
          db,
          "reading_progress"
        );


      const q = query(
        progressRef,

        where(
          "userId",
          "==",
          userId
        ),

        where(
          "materialId",
          "==",
          materialId
        )
      );


      const snapshot =
        await getDocs(q);


      if (
        snapshot.empty
      ) {

        await addDoc(
          progressRef,
          {
            userId,

            materialId,

            progress,

            createdAt:
              serverTimestamp(),

            updatedAt:
              serverTimestamp(),
          }
        );

      } else {

        const existingDoc =
          snapshot.docs[0];


        await updateDoc(
          existingDoc.ref,
          {
            progress,

            updatedAt:
              serverTimestamp(),
          }
        );
      }


      // Log activity if completed

      if (
        progress >= 100
      ) {

        await ActivityService.logActivity(
          userId,
          "material_completed",
          "Completed reading material",
          {
            materialId,
            progress,
          }
        );
      }

    } catch (error) {

      console.error(
        "Error updating reading progress:",
        error
      );
    }
  },
};


// =========================================================
// FIREBASE COLLECTIONS STRUCTURE
// =========================================================

/*
COLLECTIONS STRUCTURE:

1. users/
   - userId/
     - name
     - email
     - profileComplete
     - studyStreak
     - bestStreak
     - lastStudyDate
     - streakUpdatedAt

2. activities/
   - userId
   - type
   - description
   - metadata
   - timestamp
   - createdAt
   - sessionId

3. tasks/
   - userId
   - title
   - dateKey
   - time
   - priority
   - completed
   - category
   - estimatedDuration
   - createdAt
   - updatedAt

4. notes/
   - userId
   - title
   - content
   - category
   - tags
   - createdAt
   - updatedAt
   - isActive

5. study_materials/
   - title
   - content
   - category
   - uploadedBy
   - createdAt
   - isActive
   - viewCount

6. syllabus/
   - subject
   - topic
   - subtopics
   - isActive

7. reading_progress/
   - userId
   - materialId
   - progress
   - createdAt
   - updatedAt
*/