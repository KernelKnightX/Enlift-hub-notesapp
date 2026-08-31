import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import {
  createMap,
  slugify,
  updateMap,
  uploadMapFile,
} from "@/lib/firestore/maps";
import {
  buildMapPayload,
  getMapCategoryAdmin,
  getMapCategoryListPath,
} from "@/lib/mapCategoryFields";

const labelCls = "mb-1.5 block text-[13px] font-semibold text-[var(--color-ink-2)]";
const inputCls = "map-form-input";
const fileInputCls = "map-form-input map-form-file";

function asText(value) {
  if (value === undefined || value === null) return "";
  return String(value);
}

export default function CategoryMapForm({ category, initialMap = null, user }) {
  const router = useRouter();
  const config = getMapCategoryAdmin(category);
  const isEditing = Boolean(initialMap?.id);
  const listPath = getMapCategoryListPath(category);

  const initialValues = useMemo(() => {
    const values = {
      title: "",
      slug: "",
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
    if (!initialMap) return;
    const next = { ...initialValues };
    next.title = initialMap.title || "";
    next.slug = initialMap.slug || "";
    next.status = initialMap.status || "draft";
    config?.fields.forEach((field) => {
      next[field.key] = asText(initialMap[field.key]);
    });
    setValues(next);
    setImageUrl(initialMap.imageUrl || "");
    setPdfUrl(initialMap.pdfUrl || "");
    setSlugEdited(true);
  }, [initialMap, initialValues, config]);

  useEffect(() => {
    if (imageFile) {
      const previewUrl = URL.createObjectURL(imageFile);
      setImagePreview(previewUrl);
      return () => URL.revokeObjectURL(previewUrl);
    }
    setImagePreview(imageUrl || initialMap?.thumbnailUrl || initialMap?.imageUrl || "");
  }, [imageFile, imageUrl, initialMap?.thumbnailUrl, initialMap?.imageUrl]);

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

    const existingImage = initialMap?.imageUrl || initialMap?.thumbnailUrl || "";
    if (!imageFile && !imageUrl.trim() && !existingImage) {
      toast.error("Provide an image file or image URL.");
      return;
    }

    setSaving(true);
    try {
      const cleanSlug = slugify(values.slug);
      let uploadedImageUrl = imageUrl.trim() || existingImage;
      let uploadedPdfUrl = pdfUrl.trim() || initialMap?.pdfUrl || "";

      if (imageFile) uploadedImageUrl = await uploadMapFile(imageFile, cleanSlug, "image");
      if (pdfFile) uploadedPdfUrl = await uploadMapFile(pdfFile, cleanSlug, "pdf");

      const payload = buildMapPayload(
        category,
        { ...values, slug: cleanSlug },
        user,
        {
          imageUrl: uploadedImageUrl || undefined,
          pdfUrl: uploadedPdfUrl || undefined,
        },
      );

      if (isEditing) {
        await updateMap(initialMap.id, payload);
        toast.success(`${config?.label || "Map"} updated.`);
      } else {
        await createMap(payload);
        toast.success(`${config?.label || "Map"} created.`);
      }

      router.push(listPath);
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
        Unknown map category.
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
          Fields match the {category.replace(/-/g, " ")} CSV import columns.
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

          <div className="grid gap-4 sm:grid-cols-2">
            {config.fields.map((field) => {
              const commonProps = {
                key: field.key,
                className: field.fullWidth ? `${inputCls} sm:col-span-2` : inputCls,
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
                  <input
                    type={field.type === "number" ? "number" : "text"}
                    min={field.type === "number" ? "0" : undefined}
                    {...commonProps}
                  />
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
              <span className="chip chip-primary">{config.label}</span>
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
        <button type="button" className="btn" onClick={() => router.push(listPath)}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Saving..." : isEditing ? `Update ${config.label.toLowerCase()}` : `Create ${config.label.toLowerCase()}`}
        </button>
      </div>
    </form>
  );
}
