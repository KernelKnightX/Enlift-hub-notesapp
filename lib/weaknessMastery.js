/**
 * Weakness-to-Mastery — shared Firestore logic for mistakes, topicStats, and studyPlan.
 *
 * Collections (all under users/{userId}):
 *   mistakes/{mistakeId}
 *   topicStats/{subjectTopicId}
 *   studyPlan/{date}          — ISO date key, e.g. "2026-08-25"
 *   studySettings/settings    — daily hours, exam date, syllabus progress
 *
 * Triggers:
 *   - processMockTestResults()  — after mock submit (wrong answers → mistakes + topicStats)
 *   - recordMistakeReview()     — spaced repetition advance / reset
 *   - generateDailyStudyPlan()  — nightly or on-demand replan
 */

import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '@/firebase/config';

/** Day offsets for spaced mistake revision (reviewStage 0 → 4). */
export const REVIEW_INTERVALS_DAYS = [1, 3, 7, 14, 30];

/** UPSC paper weight hints for syllabus allocation. */
export const SUBJECT_WEIGHTS = {
  Polity: 15,
  History: 15,
  Geography: 12,
  Economy: 12,
  Environment: 10,
  'Science & Tech': 8,
  Ethics: 8,
  Art: 5,
  Culture: 5,
};

export const DEFAULT_SUBJECTS = Object.keys(SUBJECT_WEIGHTS);

const WEAK_ACCURACY_THRESHOLD = 50;

export function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function buildTopicId(subject, topic) {
  return `${slugify(subject)}_${slugify(topic)}`;
}

export function formatAnswerIndex(index, options = []) {
  if (index === undefined || index === null || Number.isNaN(Number(index))) return 'Not answered';
  const letter = 'ABCD'[Number(index)] || '?';
  const text = options[Number(index)];
  return text ? `${letter}. ${text}` : `Option ${letter}`;
}

