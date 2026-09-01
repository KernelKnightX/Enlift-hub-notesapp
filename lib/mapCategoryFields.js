import { MAP_CATEGORIES, normalizeLengthKm } from "@/lib/firestore/maps";

const COMMON_FIELDS = [
  { key: "region", label: "Region", type: "text" },
  { key: "upscFact", label: "UPSC fact", type: "textarea", rows: 5 },
];

export const MAP_CATEGORY_ADMIN = {
  "india-states": {
    label: "India State",
    listPath: "/admin/maps/india-map",
    fields: [
      { key: "capital", label: "Capital", type: "text" },
      { key: "districtsCount", label: "Districts", type: "number" },
      { key: "area", label: "Area", type: "text" },
      ...COMMON_FIELDS,
    ],
  },
  world: {
    label: "World Map",
    listPath: "/admin/maps/world",
    fields: [...COMMON_FIELDS],
  },
  "river-systems": {
    label: "River System",
    listPath: "/admin/maps/river-systems",
    fields: [
      { key: "origin", label: "Origin", type: "text" },
      { key: "mouth", label: "Mouth", type: "text" },
      { key: "lengthKm", label: "Length (km)", type: "number" },
      { key: "statesCovered", label: "States Covered", type: "text", fullWidth: true },
      { key: "tributaries", label: "Tributaries", type: "text", fullWidth: true },
      { key: "upscFact", label: "UPSC fact", type: "textarea", rows: 5 },
    ],
  },
  "mountain-ranges": {
    label: "Mountain Range",
    listPath: "/admin/maps/mountain-ranges",
    fields: [
      { key: "highestPeak", label: "Highest Peak", type: "text" },
      { key: "mountainLengthKm", label: "Length (km)", type: "number" },
      { key: "mountainStatesCovered", label: "States Covered", type: "text" },
      { key: "formedEra", label: "Formed Era", type: "text" },
      ...COMMON_FIELDS,
    ],
  },
  "national-parks": {
    label: "National Park",
    listPath: "/admin/maps/national-parks",
    fields: [
      { key: "parkState", label: "State", type: "text" },
      { key: "establishedYear", label: "Established Year", type: "text" },
      { key: "parkArea", label: "Area", type: "text" },
      { key: "famousFor", label: "Famous For", type: "text", fullWidth: true },
      ...COMMON_FIELDS,
    ],
  },
  "biosphere-reserves": {
    label: "Biosphere Reserve",
    listPath: "/admin/maps/biosphere-reserves",
    fields: [
      { key: "reserveStates", label: "States", type: "text" },
      { key: "reserveEstablishedYear", label: "Established Year", type: "text" },
      { key: "coreArea", label: "Core Area", type: "text" },
      { key: "unescoStatus", label: "UNESCO Status", type: "text" },
      ...COMMON_FIELDS,
    ],
  },
  "important-locations": {
    label: "Important Location",
    listPath: "/admin/maps/important-locations",
    fields: [
      { key: "locationState", label: "State", type: "text" },
      { key: "significance", label: "Significance", type: "text", fullWidth: true },
      { key: "nearbyLandmark", label: "Nearby Landmark", type: "text", fullWidth: true },
      ...COMMON_FIELDS,
    ],
  },
};

export const getMapCategoryAdmin = (category) => MAP_CATEGORY_ADMIN[category] || null;

const MAP_BADGE_CATEGORIES = new Set(["india-states", "world"]);

export function getMapCardUi(category) {
  return {
    badge: MAP_BADGE_CATEGORIES.has(category) ? "Atlas map" : null,
    action: "View details",
  };
}

export const getMapCategoryListPath = (category) => (
  MAP_CATEGORY_ADMIN[category]?.listPath || `/admin/maps/${category}`
);

