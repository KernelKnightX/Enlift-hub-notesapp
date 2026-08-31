import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { sectionLabel } from "@/lib/firestore/government";
import { uploadMapFile, slugify } from "@/lib/firestore/maps";
import {
  buildGovPayload,
  getGovSectionAdmin,
} from "@/lib/governmentSectionFields";

const labelCls = "mb-1.5 block text-[13px] font-semibold text-[var(--color-ink-2)]";
const inputCls = "map-form-input";
const fileInputCls = "map-form-input map-form-file";

function asText(value) {
  if (value === undefined || value === null) return "";
  return String(value);
}

export default function GovernmentSectionForm({
  section,
  initialItem = null,
  user,
  onSubmit,
}) {
  const router = useRouter();
  const config = getGovSectionAdmin(section);
  const isEditing = Boolean(initialItem?.id);

  const initialValues = useMemo(() => {
    const values = {
      title: "",
      slug: "",
      region: "",
      summary: "",
      status: "draft",
    };
    config?.fields.forEach((field) => {
      values[field.key] = "";
    });
    return values;
  }, [config]);

  const [values, setValues] = useState(initialValues);
  const [slugEdited, setSlugEdited] = useState(isEditing);
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    if (!initialItem) return;
    const next = { ...initialValues };
    next.title = initialItem.title || "";
    next.slug = initialItem.slug || "";
    next.region = initialItem.region || "";
    next.summary = initialItem.summary || "";
    next.status = initialItem.status || "draft";
    config?.fields.forEach((field) => {
      next[field.key] = asText(initialItem[field.key]);
    });
    setValues(next);
    setImageUrl(initialItem.imageUrl || initialItem.thumbnailUrl || "");
    setPdfUrl(initialItem.pdfUrl || "");
    setSlugEdited(true);
  }, [initialItem, initialValues, config]);

  useEffect(() => {
    if (imageFile) {
      const previewUrl = URL.createObjectURL(imageFile);
      setImagePreview(previewUrl);
      return () => URL.revokeObjectURL(previewUrl);
    }
    setImagePreview(imageUrl || initialItem?.thumbnailUrl || initialItem?.imageUrl || "");
  }, [imageFile, imageUrl, initialItem?.thumbnailUrl, initialItem?.imageUrl]);

  const setField = (key, value) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const handleTitleChange = (event) => {
    const nextTitle = event.target.value;
    setField("title", nextTitle);
    if (!slugEdited) setField("slug", slugify(nextTitle));
  };

  const handleSlugChange = (event) => {
    setSlugEdited(true);
    setField("slug", slugify(event.target.value));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!values.title.trim() || !values.slug.trim() || !values.status) {
      toast.error("Title, slug and status are required.");
      return;
    }

    const existingImage = initialItem?.imageUrl || initialItem?.thumbnailUrl || "";
    if (!isEditing && !imageFile && !imageUrl.trim()) {
      toast.error("Provide an image file or image URL.");
      return;
    }

    setSaving(true);
    try {
      const cleanSlug = slugify(values.slug);
      let uploadedImageUrl = imageUrl.trim() || existingImage;
      let uploadedPdfUrl = pdfUrl.trim() || initialItem?.pdfUrl || "";

      if (imageFile) uploadedImageUrl = await uploadMapFile(imageFile, cleanSlug, "image");
      if (pdfFile) uploadedPdfUrl = await uploadMapFile(pdfFile, cleanSlug, "pdf");

      const payload = buildGovPayload(
        section,
        { ...values, slug: cleanSlug },
        user,
        {
          imageUrl: uploadedImageUrl || undefined,
          pdfUrl: uploadedPdfUrl || undefined,
        },
      );

      await onSubmit(payload);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  if (!config) {
    return (
      <div className="card p-8 text-center text-[var(--color-ink-muted)]">
        Unknown government section.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card overflow-hidden">
      <div className="hairline-b bg-[var(--color-surface-alt)] px-5 py-4">
        <h2 className="text-[15px] font-semibold text-[var(--color-ink)]">
          {isEditing ? `Edit ${config.label.toLowerCase()}` : `Add ${config.label.toLowerCase()}`}
        </h2>
        <p className="mt-1 text-[13px] text-[var(--color-ink-muted)]">
          Fields match the {sectionLabel(section).toLowerCase()} CSV import columns.
        </p>
      </div>

      <div className="map-form-layout">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Title *</label>
              <input className={inputCls} value={values.title} onChange={handleTitleChange} required />
            </div>
            <div>
              <label className={labelCls}>Slug *</label>
              <input className={inputCls} value={values.slug} onChange={handleSlugChange} required />
            </div>
          </div>

          <div>
            <label className={labelCls}>Region</label>
            <input className={inputCls} value={values.region} onChange={(event) => setField("region", event.target.value)} />
          </div>

          <div>
            <label className={labelCls}>Summary</label>
            <textarea
              className={inputCls}
              rows={4}
              value={values.summary}
              onChange={(event) => setField("summary", event.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {config.fields.map((field) => {
              const commonProps = {
                key: field.key,
                className: inputCls,
                value: values[field.key] ?? "",
                onChange: (event) => setField(field.key, event.target.value),
              };

              if (field.type === "textarea") {
                return (
                  <div key={field.key} className={field.fullWidth ? "sm:col-span-2" : ""}>
                    <label className={labelCls}>{field.label}</label>
                    <textarea className={inputCls} rows={field.rows || 4} {...commonProps} />
                  </div>
                );
              }

              return (
                <div key={field.key} className={field.fullWidth ? "sm:col-span-2" : ""}>
                  <label className={labelCls}>{field.label}</label>
                  <input type="text" {...commonProps} />
                </div>
              );
            })}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Image upload {!isEditing ? "*" : ""}</label>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => setImageFile(event.target.files?.[0] || null)}
                className={fileInputCls}
              />
              <label className={`${labelCls} mt-3`}>Or image URL</label>
              <input
                className={inputCls}
                placeholder="https://..."
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>PDF upload</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(event) => setPdfFile(event.target.files?.[0] || null)}
                className={fileInputCls}
              />
              <label className={`${labelCls} mt-3`}>Or PDF URL</label>
              <input
                className={inputCls}
                placeholder="https://..."
                value={pdfUrl}
                onChange={(event) => setPdfUrl(event.target.value)}
              />
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-4">
            <div className="mb-2 text-[13px] font-semibold text-[var(--color-ink-2)]">Preview</div>
            <div className="aspect-[4/3] overflow-hidden rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface)]">
              {imagePreview ? (
                <img src={imagePreview} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full place-items-center text-[13px] text-[var(--color-ink-faint)]">
                  No image selected
                </div>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="chip chip-primary">{sectionLabel(section)}</span>
              <span className={`chip ${values.status === "published" ? "chip-green" : "chip-amber"}`}>
                {values.status === "published" ? "Published" : "Draft"}
              </span>
            </div>
          </div>

          <div className="rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <label className={labelCls}>Status *</label>
            <select
              className={inputCls}
              value={values.status}
              onChange={(event) => setField("status", event.target.value)}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </aside>
      </div>

      <div className="hairline-t flex flex-wrap justify-end gap-2 bg-[var(--color-surface-alt)] px-5 py-4">
        <button type="button" className="btn" onClick={() => router.push(`/admin/government/${section}`)}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Saving..." : isEditing ? "Save changes" : `Create ${config.label.toLowerCase()}`}
        </button>
      </div>
    </form>
  );
}
