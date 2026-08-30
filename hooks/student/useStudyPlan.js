import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import {
  generateDailyStudyPlan,
  getStudySettings,
  saveStudySettings,
  toggleStudyPlanTask,
  toDateKey,
} from '@/lib/weaknessMastery';

function getMonday(date = new Date()) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = (day + 6) % 7;
  copy.setDate(copy.getDate() - diff);
  return copy;
}

export function getWeekDateKeys(weekOffset = 0) {
  const start = getMonday();
  start.setDate(start.getDate() + weekOffset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

export default function useStudyPlan(weekOffset = 0) {
  const { user } = useAuth();
  const [plansMap, setPlansMap] = useState({});
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  const weekKeys = useMemo(() => getWeekDateKeys(weekOffset), [weekOffset]);
  const todayKey = toDateKey();

  useEffect(() => {
    if (!user?.uid) {
      setPlansMap({});
      setSettings(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    getStudySettings(user.uid).then(setSettings);

    const startKey = weekKeys[0];
    const endKey = weekKeys[6];

    const q = query(
      collection(db, 'users', user.uid, 'studyPlan'),
      where('date', '>=', startKey),
      where('date', '<=', endKey)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const map = {};
        snap.docs.forEach((d) => {
          const data = d.data();
          map[data.date || d.id] = { id: d.id, ...data };
        });
        setPlansMap(map);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.warn('[useStudyPlan]', err?.message || err);
        setPlansMap({});
        setLoading(false);
        setError(err);
      }
    );

    return () => unsub();
  }, [user?.uid, weekKeys]);

  const todayPlan = plansMap[todayKey];
  const todayTasks = todayPlan?.tasks || [];

  const replan = useCallback(
    async (dateKey = todayKey) => {
      if (!user?.uid) return;
      setGenerating(true);
      try {
        await generateDailyStudyPlan(user.uid, dateKey);
      } finally {
        setGenerating(false);
      }
    },
    [user?.uid, todayKey]
  );

  const updateSettings = useCallback(
    async (patch) => {
      if (!user?.uid) return;
      const merged = { ...(settings || {}), ...patch };
      await saveStudySettings(user.uid, merged);
      setSettings(merged);
    },
    [user?.uid, settings]
  );

  const toggleTask = useCallback(
    async (dateKey, taskIndex, done) => {
      if (!user?.uid) return;
      await toggleStudyPlanTask(user.uid, dateKey, taskIndex, done);
    },
    [user?.uid]
  );

  return {
    weekKeys,
    plansMap,
    todayKey,
    todayPlan,
    todayTasks,
    settings,
    loading,
    generating,
    error,
    replan,
    updateSettings,
    toggleTask,
  };
}
