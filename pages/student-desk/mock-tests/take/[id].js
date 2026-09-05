import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import { recordMockAttempt, bumpMockAttemptCount } from '@/lib/officeAnalytics';
import { processMockTestResults, bumpMockStats } from '@/lib/weaknessMastery';
import { computeAttemptStats, normalizeTest } from '@/lib/mockTestScoring';
import { loadMockSession, saveMockSession, clearMockSession } from '@/lib/mockTestSession';
import useTestAttempts from '@/hooks/student/useTestAttempts';
import ConfirmDialog from '@/components/student/mock/ConfirmDialog';
import MockTestInstructions from '@/components/student/mock/MockTestInstructions';
import MockTestResult from '@/components/student/mock/MockTestResult';
import {
  Clock, Flag, ChevronLeft, ChevronRight, CheckCircle2,
  ClipboardCheck, Loader2, ArrowLeft, Lock,
} from 'lucide-react';

export default function TakeTest() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const { attemptsByTest } = useTestAttempts();

  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [phase, setPhase] = useState('instructions'); // instructions | active | submitted
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState({});
  const [visited, setVisited] = useState({});
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitReason, setSubmitReason] = useState('manual');
  const [timeTakenSeconds, setTimeTakenSeconds] = useState(0);
  const [savedSession, setSavedSession] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showRetryModal, setShowRetryModal] = useState(false);

  const startedAtRef = useRef(null);
  const attemptSavedRef = useRef(false);
  const timerRef = useRef(null);

  const previousAttemptPct = useMemo(() => {
    if (!test?.id) return null;
    const prev = attemptsByTest[test.id];
    return prev?.lastPct ?? null;
  }, [attemptsByTest, test?.id]);

  // Load test
  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      try {
        const snap = await getDoc(doc(db, 'mockTests', String(id)));
        if (!snap.exists()) {
          if (!cancelled) {
            setError('This mock test was not found. It may have been removed.');
            setLoading(false);
          }
          return;
        }

        const t = normalizeTest({ id: snap.id, ...snap.data() });
        if (t.questions.length === 0) {
          if (!cancelled) {
            setError('This test has no questions yet. Check back after your team publishes it.');
            setLoading(false);
          }
          return;
        }

        if (!cancelled) {
          setTest(t);
          setTimeLeft(t.duration * 60);
          const session = loadMockSession(t.id, user?.uid);
          setSavedSession(session);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError('Could not load this test. Please try again.');
          setLoading(false);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [id, user?.uid]);

  const stats = useMemo(
    () => computeAttemptStats(test, answers),
    [test, answers],
  );

  const beginTest = useCallback((session = null) => {
    if (!test) return;
    const durationSec = test.duration * 60;
    const initialTime = session?.timeLeft ?? durationSec;

    setAnswers(session?.answers || {});
    setFlagged(session?.flagged || {});
    setVisited(session?.visited || {});
    setCurrent(session?.current ?? 0);
    setTimeLeft(initialTime);
    setPhase('active');
    setSubmitReason('manual');
    startedAtRef.current = Date.now() - (durationSec - initialTime) * 1000;
    attemptSavedRef.current = false;
  }, [test]);

  const finalizeSubmit = useCallback((reason) => {
    if (!test) return;
    const elapsed = startedAtRef.current
      ? Math.round((Date.now() - startedAtRef.current) / 1000)
      : 0;
    setTimeTakenSeconds(elapsed);
    setSubmitReason(reason);
    setPhase('submitted');
    clearMockSession(test.id, user?.uid);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [test, user?.uid]);

  // Timer — only when active
  useEffect(() => {
    if (phase !== 'active' || !test) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          finalizeSubmit('timeout');
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, test, finalizeSubmit]);

  // Auto-save session while active
  useEffect(() => {
    if (phase !== 'active' || !test) return;
    saveMockSession(test.id, user?.uid, {
      answers,
      flagged,
      visited,
      current,
      timeLeft,
    });
  }, [phase, test, answers, flagged, visited, current, timeLeft, user?.uid]);

  // Mark visited on question change
  useEffect(() => {
    if (phase !== 'active' || !test) return;
    const q = test.questions[current];
    if (q) setVisited((v) => ({ ...v, [q.id]: true }));
  }, [current, phase, test]);

  // Keyboard shortcuts
  useEffect(() => {
    if (phase !== 'active' || !test) return;

    const onKeyDown = (e) => {
      if (e.target?.tagName === 'INPUT' || e.target?.tagName === 'TEXTAREA') return;
      const q = test.questions[current];
      if (!q) return;

      const key = e.key.toLowerCase();
      if (['a', 'b', 'c', 'd'].includes(key)) {
        const idx = key.charCodeAt(0) - 97;
        if (idx < q.options.length) {
          setAnswers((a) => ({ ...a, [q.id]: idx }));
        }
      }
      if (key === 'arrowleft' && current > 0) setCurrent((c) => c - 1);
      if (key === 'arrowright' && current < test.questions.length - 1) setCurrent((c) => c + 1);
      if (key === 'f') setFlagged((f) => ({ ...f, [q.id]: !f[q.id] }));
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [phase, test, current]);

  // Save attempt to Firestore
  useEffect(() => {
    if (phase !== 'submitted' || !test || attemptSavedRef.current) return;
    attemptSavedRef.current = true;

    if (!auth.currentUser || test.id === 'unknown') return;

    const uid = auth.currentUser.uid;
    const { obtainedMarks, maxMarks, scorePct, correct, wrong, unanswered, subjectBreakdown } = stats;

    (async () => {
      let userName = auth.currentUser.displayName || '';
      try {
        const profile = await getDoc(doc(db, 'users', uid));
        if (profile.exists()) {
          const data = profile.data();
          userName = data.fullName || data.name || data.displayName || userName;
        }
      } catch { /* ignore */ }

      await addDoc(collection(db, 'users', uid, 'mockTestAttempts'), {
        testId: test.id,
        testTitle: test.title,
        obtainedMarks,
        totalMarks: maxMarks,
        maxMarks,
        scorePct,
        correct,
        wrong,
        unanswered,
        timeTakenSeconds,
        submitReason,
        answers,
        flagged,
        subjectBreakdown,
        previousAttemptPct,
        attemptedAt: serverTimestamp(),
      }).catch((err) => {
        if (typeof console !== 'undefined' && console.warn) {
          console.warn('[firestore:testAttempts] write failed:', err.code || err.message);
        }
      });

      await recordMockAttempt({
        testId: test.id,
        testTitle: test.title,
        obtainedMarks,
        totalMarks: maxMarks,
        scorePct,
        isPremium: test.isPremium,
        userName,
      });
      await bumpMockAttemptCount(test.id);
      await processMockTestResults({
        userId: uid,
        test,
        answers,
        sourceTestId: test.id,
      });
      await bumpMockStats(uid, scorePct);
    })();
  }, [phase, test, stats, answers, flagged, timeTakenSeconds, submitReason, previousAttemptPct]);

  const handleSubmitRequest = () => setShowSubmitModal(true);

  const handleSubmitConfirm = () => {
    setShowSubmitModal(false);
    finalizeSubmit('manual');
  };

  const handleRetry = () => {
    setShowRetryModal(false);
    setAnswers({});
    setFlagged({});
    setVisited({});
    setCurrent(0);
    setTimeTakenSeconds(0);
    setSubmitReason('manual');
    attemptSavedRef.current = false;
    setPhase('instructions');
    setSavedSession(null);
    clearMockSession(test?.id, user?.uid);
    if (test) setTimeLeft(test.duration * 60);
  };

  if (loading) {
    return (
      <div className="mock-test-loading">
        <Loader2 className="animate-spin" size={28} style={{ color: 'var(--color-primary)' }} />
      </div>
    );
  }

  if (!test) {
    return (
      <div className="mock-test-loading" style={{ padding: '2rem' }}>
        <div className="card p-10 text-center max-w-md">
          <ClipboardCheck size={32} style={{ color: 'var(--color-ink-faint)', margin: '0 auto' }} />
          <p className="mt-4 font-serif text-[22px]">Test unavailable</p>
          <p className="mt-2 text-[14px]" style={{ color: 'var(--color-ink-muted)' }}>
            {error || 'This mock test could not be loaded.'}
          </p>
          <Link href="/student-desk/mock-tests" className="btn btn-primary mt-6 inline-flex">
            <ArrowLeft size={14} /> Back to mock tests
          </Link>
        </div>
      </div>
    );
  }

  // Premium gate
  if (test.isPremium && !user?.isPremium) {
    return (
      <div className="mock-test-loading" style={{ padding: '2rem' }}>
        <div className="card p-10 text-center max-w-md">
          <Lock size={32} style={{ color: 'var(--color-gold)', margin: '0 auto' }} />
          <p className="mt-4 font-serif text-[22px]">Plus mock test</p>
          <p className="mt-2 text-[14px]" style={{ color: 'var(--color-ink-muted)' }}>
            This test is available on the Plus plan. Ask your coaching office to enable Plus on your account.
          </p>
          <Link href="/student-desk/mock-tests" className="btn btn-primary mt-6 inline-flex">
            <ArrowLeft size={14} /> Back to mock tests
          </Link>
        </div>
      </div>
    );
  }

  if (phase === 'instructions') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-bg)', padding: '1.5rem 1rem 3rem' }}>
        <div className="max-w-[760px] mx-auto mb-4">
          <Link href="/student-desk/mock-tests" className="text-[13px] flex items-center gap-1.5" style={{ color: 'var(--color-ink-muted)' }}>
            <ArrowLeft size={14} /> Back to mock tests
          </Link>
        </div>
        <MockTestInstructions
          test={test}
          savedSession={savedSession}
          onStart={() => beginTest(null)}
          onResume={() => beginTest(savedSession)}
          onDiscardResume={() => {
            clearMockSession(test.id, user?.uid);
            setSavedSession(null);
          }}
        />
      </div>
    );
  }

  if (phase === 'submitted') {
    return (
      <>
        <MockTestResult
          test={test}
          stats={stats}
          answers={answers}
          flagged={flagged}
          timeTakenSeconds={timeTakenSeconds}
          submitReason={submitReason}
          previousAttemptPct={previousAttemptPct}
          onRetry={() => setShowRetryModal(true)}
        />
        <ConfirmDialog
          open={showRetryModal}
          title="Retry this mock?"
          message="Your current result is already saved. Starting again will begin a fresh attempt."
          confirmLabel="Start fresh"
          onConfirm={handleRetry}
          onCancel={() => setShowRetryModal(false)}
        />
      </>
    );
  }

  const q = test.questions[current];
  const total = test.questions.length;
  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const ss = String(timeLeft % 60).padStart(2, '0');
  const timerClass = timeLeft <= 60 ? 'is-critical' : timeLeft <= 300 ? 'is-warning' : '';
  const hasAnswer = answers[q.id] !== undefined;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <header className="mock-test-header">
        <div className="mock-test-header__inner">
          <button type="button" className="mock-test-header__exit" onClick={() => setShowExitModal(true)}>
            <ArrowLeft size={14} /> Exit
          </button>
          <div className="mock-test-header__title-wrap">
            <div className="mock-test-header__subject">{test.subject.toUpperCase()}</div>
            <div className="mock-test-header__title">{test.title}</div>
          </div>
          <div className={`mock-timer ${timerClass}`} data-testid="timer">
            <Clock size={12} /> {mm}:{ss}
          </div>
          <button type="button" onClick={handleSubmitRequest} className="btn btn-primary" data-testid="submit-test"
            style={{ padding: '0.55rem 1.1rem', fontSize: 13 }}>
            Submit
          </button>
        </div>
      </header>

      <div className="max-w-[1240px] mx-auto px-4 md:px-8 py-8 grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 lg:col-span-8">
          <div className="card p-6 md:p-8" data-testid="question-card">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <span className="text-[11px] font-mono" style={{ color: 'var(--color-ink-faint)', letterSpacing: '0.14em' }}>
                QUESTION {current + 1} · OF {total}
              </span>
              <div className="flex items-center gap-2">
                {q.subject ? (
                  <span className="chip chip-primary" style={{ fontSize: 10.5 }}>{q.subject}</span>
                ) : null}
                <button
                  type="button"
                  onClick={() => setFlagged((f) => ({ ...f, [q.id]: !f[q.id] }))}
                  className="text-[12px] flex items-center gap-1"
                  style={{ color: flagged[q.id] ? 'var(--color-accent)' : 'var(--color-ink-muted)' }}
                  data-testid="flag-question"
                >
                  <Flag size={13} strokeWidth={1.6} fill={flagged[q.id] ? 'currentColor' : 'none'} />
                  {flagged[q.id] ? 'Flagged' : 'Flag'}
                </button>
              </div>
            </div>

            <div className="hero-display" style={{ fontSize: 22, lineHeight: 1.4, letterSpacing: '-0.02em' }}>
              {q.question}
            </div>

            <div className="mt-6 flex flex-col gap-2.5" data-testid="options">
              {q.options.map((op, k) => {
                const chosen = answers[q.id] === k;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setAnswers((a) => ({ ...a, [q.id]: k }))}
                    data-testid={`option-${k}`}
                    className="text-left px-4 py-3.5 rounded-xl flex items-center gap-3"
                    style={{
                      border: `1.5px solid ${chosen ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      background: chosen ? 'var(--color-primary-tint)' : 'var(--color-surface)',
                      transition: 'background .15s, border-color .15s',
                    }}
                  >
                    <span style={{
                      width: 26, height: 26, borderRadius: 8,
                      background: chosen ? 'var(--color-primary)' : 'var(--color-surface-alt)',
                      color: chosen ? '#fff' : 'var(--color-ink-muted)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, flexShrink: 0,
                    }}>
                      {'ABCD'[k]}
                    </span>
                    <span className="flex-1 text-[14.5px]" style={{ color: 'var(--color-ink)', fontWeight: chosen ? 600 : 500 }}>
                      {op}
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="mock-keyboard-hint">
              Keys: <kbd>A</kbd><kbd>B</kbd><kbd>C</kbd><kbd>D</kbd> select · <kbd>F</kbd> flag · arrows navigate
            </p>

            <div className="mt-6 flex items-center justify-between flex-wrap gap-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCurrent((c) => Math.max(0, c - 1))}
                  className="btn btn-ghost"
                  disabled={current === 0}
                  data-testid="prev-question"
                  style={{ opacity: current === 0 ? 0.5 : 1 }}
                >
                  <ChevronLeft size={14} /> Previous
                </button>
                {hasAnswer ? (
                  <button
                    type="button"
                    onClick={() => setAnswers((a) => {
                      const next = { ...a };
                      delete next[q.id];
                      return next;
                    })}
                    className="btn btn-ghost"
                    data-testid="clear-answer"
                  >
                    Clear answer
                  </button>
                ) : null}
              </div>

              {current < total - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrent((c) => Math.min(total - 1, c + 1))}
                  className="btn btn-primary"
                  data-testid="next-question"
                >
                  Next <ChevronRight size={14} />
                </button>
              ) : (
                <button type="button" onClick={handleSubmitRequest} className="btn btn-accent" data-testid="finish-test">
                  Finish & submit <CheckCircle2 size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4">
          <div className="card p-5">
            <div className="eyebrow mb-3">Question palette</div>
            <div className="grid grid-cols-6 gap-2" data-testid="palette">
              {test.questions.map((qq, i) => {
                const answered = answers[qq.id] !== undefined;
                const isFlag = flagged[qq.id];
                const isCurrent = i === current;
                const notVisited = !visited[qq.id] && !answered;

                let bg = 'var(--color-surface-alt)';
                let color = 'var(--color-ink)';
                let border = 'var(--color-border)';

                if (answered) {
                  bg = 'var(--cat-green-t)';
                  color = 'var(--cat-green)';
                  border = 'rgba(5,150,105,0.35)';
                }
                if (notVisited) {
                  bg = 'var(--color-surface-alt)';
                  color = 'var(--color-ink-faint)';
                }
                if (isCurrent) {
                  bg = 'var(--color-primary)';
                  color = '#fff';
                  border = 'var(--color-primary)';
                }

                return (
                  <button
                    key={qq.id}
                    type="button"
                    onClick={() => setCurrent(i)}
                    data-testid={`palette-${i}`}
                    className="mock-palette-btn"
                    style={{ background: bg, color, border: `1px solid ${border}` }}
                  >
                    {i + 1}
                    {isFlag ? <span className="mock-palette-btn__flag" aria-hidden /> : null}
                  </button>
                );
              })}
            </div>

            <div className="hairline-t mt-4 pt-4 flex flex-col gap-2 text-[11.5px]" style={{ color: 'var(--color-ink-muted)' }}>
              <PaletteLegend color="var(--cat-green-t)" label="Answered" />
              <PaletteLegend color="var(--color-surface-alt)" label="Not visited" />
              <PaletteLegend color="var(--color-primary)" label="Current" />
              <div className="flex items-center gap-2">
                <span className="mock-palette-btn__flag" style={{ position: 'static', width: 8, height: 8 }} />
                Flagged (dot)
              </div>
            </div>

            <div className="hairline-t mt-4 pt-4 text-[12px]" style={{ color: 'var(--color-ink-muted)' }}>
              <strong style={{ color: 'var(--color-ink)' }}>{stats.attempted}</strong> answered ·{' '}
              <strong style={{ color: 'var(--color-ink)' }}>{stats.unanswered}</strong> remaining ·{' '}
              <strong style={{ color: 'var(--color-ink)' }}>{Object.keys(flagged).filter((k) => flagged[k]).length}</strong> flagged
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showSubmitModal}
        title="Submit test?"
        message={`You have answered ${stats.attempted} of ${total} questions. ${stats.unanswered > 0 ? `${stats.unanswered} are still unanswered — ` : ''}Once submitted, you cannot change your answers.`}
        confirmLabel="Submit now"
        onConfirm={handleSubmitConfirm}
        onCancel={() => setShowSubmitModal(false)}
      />

      <ConfirmDialog
        open={showExitModal}
        title="Leave this test?"
        message="Your progress is saved locally, but the timer keeps running while you're away. You can resume from the instructions screen."
        confirmLabel="Leave test"
        tone="danger"
        onConfirm={() => router.push('/student-desk/mock-tests')}
        onCancel={() => setShowExitModal(false)}
      />
    </div>
  );
}

function PaletteLegend({ color, label }) {
  return (
    <div className="flex items-center gap-2">
      <span style={{ width: 12, height: 12, borderRadius: 3, background: color, border: '1px solid var(--color-border)' }} />
      {label}
    </div>
  );
}
