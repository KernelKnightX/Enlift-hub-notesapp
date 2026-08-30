// pages/student-desk/mock-tests/take/[id].jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/firebase/config';
import { recordMockAttempt, bumpMockAttemptCount } from '@/lib/officeAnalytics';
import { processMockTestResults, bumpMockStats } from '@/lib/weaknessMastery';
import {
  ArrowLeft, Clock, Flag, ChevronLeft, ChevronRight, CheckCircle2, XCircle,
  ClipboardCheck, Loader2, RotateCcw, Home, Trophy, Circle
} from 'lucide-react';

// Sample mock so users without published tests can still try the flow
const DEMO_TEST = {
  id: 'demo',
  title: 'Prelims Practice — GS I (Demo)',
  subject: 'General Studies I',
  duration: 30,
  questions: [
    {
      id: 'q1',
      question: 'Which Article of the Indian Constitution guarantees the Right to Constitutional Remedies?',
      options: ['Article 19', 'Article 21', 'Article 32', 'Article 44'],
      correctAnswer: 2,
      explanation: 'Article 32 gives citizens the right to move the Supreme Court for enforcement of Fundamental Rights. Dr. B. R. Ambedkar called it the "heart and soul" of the Constitution.',
      subject: 'polity',
      topic: 'Fundamental Rights',
    },
    {
      id: 'q2',
      question: 'The Tropic of Cancer does NOT pass through which of the following Indian states?',
      options: ['Rajasthan', 'Odisha', 'Chhattisgarh', 'Tripura'],
      correctAnswer: 1,
      explanation: 'The Tropic of Cancer passes through 8 Indian states — Gujarat, Rajasthan, Madhya Pradesh, Chhattisgarh, Jharkhand, West Bengal, Tripura and Mizoram. Odisha is NOT one of them.',
      subject: 'geography',
      topic: 'Indian Geography',
    },
    {
      id: 'q3',
      question: 'Which of the following was the immediate cause of the Revolt of 1857?',
      options: ['Doctrine of Lapse', 'Introduction of the Enfield rifle', 'Annexation of Awadh', 'Economic policies of Dalhousie'],
      correctAnswer: 1,
      explanation: 'The greased cartridges of the new Enfield rifle, rumoured to be laced with cow and pig fat, sparked the mutiny at Meerut in May 1857.',
      subject: 'history',
      topic: 'Modern India',
    },
    {
      id: 'q4',
      question: 'Repo rate is a monetary policy tool used by which of the following?',
      options: ['SEBI', 'Ministry of Finance', 'RBI', 'NITI Aayog'],
      correctAnswer: 2,
      explanation: 'Repo rate is the rate at which RBI lends short-term money to commercial banks; it is a key MPC tool for inflation control.',
      subject: 'economy',
      topic: 'Monetary Policy',
    },
    {
      id: 'q5',
      question: 'The Ramsar Convention deals primarily with:',
      options: ['Migratory birds', 'Wetlands', 'Wildlife trade', 'Ocean acidification'],
      correctAnswer: 1,
      explanation: 'The Ramsar Convention on Wetlands of International Importance was signed in Ramsar, Iran (1971) and is the intergovernmental treaty focused on wetland conservation.',
      subject: 'environment',
      topic: 'Conventions',
    },
  ],
};

const s = (v, f = '') => (typeof v === 'string' || typeof v === 'number' ? v : f);
const n = (v, f = 0) => (Number.isFinite(Number(v)) ? Number(v) : f);

