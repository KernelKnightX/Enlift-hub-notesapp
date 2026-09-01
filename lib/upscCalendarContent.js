import { defaultUpscCalendarContent, UPSC_CALENDAR_PAGE_ID } from "@/data/upsc-calendar-defaults";

const deepMerge = (defaults, overrides) => {
  if (!overrides || typeof overrides !== "object") return defaults;
  if (Array.isArray(defaults)) {
    return Array.isArray(overrides) && overrides.length ? overrides : defaults;
  }

  const merged = { ...defaults };
  Object.keys(overrides).forEach((key) => {
    const defaultValue = defaults?.[key];
    const overrideValue = overrides[key];
    if (overrideValue === undefined || overrideValue === null || overrideValue === "") return;
    if (defaultValue && typeof defaultValue === "object" && !Array.isArray(defaultValue)) {
      merged[key] = deepMerge(defaultValue, overrideValue);
      return;
    }
    merged[key] = overrideValue;
  });
  return merged;
};

export function normalizeUpscCalendarContent(source = {}) {
  const merged = deepMerge(defaultUpscCalendarContent, source);
  return {
    ...merged,
    slug: UPSC_CALENDAR_PAGE_ID,
    status: source.status || merged.status || "published",
  };
}

export function serializeUpscCalendarForProps(content) {
  const normalized = normalizeUpscCalendarContent(content);
  return JSON.parse(JSON.stringify(normalized));
}

const TOKEN_REGEX = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;

export function renderInlineFormattedText(text = "") {
  if (!text) return [];

  return String(text).split(TOKEN_REGEX).filter(Boolean).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return { type: "strong", value: part.slice(2, -2), key: `strong-${index}` };
    }

    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return {
        type: "link",
        label: linkMatch[1],
        href: linkMatch[2],
        key: `link-${index}`,
      };
    }

    return { type: "text", value: part, key: `text-${index}` };
  });
}

export function linesToList(value = "") {
  return String(value)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function listToLines(value = []) {
  return (Array.isArray(value) ? value : []).join("\n");
}
