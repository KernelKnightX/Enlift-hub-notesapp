import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '@/firebase/config';

export default function useTestAttempts() {
  const [uid, setUid] = useState(null);
  const [attemptsByTest, setAttemptsByTest] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setUid(user?.uid || null);
    });
    return unsubAuth;
  }, []);

  useEffect(() => {
    if (!uid) {
      setAttemptsByTest({});
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, 'users', uid, 'mockTestAttempts'),
      orderBy('attemptedAt', 'asc'),
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const grouped = {};
        snap.forEach((docSnap) => {
          const d = docSnap.data();
          if (!d.testId) return;
          const attemptedAt = d.attemptedAt?.toDate
            ? d.attemptedAt.toDate()
            : new Date(d.attemptedAt);
          (grouped[d.testId] ??= []).push({
            id: docSnap.id,
            score: Number(d.obtainedMarks ?? 0),
            total: Number(d.totalMarks ?? d.maxMarks ?? 0),
            scorePct: Number(d.scorePct ?? 0),
            attemptedAt,
          });
        });

        const summary = {};
        Object.entries(grouped).forEach(([testId, attempts]) => {
          const sorted = attempts.sort((a, b) => a.attemptedAt - b.attemptedAt);
          const last = sorted[sorted.length - 1];
          const prev = sorted.length > 1 ? sorted[sorted.length - 2] : null;
          const lastPct = last.total ? (last.score / last.total) * 100 : (last.scorePct || 0);
          const prevPct = prev?.total ? (prev.score / prev.total) * 100 : (prev?.scorePct ?? null);

          summary[testId] = {
            count: sorted.length,
            lastScore: last.score,
            lastTotal: last.total,
            lastPct,
            trend: prevPct != null ? Math.round((lastPct - prevPct) * 10) / 10 : null,
            lastDate: last.attemptedAt,
            lastAttemptId: last.id,
          };
        });

        setAttemptsByTest(summary);
        setLoading(false);
      },
      (err) => {
        if (typeof console !== 'undefined' && console.warn) {
          console.warn('[firestore:mockTestAttempts] read failed:', err.code || err.message);
        }
        setAttemptsByTest({});
        setLoading(false);
      },
    );

    return unsub;
  }, [uid]);

  return { attemptsByTest, loading };
}
