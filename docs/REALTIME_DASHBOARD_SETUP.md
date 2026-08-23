# Real-Time Dashboard Setup Guide

## Overview
The dashboard now displays real-time metrics that sync instantly from Firestore. This guide shows you how to structure your Firestore data to enable all real-time features.

## Firestore Structure

### 1. User Stats Document
**Location**: `users/{uid}/stats/summary`

**Document Structure**:
```javascript
{
  // Metrics
  notesCreated: 42,           // Total notes created by user
  notesThisWeek: 6,           // Notes created this week
  mocksAttempted: 18,         // Total mocks attempted
  mockAvgScore: 72,           // Average mock score (%)
  studyStreak: 27,            // Current study streak (days)
  bestStreak: 34,             // Best study streak ever (days)
  
  // Weekly Progress
  weeklyProgressPct: 68,      // Overall weekly progress (0-100)
  weeklyStudyHours: 26.5,     // Study hours completed this week
  weeklyGoal: 40,             // Target study hours per week
  weeklyNotesGoal: 10,        // Target notes per week
  weeklyMocksGoal: 3,         // Target mocks per week
  
  // Timestamps
  updatedAt: Timestamp,       // When metrics were last updated
  lastActivityDate: Timestamp, // When user last studied
}
```

### 2. Planner Tasks Collection
**Location**: `plannerTasks` (global collection)

**Document Structure**:
```javascript
{
  userId: "user_uid",         // Owner of the task
  date: "2026-08-18",         // Date in YYYY-MM-DD format
  title: "Attempt: GS-I mock",// Task name
  text: "Attempt: GS-I mock", // Alternative field name
  done: false,                // Completion status
  duration: "60m",            // Estimated duration
  time: "60m",                // Alternative field name
  createdAt: Timestamp,       // When task was created
  updatedAt: Timestamp,       // Last update time
}
```

### 3. Mock Tests Collection
**Location**: `mockTests` (global collection)

**Document Structure**:
```javascript
{
  title: "GS-I Prelims Mock #12",
  description: "Full length prelims mock",
  status: "published",        // draft, published, archived
  isLive: false,              // Whether exam is currently running
  startsAt: Timestamp,        // When the exam starts
  endsAt: Timestamp,          // When the exam ends
  duration: 120,              // Duration in minutes
  totalQuestions: 100,
  createdBy: "admin_uid",
  createdAt: Timestamp,
}
```

## How to Update Metrics

### Option 1: Firestore Cloud Functions (Recommended)
Automatically update metrics when activities are created/updated.

**Trigger**: When notes, mocks, or planner tasks are created/updated
**Function**: Calculate stats and write to `users/{uid}/stats/summary`

Example triggers:
- User creates a note → Increment `notesCreated`, `notesThisWeek`
- User completes a mock → Increment `mocksAttempted`, update `mockAvgScore`
- User marks a task done → Update `weeklyProgressPct`

### Option 2: Manual Updates (Development)
For testing, manually write data to Firestore:

```bash
# Using Firebase CLI
firebase firestore:delete users/USER_UID/stats/summary
firebase firestore:set users/USER_UID/stats/summary '{
  "notesCreated": 42,
  "notesThisWeek": 6,
  "mocksAttempted": 18,
  "mockAvgScore": 72,
  "studyStreak": 27,
  "bestStreak": 34,
  "weeklyProgressPct": 68,
  "weeklyStudyHours": 26.5,
  "weeklyGoal": 40,
  "weeklyNotesGoal": 10,
  "weeklyMocksGoal": 3,
  "updatedAt": "2026-08-18T19:32:16Z"
}'
```

### Option 3: Application Code
When users perform actions, update their stats:

```javascript
import { doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';

export async function recordNoteCreated(userId) {
  const statsRef = doc(db, 'users', userId, 'stats', 'summary');
  await updateDoc(statsRef, {
    notesCreated: increment(1),
    notesThisWeek: increment(1),
    updatedAt: serverTimestamp(),
  });
}

export async function recordMockAttempted(userId, score) {
  const statsRef = doc(db, 'users', userId, 'stats', 'summary');
  // Get current stats to recalculate average
  const snap = await getDoc(statsRef);
  const current = snap.data();
  const newTotal = (current.mocksAttempted || 0) + 1;
  const newAvg = ((current.mockAvgScore || 0) * (current.mocksAttempted || 0) + score) / newTotal;
  
  await updateDoc(statsRef, {
    mocksAttempted: increment(1),
    mockAvgScore: Math.round(newAvg),
    updatedAt: serverTimestamp(),
  });
}
```

## Real-Time Flow

```
User Action (create note, attempt mock, etc.)
    ↓
Firestore Document Updated
    ↓
useUserMetrics Hook Triggered (onSnapshot)
    ↓
React State Updated
    ↓
Dashboard KPIs & Progress Card Refresh
```

## Testing Real-Time Updates

### Step 1: Verify Data in Firestore
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Firestore Database
4. Navigate to `users/{your-uid}/stats/summary`
5. Verify the document exists with sample data

### Step 2: Test Real-Time Updates
1. Open dashboard in browser
2. In Firebase Console, edit the `summary` document
3. Change any value (e.g., notesCreated: 43)
4. Dashboard should update instantly without refresh

### Step 3: Test with Today's Tasks
1. Create a planner task for today's date
2. Dashboard "Today's Task" section should show it instantly
3. Edit the task in Firestore
4. Dashboard should update instantly

## Fallback Behavior

If Firestore data is missing/empty, the dashboard shows:

**Weekly Progress**: 68% (mock)
**Notes Created**: 0
**Mocks Attempted**: 0 or live mock count
**Study Streak**: 0

This is intentional—the UI works perfectly with no data, so you can design in demo mode.

## Firestore Security Rules

Ensure users can only read/write their own stats:

```firestore
match /users/{uid}/stats/{document=**} {
  allow read, write: if request.auth.uid == uid;
}

match /plannerTasks/{document=**} {
  allow read, write: if request.auth.uid == resource.data.userId;
}
```

## Next Steps

1. ✅ Create `users/{uid}/stats/summary` documents in Firestore
2. ✅ Populate with initial data using Firebase Console or CLI
3. ✅ Set up Cloud Functions to auto-update stats (optional but recommended)
4. ✅ Test real-time updates by editing data in Firestore Console
5. ✅ Integrate metric updates into your app's action handlers