function normalizeTest(raw, fallbackTitle) {
  const questions = Array.isArray(raw?.questions)
    ? raw.questions.map((q, i) => ({
        id: s(q.id, `q${i + 1}`),
        question: s(q.question, s(q.text, `Question ${i + 1}`)),
        options: Array.isArray(q.options) ? q.options.map((o) => s(o, '')) : [],
        correctAnswer: n(q.correctAnswer ?? q.correct ?? q.answer, 0),
        explanation: s(q.explanation, s(q.solution, '')),
        subject: s(q.subject, ''),
        topic: s(q.topic, s(q.subTopic, '')),
      }))
    : [];
  return {
    id: s(raw?.id, 'unknown'),
    title: s(raw?.title, s(raw?.name, fallbackTitle || 'Mock Test')),
    subject: s(raw?.subject, s(raw?.subj, 'General Studies')),
    duration: n(raw?.duration ?? raw?.time, 30),
    totalMarks: n(raw?.marks ?? raw?.totalMarks ?? raw?.mks, questions.length),
    isPremium: !!(raw?.isPremium || raw?.premium),
    questions,
  };
}

export default function TakeTest() {
  const router = useRouter();
  const { id } = router.query;

  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState({});
  const [current, setCurrent] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const startedRef = useRef(false);
  const attemptSavedRef = useRef(false);

  // Load test doc
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        if (id === 'demo') {
          if (!cancelled) { setTest(normalizeTest(DEMO_TEST)); setLoading(false); }
          return;
        }
        const snap = await getDoc(doc(db, 'mockTests', String(id)));
        if (!snap.exists()) {
          if (!cancelled) { setTest(normalizeTest(DEMO_TEST, 'Demo Test')); setError('Test not found — showing demo test instead.'); setLoading(false); }
          return;
        }
        const t = normalizeTest({ id: snap.id, ...snap.data() });
        if (t.questions.length === 0) {
          if (!cancelled) { setTest(normalizeTest(DEMO_TEST, 'Demo Test')); setError('This test has no questions yet — showing demo test.'); setLoading(false); }
          return;
        }
        if (!cancelled) { setTest(t); setLoading(false); }
      } catch (e) {
        if (!cancelled) { setTest(normalizeTest(DEMO_TEST, 'Demo Test')); setError('Could not load test — showing demo.'); setLoading(false); }
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  // Timer
  useEffect(() => {
    if (!test || submitted) return;
    if (!startedRef.current) {
      setTimeLeft(test.duration * 60);
      startedRef.current = true;
    }
    const iv = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(iv); setSubmitted(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [test, submitted]);

  const stats = useMemo(() => {
    if (!test) return { attempted: 0, unanswered: 0, correct: 0, wrong: 0, score: 0 };
    let correct = 0, wrong = 0, attempted = 0;
    for (const q of test.questions) {
      const a = answers[q.id];
      if (a === undefined) continue;
      attempted++;
      if (a === q.correctAnswer) correct++; else wrong++;
    }
    return {
      attempted, unanswered: test.questions.length - attempted, correct, wrong,
      score: Math.round((correct / test.questions.length) * 100),
    };
  }, [test, answers]);

  // Record the attempt to Firestore once, when the test is submitted
  useEffect(() => {
    if (!submitted || !test || attemptSavedRef.current) return;
    attemptSavedRef.current = true;

    // Don't log demo runs or tests we couldn't resolve to a real doc
    if (!auth.currentUser || test.id === 'demo' || test.id === 'unknown') return;

    const obtainedMarks = Math.round((stats.correct / test.questions.length) * test.totalMarks);
    const scorePct = test.questions.length
      ? Math.round((stats.correct / test.questions.length) * 100)
      : 0;
    const uid = auth.currentUser.uid;

    (async () => {
      let userName = auth.currentUser.displayName || '';
      try {
        const profile = await getDoc(doc(db, 'users', uid));
        if (profile.exists()) {
          const data = profile.data();
          userName = data.fullName || data.name || data.displayName || userName;
        }
      } catch {}

      await addDoc(collection(db, 'users', uid, 'mockTestAttempts'), {
        testId: test.id,
        obtainedMarks,
        totalMarks: test.totalMarks,
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
        totalMarks: test.totalMarks,
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
  }, [submitted, test, stats.correct, answers]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
        <Loader2 className="animate-spin" size={28} style={{ color: 'var(--color-primary)' }} />
      </div>
    );
  }
  if (!test) return null;

  const q = test.questions[current];
  const total = test.questions.length;
  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const ss = String(timeLeft % 60).padStart(2, '0');

  // ── SCORE SCREEN ──
  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }} data-testid="test-result">
        <div className="grad-ink-glow" style={{ color: '#fff' }}>
          <div className="max-w-[900px] mx-auto px-6 md:px-10 py-10">
            <Link href="/student-desk/mock-tests" className="text-[13px] flex items-center gap-1.5" style={{ color: '#B7BFB8' }}>
              <ArrowLeft size={14} /> Back to mocks
            </Link>
            <div className="mt-8 flex items-center gap-3">
              <Trophy size={22} strokeWidth={1.6} style={{ color: '#F59E0B' }} />
              <span className="eyebrow" style={{ color: '#B7BFB8' }}>Result · {test.subject}</span>
            </div>
            <h1 className="mt-4 hero-display" style={{ fontSize: 'clamp(32px, 4vw, 52px)', letterSpacing: '-0.035em', color: '#fff' }}>
              You scored <span className="grad-text">{stats.score}%</span>
            </h1>
            <p className="mt-3 text-[15px]" style={{ color: '#B7BFB8' }}>
              {stats.correct} correct · {stats.wrong} wrong · {stats.unanswered} unanswered · {total} total
            </p>
          </div>
        </div>

        <div className="max-w-[900px] mx-auto px-6 md:px-10 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <StatTile label="Score" value={stats.score + '%'} tone="primary" />
            <StatTile label="Correct" value={stats.correct} tone="green" />
            <StatTile label="Wrong" value={stats.wrong} tone="pink" />
            <StatTile label="Skipped" value={stats.unanswered} tone="amber" />
          </div>

          <div className="eyebrow mb-3">Review your answers</div>
          <div className="flex flex-col gap-3" data-testid="test-review">
            {test.questions.map((qq, i) => {
              const a = answers[qq.id];
              const correct = a === qq.correctAnswer;
              const chosen = a !== undefined;
              return (
                <div key={qq.id} className="card p-5" data-testid={`review-q-${i}`}>
                  <div className="flex items-start gap-3">
                    {!chosen ? <Circle size={18} strokeWidth={1.5} style={{ color:'var(--color-ink-faint)', marginTop:2 }} />
                     : correct ? <CheckCircle2 size={18} strokeWidth={1.6} style={{ color:'var(--color-success)', marginTop:2 }} />
                     :           <XCircle size={18} strokeWidth={1.6} style={{ color:'var(--color-danger)', marginTop:2 }} />}
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-mono mb-1" style={{ color:'var(--color-ink-faint)' }}>Q{i+1} / {total}</div>
                      <div className="text-[15px] font-semibold" style={{ letterSpacing:'-0.005em' }}>{qq.question}</div>
                      <ul className="mt-3 flex flex-col gap-1.5">
                        {qq.options.map((op, k) => {
                          const isCorrect = k === qq.correctAnswer;
                          const isChosen = a === k;
                          return (
                            <li key={k} className="text-[13.5px] px-3 py-2 rounded-lg" style={{
                              background: isCorrect ? 'var(--cat-green-t)' : isChosen ? 'var(--cat-pink-t)' : 'transparent',
                              border: '1px solid ' + (isCorrect ? 'rgba(5,150,105,0.35)' : isChosen ? 'rgba(236,72,153,0.35)' : 'var(--color-border)'),
                              color: isCorrect ? 'var(--cat-green)' : isChosen ? 'var(--cat-pink)' : 'var(--color-ink)',
                              fontWeight: (isCorrect || isChosen) ? 600 : 500,
                            }}>
                              <span className="font-mono mr-2">{'ABCD'[k]}.</span>{op}
                            </li>
                          );
                        })}
                      </ul>
                      {qq.explanation && (
                        <div className="mt-3 text-[13px] p-3 rounded-lg" style={{ background:'var(--color-primary-tint)', color:'var(--color-primary)' }}>
                          <b>Solution.</b> {qq.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {stats.wrong > 0 && (
              <Link href="/student-desk/mistake-notebook" className="btn btn-accent" data-testid="view-mistakes">
                <XCircle size={14} /> Review {stats.wrong} mistake{stats.wrong === 1 ? '' : 's'}
              </Link>
            )}
            <button onClick={() => { setAnswers({}); setCurrent(0); setSubmitted(false); startedRef.current = false; attemptSavedRef.current = false; }}
                    className="btn btn-ghost" data-testid="retry-test">
              <RotateCcw size={14} /> Retry test
            </button>
            <Link href="/student-desk/mock-tests" className="btn btn-primary" data-testid="back-to-mocks">
              <Home size={14} /> Back to mocks
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── QUESTION SCREEN ──
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      {/* Header */}
      <div className="hairline-b sticky top-0 z-30" style={{ background: 'rgba(250,250,247,0.9)', backdropFilter: 'blur(14px)' }}>
        <div className="max-w-[1240px] mx-auto px-4 md:px-8 py-3.5 flex items-center gap-3">
          <Link href="/student-desk/mock-tests" className="flex items-center gap-1.5 text-[13px]" style={{ color: 'var(--color-ink-muted)' }}>
            <ArrowLeft size={14} /> Exit
          </Link>
          <div className="flex-1 text-center min-w-0">
            <div className="text-[10.5px] font-mono" style={{ color: 'var(--color-ink-faint)', letterSpacing: '0.14em' }}>{test.subject.toUpperCase()}</div>
            <div className="font-sans text-[15px] truncate" style={{ fontWeight: 700, letterSpacing: '-0.01em' }}>{test.title}</div>
          </div>
          <div className="chip chip-primary flex items-center gap-1.5" data-testid="timer">
            <Clock size={12} /> {mm}:{ss}
          </div>
          <button onClick={() => setSubmitted(true)} className="btn btn-primary" data-testid="submit-test"
                  style={{ padding: '0.55rem 1.1rem', fontSize: 13 }}>
            Submit
          </button>
        </div>
      </div>

      <div className="max-w-[1240px] mx-auto px-4 md:px-8 py-8 grid grid-cols-12 gap-4 md:gap-6">
        {/* Question card */}
        <div className="col-span-12 lg:col-span-8">
          {error && <div className="chip chip-amber mb-4">{error}</div>}
          <div className="card p-6 md:p-8" data-testid="question-card">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-mono" style={{ color: 'var(--color-ink-faint)', letterSpacing: '0.14em' }}>
                QUESTION {current + 1} · OF {total}
              </span>
              <button onClick={() => setFlagged(f => ({ ...f, [q.id]: !f[q.id] }))}
                      className="text-[12px] flex items-center gap-1"
                      style={{ color: flagged[q.id] ? 'var(--color-accent)' : 'var(--color-ink-muted)' }}
                      data-testid="flag-question">
                <Flag size={13} strokeWidth={1.6} fill={flagged[q.id] ? 'currentColor' : 'none'} />
                {flagged[q.id] ? 'Flagged' : 'Flag for review'}
              </button>
            </div>
            <div className="hero-display" style={{ fontSize: 22, lineHeight: 1.4, letterSpacing: '-0.02em' }}>
              {q.question}
            </div>
            <div className="mt-6 flex flex-col gap-2.5" data-testid="options">
              {q.options.map((op, k) => {
                const chosen = answers[q.id] === k;
                return (
                  <button key={k} onClick={() => setAnswers(a => ({ ...a, [q.id]: k }))}
                          data-testid={`option-${k}`}
                          className="text-left px-4 py-3.5 rounded-xl flex items-center gap-3"
                          style={{
                            border: `1.5px solid ${chosen ? 'var(--color-primary)' : 'var(--color-border)'}`,
                            background: chosen ? 'var(--color-primary-tint)' : 'var(--color-surface)',
                            transition: 'background .15s, border-color .15s',
                          }}>
                    <span style={{
                      width: 26, height: 26, borderRadius: 8,
                      background: chosen ? 'var(--color-primary)' : 'var(--color-surface-alt)',
                      color: chosen ? '#fff' : 'var(--color-ink-muted)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, flexShrink: 0,
                    }}>{'ABCD'[k]}</span>
                    <span className="flex-1 text-[14.5px]" style={{ color: 'var(--color-ink)', fontWeight: chosen ? 600 : 500 }}>{op}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex items-center justify-between">
              <button onClick={() => setCurrent(c => Math.max(0, c - 1))} className="btn btn-ghost" disabled={current === 0}
                      data-testid="prev-question" style={{ opacity: current === 0 ? 0.5 : 1 }}>
                <ChevronLeft size={14} /> Previous
              </button>
              {current < total - 1 ? (
                <button onClick={() => setCurrent(c => Math.min(total - 1, c + 1))}
                        className="btn btn-primary" data-testid="next-question">
                  Next <ChevronRight size={14} />
                </button>
              ) : (
                <button onClick={() => setSubmitted(true)} className="btn btn-accent" data-testid="finish-test">
                  Finish & submit <CheckCircle2 size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Palette */}
        <div className="col-span-12 lg:col-span-4">
          <div className="card p-5">
            <div className="eyebrow mb-3">Question palette</div>
            <div className="grid grid-cols-6 gap-2" data-testid="palette">
              {test.questions.map((qq, i) => {
                const answered = answers[qq.id] !== undefined;
                const isFlag = flagged[qq.id];
                const isCurrent = i === current;
                let bg = 'var(--color-surface-alt)', color = 'var(--color-ink)', border = 'var(--color-border)';
                if (answered) { bg = 'var(--cat-green-t)'; color = 'var(--cat-green)'; border = 'rgba(5,150,105,0.35)'; }
                if (isFlag)   { bg = 'var(--cat-amber-t)'; color = '#B45309'; border = 'rgba(245,158,11,0.4)'; }
                if (isCurrent){ bg = 'var(--color-primary)'; color = '#fff'; border = 'var(--color-primary)'; }
                return (
                  <button key={qq.id} onClick={() => setCurrent(i)}
                          data-testid={`palette-${i}`}
                          style={{
                            aspectRatio: '1', borderRadius: 10,
                            background: bg, color, border: `1px solid ${border}`,
                            fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700,
                            transition: 'background .15s ease',
                          }}>
                    {i + 1}
                  </button>
                );
              })}
            </div>
            <div className="hairline-t mt-4 pt-4 flex flex-col gap-2 text-[11.5px]" style={{ color: 'var(--color-ink-muted)' }}>
              <LegendDot color="var(--cat-green-t)" label="Answered" />
              <LegendDot color="var(--cat-amber-t)" label="Flagged" />
              <LegendDot color="var(--color-primary)" label="Current" />
              <LegendDot color="var(--color-surface-alt)" label="Not visited" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LegendDot({ color, label }) {
  return (
    <div className="flex items-center gap-2">
      <span style={{ width: 12, height: 12, borderRadius: 3, background: color, border: '1px solid var(--color-border)' }} />
      {label}
    </div>
  );
}

function StatTile({ label, value, tone }) {
  const map = {
    primary:{ bg:'var(--color-primary-tint)', fg:'var(--color-primary)' },
    green:  { bg:'var(--cat-green-t)', fg:'var(--cat-green)' },
    pink:   { bg:'var(--cat-pink-t)', fg:'var(--cat-pink)' },
    amber:  { bg:'var(--cat-amber-t)', fg:'#B45309' },
  }[tone] || {};
  return (
    <div className="card p-4">
      <div style={{
        width: 30, height: 30, borderRadius: 8,
        background: map.bg, color: map.fg,
        display:'flex', alignItems:'center', justifyContent:'center', marginBottom: 8,
      }}>
        <ClipboardCheck size={15} strokeWidth={1.6} />
      </div>
      <div className="display-num text-[26px]" style={{ color: map.fg }}>{value}</div>
      <div className="text-[11.5px] mt-0.5" style={{ color: 'var(--color-ink-muted)' }}>{label}</div>
    </div>
  );
}