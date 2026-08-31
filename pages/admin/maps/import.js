import { useState, useMemo } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Papa from "papaparse";
import AdminLayout from "@/layouts/AdminLayout";
import useAdminGate from "@/hooks/admin/useAdminGate";
import { toast } from "react-toastify";
import {
  MAP_CATEGORIES,
  createMap,
  normalizeLengthKm,
} from "@/lib/firestore/maps";

const COMMON_OPTIONAL = ["region", "upscFact", "imageFilename", "pdfFilename"];

const CATEGORY_IMPORT_CONFIG = {
  "india-states": {
    label: "India State fields",
    columns: ["capital", "districtsCount", "area", ...COMMON_OPTIONAL],
    example: `title,slug,status,category,capital,districtsCount,area,region,upscFact
Uttar Pradesh,uttar-pradesh,published,india-states,Lucknow,75,"240,928 sq km",North India,Most populous state in India
Maharashtra,maharashtra,published,india-states,Mumbai,36,"307,713 sq km",West India,Financial capital of India`,
  },
  "river-systems": {
    label: "River System fields",
    columns: [
      "origin",
      "mouth",
      "lengthKm",
      "statesCovered",
      "tributaries",
      ...COMMON_OPTIONAL,
    ],
    example: `title,slug,status,category,origin,mouth,lengthKm,statesCovered,tributaries,upscFact,imageFilename,pdfFilename
Ganga,ganga,published,river-systems,"Gangotri Glacier, Uttarakhand",Bay of Bengal,2525,"Uttarakhand, Uttar Pradesh, Bihar","Yamuna, Ghaghara, Gandak","India's longest river...",ganga.jpg,ganga.pdf
Yamuna,yamuna,published,river-systems,"Yamunotri Glacier, Uttarakhand",Confluence with Ganga at Prayagraj,1376,"Uttarakhand, Delhi, Uttar Pradesh","Chambal, Betwa, Ken","Longest tributary of the Ganga...",yamuna.jpg,yamuna.pdf`,
  },
  "mountain-ranges": {
    label: "Mountain Range fields",
    columns: [
      "highestPeak",
      "mountainLengthKm",
      "mountainStatesCovered",
      "formedEra",
      ...COMMON_OPTIONAL,
    ],
    example: `title,slug,status,category,highestPeak,mountainLengthKm,mountainStatesCovered,formedEra,upscFact,imageFilename,pdfFilename
Himalayas,himalayas,published,mountain-ranges,Mount Everest,2400,"Jammu & Kashmir, Himachal Pradesh, Uttarakhand, Sikkim, Arunachal Pradesh",Alpine-Himalayan orogeny,"Young fold mountains forming India's northern boundary...",himalayas.jpg,himalayas.pdf
Aravalli Range,aravalli-range,published,mountain-ranges,Guru Shikhar,692,"Rajasthan, Gujarat, Haryana, Delhi",Proterozoic,"One of the oldest fold mountain systems in India...",aravalli.jpg,aravalli.pdf`,
  },
  "national-parks": {
    label: "National Park fields",
    columns: [
      "parkState",
      "establishedYear",
      "parkArea",
      "famousFor",
      ...COMMON_OPTIONAL,
    ],
    example: `title,slug,status,category,parkState,establishedYear,parkArea,famousFor,upscFact
Jim Corbett National Park,jim-corbett-national-park,published,national-parks,Uttarakhand,1936,520 sq km,Tigers and elephants,India's first national park
Kaziranga National Park,kaziranga-national-park,published,national-parks,Assam,1974,430 sq km,One-horned rhinoceros,UNESCO World Heritage Site`,
  },
  "biosphere-reserves": {
    label: "Biosphere Reserve fields",
    columns: [
      "reserveStates",
      "reserveEstablishedYear",
      "coreArea",
      "unescoStatus",
      ...COMMON_OPTIONAL,
    ],
    example: `title,slug,status,category,reserveStates,reserveEstablishedYear,coreArea,unescoStatus,upscFact
Nilgiri Biosphere Reserve,nilgiri-biosphere-reserve,published,biosphere-reserves,"Tamil Nadu, Kerala, Karnataka",1986,1240 sq km,Yes,First biosphere reserve in India
Sundarbans Biosphere Reserve,sundarbans-biosphere-reserve,published,biosphere-reserves,West Bengal,1989,1330 sq km,Yes,Famous for mangroves and Royal Bengal tigers`,
  },
  "important-locations": {
    label: "Important Location fields",
    columns: [
      "locationState",
      "significance",
      "nearbyLandmark",
      ...COMMON_OPTIONAL,
    ],
    example: `title,slug,status,category,locationState,significance,nearbyLandmark,upscFact
Kanyakumari,kanyakumari,published,important-locations,Tamil Nadu,Southernmost tip of mainland India,Indian Ocean confluence,Important for geography map-based questions
Wagah Border,wagah-border,published,important-locations,Punjab,India-Pakistan border crossing near Amritsar,Attari,Strategic location on Grand Trunk Road`,
  },
  world: {
    label: "World Map fields",
    columns: [...COMMON_OPTIONAL],
    example: `title,slug,status,category,region,upscFact
Continents Overview,continents-overview,published,world,Global geography,Useful for world map orientation in UPSC prelims`,
  },
};