export function buildMapPayload(category, values, user, media = {}) {
  const payload = {
    title: values.title.trim(),
    slug: values.slug,
    category,
    status: values.status,
    authorId: user?.uid || "",
    authorName: user?.displayName || user?.email || "Admin",
    imageUrl: media.imageUrl || undefined,
    thumbnailUrl: media.imageUrl || undefined,
    pdfUrl: media.pdfUrl || undefined,
  };

  const config = MAP_CATEGORY_ADMIN[category];
  if (!config) return payload;

  config.fields.forEach((field) => {
    const raw = values[field.key];
    if (raw === undefined || raw === null || raw === "") return;

    if (field.type === "number") {
      if (field.key === "lengthKm" || field.key === "mountainLengthKm") {
        const normalized = normalizeLengthKm(raw);
        if (normalized !== undefined) payload[field.key] = normalized;
        return;
      }
      if (field.key === "districtsCount") {
        payload[field.key] = Number(raw);
        return;
      }
    }

    payload[field.key] = String(raw).trim();
  });

  Object.keys(payload).forEach((key) => {
    if (payload[key] === undefined || Number.isNaN(payload[key])) delete payload[key];
  });

  return payload;
}

export function getMapCardSubtitle(item, category) {
  if (category === "river-systems") {
    const parts = [];
    const length = item.lengthKm !== undefined ? normalizeLengthKm(item.lengthKm) : undefined;
    if (length !== undefined) parts.push(`${length.toLocaleString("en-IN")} km`);
    if (item.origin) parts.push(item.origin);
    return parts.join(" · ");
  }

  if (category === "mountain-ranges") {
    const parts = [];
    if (item.highestPeak) parts.push(item.highestPeak);
    const length = item.mountainLengthKm !== undefined ? normalizeLengthKm(item.mountainLengthKm) : undefined;
    if (length !== undefined) parts.push(`${length.toLocaleString("en-IN")} km`);
    return parts.join(" · ");
  }

  if (category === "india-states") {
    const parts = [];
    if (item.capital) parts.push(`Capital: ${item.capital}`);
    if (item.region) parts.push(item.region);
    return parts.join(" · ");
  }

  if (category === "national-parks") {
    return [item.parkState, item.famousFor, item.region].filter(Boolean).join(" · ");
  }

  if (category === "biosphere-reserves") {
    return [item.reserveStates, item.unescoStatus, item.region].filter(Boolean).join(" · ");
  }

  if (category === "important-locations") {
    return [item.locationState, item.significance, item.region].filter(Boolean).join(" · ");
  }

  return item.region || item.upscFact || "";
}

const CSV_EXAMPLES = {
  "india-states": `title,slug,status,category,capital,districtsCount,area,region,upscFact
Uttar Pradesh,uttar-pradesh,published,india-states,Lucknow,75,"240,928 sq km",North India,Most populous state in India`,
  "river-systems": `title,slug,status,category,origin,mouth,lengthKm,statesCovered,tributaries,upscFact
Ganga,ganga,published,river-systems,"Gangotri Glacier, Uttarakhand",Bay of Bengal,2525,"Uttarakhand, Uttar Pradesh, Bihar","Yamuna, Ghaghara, Gandak","India's longest river..."`,
  "mountain-ranges": `title,slug,status,category,highestPeak,mountainLengthKm,mountainStatesCovered,formedEra,upscFact
Himalayas,himalayas,published,mountain-ranges,Mount Everest,2400,"Jammu & Kashmir, Himachal Pradesh, Uttarakhand",Alpine-Himalayan orogeny,"Young fold mountains forming India's northern boundary..."`,
  "national-parks": `title,slug,status,category,parkState,establishedYear,parkArea,famousFor,upscFact
Jim Corbett National Park,jim-corbett-national-park,published,national-parks,Uttarakhand,1936,520 sq km,Tigers and elephants,India's first national park`,
  "biosphere-reserves": `title,slug,status,category,reserveStates,reserveEstablishedYear,coreArea,unescoStatus,upscFact
Nilgiri Biosphere Reserve,nilgiri-biosphere-reserve,published,biosphere-reserves,"Tamil Nadu, Kerala, Karnataka",1986,1240 sq km,Yes,First biosphere reserve in India`,
  "important-locations": `title,slug,status,category,locationState,significance,nearbyLandmark,upscFact
Kanyakumari,kanyakumari,published,important-locations,Tamil Nadu,Southernmost tip of mainland India,Indian Ocean confluence,Important for geography map-based questions`,
  world: `title,slug,status,category,region,upscFact
Continents Overview,continents-overview,published,world,Global geography,Useful for world map orientation in UPSC prelims`,
};

