import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { Loader2, ArrowLeft, ClipboardCheck } from 'lucide-react';
import { normalizeTest, computeAttemptStats } from '@/lib/mockTestScoring';
import MockTestResult from '@/components/student/mock/MockTestResult';

export default function MockTestReviewPage() {
  const router = useRouter();
  const { attempt: attemptId, test: testIdQuery } = router.query;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [test, setTest] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [uid, setUid] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUid(user?.uid || null);
      setAuthReady(true);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!attemptId || !authReady) return;

    if (!uid) {
      setError('Please log in to view this attempt.');
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const attemptSnap = await getDoc(
          doc(db, 'users', uid, 'mockTestAttempts', String(attemptId)),
        );
        if (!attemptSnap.exists()) {
          if (!cancelled) {
            setError('Attempt not found.');
            setLoading(false);
          }
          return;
        }

        const attemptData = { id: attemptSnap.id, ...attemptSnap.data() };
        const resolvedTestId = testIdQuery || attemptData.testId;
        if (!resolvedTestId) {
          if (!cancelled) {
            setError('Test reference missing for this attempt.');
            setLoading(false);
          }
          return;
        }

        const testSnap = await getDoc(doc(db, 'mockTests', String(resolvedTestId)));
        if (!testSnap.exists()) {
          if (!cancelled) {
            setError('The original test is no longer available.');
            setLoading(false);
          }
          return;
        }

        const normalized = normalizeTest({ id: testSnap.id, ...testSnap.data() });
        const answers = attemptData.answers || {};
        const stats = computeAttemptStats(normalized, answers);

        if (!cancelled) {
          setTest(normalized);
          setAttempt({
            ...attemptData,
            stats: {
              ...stats,
              obtainedMarks: attemptData.obtainedMarks ?? stats.obtainedMarks,
              maxMarks: attemptData.maxMarks ?? stats.maxMarks,
              scorePct: attemptData.scorePct ?? stats.scorePct,
            },
          });
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError('Could not load this attempt.');
          setLoading(false);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [attemptId, testIdQuery, uid, authReady]);

  if (loading) {
    return (
      <div className="mock-test-loading">
        <Loader2 className="animate-spin" size={28} style={{ color: 'var(--color-primary)' }} />
      </div>
    );
  }

  if (!test || !attempt) {
    return (
      <div className="mock-test-loading" style={{ padding: '2rem' }}>
        <div className="card p-10 text-center max-w-md">
          <ClipboardCheck size={32} style={{ color: 'var(--color-ink-faint)', margin: '0 auto' }} />
          <p className="mt-4 font-serif text-[22px]">Review unavailable</p>
          <p className="mt-2 text-[14px]" style={{ color: 'var(--color-ink-muted)' }}>{error}</p>
          <Link href="/student-desk/mock-tests" className="btn btn-primary mt-6 inline-flex">
            <ArrowLeft size={14} /> Back to mock tests
          </Link>
        </div>
      </div>
    );
  }

  return (
    <MockTestResult
      test={test}
      stats={attempt.stats}
      answers={attempt.answers || {}}
      flagged={attempt.flagged || {}}
      timeTakenSeconds={attempt.timeTakenSeconds || 0}
      submitReason={attempt.submitReason || 'manual'}
      previousAttemptPct={attempt.previousAttemptPct ?? null}
      readOnly
    />
  );
}
