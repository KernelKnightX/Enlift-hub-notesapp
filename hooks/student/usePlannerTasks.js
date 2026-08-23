// hooks/student/usePlannerTasks.js

import { useState, useEffect, useCallback } from "react";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/firebase/config";
import { useAuth } from "@/contexts/AuthContext";

export const usePlannerTasks = () => {
  const { user } = useAuth();

  const [tasksMap, setTasksMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /*
   * ---------------------------------------------------------
   * LOAD USER TASKS
   *
   * Firestore path:
   * /tasks
   *
   * Every task contains:
   * userId = current Firebase user's UID
   * ---------------------------------------------------------
   */

  useEffect(() => {
    // Auth is still loading / user not available
    if (!user?.uid) {
      setTasksMap({});
      setLoading(false);
      setError(null);
      return;
    }

    console.log(
      "[usePlannerTasks] Loading tasks for UID:",
      user.uid
    );

    setLoading(true);
    setError(null);

    /*
     * IMPORTANT:
     *
     * We keep using /tasks because your existing planner
     * already stores tasks there.
     *
     * Do NOT change this to plannerTasks right now.
     */

    const tasksRef = collection(db, "tasks");

    const q = query(
      tasksRef,
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      q,

      (snapshot) => {
        console.log(
          "[usePlannerTasks] Firestore tasks received:",
          snapshot.size
        );

        const newTasksMap = {};

        snapshot.forEach((snapshotDoc) => {
          const task = {
            id: snapshotDoc.id,
            ...snapshotDoc.data(),
          };

          if (!task.date) {
            console.warn(
              "[usePlannerTasks] Task has no date:",
              task
            );
            return;
          }

          const dateKey = task.date;

          if (!newTasksMap[dateKey]) {
            newTasksMap[dateKey] = [];
          }

          newTasksMap[dateKey].push(task);
        });

        /*
         * Sort tasks AFTER receiving them.
         *
         * This avoids requiring a Firestore composite index
         * for date + time.
         */

        Object.keys(newTasksMap).forEach((dateKey) => {
          newTasksMap[dateKey].sort((a, b) => {
            const timeA = a.time || "";
            const timeB = b.time || "";

            return timeA.localeCompare(timeB);
          });
        });

        /*
         * IMPORTANT:
         *
         * An empty snapshot means the user genuinely has
         * zero tasks.
         *
         * We ONLY update local state.
         *
         * We NEVER write the empty state back to Firestore.
         */

        setTasksMap(newTasksMap);
        setLoading(false);
        setError(null);
      },

      (firebaseError) => {
        console.error(
          "[usePlannerTasks] Firestore read failed:",
          firebaseError
        );

        console.error(
          "[usePlannerTasks] Error code:",
          firebaseError?.code
        );

        setError(firebaseError);
        setLoading(false);

        /*
         * IMPORTANT:
         *
         * Do NOT clear existing tasks here.
         *
         * If Firestore temporarily fails, keep whatever
         * data is already on screen.
         */

        setTasksMap((previousTasks) => previousTasks);
      }
    );

    return () => {
      console.log(
        "[usePlannerTasks] Removing Firestore listener."
      );

      unsubscribe();
    };
  }, [user?.uid]);


  /*
   * ---------------------------------------------------------
   * SAVE TASK
   * ---------------------------------------------------------
   */

  const saveTask = useCallback(
    async (dateKey, taskData) => {
      if (!user?.uid) {
        throw new Error(
          "You must be logged in to save a planner task."
        );
      }

      if (!dateKey) {
        throw new Error(
          "A date is required to save a planner task."
        );
      }

      try {
        /*
         * Existing task:
         * keep its ID.
         *
         * New task:
         * create a new Firestore document ID.
         */

        const taskId =
          taskData?.id ||
          doc(collection(db, "tasks")).id;

        const taskRef = doc(
          db,
          "tasks",
          taskId
        );

        /*
         * Never overwrite createdAt when editing
         * an existing task.
         */

        const taskPayload = {
          ...taskData,

          id: taskId,

          // Always associate task with current user
          userId: user.uid,

          // Planner date
          date: dateKey,

          // Update timestamp
          updatedAt: serverTimestamp(),
        };

        /*
         * Only add createdAt for NEW tasks.
         */

        if (!taskData?.id) {
          taskPayload.createdAt = serverTimestamp();
        }

        console.log(
          "[usePlannerTasks] Saving task:",
          {
            taskId,
            date: dateKey,
            userId: user.uid,
          }
        );

        await setDoc(
          taskRef,
          taskPayload,
          {
            merge: true,
          }
        );

        console.log(
          "[usePlannerTasks] Task saved:",
          taskId
        );

        return taskId;
      } catch (firebaseError) {
        console.error(
          "[usePlannerTasks] Error saving task:",
          firebaseError
        );

        throw firebaseError;
      }
    },
    [user?.uid]
  );


  /*
   * ---------------------------------------------------------
   * DELETE TASK
   * ---------------------------------------------------------
   */

  const deleteTask = useCallback(
    async (taskId) => {
      if (!user?.uid) {
        throw new Error(
          "You must be logged in to delete a planner task."
        );
      }

      if (!taskId) {
        throw new Error(
          "Task ID is required to delete a task."
        );
      }

      try {
        const taskRef = doc(
          db,
          "tasks",
          taskId
        );

        console.log(
          "[usePlannerTasks] Deleting task:",
          taskId
        );

        await deleteDoc(taskRef);

        console.log(
          "[usePlannerTasks] Task deleted:",
          taskId
        );
      } catch (firebaseError) {
        console.error(
          "[usePlannerTasks] Error deleting task:",
          firebaseError
        );

        throw firebaseError;
      }
    },
    [user?.uid]
  );


  /*
   * ---------------------------------------------------------
   * UPCOMING TASKS
   * ---------------------------------------------------------
   */

  const getUpcomingTasks = useCallback(() => {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const nextWeek = new Date(today);

    nextWeek.setDate(
      nextWeek.getDate() + 7
    );

    const upcomingTasks = [];

    Object.keys(tasksMap).forEach((dateKey) => {
      const taskDate = new Date(dateKey);

      taskDate.setHours(0, 0, 0, 0);

      if (
        taskDate >= today &&
        taskDate <= nextWeek
      ) {
        tasksMap[dateKey].forEach((task) => {
          upcomingTasks.push({
            ...task,
            dateKey,
          });
        });
      }
    });

    return upcomingTasks.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);

      const dateCompare =
        dateA - dateB;

      if (dateCompare !== 0) {
        return dateCompare;
      }

      return (a.time || "").localeCompare(
        b.time || ""
      );
    });
  }, [tasksMap]);


  /*
   * ---------------------------------------------------------
   * RETURN
   * ---------------------------------------------------------
   */

  return {
    tasksMap,
    loading,
    error,
    saveTask,
    deleteTask,
    getUpcomingTasks,
  };
};