/**
 * useUserMetrics
 *
 * Reads real-time user metrics from:
 * users/{uid}/stats/summary
 *
 * If the stats document does not exist or cannot be read,
 * the hook safely falls back to DEFAULT_METRICS.
 */

import { useEffect, useState } from "react";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/config";
import { useAuth } from "@/contexts/AuthContext";

const DEFAULT_METRICS = {
  notesCreated: 0,
  notesThisWeek: 0,
  mocksAttempted: 0,
  mockAvgScore: 0,
  studyStreak: 0,
  bestStreak: 0,
  weeklyProgressPct: 0,
  weeklyStudyHours: 0,
  weeklyGoal: 40,
  weeklyNotesGoal: 10,
  weeklyMocksGoal: 3,
};

export default function useUserMetrics() {
  const { user } = useAuth();

  const [metrics, setMetrics] = useState(DEFAULT_METRICS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMock, setIsMock] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setMetrics(DEFAULT_METRICS);
      setLoading(false);
      setError(null);
      setIsMock(true);
      return;
    }

    setLoading(true);
    setError(null);

    const userDocRef = doc(db, "users", user.uid);
    const statsDocRef = doc(db, "users", user.uid, "stats", "summary");

    const unsubscribe = onSnapshot(
      userDocRef,
      async (userSnapshot) => {
        try {
          const userData = userSnapshot.exists() ? userSnapshot.data() || {} : {};
          const statsSnapshot = await getDoc(statsDocRef);
          const summaryData = statsSnapshot.exists() ? statsSnapshot.data() || {} : {};

          const mergedMetrics = {
            ...DEFAULT_METRICS,
            ...userData,
            ...summaryData,
            studyStreak: Number(userData.studyStreak ?? summaryData.studyStreak ?? 0),
            bestStreak: Number(userData.bestStreak ?? summaryData.bestStreak ?? userData.studyStreak ?? summaryData.studyStreak ?? 0),
          };

          setMetrics(mergedMetrics);
          setIsMock(!userSnapshot.exists() && !statsSnapshot.exists());
          setLoading(false);
          setError(null);
        } catch (firebaseError) {
          console.warn("[useUserMetrics] read failed:", firebaseError?.message || firebaseError);
          setError(firebaseError);
          setMetrics(DEFAULT_METRICS);
          setIsMock(true);
          setLoading(false);
        }
      },
      (firebaseError) => {
        console.warn("[useUserMetrics] listener failed:", firebaseError?.message || firebaseError);
        setError(firebaseError);
        setMetrics(DEFAULT_METRICS);
        setIsMock(true);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user?.uid]);

  return {
    metrics,
    loading,
    error,
    isMock,
  };
}