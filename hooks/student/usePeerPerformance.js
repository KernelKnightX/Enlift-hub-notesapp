import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/firebase/config";
import { useAuth } from "@/contexts/AuthContext";

const timestampMs = (value) => {
  if (value?.toDate) return value.toDate().getTime();
  if (value instanceof Date) return value.getTime();
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export default function usePeerPerformance(userId) {
  const { user } = useAuth();
  const uid = userId || user?.uid;
  const [state, setState] = useState({
    attempt: null,
    total: 0,
    lower: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!uid) {
      setState({
        attempt: null,
        total: 0,
        lower: 0,
        loading: false,
        error: null,
      });
      return undefined;
    }

    setState((previous) => ({ ...previous, loading: true, error: null }));
    let peerUnsubscribe = () => {};
    const userQuery = query(
      collection(db, "mockAttempts"),
      where("userId", "==", uid),
    );

    const userUnsubscribe = onSnapshot(
      userQuery,
      (snapshot) => {
        const attempts = snapshot.docs
          .map((item) => ({ id: item.id, ...item.data() }))
          .filter(
            (item) =>
              Number.isFinite(Number(item.scorePct)) ||
              Number(item.totalMarks) > 0,
          )
          .sort((a, b) => timestampMs(b.createdAt) - timestampMs(a.createdAt));
        const latest = attempts[0];

        if (!latest?.testId) {
          peerUnsubscribe();
          peerUnsubscribe = () => {};
          setState({
            attempt: null,
            total: 0,
            lower: 0,
            loading: false,
            error: null,
          });
          return;
        }

        peerUnsubscribe();
        const peerQuery = query(
          collection(db, "mockAttempts"),
          where("testId", "==", latest.testId),
        );
        peerUnsubscribe = onSnapshot(
          peerQuery,
          (peerSnapshot) => {
            const scores = peerSnapshot.docs
              .map((item) => Number(item.data().scorePct))
              .filter((score) => Number.isFinite(score));
            const score = Number(latest.scorePct);
            const lower = scores.filter(
              (peerScore) => peerScore < score,
            ).length;
            setState({
              attempt: { ...latest, scorePct: score },
              total: scores.length,
              lower,
              loading: false,
              error: null,
            });
          },
          (error) =>
            setState((previous) => ({ ...previous, loading: false, error })),
        );
      },
      (error) =>
        setState({ attempt: null, total: 0, lower: 0, loading: false, error }),
    );

    return () => {
      userUnsubscribe();
      peerUnsubscribe();
    };
  }, [uid]);

  const percentile = state.total
    ? Math.round((state.lower / state.total) * 100)
    : null;
  return { ...state, percentile };
}
