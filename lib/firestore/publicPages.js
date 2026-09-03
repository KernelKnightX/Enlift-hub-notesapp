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
import { deepMerge } from "@/lib/content/deepMerge";
import { defaultUpscSyllabusContent, UPSC_SYLLABUS_PAGE_ID } from "@/data/study-material/upsc-syllabus-defaults";

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

export function serializePublicPageContent(defaults, source = {}) {
  const normalized = deepMerge(defaults, source);
  return JSON.parse(JSON.stringify({
    ...normalized,
    status: source.status || normalized.status || "published",
  }));
}

export async function getMergedPublicPageContent(pageId, defaults) {
  const page = await getPublicPage(pageId);
  return serializePublicPageContent(defaults, page || {});
}

export async function savePublicPage(pageId, content, user, { normalize } = {}) {
  const payload = normalize ? normalize(content) : content;
  await setDoc(
    doc(requireDb(), COLLECTION, pageId),
    {
      ...payload,
      slug: pageId,
      updatedAt: serverTimestamp(),
      updatedBy: user?.uid || "",
      updatedByName: user?.displayName || user?.email || "Admin",
    },
    { merge: true }
  );
}

export async function getUpscCalendarPageContent() {
  const page = await getPublicPage(UPSC_CALENDAR_PAGE_ID);
  return serializeUpscCalendarForProps(page || {});
}

export async function saveUpscCalendarPage(content, user) {
  const payload = normalizeUpscCalendarContent(content);
  await savePublicPage(UPSC_CALENDAR_PAGE_ID, payload, user);
}

export async function getUpscSyllabusPageContent() {
  return getMergedPublicPageContent(UPSC_SYLLABUS_PAGE_ID, defaultUpscSyllabusContent);
}

export async function saveUpscSyllabusPage(content, user) {
  const payload = serializePublicPageContent(defaultUpscSyllabusContent, content);
  await savePublicPage(UPSC_SYLLABUS_PAGE_ID, payload, user);
}
