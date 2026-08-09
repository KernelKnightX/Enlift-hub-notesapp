import { useState, useMemo } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Papa from "papaparse";
import AdminLayout from "@/components/admin/AdminLayout";
import useAdminGate from "@/hooks/admin/useAdminGate";
import { toast } from "react-toastify";
import { MAP_CATEGORIES, uploadMapFile, createMap } from "@/lib/firestore/maps";

export default function AdminMapsImportPage() {
  const { loading, isAdmin } = useAdminGate();
  const router = useRouter();
  const categoryParam = router.query.category;
  const [csvFile, setCsvFile] = useState(null);
  const [assetFiles, setAssetFiles] = useState([]);
  const [parsing, setParsing] = useState(false);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState([]);

  const selectedCategory = useMemo(() => MAP_CATEGORIES.find((c) => c.value === categoryParam), [categoryParam]);

  if (loading) return null;
  if (!isAdmin) return null;

  const handleCsvChange = (e) => {
    setCsvFile(e.target.files?.[0] || null);
  };

  const handleFilesChange = (e) => {
    setAssetFiles(Array.from(e.target.files || []));
  };

  const findAssetByName = (name) => {
    if (!name) return null;
    return assetFiles.find((f) => f.name === name) || null;
  };

  const basename = (name = "") => (name ? name.replace(/\.[^/.]+$/, "") : "");
  const findAssetBySlug = (slug) => {
    if (!slug) return null;
    return assetFiles.find((f) => basename(f.name) === slug) || null;
  };

  const validateRow = (row) => {
    // required: title, slug, status; category may be set by import param
    if (!row.title || !row.slug || !row.status) return "Missing required field (title/slug/status)";
    if (selectedCategory) {
      // enforce or inject selected category
      if (row.category && row.category !== selectedCategory.value) return `Row category '${row.category}' does not match import category '${selectedCategory.value}'`;
      row.category = selectedCategory.value;
    }
    if (!row.category) return "Missing category for row";
    const categoryOk = MAP_CATEGORIES.some((c) => c.value === row.category);
    if (!categoryOk) return `Unknown category: ${row.category}`;
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

        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          const trimmed = {};
          Object.keys(row).forEach((k) => { trimmed[k.trim()] = (row[k] || "").toString().trim(); });

          const error = validateRow(trimmed);
          if (error) {
            out.push({ row: i + 1, slug: trimmed.slug || "", status: "error", message: error });
            continue;
          }

          // if selectedCategory is provided, ensure trimmed.category is set
          if (selectedCategory) trimmed.category = selectedCategory.value;

          try {
            // Enforce slug-based filenames: if imageFilename/pdfFilename provided they must have basename === slug
            const imageFilenameCol = (trimmed.imageFilename || "").toString().trim();
            const pdfFilenameCol = (trimmed.pdfFilename || "").toString().trim();

            if (imageFilenameCol && basename(imageFilenameCol) !== trimmed.slug) {
              out.push({ row: i + 1, slug: trimmed.slug, status: "error", message: `imageFilename must match slug (expected basename '${trimmed.slug}')` });
              continue;
            }
            if (pdfFilenameCol && basename(pdfFilenameCol) !== trimmed.slug) {
              out.push({ row: i + 1, slug: trimmed.slug, status: "error", message: `pdfFilename must match slug (expected basename '${trimmed.slug}')` });
              continue;
            }

            // Prefer exact filename match, otherwise look up by slug (basename)
            const imageFile = imageFilenameCol ? findAssetByName(imageFilenameCol) : findAssetBySlug(trimmed.slug);
            const pdfFile = pdfFilenameCol ? findAssetByName(pdfFilenameCol) : findAssetBySlug(trimmed.slug);

            if (imageFilenameCol && !imageFile) {
              out.push({ row: i + 1, slug: trimmed.slug, status: "error", message: `Image file '${imageFilenameCol}' not uploaded` });
              continue;
            }
            if (pdfFilenameCol && !pdfFile) {
              out.push({ row: i + 1, slug: trimmed.slug, status: "error", message: `PDF file '${pdfFilenameCol}' not uploaded` });
              continue;
            }

            let imageUrl = "";
            let pdfUrl = "";

            if (imageFile) {
              imageUrl = await uploadMapFile(imageFile, trimmed.slug, "image");
            }
            if (pdfFile) {
              pdfUrl = await uploadMapFile(pdfFile, trimmed.slug, "pdf");
            }

            // Build document using exact Firestore schema fields
            const doc = {
              title: trimmed.title,
              slug: trimmed.slug,
              category: trimmed.category,
              status: trimmed.status,
            };

            // common optional fields
            if (trimmed.region) doc.region = trimmed.region;
            if (imageUrl) { doc.imageUrl = imageUrl; doc.thumbnailUrl = imageUrl; }
            if (pdfUrl) doc.pdfUrl = pdfUrl;
            if (trimmed.upscFact) doc.upscFact = trimmed.upscFact;

            // india-states specific
            if (trimmed.category === 'india-states') {
              if (trimmed.capital) doc.capital = trimmed.capital;
              if (trimmed.districtsCount) doc.districtsCount = Number(trimmed.districtsCount);
              if (trimmed.area) doc.area = trimmed.area;
            }

            // river-systems specific
            if (trimmed.category === 'river-systems') {
              if (trimmed.origin) doc.origin = trimmed.origin;
              if (trimmed.mouth) doc.mouth = trimmed.mouth;
              if (trimmed.lengthKm) doc.lengthKm = Number(trimmed.lengthKm);
              if (trimmed.statesCovered) doc.statesCovered = trimmed.statesCovered;
              if (trimmed.tributaries) doc.tributaries = trimmed.tributaries;
            }

            // other optional generic fields
            if (trimmed.capital && !doc.capital) doc.capital = trimmed.capital;

            await createMap(doc);
            out.push({ row: i + 1, slug: trimmed.slug, status: "ok" });
          } catch (err) {
            console.error(err);
            out.push({ row: i + 1, slug: rows[i]?.slug || "", status: "error", message: err.message || String(err) });
          }
        }

        setResults(out);
        setRunning(false);
        toast.success("Import complete");
      },
      error: (err) => {
        setParsing(false);
        toast.error("CSV parse failed: " + err.message);
      },
    });
  };

  return (
    <>
      <Head>
        <title>Import Maps · Admin</title>
      </Head>
      <AdminLayout title="Import maps (CSV)" subtitle="Bulk upload maps with images and optional PDFs">
        <div className="card p-6">
          <div className="mb-4">
            <label className="block font-semibold mb-1">CSV file</label>
            <input type="file" accept=".csv,text/csv" onChange={handleCsvChange} />
            <div className="text-sm text-[var(--color-ink-muted)] mt-2">Required headers: title,slug,status. Optional headers: category,region,capital,districtsCount,area,origin,mouth,lengthKm,statesCovered,tributaries,upscFact,imageFilename,pdfFilename
              {selectedCategory ? (
                <div className="mt-2 text-sm">Importing for category: <strong>{selectedCategory.label} ({selectedCategory.value})</strong>. Rows with a different category will fail; category column may be omitted.</div>
              ) : null}
            </div>
          </div>

          <div className="mb-4">
            <label className="block font-semibold mb-1">Image / PDF files (select all)</label>
            <input type="file" accept="image/*,.pdf" onChange={handleFilesChange} multiple />
            <div className="text-sm text-[var(--color-ink-muted)] mt-2">Image filenames should match imageFilename column or be &lt;slug&gt;.png/jpg. PDFs are optional and matched by pdfFilename column.</div>
          </div>

          <div className="flex gap-3">
            <button type="button" className={`btn btn-primary ${parsing || running ? "opacity-60 pointer-events-none" : ""}`} onClick={handleImport}>Start import</button>
            <button type="button" className="btn" onClick={() => { setCsvFile(null); setAssetFiles([]); setResults([]); }}>Reset</button>
          </div>

          <div className="mt-6">
            <h4 className="font-semibold">Progress</h4>
            {parsing && <div>Parsing CSV…</div>}
            {running && <div>Uploading and creating documents…</div>}
            {!parsing && !running && results.length === 0 && <div className="text-sm text-[var(--color-ink-muted)]">No import run yet.</div>}

            {results.length > 0 && (
              <div className="mt-3">
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
                    {results.map((r, idx) => (
                      <tr key={idx} className={r.status === 'error' ? 'text-red-600' : ''}>
                        <td className="py-2">{r.row}</td>
                        <td>{r.slug}</td>
                        <td>{r.status}</td>
                        <td>{r.message || ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
    </>
  );
}
