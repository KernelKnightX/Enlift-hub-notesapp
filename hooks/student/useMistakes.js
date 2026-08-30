import { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import { toDateKey } from '@/lib/weaknessMastery';

export default function useMistakes() {
  const { user } = useAuth();
  const [mistakes, setMistakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.uid) {
      setMistakes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, 'users', user.uid, 'mistakes'),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setMistakes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.warn('[useMistakes]', err?.message || err);
        setMistakes([]);
        setLoading(false);
        setError(err);
      }
    );

    return () => unsub();
  }, [user?.uid]);

  const todayKey = toDateKey();

  const dueToday = useMemo(() => {
    const endOfDay = new Date(todayKey);
    endOfDay.setHours(23, 59, 59, 999);
    return mistakes.filter((m) => {
      if (m.status !== 'active') return false;
      const next = m.nextReviewDate?.toDate?.() || new Date(m.nextReviewDate);
      return next <= endOfDay;
    });
  }, [mistakes, todayKey]);

  const active = useMemo(() => mistakes.filter((m) => m.status === 'active'), [mistakes]);
  const mastered = useMemo(() => mistakes.filter((m) => m.status === 'mastered'), [mistakes]);

  const subjects = useMemo(() => {
    const set = new Set(mistakes.map((m) => m.subject).filter(Boolean));
    return Array.from(set).sort();
  }, [mistakes]);

  return {
    mistakes,
    active,
    mastered,
    dueToday,
    dueCount: dueToday.length,
    subjects,
    loading,
    error,
  };
}