const DEFAULT_IMPORT_CONFIG = {
  label: "Optional fields",
  columns: [...COMMON_OPTIONAL],
  example: `title,slug,status,category,region,upscFact
Sample Map,sample-map,published,india-states,North India,Optional UPSC note for this map entry`,
};

export default function AdminMapsImportPage() {
  const { loading, isAdmin } = useAdminGate();
  const router = useRouter();
  const categoryParam = router.query.category;
  const [csvFile, setCsvFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState([]);

  const selectedCategory = useMemo(
    () => MAP_CATEGORIES.find((category) => category.value === categoryParam),
    [categoryParam],
  );

  const importConfig = useMemo(() => {
    if (!selectedCategory) return DEFAULT_IMPORT_CONFIG;
    return (
      CATEGORY_IMPORT_CONFIG[selectedCategory.value] || DEFAULT_IMPORT_CONFIG
    );
  }, [selectedCategory]);

  if (loading) return null;
  if (!isAdmin) return null;

  const handleCsvChange = (event) => {
    setCsvFile(event.target.files?.[0] || null);
  };

  const normalizeCsvKey = (key = "") =>
    String(key)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "")
      .replace(/^the/, "");

  const resolveCsvValue = (row, aliases) => {
    for (const alias of aliases) {
      const key = Object.keys(row).find(
        (entry) => normalizeCsvKey(entry) === normalizeCsvKey(alias),
      );
      if (
        key !== undefined &&
        row[key] !== undefined &&
        String(row[key]).trim() !== ""
      ) {
        return String(row[key]).trim();
      }
    }
    return "";
  };

  const applyResolvedFields = (row) => {
    const mappings = [
      ["region", ["region", "Region"]],
      ["upscFact", ["upscFact", "upscfact", "upsc fact", "fact"]],
      ["capital", ["capital", "Capital"]],
      [
        "districtsCount",
        ["districtsCount", "districtscount", "districts count", "districts"],
      ],
      ["area", ["area", "Area"]],
      ["origin", ["origin", "Origin", "source"]],
      ["mouth", ["mouth", "Mouth", "outlet"]],
      ["lengthKm", ["lengthKm", "lengthkm", "length_km", "Length", "length"]],
      ["statesCovered", ["statesCovered", "statescovered", "states covered"]],
      ["tributaries", ["tributaries", "tributary", "major tributaries"]],
      ["highestPeak", ["highestPeak", "highestpeak", "highest peak", "peak"]],
      [
        "mountainLengthKm",
        [
          "mountainLengthKm",
          "mountainlengthkm",
          "mountain length km",
          "lengthKm",
          "length",
        ],
      ],
      [
        "mountainStatesCovered",
        [
          "mountainStatesCovered",
          "mountainstatescovered",
          "states covered",
          "statesCovered",
        ],
      ],
      ["formedEra", ["formedEra", "formed era", "formation era"]],
      ["parkState", ["parkState", "parkstate", "park state", "state"]],
      [
        "establishedYear",
        ["establishedYear", "establishedyear", "established year", "year"],
      ],
      ["parkArea", ["parkArea", "parkarea", "park area", "area"]],
      ["famousFor", ["famousFor", "famousfor", "famous for"]],
      ["reserveStates", ["reserveStates", "reservestates", "states"]],
      [
        "reserveEstablishedYear",
        [
          "reserveEstablishedYear",
          "reserveestablishedyear",
          "established year",
          "year",
        ],
      ],
      ["coreArea", ["coreArea", "corearea", "core area"]],
      ["unescoStatus", ["unescoStatus", "unescostatus", "unesco status"]],
      [
        "locationState",
        ["locationState", "locationstate", "location state", "state"],
      ],
      ["significance", ["significance", "Significance"]],
      [
        "nearbyLandmark",
        ["nearbyLandmark", "nearbylandmark", "nearby landmark"],
      ],
    ];

    mappings.forEach(([field, aliases]) => {
      const value = resolveCsvValue(row, aliases);
      if (value) row[field] = value;
    });

    return row;
  };

  const validateRow = (row) => {
    const title = resolveCsvValue(row, ["title", "Title"]);
    const slug = resolveCsvValue(row, ["slug", "Slug"]);
    const status = resolveCsvValue(row, ["status", "Status"]);

    if (!title || !slug || !status)
      return "Missing required field (title/slug/status)";
    row.title = title;
    row.slug = slug;
    row.status = status;

    if (selectedCategory) {
      const categoryValue = resolveCsvValue(row, ["category", "Category"]);
      if (categoryValue && categoryValue !== selectedCategory.value) {
        return `Row category '${categoryValue}' does not match import category '${selectedCategory.value}'`;
      }
      row.category = selectedCategory.value;
    }

    if (!row.category) return "Missing category for row";
    const categoryOk = MAP_CATEGORIES.some(
      (category) => category.value === row.category,
    );
    if (!categoryOk) return `Unknown category: ${row.category}`;
    return null;
  };

  const buildMapDoc = (row) => {
    const doc = {
      title: row.title,
      slug: row.slug,
      category: row.category,
      status: row.status,
    };

    if (row.region) doc.region = row.region;
    if (row.upscFact) doc.upscFact = row.upscFact;

    if (row.category === "india-states") {
      if (row.capital) doc.capital = row.capital;
      if (row.districtsCount) doc.districtsCount = Number(row.districtsCount);
      if (row.area) doc.area = row.area;
    }

    if (row.category === "river-systems") {
      if (row.origin) doc.origin = row.origin;
      if (row.mouth) doc.mouth = row.mouth;
      const lengthKm = normalizeLengthKm(row.lengthKm);
      if (lengthKm !== undefined) doc.lengthKm = lengthKm;
      if (row.statesCovered) doc.statesCovered = row.statesCovered;
      if (row.tributaries) doc.tributaries = row.tributaries;
    }

    if (row.category === "mountain-ranges") {
      if (row.highestPeak) doc.highestPeak = row.highestPeak;
      const mountainLengthKm = normalizeLengthKm(row.mountainLengthKm);
      if (mountainLengthKm !== undefined)
        doc.mountainLengthKm = mountainLengthKm;
      if (row.mountainStatesCovered)
        doc.mountainStatesCovered = row.mountainStatesCovered;
      if (row.formedEra) doc.formedEra = row.formedEra;
    }

    if (row.category === "national-parks") {
      if (row.parkState) doc.parkState = row.parkState;
      if (row.establishedYear) doc.establishedYear = row.establishedYear;
      if (row.parkArea) doc.parkArea = row.parkArea;
      if (row.famousFor) doc.famousFor = row.famousFor;
    }

    if (row.category === "biosphere-reserves") {
      if (row.reserveStates) doc.reserveStates = row.reserveStates;
      if (row.reserveEstablishedYear)
        doc.reserveEstablishedYear = row.reserveEstablishedYear;
      if (row.coreArea) doc.coreArea = row.coreArea;
      if (row.unescoStatus) doc.unescoStatus = row.unescoStatus;
    }

    if (row.category === "important-locations") {
      if (row.locationState) doc.locationState = row.locationState;
      if (row.significance) doc.significance = row.significance;
      if (row.nearbyLandmark) doc.nearbyLandmark = row.nearbyLandmark;
    }

    return doc;
  };

  const handleImport = () => {
    if (!csvFile) return toast.error("Please select a CSV file.");
    setParsing(true);

    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (resultsCsv) => {
        setParsing(false);
        const rows = resultsCsv.data;
        if (!rows || rows.length === 0)
          return toast.error("CSV contains no rows.");
        setRunning(true);
        const out = [];

        for (let index = 0; index < rows.length; index += 1) {
          const trimmed = {};
          Object.keys(rows[index]).forEach((key) => {
            trimmed[key.trim()] = (rows[index][key] || "").toString().trim();
          });

          if (trimmed.category === undefined && selectedCategory) {
            trimmed.category = selectedCategory.value;
          }

          applyResolvedFields(trimmed);

          const error = validateRow(trimmed);
          if (error) {
            out.push({
              row: index + 1,
              slug: trimmed.slug || "",
              status: "error",
              message: error,
            });
            continue;
          }

          if (selectedCategory) trimmed.category = selectedCategory.value;

          try {
            await createMap(buildMapDoc(trimmed));
            out.push({ row: index + 1, slug: trimmed.slug, status: "ok" });
          } catch (err) {
            console.error(err);
            out.push({
              row: index + 1,
              slug: rows[index]?.slug || "",
              status: "error",
              message: err.message || String(err),
            });
          }
        }

        setResults(out);
        setRunning(false);
        toast.success("Import complete");
      },
      error: (err) => {
        setParsing(false);
        toast.error(`CSV parse failed: ${err.message}`);
      },
    });
  };

  const currentTarget = selectedCategory
    ? `${selectedCategory.label} (${selectedCategory.value})`
    : "All map categories";

  return (
    <>
      <Head>
        <title>
          {selectedCategory
            ? `Import ${selectedCategory.label}`
            : "Import Maps"}
        </title>
      </Head>

      <AdminLayout
        title={
          selectedCategory
            ? `Import ${selectedCategory.label} (CSV)`
            : "Import maps (CSV)"
        }
        subtitle="Upload a CSV file only"
      >
        <div className="card p-6">
          <div className="mb-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">
              Import target
            </div>
            <div className="mt-2 text-xl font-semibold text-[var(--color-ink)]">
              {currentTarget}
            </div>
            <div className="mt-2 text-sm text-[var(--color-ink-muted)]">
              This import is locked to the selected category. Rows from another
              category will be rejected.
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-[var(--color-border)] bg-white p-4">
              <div className="mb-3 text-base font-semibold text-[var(--color-ink)]">
                1) Upload CSV file
              </div>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleCsvChange}
                className="block w-full rounded-lg border border-[var(--color-border)] bg-white p-2.5"
              />
              <div className="mt-2 text-sm text-[var(--color-ink-muted)]">
                {csvFile ? `Selected: ${csvFile.name}` : "No CSV selected yet."}
              </div>
            </div>

            <div className="rounded-xl border border-[var(--color-border)] bg-white p-4">
              <div className="mb-3 text-base font-semibold text-[var(--color-ink)]">
                2) Use the correct columns
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="mb-2 text-sm font-semibold text-[var(--color-ink)]">
                    Required
                  </div>
                  <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--color-ink-muted)]">
                    <li>title</li>
                    <li>slug</li>
                    <li>status</li>
                  </ul>
                </div>
                <div>
                  <div className="mb-2 text-sm font-semibold text-[var(--color-ink)]">
                    {importConfig.label}
                  </div>
                  <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--color-ink-muted)]">
                    {importConfig.columns.map((column) => (
                      <li key={column}>{column}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-4">
              <div className="mb-3 text-base font-semibold text-[var(--color-ink)]">
                Example {selectedCategory ? selectedCategory.label : "Maps"} CSV
              </div>
              <pre className="overflow-x-auto rounded-lg bg-[#0f172a] p-3 text-xs leading-6 text-slate-100 whitespace-pre-wrap">
                {importConfig.example}
              </pre>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className={`btn btn-primary ${parsing || running ? "opacity-60 pointer-events-none" : ""}`}
                onClick={handleImport}
              >
                Start import
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setCsvFile(null);
                  setResults([]);
                }}
              >
                Reset
              </button>
            </div>

            <div className="rounded-xl border border-[var(--color-border)] bg-white p-4">
              <div className="mb-2 text-base font-semibold text-[var(--color-ink)]">
                Progress
              </div>
              {parsing && (
                <div className="text-sm text-[var(--color-ink-muted)]">
                  Parsing CSV…
                </div>
              )}
              {running && (
                <div className="text-sm text-[var(--color-ink-muted)]">
                  Uploading and creating documents…
                </div>
              )}
              {!parsing && !running && results.length === 0 && (
                <div className="text-sm text-[var(--color-ink-muted)]">
                  No import run yet.
                </div>
              )}

              {results.length > 0 && (
                <div className="mt-3 overflow-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr>
                        <th className="py-2">Row</th>
                        <th>Slug</th>
                        <th>Status</th>
                        <th>Message</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((result, index) => (
                        <tr
                          key={index}
                          className={
                            result.status === "error" ? "text-red-600" : ""
                          }
                        >
                          <td className="py-2">{result.row}</td>
                          <td>{result.slug}</td>
                          <td>{result.status}</td>
                          <td>{result.message || ""}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </AdminLayout>
    </>
  );
}
