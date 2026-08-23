import {
  addDoc,
  collection,
  doc,
  increment,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db, auth } from '@/firebase/config';

function currentUser() {
  return auth?.currentUser || null;
}

export async function logOfficeEvent(type, payload = {}) {
  const user = currentUser();
  if (!user) return;
  try {
    await addDoc(collection(db, 'officeEvents'), {
      type,
      userId: user.uid,
      userEmail: user.email || '',
      userName: payload.userName || user.displayName || '',
      resourceId: payload.resourceId || '',
      resourceTitle: payload.resourceTitle || '',
      meta: payload.meta || {},
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.warn('[officeEvents]', error.code || error.message);
  }
}

export async function bumpPdfStat(pdfId, field) {
  if (!pdfId) return;
  try {
    await updateDoc(doc(db, 'pdfs', pdfId), {
      [field]: increment(1),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.warn('[pdfs stat]', error.code || error.message);
  }
}

export async function bumpMockAttemptCount(testId) {
  if (!testId) return;
  try {
    await updateDoc(doc(db, 'mockTests', testId), {
      attemptCount: increment(1),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.warn('[mockTests attemptCount]', error.code || error.message);
  }
}

export async function recordMockAttempt(data) {
  const user = currentUser();
  if (!user) return;
  try {
    await addDoc(collection(db, 'mockAttempts'), {
      userId: user.uid,
      userEmail: user.email || '',
      userName: data.userName || user.displayName || '',
      testId: data.testId,
      testTitle: data.testTitle || '',
      obtainedMarks: data.obtainedMarks || 0,
      totalMarks: data.totalMarks || 0,
      scorePct: data.scorePct || 0,
      isPremium: !!data.isPremium,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.warn('[mockAttempts]', error.code || error.message);
  }
}

export async function trackPdfOpen(pdf, extra = {}) {
  if (!pdf?.id) return;
  await Promise.all([
    bumpPdfStat(pdf.id, 'openCount'),
    logOfficeEvent('pdf_open', {
      resourceId: pdf.id,
      resourceTitle: pdf.title || pdf.name || 'PDF',
      userName: extra.userName,
    }),
  ]);
}

export async function trackPdfDownload(pdf, extra = {}) {
  if (!pdf?.id) return;
  await Promise.all([
    bumpPdfStat(pdf.id, 'downloadCount'),
    logOfficeEvent('pdf_download', {
      resourceId: pdf.id,
      resourceTitle: pdf.title || pdf.name || 'PDF',
      userName: extra.userName,
    }),
  ]);
}
