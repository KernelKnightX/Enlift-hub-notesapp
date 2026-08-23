import { db } from "@/firebase/config";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

const GOV_COLLECTION = "government";

export const GOV_SECTIONS = [
  { value: "schemes", label: "Schemes" },
  { value: "constitution-articles", label: "Constitution Articles" },
  { value: "important-acts", label: "Important Acts" },
  { value: "committees", label: "Committees" },
  { value: "ministries", label: "Ministries" },
  { value: "reports-and-indices", label: "Reports & Indices" },
  { value: "constitutional-bodies", label: "Constitutional Bodies" },
  { value: "policies", label: "Policies" },
  { value: "international-organizations", label: "International Organizations" },
];

export const sectionLabel = (section) => (
  GOV_SECTIONS.find((s) => s.value === section)?.label || section || "Unknown"
);

export const isValidSection = (section) => GOV_SECTIONS.some((s) => s.value === section);

const SECTION_ALIASES = {
  "reports-and-indices": ["reports-and-indices", "reports-indices"],
  "reports-indices": ["reports-indices", "reports-and-indices"],
};

const matchesSection = (itemSection, requested) => {
  const aliases = SECTION_ALIASES[requested] || [requested];
  return aliases.includes(itemSection);
};

const requireDb = () => {
  if (!db) throw new Error("Firestore is only available in the browser.");
  return db;
};

export async function createGovItem(data) {
  return addDoc(collection(requireDb(), GOV_COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateGovItem(id, data) {
  return updateDoc(doc(requireDb(), GOV_COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteGovItem(id) {
  if (!id) throw new Error("Invalid id");
  return deleteDoc(doc(requireDb(), GOV_COLLECTION, id));
}

export async function getPublishedGovernment(section = "all") {
  const q = query(
    collection(requireDb(), GOV_COLLECTION),
    where("status", "==", "published"),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  if (!section || section === "all") return items;
  return items.filter((it) => matchesSection(it.section, section));
}

export async function getGovernmentBySlug(section, slug) {
  const q = query(
    collection(requireDb(), GOV_COLLECTION),
    where("status", "==", "published"),
    where("slug", "==", slug),
    where("section", "==", section),
    limit(1),
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() };
}

export async function getGovItemById(id) {
  const snap = await getDoc(doc(requireDb(), GOV_COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function getAllGovernmentAdmin() {
  const snap = await getDocs(query(collection(requireDb(), GOV_COLLECTION), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
