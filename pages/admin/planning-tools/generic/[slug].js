import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { doc, getDoc } from "firebase/firestore";
import AdminLayout from "@/layouts/AdminLayout";
import useAdminGate from "@/hooks/admin/useAdminGate";
import { db } from "@/firebase/config";
import { savePublicPage, serializePublicPageContent } from "@/lib/firestore/publicPages";
import { getGenericPlanningPageBySlug } from "@/lib/planning/planningPagesConfig";
import { contentBySlug } from "@/components/public/GenericPublicPage";
import {
  Field,
  JsonEditor,
  PreviewLink,
  SectionCard,
  inputClass,
} from "@/components/admin/adminFormStyles";

function getBuiltInDefaults(slug) {
  if (contentBySlug[slug]) {
    return { slug, status: "published", ...contentBySlug[slug] };
  }
  return { slug, status: "published" };
}

export default function AdminGenericPlanningPage() {
  const router = useRouter();
  const slug = typeof router.query.slug === "string" ? router.query.slug : "";
  const page = getGenericPlanningPageBySlug(slug);
  const { user, loading, isAdmin } = useAdminGate();
  const defaults = useMemo(() => getBuiltInDefaults(slug), [slug]);
  const [form, setForm] = useState(defaults);
  const [jsonDraft, setJsonDraft] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAdmin || !page) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDoc(doc(db, "publicPages", page.pageId));
        const merged = serializePublicPageContent(defaults, snap.exists() ? snap.data() : {});
        if (!cancelled) {
          setForm(merged);
          setJsonDraft(JSON.stringify(merged, null, 2));
        }
      } catch (error) {
        console.error(error);
        toast.error(`Could not load ${page.label}.`);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAdmin, page, defaults]);

  if (!router.isReady) return null;
  if (!page) {
    router.replace("/admin/planning-tools");
    return null;
  }

  const updateField = (key, value) => {
    setForm((current) => {
      const next = { ...current, [key]: value };
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
      toast.success("JSON applied.");
    } catch {
      toast.error("Invalid JSON.");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = serializePublicPageContent(defaults, JSON.parse(jsonDraft));
      await savePublicPage(page.pageId, payload, user);
      setForm(payload);
      setJsonDraft(JSON.stringify(payload, null, 2));
      toast.success(`${page.label} saved.`);
    } catch (error) {
      console.error(error);
      toast.error(error.message?.includes("JSON") ? "Fix JSON syntax before saving." : `Could not save ${page.label}.`);
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
      title={page.label}
      subtitle="Edit hero, cards, FAQs, and related links for this planning guide page."
      actions={<PreviewLink href={page.publicPath} />}
    >
      <div className="space-y-6">
        <SectionCard title="Publish settings">
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
        </SectionCard>

        <SectionCard title="Hero & SEO">
          <div className="grid gap-4">
            <Field label="SEO title">
              <input className={inputClass} value={form.seoTitle || ""} onChange={(e) => updateField("seoTitle", e.target.value)} />
            </Field>
            <Field label="Meta description">
              <textarea className={inputClass} rows={2} value={form.metaDescription || ""} onChange={(e) => updateField("metaDescription", e.target.value)} />
            </Field>
            <Field label="Hero title">
              <input className={inputClass} value={form.heroTitle || ""} onChange={(e) => updateField("heroTitle", e.target.value)} />
            </Field>
            <Field label="Hero description">
              <textarea className={inputClass} rows={2} value={form.heroDescription || ""} onChange={(e) => updateField("heroDescription", e.target.value)} />
            </Field>
          </div>
        </SectionCard>

        <SectionCard
          title="Structured content (JSON)"
          actions={(
            <button type="button" className="btn btn-secondary btn-sm" onClick={applyJsonDraft}>
              Apply JSON
            </button>
          )}
        >
          <p className="text-sm text-[var(--color-ink-muted)]">
            Edit stats, highlights, cards, checklist, related links, and FAQs in JSON.
          </p>
          <JsonEditor value={jsonDraft} onChange={setJsonDraft} rows={22} />
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
