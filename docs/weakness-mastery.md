# Weakness-to-Mastery System

Connected features sharing Firestore data under `users/{userId}/`.

## Data model

| Collection | Doc ID | Purpose |
|------------|--------|---------|
| `mistakes` | auto | Wrong answers from mock tests + spaced revision state |
| `topicStats` | `{subject}_{topic}` slug | Per-topic accuracy aggregates |
| `studyPlan` | ISO date `YYYY-MM-DD` | Generated daily task list |
| `studySettings` | `settings` | Daily hours, exam date, syllabus %, manual weak-topic queue |

Core library: `lib/weaknessMastery.js`

---

## Feature 1 — Mistake Notebook

**Page:** `/student-desk/mistake-notebook`

**Writes (trigger):** `processMockTestResults()` after mock submit in `pages/student-desk/mock-tests/take/[id].js`

- One `mistakes` doc per wrong answer
- Fields: question, student/correct answers, explanation, subject, topic, `sourceTestId`, `status`, `reviewStage`, `nextReviewDate`

**Reads:** `hooks/student/useMistakes.js` — live listener, grouped in UI by subject → topic

**Manual actions:** `markMistakeMastered()` sets `status: 'mastered'`

---

## Feature 2 — Spaced Mistake Revision

**Page:** `/student-desk/mistake-notebook/review`

**On creation:** `reviewStage: 0`, `nextReviewDate = createdAt + 1 day` (interval index 0 → 1 day)

**Intervals:** `[1, 3, 7, 14, 30]` days — `REVIEW_INTERVALS_DAYS` in `lib/weaknessMastery.js`

**Review flow:** `recordMistakeReview(userId, mistakeId, gotItRight)`

- `gotItRight = false` → reset `reviewStage` to 0, next review +1 day
- `gotItRight = true` → advance stage; after final stage success → `status: 'mastered'`

**Due query:** `status == 'active'` AND `nextReviewDate <= now` (client-side also filters in `useMistakes`)

**Dashboard:** `components/student/MistakesDueCard.jsx` — count + quick-review CTA

**Cloud Function (optional):** A daily cron can call the same due-query logic; client queries are sufficient for MVP.

---

## Feature 3 — Weakness Analyzer

**Page:** `/student-desk/analytics`

**Writes (trigger):** `bumpTopicStats()` inside `processMockTestResults()` per attempted question

- Increments `totalAttempts` / `correctAttempts`, recomputes `accuracyPct`

**Reads:** `hooks/student/useTopicStats.js` — sorted by lowest accuracy

**Actions:** “Add to plan” → `addTopicToPlanQueue()` appends topic to `studySettings.manualWeakTopics`

---

## Feature 4 — Personalized Study Planner

**Page:** `/student-desk/planner` (enhanced)

**Generator:** `generateDailyStudyPlan(userId, dateKey)` — rule-based, not ML

**Algorithm (`buildPlanTasks`):**

1. Allocate up to 30% of daily minutes for due mistake-reviews (Feature 2)
2. Roll forward incomplete tasks from yesterday’s `studyPlan`
3. Weight weak topics (`accuracyPct < 50%`) and manual queue at **1.5×**
4. Distribute remaining time across syllabus gaps using `SUBJECT_WEIGHTS` and `syllabusProgress` %

**Replan:** “Replan today” button — missed tasks roll forward; completed tasks are not re-added

**Settings:** `studySettings/settings` — `dailyStudyHours`, `examDate`, `syllabusProgress`, `manualWeakTopics`

**Toggle done:** `toggleStudyPlanTask()` updates `tasks[i].done` on the date doc

Manual tasks remain in top-level `/tasks` (existing planner); generated plan lives in `studyPlan`.

---

## Deploy checklist

**Required** — your live Firebase rules must include the weakness-to-mastery subcollections. If you see `Missing or insufficient permissions` for `useMistakes` / `useTopicStats`, the rules below are not deployed yet.

```bash
firebase deploy --only firestore:rules
```

Optional indexes (if queries fail after rules deploy):

```bash
firebase deploy --only firestore:indexes
```

If index deploy errors on `topicStats` single-field sort, skip it — Firestore auto-indexes single fields. Only `mistakes` (status + nextReviewDate) and `studyPlan` (date range) need composite indexes.

Required rules under `users/{userId}`:

```
match /mistakes/{mistakeId} {
  allow read, create, update, delete: if isOwner(userId);
}
match /topicStats/{topicId} {
  allow read, create, update, delete: if isOwner(userId);
}
match /studyPlan/{dateId} {
  allow read, create, update, delete: if isOwner(userId);
}
match /studySettings/{settingsId} {
  allow read, create, update, delete: if isOwner(userId);
}
```

Also add `topperTips` for the dashboard tip card:

```
match /topperTips/{tipId} {
  allow read: if isAuthenticated();
  allow create, update, delete: if isAdmin();
}
```

You can paste rules in [Firebase Console → Firestore → Rules](https://console.firebase.google.com/) if CLI deploy is unavailable.

---

## Maintenance notes

- Mock questions should include `subject` and `topic` fields (admin mock editor) for accurate topicStats
- `normalizeTest()` in take page preserves `subject` / `topic` on each question
- `weakTopicCount` on `users/{uid}/stats/summary` updates after mistake/topic changes
