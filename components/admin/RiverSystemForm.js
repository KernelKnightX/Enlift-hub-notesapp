import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import {
  createMap,
  slugify,
  updateMap,
  uploadMapFile,
} from "@/lib/firestore/maps";

const labelCls = "mb-1.5 block text-[13px] font-semibold text-[var(--color-ink-2)]";
const inputCls = "map-form-input";
const fileInputCls = "map-form-input map-form-file";

export default function RiverSystemForm({ initialMap = null, user }) {
  const router = useRouter();
  const isEditing = Boolean(initialMap?.id);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(isEditing);
  const [origin, setOrigin] = useState("");
  const [mouth, setMouth] = useState("");
  const [lengthKm, setLengthKm] = useState("");
  const [statesCovered, setStatesCovered] = useState("");
  const [tributaries, setTributaries] = useState("");
  const [upscFact, setUpscFact] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState("");
  const [status, setStatus] = useState("draft");
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    if (!initialMap) return;
    setTitle(initialMap.title || "");
    setSlug(initialMap.slug || "");
    setOrigin(initialMap.origin || "");
    setMouth(initialMap.mouth || "");
    setLengthKm(initialMap.lengthKm ?? "");
    setStatesCovered(initialMap.statesCovered || "");
    setTributaries(initialMap.tributaries || "");
    setUpscFact(initialMap.upscFact || "");
    setImageUrl(initialMap.imageUrl || "");
    setPdfUrl(initialMap.pdfUrl || "");
    setStatus(initialMap.status || "draft");
    setSlugEdited(true);
  }, [initialMap]);

  useEffect(() => {
    if (imageFile) {
      const previewUrl = URL.createObjectURL(imageFile);
      setImagePreview(previewUrl);
      return () => URL.revokeObjectURL(previewUrl);
    }
    setImagePreview(imageUrl || initialMap?.thumbnailUrl || initialMap?.imageUrl || "");
  }, [imageFile, imageUrl, initialMap?.thumbnailUrl, initialMap?.imageUrl]);

  const handleTitleChange = (event) => {
    const nextTitle = event.target.value;
    setTitle(nextTitle);
    if (!slugEdited) setSlug(slugify(nextTitle));
  };

  const handleSlugChange = (event) => {
    setSlugEdited(true);
    setSlug(slugify(event.target.value));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!title.trim() || !slug.trim() || !status) {
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
      const cleanSlug = slugify(slug);
      let uploadedImageUrl = imageUrl.trim() || existingImage;
      let uploadedPdfUrl = pdfUrl.trim() || initialMap?.pdfUrl || "";

      if (imageFile) uploadedImageUrl = await uploadMapFile(imageFile, cleanSlug, "image");
      if (pdfFile) uploadedPdfUrl = await uploadMapFile(pdfFile, cleanSlug, "pdf");

      const payload = {
        title: title.trim(),
        slug: cleanSlug,
        category: "river-systems",
        status,
        origin: origin.trim() || undefined,
        mouth: mouth.trim() || undefined,
        lengthKm: lengthKm !== "" ? Number(lengthKm) : undefined,
        statesCovered: statesCovered.trim() || undefined,
        tributaries: tributaries.trim() || undefined,
        upscFact: upscFact.trim() || undefined,
        imageUrl: uploadedImageUrl || undefined,
        thumbnailUrl: uploadedImageUrl || undefined,
        pdfUrl: uploadedPdfUrl || undefined,
        authorId: user?.uid || "",
        authorName: user?.displayName || user?.email || "Admin",
      };

      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined || Number.isNaN(payload[key])) delete payload[key];
      });

      if (isEditing) {
        await updateMap(initialMap.id, payload);
        toast.success("River updated.");
      } else {
        await createMap(payload);
        toast.success("River created.");
      }

      router.push("/admin/maps/river-systems");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card overflow-hidden">
      <div className="hairline-b bg-[var(--color-surface-alt)] px-5 py-4">
        <h2 className="text-[15px] font-semibold text-[var(--color-ink)]">
          {isEditing ? "Edit river system" : "Add river system"}
        </h2>
        <p className="mt-1 text-[13px] text-[var(--color-ink-muted)]">
          Fields match the river-systems CSV import: origin, mouth, length, states, tributaries, and UPSC fact.
        </p>
      </div>

      <div className="map-form-layout">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Title *</label>
              <input className={inputCls} value={title} onChange={handleTitleChange} required />
            </div>
            <div>
              <label className={labelCls}>Slug *</label>
              <input className={inputCls} value={slug} onChange={handleSlugChange} required />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Origin</label>
              <input className={inputCls} value={origin} onChange={(event) => setOrigin(event.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Mouth</label>
              <input className={inputCls} value={mouth} onChange={(event) => setMouth(event.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Length (km)</label>
              <input
                className={inputCls}
                type="number"
                min="0"
                value={lengthKm}
                onChange={(event) => setLengthKm(event.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>States Covered</label>
              <input
                className={inputCls}
                value={statesCovered}
                onChange={(event) => setStatesCovered(event.target.value)}
                placeholder="Uttarakhand, Uttar Pradesh, Bihar"
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Tributaries</label>
              <input
                className={inputCls}
                value={tributaries}
                onChange={(event) => setTributaries(event.target.value)}
                placeholder="Yamuna, Ghaghara, Gandak"
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>UPSC fact</label>
            <textarea
              className={inputCls}
              rows={5}
              value={upscFact}
              onChange={(event) => setUpscFact(event.target.value)}
            />
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
              <span className="chip chip-primary">River Systems</span>
              <span className={`chip ${status === "published" ? "chip-green" : "chip-amber"}`}>
                {status === "published" ? "Published" : "Draft"}
              </span>
            </div>
          </div>

          <div className="rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <label className={labelCls}>Status *</label>
            <select className={inputCls} value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </aside>
      </div>

      <div className="hairline-t flex flex-wrap justify-end gap-2 bg-[var(--color-surface-alt)] px-5 py-4">
        <button type="button" className="btn" onClick={() => router.push("/admin/maps/river-systems")}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Saving..." : isEditing ? "Update river" : "Create river"}
        </button>
      </div>
    </form>
  );
}
