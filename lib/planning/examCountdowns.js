import { defaultUpscCalendarContent } from "@/data/upsc-calendar-defaults";

/** Parse labels like "24 May 2026 (Sunday)" → ISO date string */
export function parseExamDateLabel(label) {
  if (!label || typeof label !== "string") return null;
  const cleaned = label.replace(/\([^)]*\)/g, "").trim();
  const parsed = Date.parse(cleaned);
  if (!Number.isFinite(parsed)) return null;
  return new Date(parsed).toISOString().slice(0, 10);
}

export function getDefaultExamCountdowns() {
  const events = defaultUpscCalendarContent?.keyEvents?.events || [];

  const prelimsEvent = events.find(
    (item) =>
      item.exam?.includes("Prelims") &&
      item.event?.toLowerCase().includes("exam date")
  );
  const mainsEvent = events.find(
    (item) =>
      item.exam?.includes("Main") &&
      item.event?.toLowerCase().includes("start")
  );

  const prelimsDate =
    parseExamDateLabel(prelimsEvent?.date) || "2026-05-24";
  const mainsDate =
    parseExamDateLabel(mainsEvent?.date) || "2026-08-21";

  return [
    { name: "UPSC CSE Prelims", date: prelimsDate, tone: "primary" },
    { name: "UPSC CSE Mains", date: mainsDate, tone: "accent" },
  ];
}
