import { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '@/contexts/AuthContext';

const WEAK_THRESHOLD = 50;

export default function useTopicStats() {
  const { user } = useAuth();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.uid) {
      setTopics([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, 'users', user.uid, 'topicStats'),
      orderBy('accuracyPct', 'asc')
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setTopics(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.warn('[useTopicStats]', err?.message || err);
        setTopics([]);
        setLoading(false);
        setError(err);
      }
    );

    return () => unsub();
  }, [user?.uid]);

  const weakTopics = useMemo(
    () => topics.filter((t) => Number(t.accuracyPct) < WEAK_THRESHOLD),
    [topics]
  );

  const weakest = weakTopics[0] || null;

  const bySubject = useMemo(() => {
    const map = {};
    for (const t of topics) {
      const subj = t.subject || 'Other';
      if (!map[subj]) map[subj] = [];
      map[subj].push(t);
    }
    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => Number(a.accuracyPct) - Number(b.accuracyPct));
    }
    return map;
  }, [topics]);

  return {
    topics,
    weakTopics,
    weakest,
    weakCount: weakTopics.length,
    bySubject,
    loading,
    error,
  };
}
