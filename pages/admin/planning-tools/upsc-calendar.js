import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { doc, getDoc } from "firebase/firestore";
import AdminLayout from "@/layouts/AdminLayout";
import useAdminGate from "@/hooks/admin/useAdminGate";
import { db } from "@/firebase/config";
import { saveUpscCalendarPage } from "@/lib/firestore/publicPages";
import {
  linesToList,
  listToLines,
  normalizeUpscCalendarContent,
} from "@/lib/upscCalendarContent";
import { defaultUpscCalendarContent, UPSC_CALENDAR_PAGE_ID } from "@/data/upsc-calendar-defaults";

const inputClass =
  "w-full rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]";

function Field({ label, children, hint }) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      {children}
      {hint ? <span className="mt-1 block text-xs font-normal text-[var(--color-ink-muted)]">{hint}</span> : null}
    </label>
  );
}

function SectionCard({ title, children }) {
  return (
    <section className="card space-y-4 p-5">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export default function AdminUpscCalendarPage() {
  const { user, loading, isAdmin } = useAdminGate();
  const [form, setForm] = useState(defaultUpscCalendarContent);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAdmin) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDoc(doc(db, "publicPages", UPSC_CALENDAR_PAGE_ID));
        if (!cancelled) {
          setForm(normalizeUpscCalendarContent(snap.exists() ? snap.data() : {}));
        }
      } catch (error) {
        console.error(error);
        toast.error("Could not load UPSC calendar content.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

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
      return next;
    });
  };

  const updateEvent = (index, key, value) => {
    setForm((current) => {
      const next = structuredClone(current);
      next.keyEvents.events[index][key] = value;
      return next;
    });
  };

  const addEvent = () => {
    setForm((current) => ({
      ...current,
      keyEvents: {
        ...current.keyEvents,
        events: [...current.keyEvents.events, { exam: "", event: "", date: "" }],
      },
    }));
  };

  const removeEvent = (index) => {
    setForm((current) => ({
      ...current,
      keyEvents: {
        ...current.keyEvents,
        events: current.keyEvents.events.filter((_, itemIndex) => itemIndex !== index),
      },
    }));
  };

  const updateSidebarDate = (widgetIndex, itemIndex, key, value) => {
    setForm((current) => {
      const next = structuredClone(current);
      next.sidebarWidgets[widgetIndex].items[itemIndex][key] = value;
      return next;
    });
  };

  const updateSidebarLink = (widgetIndex, itemIndex, key, value) => {
    setForm((current) => {
      const next = structuredClone(current);
      next.sidebarWidgets[widgetIndex].items[itemIndex][key] = value;
      return next;
    });
  };

  const updateSidebarWidget = (widgetIndex, key, value) => {
    setForm((current) => {
      const next = structuredClone(current);
      next.sidebarWidgets[widgetIndex][key] = value;
      return next;
    });
  };

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await saveUpscCalendarPage(form, user);
      toast.success("UPSC calendar page updated.");
    } catch (error) {
      console.error(error);
      toast.error("Could not save UPSC calendar page.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen grid place-items-center">Loading...</div>;
  if (!isAdmin) return null;

  const datesWidgetIndex = form.sidebarWidgets.findIndex((widget) => widget.type === "dates");
  const planningLinksIndex = form.sidebarWidgets.findIndex(
    (widget) => widget.type === "links" && widget.title === "Planning Tools"
  );
  const resourceLinksIndex = form.sidebarWidgets.findIndex(
    (widget) => widget.type === "links" && widget.title === "Study Resources"
  );
  const ctaWidgetIndex = form.sidebarWidgets.findIndex((widget) => widget.type === "cta");

  return (
    <AdminLayout
      title="UPSC Calendar Page"
      subtitle="Edit exam dates, official links, sidebar widgets and page content."
      backHref="/admin"
      actions={
        <a href="/planning-tools/upsc-calendar" target="_blank" rel="noreferrer" className="btn btn-ghost">
          View public page
        </a>
      }
    >
      <form onSubmit={save} className="space-y-6">
        <SectionCard title="SEO and hero">
          <Field label="Page title">
            <input className={inputClass} value={form.seo.title} onChange={(e) => updateField("seo.title", e.target.value)} />
          </Field>
          <Field label="Meta description">
            <textarea className={inputClass} rows={3} value={form.seo.description} onChange={(e) => updateField("seo.description", e.target.value)} />
          </Field>
          <Field label="Hero eyebrow">
            <input className={inputClass} value={form.hero.eyebrow} onChange={(e) => updateField("hero.eyebrow", e.target.value)} />
          </Field>
          <Field label="Hero title">
            <input className={inputClass} value={form.hero.title} onChange={(e) => updateField("hero.title", e.target.value)} />
          </Field>
          <Field label="Hero description">
            <textarea className={inputClass} rows={3} value={form.hero.description} onChange={(e) => updateField("hero.description", e.target.value)} />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Updated label">
              <input className={inputClass} value={form.meta.updatedLabel} onChange={(e) => updateField("meta.updatedLabel", e.target.value)} />
            </Field>
            <Field label="Read time">
              <input className={inputClass} value={form.meta.readTime} onChange={(e) => updateField("meta.readTime", e.target.value)} />
            </Field>
          </div>
          <Field label="Publish status">
            <select className={inputClass} value={form.status} onChange={(e) => updateField("status", e.target.value)}>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </Field>
        </SectionCard>

        <SectionCard title="Intro">
          <Field label="Lead paragraph" hint="Use **bold** and [link text](https://example.com)">
            <textarea className={inputClass} rows={4} value={form.intro.lead} onChange={(e) => updateField("intro.lead", e.target.value)} />
          </Field>
          <Field label="Supporting paragraphs" hint="One paragraph per line">
            <textarea
              className={inputClass}
              rows={5}
              value={listToLines(form.intro.paragraphs)}
              onChange={(e) => updateField("intro.paragraphs", linesToList(e.target.value))}
            />
          </Field>
        </SectionCard>

        <SectionCard title="Exam dates table">
          <Field label="Section title">
            <input className={inputClass} value={form.keyEvents.title} onChange={(e) => updateField("keyEvents.title", e.target.value)} />
          </Field>
          <Field label="Section intro">
            <textarea className={inputClass} rows={3} value={form.keyEvents.intro} onChange={(e) => updateField("keyEvents.intro", e.target.value)} />
          </Field>
          <div className="space-y-3">
            {form.keyEvents.events.map((item, index) => (
              <div key={`event-${index}`} className="grid gap-3 rounded-xl border border-[var(--color-border)] p-4 md:grid-cols-[1.2fr_1fr_1fr_auto]">
                <input className={inputClass} value={item.exam} placeholder="Exam name" onChange={(e) => updateEvent(index, "exam", e.target.value)} />
                <input className={inputClass} value={item.event} placeholder="Event" onChange={(e) => updateEvent(index, "event", e.target.value)} />
                <input className={inputClass} value={item.date} placeholder="Date / details" onChange={(e) => updateEvent(index, "date", e.target.value)} />
                <button type="button" className="btn btn-danger" onClick={() => removeEvent(index)}>Remove</button>
              </div>
            ))}
          </div>
          <button type="button" className="btn btn-ghost" onClick={addEvent}>Add exam row</button>
          <Field label="Tip callout">
            <textarea className={inputClass} rows={3} value={form.keyEvents.tipCallout} onChange={(e) => updateField("keyEvents.tipCallout", e.target.value)} />
          </Field>
          <Field label="Note callout">
            <textarea className={inputClass} rows={3} value={form.keyEvents.noteCallout} onChange={(e) => updateField("keyEvents.noteCallout", e.target.value)} />
          </Field>
        </SectionCard>

        <SectionCard title="Official download section">
          <Field label="Section title">
            <input className={inputClass} value={form.download.title} onChange={(e) => updateField("download.title", e.target.value)} />
          </Field>
          <Field label="Intro" hint="Supports official links like [UPSC website](https://www.upsc.gov.in/)">
            <textarea className={inputClass} rows={3} value={form.download.intro} onChange={(e) => updateField("download.intro", e.target.value)} />
          </Field>
          <Field label="Steps" hint="One step per line">
            <textarea
              className={inputClass}
              rows={6}
              value={listToLines(form.download.steps)}
              onChange={(e) => updateField("download.steps", linesToList(e.target.value))}
            />
          </Field>
          <Field label="Closing paragraph">
            <textarea className={inputClass} rows={3} value={form.download.closing} onChange={(e) => updateField("download.closing", e.target.value)} />
          </Field>
        </SectionCard>

        <SectionCard title="Sidebar widgets">
          {ctaWidgetIndex >= 0 ? (
            <div className="space-y-3 rounded-xl border border-[var(--color-border)] p-4">
              <h3 className="font-semibold">CTA box</h3>
              <input className={inputClass} value={form.sidebarWidgets[ctaWidgetIndex].title} onChange={(e) => updateSidebarWidget(ctaWidgetIndex, "title", e.target.value)} />
              <textarea className={inputClass} rows={3} value={form.sidebarWidgets[ctaWidgetIndex].description} onChange={(e) => updateSidebarWidget(ctaWidgetIndex, "description", e.target.value)} />
              <input className={inputClass} value={form.sidebarWidgets[ctaWidgetIndex].href} placeholder="Button link" onChange={(e) => updateSidebarWidget(ctaWidgetIndex, "href", e.target.value)} />
              <input className={inputClass} value={form.sidebarWidgets[ctaWidgetIndex].action} placeholder="Button label" onChange={(e) => updateSidebarWidget(ctaWidgetIndex, "action", e.target.value)} />
            </div>
          ) : null}

          {datesWidgetIndex >= 0 ? (
            <div className="space-y-3 rounded-xl border border-[var(--color-border)] p-4">
              <h3 className="font-semibold">Key exam dates box</h3>
              {form.sidebarWidgets[datesWidgetIndex].items.map((item, index) => (
                <div key={`date-${index}`} className="grid gap-3 md:grid-cols-2">
                  <input className={inputClass} value={item.label} placeholder="Label" onChange={(e) => updateSidebarDate(datesWidgetIndex, index, "label", e.target.value)} />
                  <input className={inputClass} value={item.value} placeholder="Date" onChange={(e) => updateSidebarDate(datesWidgetIndex, index, "value", e.target.value)} />
                </div>
              ))}
            </div>
          ) : null}

          {planningLinksIndex >= 0 ? (
            <div className="space-y-3 rounded-xl border border-[var(--color-border)] p-4">
              <h3 className="font-semibold">Planning tools links</h3>
              {form.sidebarWidgets[planningLinksIndex].items.map((item, index) => (
                <div key={`planning-${index}`} className="grid gap-3 md:grid-cols-2">
                  <input className={inputClass} value={item.label} placeholder="Label" onChange={(e) => updateSidebarLink(planningLinksIndex, index, "label", e.target.value)} />
                  <input className={inputClass} value={item.href} placeholder="/planning-tools/..." onChange={(e) => updateSidebarLink(planningLinksIndex, index, "href", e.target.value)} />
                </div>
              ))}
            </div>
          ) : null}

          {resourceLinksIndex >= 0 ? (
            <div className="space-y-3 rounded-xl border border-[var(--color-border)] p-4">
              <h3 className="font-semibold">Study resources links</h3>
              {form.sidebarWidgets[resourceLinksIndex].items.map((item, index) => (
                <div key={`resource-${index}`} className="grid gap-3 md:grid-cols-2">
                  <input className={inputClass} value={item.label} placeholder="Label" onChange={(e) => updateSidebarLink(resourceLinksIndex, index, "label", e.target.value)} />
                  <input className={inputClass} value={item.href} placeholder="/study-material/..." onChange={(e) => updateSidebarLink(resourceLinksIndex, index, "href", e.target.value)} />
                </div>
              ))}
            </div>
          ) : null}
        </SectionCard>

        <SectionCard title="Important note">
          <Field label="Title">
            <input className={inputClass} value={form.importantNote.title} onChange={(e) => updateField("importantNote.title", e.target.value)} />
          </Field>
          <Field label="Text">
            <textarea className={inputClass} rows={4} value={form.importantNote.text} onChange={(e) => updateField("importantNote.text", e.target.value)} />
          </Field>
        </SectionCard>

        <div className="flex gap-3">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving..." : "Save calendar page"}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
