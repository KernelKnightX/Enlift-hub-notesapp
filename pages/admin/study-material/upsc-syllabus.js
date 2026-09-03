import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { doc, getDoc } from "firebase/firestore";
import AdminLayout from "@/layouts/AdminLayout";
import useAdminGate from "@/hooks/admin/useAdminGate";
import { db } from "@/firebase/config";
import { saveUpscSyllabusPage } from "@/lib/firestore/publicPages";
import { serializePublicPageContent } from "@/lib/firestore/publicPages";
import { defaultUpscSyllabusContent, UPSC_SYLLABUS_PAGE_ID } from "@/data/study-material/upsc-syllabus-defaults";
import {
  Field,
  JsonEditor,
  PreviewLink,
  SectionCard,
  inputClass,
} from "@/components/admin/adminFormStyles";

function PaperEditor({ paper, onChange, onRemove }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold">{paper.title || "Untitled paper"}</h3>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onRemove}>
          Remove
        </button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="ID">
          <input className={inputClass} value={paper.id || ""} onChange={(e) => onChange("id", e.target.value)} />
        </Field>
        <Field label="Title">
          <input className={inputClass} value={paper.title || ""} onChange={(e) => onChange("title", e.target.value)} />
        </Field>
        <Field label="Marks">
          <input className={inputClass} value={paper.marks || ""} onChange={(e) => onChange("marks", e.target.value)} />
        </Field>
        <Field label="Duration">
          <input className={inputClass} value={paper.duration || ""} onChange={(e) => onChange("duration", e.target.value)} />
        </Field>
      </div>
      <Field label="Note (optional)">
        <input className={inputClass} value={paper.note || ""} onChange={(e) => onChange("note", e.target.value)} />
      </Field>
      <Field label="Topics (one per line)">
        <textarea
          className={inputClass}
          rows={5}
          value={(paper.topics || []).join("\n")}
          onChange={(e) => onChange("topics", e.target.value.split("\n").map((line) => line.trim()).filter(Boolean))}
        />
      </Field>
    </div>
  );
}

