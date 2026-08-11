import { db } from "@/firebase/config";
import { deleteDoc, doc } from "firebase/firestore";

export const GOV_SECTIONS = [
  { value: "schemes", label: "Schemes" },
  { value: "ministries", label: "Ministries" },
  { value: "important-acts", label: "Important Acts" },
  { value: "constitutional-bodies", label: "Constitutional Bodies" },
  { value: "policies", label: "Policies" },
  { value: "reports-and-indices", label: "Reports & Indices" },
  { value: "committees", label: "Committees" },
  { value: "international-organizations", label: "International Organizations" },
];

export const sectionLabel = (section) => (
  GOV_SECTIONS.find((s) => s.value === section)?.label || section || "Unknown"
);

export const isValidSection = (section) => GOV_SECTIONS.some((s) => s.value === section);

export async function deleteGovItem(id) {
  if (!id) throw new Error("Invalid id");
  return deleteDoc(doc(db, "government", id));
}
