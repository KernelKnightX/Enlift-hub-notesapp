import { db } from "@/firebase/config";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import {
  normalizeUpscCalendarContent,
  serializeUpscCalendarForProps,
} from "@/lib/upscCalendarContent";
import { UPSC_CALENDAR_PAGE_ID } from "@/data/upsc-calendar-defaults";

const COLLECTION = "publicPages";

const requireDb = () => {
  if (!db) throw new Error("Firestore is only available when Firebase is configured.");
  return db;
};

export async function getPublicPage(slug, { includeDraft = false } = {}) {
  const snap = await getDoc(doc(requireDb(), COLLECTION, slug));
  if (!snap.exists()) return null;
  const data = { id: snap.id, ...snap.data() };
  if (!includeDraft && data.status !== "published") return null;
  return data;
}

export async function getUpscCalendarPageContent() {
  const page = await getPublicPage(UPSC_CALENDAR_PAGE_ID);
  return serializeUpscCalendarForProps(page || {});
}

export async function saveUpscCalendarPage(content, user) {
  const payload = normalizeUpscCalendarContent(content);
  await setDoc(
    doc(requireDb(), COLLECTION, UPSC_CALENDAR_PAGE_ID),
    {
      ...payload,
      slug: UPSC_CALENDAR_PAGE_ID,
      updatedAt: serverTimestamp(),
      updatedBy: user?.uid || "",
      updatedByName: user?.displayName || user?.email || "Admin",
    },
    { merge: true }
  );
}
