import { db, storage } from "@/firebase/config";
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
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

const MAPS_COLLECTION = "maps";

export const MAP_CATEGORIES = [
  { value: "india-states", label: "India States" },
  { value: "world", label: "World" },
  { value: "river-systems", label: "River Systems" },
  { value: "mountain-ranges", label: "Mountain Ranges" },
  { value: "national-parks", label: "National Parks" },
  { value: "biosphere-reserves", label: "Biosphere Reserves" },
  { value: "important-locations", label: "Important Locations" },
];

export const categoryLabel = (category) => (
  MAP_CATEGORIES.find((item) => item.value === category)?.label || category || "Uncategorised"
);

const requireDb = () => {
  if (!db) throw new Error("Firestore is only available in the browser.");
  return db;
};

const requireStorage = () => {
  if (!storage) throw new Error("Firebase Storage is only available in the browser.");
  return storage;
};

export const slugify = (title = "") => (
  title
    .toString()
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
);

const cleanFilename = (name = "file") => (
  name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-+|-+$/g, "") || "file"
);

const mapDoc = (snapshot) => (
  snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null
);

const ensureUniqueSlug = async (slug, ignoreId = null) => {
  const q = query(collection(requireDb(), MAPS_COLLECTION), where("slug", "==", slug), limit(1));
  const snap = await getDocs(q);
  const duplicate = snap.docs.find((item) => item.id !== ignoreId);
  if (duplicate) throw new Error("A map with this slug already exists.");
};

export async function getPublishedMaps(category = "all") {
  const snap = await getDocs(query(
    collection(requireDb(), MAPS_COLLECTION),
    where("status", "==", "published"),
    orderBy("createdAt", "desc"),
  ));
  const maps = snap.docs.map((item) => ({ id: item.id, ...item.data() }));
  if (!category || category === "all") return maps;
  return maps.filter((item) => item.category === category);
}

export async function getAllMapsAdmin() {
  const snap = await getDocs(query(collection(requireDb(), MAPS_COLLECTION), orderBy("createdAt", "desc")));
  return snap.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function getMapBySlug(slug) {
  const snap = await getDocs(query(
    collection(requireDb(), MAPS_COLLECTION),
    where("slug", "==", slug),
    where("status", "==", "published"),
    limit(1),
  ));
  return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
}

export async function getMapById(id) {
  return mapDoc(await getDoc(doc(requireDb(), MAPS_COLLECTION, id)));
}

export async function uploadMapFile(file, slug, type) {
  if (!file) return "";
  const safeSlug = slugify(slug) || "map";
  const storageRef = ref(
    requireStorage(),
    `maps/${safeSlug}/${type}-${Date.now()}-${cleanFilename(file.name)}`,
  );
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function createMap(data) {
  await ensureUniqueSlug(data.slug);
  return addDoc(collection(requireDb(), MAPS_COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateMap(id, data) {
  if (data.slug) await ensureUniqueSlug(data.slug, id);
  return updateDoc(doc(requireDb(), MAPS_COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteMap(id) {
  return deleteDoc(doc(requireDb(), MAPS_COLLECTION, id));
}