export default function AdminUpscSyllabusPage() {
  const { user, loading, isAdmin } = useAdminGate();
  const defaults = useMemo(() => defaultUpscSyllabusContent, []);
  const [form, setForm] = useState(defaults);
  const [jsonDraft, setJsonDraft] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAdmin) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDoc(doc(db, "publicPages", UPSC_SYLLABUS_PAGE_ID));
        const merged = serializePublicPageContent(defaults, snap.exists() ? snap.data() : {});
        if (!cancelled) {
          setForm(merged);
          setJsonDraft(JSON.stringify(merged, null, 2));
        }
      } catch (error) {
        console.error(error);
        toast.error("Could not load UPSC syllabus.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAdmin, defaults]);

  const updateField = (path, value) => {
    setForm((current) => {
      const next = structuredClone(current);
      const keys = path.split(".");
      let cursor = next;
      keys.slice(0, -1).forEach((key) => {
        cursor[key] = cursor[key] || {};
        cursor = cursor[key];
      });
      cursor[keys[keys.length - 1]] = value;
      setJsonDraft(JSON.stringify(next, null, 2));
      return next;
    });
  };

  const updatePaper = (section, index, key, value) => {
    setForm((current) => {
      const next = structuredClone(current);
      next[section][index][key] = value;
      setJsonDraft(JSON.stringify(next, null, 2));
      return next;
    });
  };

  const addPaper = (section) => {
    setForm((current) => {
      const next = structuredClone(current);
      next[section].push({
        id: `paper-${Date.now()}`,
        title: "",
        marks: "",
        duration: "",
        topics: [],
      });
      setJsonDraft(JSON.stringify(next, null, 2));
      return next;
    });
  };

  const removePaper = (section, index) => {
    setForm((current) => {
      const next = structuredClone(current);
      next[section] = next[section].filter((_, itemIndex) => itemIndex !== index);
      setJsonDraft(JSON.stringify(next, null, 2));
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveUpscSyllabusPage(form, user);
      toast.success("UPSC syllabus saved.");
    } catch (error) {
      console.error(error);
      toast.error("Could not save UPSC syllabus.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[var(--color-bg)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-border-strong)] border-t-[var(--color-primary)]" />
      </div>
    );
  }
  if (!isAdmin) return null;

  return (
    <AdminLayout
      title="UPSC Syllabus"
      subtitle="Edit preliminary and main examination papers shown on the public syllabus page."
      actions={<PreviewLink href="/study-material/upsc-syllabus" />}
    >
      <div className="space-y-6">
        <SectionCard title="Publish settings">
          <Field label="Status">
            <select className={inputClass} value={form.status || "published"} onChange={(e) => updateField("status", e.target.value)}>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </Field>
        </SectionCard>

        <SectionCard title="Hero & SEO">
          <div className="grid gap-4">
            <Field label="Hero title">
              <input className={inputClass} value={form.hero?.title || ""} onChange={(e) => updateField("hero.title", e.target.value)} />
            </Field>
            <Field label="Hero description">
              <textarea className={inputClass} rows={2} value={form.hero?.description || ""} onChange={(e) => updateField("hero.description", e.target.value)} />
            </Field>
            <Field label="SEO title">
              <input className={inputClass} value={form.seo?.title || ""} onChange={(e) => updateField("seo.title", e.target.value)} />
            </Field>
            <Field label="SEO description">
              <textarea className={inputClass} rows={2} value={form.seo?.description || ""} onChange={(e) => updateField("seo.description", e.target.value)} />
            </Field>
          </div>
        </SectionCard>

        <SectionCard title="Section intros">
          <div className="grid gap-4">
            <Field label="Preliminary intro">
              <textarea className={inputClass} rows={2} value={form.prelimIntro || ""} onChange={(e) => updateField("prelimIntro", e.target.value)} />
            </Field>
            <Field label="Main examination intro">
              <textarea className={inputClass} rows={2} value={form.mainIntro || ""} onChange={(e) => updateField("mainIntro", e.target.value)} />
            </Field>
          </div>
        </SectionCard>

        <SectionCard
          title="Preliminary papers"
          actions={<button type="button" className="btn btn-secondary btn-sm" onClick={() => addPaper("prelimPapers")}>Add paper</button>}
        >
          <div className="space-y-4">
            {form.prelimPapers.map((paper, index) => (
              <PaperEditor
                key={`${paper.id}-${index}`}
                paper={paper}
                onChange={(key, value) => updatePaper("prelimPapers", index, key, value)}
                onRemove={() => removePaper("prelimPapers", index)}
              />
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Main examination papers"
          actions={<button type="button" className="btn btn-secondary btn-sm" onClick={() => addPaper("mainPapers")}>Add paper</button>}
        >
          <div className="space-y-4">
            {form.mainPapers.map((paper, index) => (
              <PaperEditor
                key={`${paper.id}-${index}`}
                paper={paper}
                onChange={(key, value) => updatePaper("mainPapers", index, key, value)}
                onRemove={() => removePaper("mainPapers", index)}
              />
            ))}
          </div>
        </SectionCard>

        <SectionCard title="PDF download">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={!!form.pdfDownload?.enabled}
                onChange={(e) => updateField("pdfDownload.enabled", e.target.checked)}
              />
              Enable PDF download button
            </label>
            <Field label="PDF URL">
              <input className={inputClass} value={form.pdfDownload?.url || ""} onChange={(e) => updateField("pdfDownload.url", e.target.value)} />
            </Field>
            <Field label="Button label">
              <input className={inputClass} value={form.pdfDownload?.label || ""} onChange={(e) => updateField("pdfDownload.label", e.target.value)} />
            </Field>
            <Field label="Hint text">
              <input className={inputClass} value={form.pdfDownload?.hint || ""} onChange={(e) => updateField("pdfDownload.hint", e.target.value)} />
            </Field>
          </div>
        </SectionCard>

        <SectionCard title="Advanced JSON">
          <JsonEditor
            value={jsonDraft}
            onChange={(value) => {
              setJsonDraft(value);
              try {
                setForm(serializePublicPageContent(defaults, JSON.parse(value)));
              } catch {
                // keep form until valid JSON on save
              }
            }}
            rows={16}
          />
        </SectionCard>

        <div className="flex justify-end">
          <button type="button" className="btn btn-primary" disabled={saving} onClick={handleSave}>
            {saving ? "Saving…" : "Save syllabus"}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
