import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { doc, getDoc } from "firebase/firestore";
import AdminLayout from "@/layouts/AdminLayout";
import useAdminGate from "@/hooks/admin/useAdminGate";
import { db } from "@/firebase/config";
import { savePublicPage, serializePublicPageContent } from "@/lib/firestore/publicPages";
import {
  Field,
  JsonEditor,
  PreviewLink,
  SectionCard,
  inputClass,
} from "@/components/admin/adminFormStyles";

export default function PlanningContentEditor({
  pageId,
  label,
  publicPath,
  getDefaults,
  subtitle,
}) {
  const { user, loading, isAdmin } = useAdminGate();
  const defaults = useMemo(() => getDefaults(), [getDefaults]);
  const [form, setForm] = useState(defaults);
  const [jsonDraft, setJsonDraft] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAdmin) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDoc(doc(db, "publicPages", pageId));
        const merged = serializePublicPageContent(defaults, snap.exists() ? snap.data() : {});
        if (!cancelled) {
          setForm(merged);
          setJsonDraft(JSON.stringify(merged, null, 2));
        }
      } catch (error) {
        console.error(error);
        toast.error(`Could not load ${label}.`);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAdmin, pageId, defaults, label]);

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

  const applyJsonDraft = () => {
    try {
      const parsed = JSON.parse(jsonDraft);
      const merged = serializePublicPageContent(defaults, parsed);
      setForm(merged);
      setJsonDraft(JSON.stringify(merged, null, 2));
      toast.success("JSON applied to the editor.");
    } catch (error) {
      toast.error("Invalid JSON. Fix syntax before applying.");
    }
  };

  const resetDefaults = () => {
    if (!window.confirm("Reset this page to built-in defaults? Unsaved CMS changes will be replaced in the editor.")) {
      return;
    }
    setForm(defaults);
    setJsonDraft(JSON.stringify(defaults, null, 2));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let payload = form;
      try {
        payload = serializePublicPageContent(defaults, JSON.parse(jsonDraft));
      } catch {
        toast.error("Fix JSON syntax before saving.");
        return;
      }
      await savePublicPage(pageId, payload, user);
      setForm(payload);
      setJsonDraft(JSON.stringify(payload, null, 2));
      toast.success(`${label} saved.`);
    } catch (error) {
      console.error(error);
      toast.error(`Could not save ${label}.`);
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
      title={label}
      subtitle={subtitle || `Edit ${label} content stored in Firestore publicPages.`}
      actions={<PreviewLink href={publicPath} />}
    >
      <div className="space-y-6">
        <SectionCard title="Publish settings">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Status">
              <select
                className={inputClass}
                value={form.status || "published"}
                onChange={(event) => updateField("status", event.target.value)}
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </Field>
          </div>
        </SectionCard>

        <SectionCard title="SEO & hero">
          <div className="grid gap-4">
            <Field label="SEO title">
              <input
                className={inputClass}
                value={form.seo?.title || ""}
                onChange={(event) => updateField("seo.title", event.target.value)}
              />
            </Field>
            <Field label="SEO description">
              <textarea
                className={inputClass}
                rows={2}
                value={form.seo?.description || ""}
                onChange={(event) => updateField("seo.description", event.target.value)}
              />
            </Field>
            {form.seo?.keywords !== undefined ? (
              <Field label="SEO keywords">
                <input
                  className={inputClass}
                  value={form.seo?.keywords || ""}
                  onChange={(event) => updateField("seo.keywords", event.target.value)}
                />
              </Field>
            ) : null}
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Hero eyebrow">
                <input
                  className={inputClass}
                  value={form.hero?.eyebrow || ""}
                  onChange={(event) => updateField("hero.eyebrow", event.target.value)}
                />
              </Field>
              <Field label="Hero title">
                <input
                  className={inputClass}
                  value={form.hero?.title || ""}
                  onChange={(event) => updateField("hero.title", event.target.value)}
                />
              </Field>
              <Field label="Hero description">
                <textarea
                  className={inputClass}
                  rows={2}
                  value={form.hero?.description || ""}
                  onChange={(event) => updateField("hero.description", event.target.value)}
                />
              </Field>
            </div>
            {form.meta ? (
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Updated label">
                  <input
                    className={inputClass}
                    value={form.meta?.updatedLabel || ""}
                    onChange={(event) => updateField("meta.updatedLabel", event.target.value)}
                  />
                </Field>
                <Field label="Read time">
                  <input
                    className={inputClass}
                    value={form.meta?.readTime || ""}
                    onChange={(event) => updateField("meta.readTime", event.target.value)}
                  />
                </Field>
              </div>
            ) : null}
          </div>
        </SectionCard>

        <SectionCard
          title="Full page content (JSON)"
          actions={(
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn btn-secondary btn-sm" onClick={resetDefaults}>
                Reset defaults
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={applyJsonDraft}>
                Apply JSON
              </button>
            </div>
          )}
        >
          <p className="text-sm text-[var(--color-ink-muted)]">
            Edit sections, sidebars, FAQs, and other structured content here. Use Apply JSON after changes, then Save.
          </p>
          <JsonEditor value={jsonDraft} onChange={setJsonDraft} rows={24} />
        </SectionCard>

        <div className="flex justify-end">
          <button type="button" className="btn btn-primary" disabled={saving} onClick={handleSave}>
            {saving ? "Saving…" : "Save page"}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
