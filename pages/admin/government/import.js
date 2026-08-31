import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Papa from "papaparse";
import AdminLayout from "@/layouts/AdminLayout";
import useAdminGate from "@/hooks/admin/useAdminGate";
import { toast } from "react-toastify";
import {
  GOV_SECTIONS,
  createGovItem,
  isValidSection,
  sectionLabel,
} from "@/lib/firestore/government";
import {
  buildGovDocFromImportRow,
  getGovImportConfig,
  GOV_IMPORT_ALIASES,
} from "@/lib/governmentSectionFields";

const DEFAULT_IMPORT_CONFIG = {
  label: "Optional fields",
  columns: ["region", "summary", "upscFact"],
  example: `title,slug,status,section,region,summary,upscFact
Sample Item,sample-item,published,schemes,National,Short summary,Optional UPSC note`,
};

export default function AdminGovernmentImportPage() {
  const { loading, isAdmin } = useAdminGate();
  const router = useRouter();
  const sectionParam = router.query.section;
  const [csvFile, setCsvFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState([]);

  const selectedSection = useMemo(
    () => GOV_SECTIONS.find((section) => section.value === sectionParam),
    [sectionParam],
  );

  const importConfig = useMemo(() => {
    if (!selectedSection) return DEFAULT_IMPORT_CONFIG;
    return getGovImportConfig(selectedSection.value) || DEFAULT_IMPORT_CONFIG;
  }, [selectedSection]);

  if (loading) return null;
  if (!isAdmin) return null;

  if (router.isReady && sectionParam && !isValidSection(sectionParam)) {
    return (
      <AdminLayout title="Government Import" subtitle="Unknown section">
        <div className="card p-12 text-center">Unknown section</div>
      </AdminLayout>
    );
  }

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
    GOV_IMPORT_ALIASES.forEach(([field, aliases]) => {
      const value = resolveCsvValue(row, aliases);
      if (value) row[field] = value;
    });
    return row;
  };

  const validateRow = (row) => {
    const title = resolveCsvValue(row, ["title", "Title"]);
    const slug = resolveCsvValue(row, ["slug", "Slug"]);
    const status = resolveCsvValue(row, ["status", "Status"]);

    if (!title || !slug || !status) {
      return "Missing required field (title/slug/status)";
    }

    row.title = title;
    row.slug = slug;
    row.status = status;

    if (selectedSection) {
      const sectionValue = resolveCsvValue(row, ["section", "Section"]);
      if (sectionValue && sectionValue !== selectedSection.value) {
        return `Row section '${sectionValue}' does not match import section '${selectedSection.value}'`;
      }
      row.section = selectedSection.value;
    }

    if (!row.section) return "Missing section for row";
    if (!isValidSection(row.section)) return `Unknown section: ${row.section}`;
    return null;
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
        if (!rows || rows.length === 0) return toast.error("CSV contains no rows.");
        setRunning(true);
        const out = [];

        for (let index = 0; index < rows.length; index += 1) {
          const trimmed = {};
          Object.keys(rows[index]).forEach((key) => {
            trimmed[key.trim()] = (rows[index][key] || "").toString().trim();
          });

          if (trimmed.section === undefined && selectedSection) {
            trimmed.section = selectedSection.value;
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

          if (selectedSection) trimmed.section = selectedSection.value;

          try {
            await createGovItem(buildGovDocFromImportRow(trimmed));
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

  const currentTarget = selectedSection
    ? `${selectedSection.label} (${selectedSection.value})`
    : "All government sections";

  return (
    <>
      <Head>
        <title>
          {selectedSection
            ? `Import ${selectedSection.label}`
            : "Import Government Items"}
        </title>
      </Head>

      <AdminLayout
        title={
          selectedSection
            ? `Import ${selectedSection.label} (CSV)`
            : "Import government items (CSV)"
        }
        subtitle="Upload a CSV file only"
        backHref={selectedSection ? `/admin/government/${selectedSection.value}` : "/admin/government"}
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
              This import is locked to the selected section. Rows from another section will be rejected.
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
                onChange={(event) => setCsvFile(event.target.files?.[0] || null)}
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
                    {selectedSection ? null : <li>section</li>}
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
                Example {selectedSection ? sectionLabel(selectedSection.value) : "Government"} CSV
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
              {parsing && <div className="text-sm text-[var(--color-ink-muted)]">Parsing CSV…</div>}
              {running && <div className="text-sm text-[var(--color-ink-muted)]">Uploading and creating documents…</div>}
              {!parsing && !running && results.length === 0 && (
                <div className="text-sm text-[var(--color-ink-muted)]">No import run yet.</div>
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
                        <tr key={index} className={result.status === "error" ? "text-red-600" : ""}>
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
