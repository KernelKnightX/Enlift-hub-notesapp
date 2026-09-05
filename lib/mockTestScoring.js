/** UPSC CSE Prelims marking: +2 per correct, −⅔ per wrong, 0 for unattempted. */
export const UPSC_MARKS_CORRECT = 2;
export const UPSC_MARKS_WRONG = -2 / 3;

const SUBJECT_LABELS = {
  general: 'General Studies',
  general_studies: 'General Studies',
  polity: 'Polity',
  history: 'History',
  geography: 'Geography',
  economy: 'Economy',
  environment: 'Environment',
  science: 'Science & Tech',
  current_affairs: 'Current Affairs',
  english: 'English',
  mathematics: 'Mathematics',
  reasoning: 'Reasoning',
};

export function formatSubjectLabel(raw, fallback = 'General Studies') {
  if (!raw) return fallback;
  const key = String(raw).trim().toLowerCase().replace(/\s+/g, '_');
  if (SUBJECT_LABELS[key]) return SUBJECT_LABELS[key];
  const cleaned = String(raw).trim();
  if (!cleaned) return fallback;
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function roundMarks(value) {
  return Math.round(value * 100) / 100;
}

/**
 * Grade a mock attempt with UPSC Prelims marking.
 */
export function computeAttemptStats(test, answers = {}) {
  if (!test?.questions?.length) {
    return {
      attempted: 0,
      unanswered: 0,
      correct: 0,
      wrong: 0,
      total: 0,
      obtainedMarks: 0,
      maxMarks: 0,
      scorePct: 0,
      subjectBreakdown: [],
    };
  }

  let correct = 0;
  let wrong = 0;
  let attempted = 0;
  const subjectMap = {};

  for (const q of test.questions) {
    const subject = formatSubjectLabel(q.subject, formatSubjectLabel(test.subject));
    if (!subjectMap[subject]) {
      subjectMap[subject] = { subject, correct: 0, wrong: 0, unanswered: 0, total: 0 };
    }
    subjectMap[subject].total += 1;

    const chosen = answers[q.id];
    if (chosen === undefined) {
      subjectMap[subject].unanswered += 1;
      continue;
    }

    attempted += 1;
    if (chosen === q.correctAnswer) {
      correct += 1;
      subjectMap[subject].correct += 1;
    } else {
      wrong += 1;
      subjectMap[subject].wrong += 1;
    }
  }

  const total = test.questions.length;
  const unanswered = total - attempted;
  const obtainedMarks = roundMarks(
    correct * UPSC_MARKS_CORRECT + wrong * UPSC_MARKS_WRONG,
  );
  const maxMarks = total * UPSC_MARKS_CORRECT;
  const scorePct = maxMarks > 0 ? Math.round((obtainedMarks / maxMarks) * 100) : 0;

  const subjectBreakdown = Object.values(subjectMap)
    .map((row) => ({
      ...row,
      obtainedMarks: roundMarks(
        row.correct * UPSC_MARKS_CORRECT + row.wrong * UPSC_MARKS_WRONG,
      ),
      maxMarks: row.total * UPSC_MARKS_CORRECT,
      accuracyPct: row.total
        ? Math.round(((row.correct / row.total) * 100))
        : 0,
    }))
    .sort((a, b) => b.total - a.total);

  return {
    attempted,
    unanswered,
    correct,
    wrong,
    total,
    obtainedMarks,
    maxMarks,
    scorePct,
    subjectBreakdown,
  };
}

export function formatDuration(seconds) {
  const safe = Math.max(0, Number(seconds) || 0);
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function formatMarks(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '0';
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, '');
}

export function normalizeTest(raw, fallbackTitle) {
  const s = (v, f = '') => (typeof v === 'string' || typeof v === 'number' ? v : f);
  const n = (v, f = 0) => (Number.isFinite(Number(v)) ? Number(v) : f);

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

  const maxMarks = questions.length * UPSC_MARKS_CORRECT;

  return {
    id: s(raw?.id, 'unknown'),
    title: s(raw?.title, s(raw?.name, fallbackTitle || 'Mock Test')),
    subject: formatSubjectLabel(raw?.subject ?? raw?.subj),
    duration: n(raw?.duration ?? raw?.time, 30),
    totalMarks: n(raw?.marks ?? raw?.totalMarks ?? raw?.mks, maxMarks),
    maxMarks,
    isPremium: !!(raw?.isPremium || raw?.premium),
    questions,
  };
}