export function getMapImportConfig(category) {
  const admin = MAP_CATEGORY_ADMIN[category];
  if (!admin) {
    return {
      label: "Optional fields",
      columns: ["region", "upscFact"],
      example: CSV_EXAMPLES.world,
    };
  }

  return {
    label: `${admin.label} fields`,
    columns: admin.fields.map((field) => field.key),
    example: CSV_EXAMPLES[category] || CSV_EXAMPLES.world,
  };
}

export function buildMapDocFromImportRow(row) {
  const doc = {
    title: row.title,
    slug: row.slug,
    category: row.category,
    status: row.status,
  };

  const config = MAP_CATEGORY_ADMIN[row.category];
  if (!config) {
    if (row.region) doc.region = row.region;
    if (row.upscFact) doc.upscFact = row.upscFact;
    return doc;
  }

  config.fields.forEach((field) => {
    const value = row[field.key];
    if (!value) return;

    if (field.type === "number") {
      if (field.key === "lengthKm" || field.key === "mountainLengthKm") {
        const normalized = normalizeLengthKm(value);
        if (normalized !== undefined) doc[field.key] = normalized;
        return;
      }
      if (field.key === "districtsCount") {
        doc[field.key] = Number(value);
        return;
      }
    }

    doc[field.key] = String(value).trim();
  });

  return doc;
}

export const MAP_IMPORT_ALIASES = [
  ["region", ["region", "Region"]],
  ["upscFact", ["upscFact", "upscfact", "upsc fact", "fact"]],
  ["capital", ["capital", "Capital"]],
  ["districtsCount", ["districtsCount", "districtscount", "districts count", "districts"]],
  ["area", ["area", "Area"]],
  ["origin", ["origin", "Origin", "source"]],
  ["mouth", ["mouth", "Mouth", "outlet"]],
  ["lengthKm", ["lengthKm", "lengthkm", "length_km", "Length", "length"]],
  ["statesCovered", ["statesCovered", "statescovered", "states covered"]],
  ["tributaries", ["tributaries", "tributary", "major tributaries"]],
  ["highestPeak", ["highestPeak", "highestpeak", "highest peak", "peak"]],
  ["mountainLengthKm", ["mountainLengthKm", "mountainlengthkm", "mountain length km"]],
  ["mountainStatesCovered", ["mountainStatesCovered", "mountainstatescovered", "states covered"]],
  ["formedEra", ["formedEra", "formed era", "formation era"]],
  ["parkState", ["parkState", "parkstate", "park state", "state"]],
  ["establishedYear", ["establishedYear", "establishedyear", "established year", "year"]],
  ["parkArea", ["parkArea", "parkarea", "park area"]],
  ["famousFor", ["famousFor", "famousfor", "famous for"]],
  ["reserveStates", ["reserveStates", "reservestates", "states"]],
  ["reserveEstablishedYear", ["reserveEstablishedYear", "reserveestablishedyear", "established year"]],
  ["coreArea", ["coreArea", "corearea", "core area"]],
  ["unescoStatus", ["unescoStatus", "unescostatus", "unesco status"]],
  ["locationState", ["locationState", "locationstate", "location state"]],
  ["significance", ["significance", "Significance"]],
  ["nearbyLandmark", ["nearbyLandmark", "nearbylandmark", "nearby landmark"]],
];

export const MAP_CATEGORY_VALUES = MAP_CATEGORIES.map((item) => item.value);