export function toDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function capitalizeSubject(raw) {
  const s = String(raw || 'General Studies').trim();
  if (!s) return 'General Studies';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function deriveTopic(question, testSubject) {
  const explicit = question.topic || question.subTopic || question.theme;
  if (explicit) return String(explicit).trim();
  const subj = question.subject || testSubject;
  if (subj && subj !== testSubject) return capitalizeSubject(subj);
  return 'General';
}

function mistakesCol(userId) {
  return collection(db, 'users', userId, 'mistakes');
}

function topicStatsCol(userId) {
  return collection(db, 'users', userId, 'topicStats');
}

function studyPlanDoc(userId, dateKey) {
  return doc(db, 'users', userId, 'studyPlan', dateKey);
}

function studySettingsDoc(userId) {
  return doc(db, 'users', userId, 'studySettings', 'settings');
}

/** Infer subject/topic from question + test metadata. */
export function resolveQuestionMeta(question, test) {
  const subject = capitalizeSubject(
    question.subject || test?.subject || 'General Studies'
  );
  const topic = deriveTopic(question, test?.subject);
  const topicId = buildTopicId(subject, topic);
  return { subject, topic, topicId };
}

/**
 * After mock grading: create mistake docs for wrong answers and bump topicStats.
 */
export async function processMockTestResults({
  userId,
  test,
  answers,
  sourceTestId,
}) {
  if (!userId || !test?.questions?.length) return { mistakesCreated: 0 };

  let mistakesCreated = 0;

  for (const question of test.questions) {
    const studentIndex = answers[question.id];
    const attempted = studentIndex !== undefined;
    const isCorrect = attempted && studentIndex === question.correctAnswer;
    const { subject, topic, topicId } = resolveQuestionMeta(question, test);

    await bumpTopicStats(userId, {
      subject,
      topic,
      topicId,
      correct: isCorrect,
      attempted,
    });

    if (!attempted || isCorrect) continue;

    const nextReview = Timestamp.fromDate(addDays(new Date(), REVIEW_INTERVALS_DAYS[0]));

    await addDoc(mistakesCol(userId), {
      question: question.question,
      studentAnswer: formatAnswerIndex(studentIndex, question.options),
      correctAnswer: formatAnswerIndex(question.correctAnswer, question.options),
      explanation: question.explanation || '',
      subject,
      topic,
      topicId,
      sourceTestId: sourceTestId || test.id || '',
      status: 'active',
      reviewStage: 0,
      nextReviewDate: nextReview,
      createdAt: serverTimestamp(),
      lastReviewedAt: null,
    });
    mistakesCreated += 1;
  }

  await bumpWeakTopicSummary(userId);
  return { mistakesCreated };
}

async function bumpTopicStats(userId, { subject, topic, topicId, correct, attempted }) {
  if (!attempted) return;

  const ref = doc(db, 'users', userId, 'topicStats', topicId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    const correctAttempts = correct ? 1 : 0;
    await setDoc(ref, {
      subject,
      topic,
      topicId,
      totalAttempts: 1,
      correctAttempts,
      accuracyPct: correct ? 100 : 0,
      lastAttemptedAt: serverTimestamp(),
    });
    return;
  }

  const data = snap.data();
  const totalAttempts = (data.totalAttempts || 0) + 1;
  const correctAttempts = (data.correctAttempts || 0) + (correct ? 1 : 0);
  const accuracyPct = Math.round((correctAttempts / totalAttempts) * 100);

  await updateDoc(ref, {
    totalAttempts,
    correctAttempts,
    accuracyPct,
    lastAttemptedAt: serverTimestamp(),
  });
}

async function bumpWeakTopicSummary(userId) {
  try {
    const weakSnap = await getDocs(
      query(
        topicStatsCol(userId),
        where('accuracyPct', '<', WEAK_ACCURACY_THRESHOLD),
        limit(100)
      )
    );
    const statsRef = doc(db, 'users', userId, 'stats', 'summary');
    await setDoc(
      statsRef,
      {
        weakTopicCount: weakSnap.size,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('[weaknessMastery] bumpWeakTopicSummary:', err?.message || err);
  }
}

/** Mark mistake mastered manually. */
export async function markMistakeMastered(userId, mistakeId) {
  await updateDoc(doc(db, 'users', userId, 'mistakes', mistakeId), {
    status: 'mastered',
    lastReviewedAt: serverTimestamp(),
  });
  await bumpWeakTopicSummary(userId);
}

/**
 * Spaced revision after student reviews a mistake.
 * gotItRight=true → advance stage; after stage 4 success → mastered.
 * gotItRight=false → reset to stage 0, +1 day.
 */
export async function recordMistakeReview(userId, mistakeId, gotItRight) {
  const ref = doc(db, 'users', userId, 'mistakes', mistakeId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const data = snap.data();
  if (data.status === 'mastered') return;

  if (!gotItRight) {
    const nextReview = Timestamp.fromDate(addDays(new Date(), REVIEW_INTERVALS_DAYS[0]));
    await updateDoc(ref, {
      reviewStage: 0,
      nextReviewDate: nextReview,
      lastReviewedAt: serverTimestamp(),
    });
    return;
  }

  const currentStage = Number(data.reviewStage) || 0;
  const nextStage = currentStage + 1;

  if (nextStage >= REVIEW_INTERVALS_DAYS.length) {
    await updateDoc(ref, {
      status: 'mastered',
      reviewStage: REVIEW_INTERVALS_DAYS.length - 1,
      lastReviewedAt: serverTimestamp(),
    });
    await bumpWeakTopicSummary(userId);
    return;
  }

  const days = REVIEW_INTERVALS_DAYS[nextStage];
  const nextReview = Timestamp.fromDate(addDays(new Date(), days));
  await updateDoc(ref, {
    reviewStage: nextStage,
    nextReviewDate: nextReview,
    lastReviewedAt: serverTimestamp(),
  });
}

export async function getStudySettings(userId) {
  const snap = await getDoc(studySettingsDoc(userId));
  if (!snap.exists()) {
    return {
      dailyStudyHours: 4,
      examDate: '2027-06-06',
      syllabusProgress: {
        Polity: 55,
        History: 45,
        Geography: 50,
        Economy: 40,
        Environment: 35,
        'Science & Tech': 30,
        Ethics: 25,
        Art: 20,
        Culture: 20,
      },
      manualWeakTopics: [],
    };
  }
  return { ...snap.data() };
}

export async function saveStudySettings(userId, settings) {
  await setDoc(
    studySettingsDoc(userId),
    { ...settings, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

/** Add a weak topic to tomorrow's plan manual queue. */
export async function addTopicToPlanQueue(userId, { subject, topic, topicId }) {
  const settings = await getStudySettings(userId);
  const manual = settings.manualWeakTopics || [];
  const entry = { subject, topic, topicId: topicId || buildTopicId(subject, topic) };
  if (manual.some((m) => m.topicId === entry.topicId)) return;

  await saveStudySettings(userId, {
    manualWeakTopics: [...manual, entry],
  });
}

function buildWeightedPool(weakTopics, manualTopics, syllabusProgress) {
  const pool = [];
  const seen = new Set();

  const push = (item) => {
    const id = item.topicId || buildTopicId(item.subject, item.topic);
    if (seen.has(id)) return;
    seen.add(id);
    pool.push({ ...item, topicId: id, weight: item.weight || 1.5 });
  };

  for (const t of weakTopics) {
    push({
      subject: t.subject,
      topic: t.topic,
      topicId: t.topicId || buildTopicId(t.subject, t.topic),
      type: 'revision',
      weight: 1.5,
      accuracyPct: t.accuracyPct,
    });
  }

  for (const t of manualTopics || []) {
    push({
      subject: t.subject,
      topic: t.topic,
      topicId: t.topicId,
      type: 'revision',
      weight: 1.5,
    });
  }

  for (const subject of DEFAULT_SUBJECTS) {
    const remainingPct = Number(syllabusProgress?.[subject] ?? 50);
    if (remainingPct >= 95) continue;
    const uncovered = 100 - remainingPct;
    const weight = (uncovered / 100) * (SUBJECT_WEIGHTS[subject] || 5);
    push({
      subject,
      topic: 'Syllabus coverage',
      type: 'new',
      weight,
    });
  }

  return pool;
}

/**
 * Rule-based daily plan generator (not ML).
 * Priority: due mistake-reviews → weak topics (1.5×) → remaining syllabus by weight.
 */
export function buildPlanTasks({
  dailyMinutes,
  dueMistakeCount,
  weakTopics,
  manualWeakTopics,
  syllabusProgress,
  rolledForward = [],
}) {
  const tasks = [];
  let remaining = dailyMinutes;

  const mistakeMinutes = dueMistakeCount
    ? Math.min(Math.round(dailyMinutes * 0.3), dueMistakeCount * 12, remaining)
    : 0;

  if (mistakeMinutes > 0) {
    tasks.push({
      subject: 'Revision',
      topic: `${dueMistakeCount} mistake${dueMistakeCount === 1 ? '' : 's'} due`,
      type: 'mistake-review',
      estMinutes: mistakeMinutes,
      done: false,
    });
    remaining -= mistakeMinutes;
  }

  for (const task of rolledForward) {
    if (!task.done && remaining > 0) {
      const mins = Math.min(task.estMinutes || 30, remaining);
      tasks.push({ ...task, estMinutes: mins, done: false });
      remaining -= mins;
    }
  }

  const pool = buildWeightedPool(weakTopics, manualWeakTopics, syllabusProgress);
  const totalWeight = pool.reduce((sum, item) => sum + item.weight, 0) || 1;

  for (const item of pool) {
    if (remaining < 15) break;
    const minutes = Math.max(
      15,
      Math.min(Math.round(remaining * (item.weight / totalWeight)), remaining)
    );
    tasks.push({
      subject: item.subject,
      topic: item.topic,
      type: item.type || 'revision',
      estMinutes: minutes,
      done: false,
      topicId: item.topicId,
    });
    remaining -= minutes;
  }

  return tasks;
}

export async function generateDailyStudyPlan(userId, dateKey = toDateKey()) {
  const settings = await getStudySettings(userId);
  const dailyMinutes = Math.round(Number(settings.dailyStudyHours || 4) * 60);

  const now = Timestamp.fromDate(new Date());
  const dueSnap = await getDocs(
    query(
      mistakesCol(userId),
      where('status', '==', 'active'),
      where('nextReviewDate', '<=', now),
      limit(50)
    )
  );

  const topicSnap = await getDocs(
    query(
      topicStatsCol(userId),
      where('accuracyPct', '<', WEAK_ACCURACY_THRESHOLD),
      orderBy('accuracyPct', 'asc'),
      limit(20)
    )
  );

  const weakTopics = topicSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  const yesterdayKey = toDateKey(addDays(new Date(dateKey), -1));
  const yesterdaySnap = await getDoc(studyPlanDoc(userId, yesterdayKey));
  const rolledForward = yesterdaySnap.exists()
    ? (yesterdaySnap.data().tasks || []).filter((t) => !t.done)
    : [];

  const syllabusRemainingPct = {};
  for (const subject of DEFAULT_SUBJECTS) {
    const done = Number(settings.syllabusProgress?.[subject] ?? 0);
    syllabusRemainingPct[subject] = Math.max(0, 100 - done);
  }

  const tasks = buildPlanTasks({
    dailyMinutes,
    dueMistakeCount: dueSnap.size,
    weakTopics,
    manualWeakTopics: settings.manualWeakTopics || [],
    syllabusProgress: settings.syllabusProgress || {},
    rolledForward,
  });

  const generatedFrom = {
    syllabusRemainingPct,
    weakTopics: weakTopics.map((t) => t.topicId || t.id),
    hoursAvailable: Number(settings.dailyStudyHours || 4),
    dueMistakes: dueSnap.size,
  };

  await setDoc(
    studyPlanDoc(userId, dateKey),
    {
      date: dateKey,
      tasks,
      generatedFrom,
      generatedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return { dateKey, tasks, generatedFrom };
}

export async function toggleStudyPlanTask(userId, dateKey, taskIndex, done) {
  const ref = studyPlanDoc(userId, dateKey);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const tasks = [...(snap.data().tasks || [])];
  if (!tasks[taskIndex]) return;
  tasks[taskIndex] = { ...tasks[taskIndex], done };

  await updateDoc(ref, {
    tasks,
    updatedAt: serverTimestamp(),
  });
}

export async function bumpMockStats(userId, scorePct) {
  if (!userId) return;
  try {
    const statsRef = doc(db, 'users', userId, 'stats', 'summary');
    await setDoc(
      statsRef,
      {
        mocksAttempted: increment(1),
        mockAvgScore: scorePct,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('[weaknessMastery] bumpMockStats:', err?.message || err);
  }
}
