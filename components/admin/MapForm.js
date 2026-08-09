import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { toast } from "react-toastify";
import {
  MAP_CATEGORIES,
  categoryLabel,
  createMap,
  slugify,
  updateMap,
  uploadMapFile,
} from "@/lib/firestore/maps";

const EMPTY_FORM = {
  title: "",
  slug: "",
  category: "india-states",
  region: "",
  capital: "",
  districtsCount: "",
  area: "",
  origin: "",
  mouth: "",
  lengthKm: "",
  statesCovered: "",
  tributaries: "",
  highestPeak: "",
  mountainLengthKm: "",
  mountainStatesCovered: "",
  formedEra: "",
  parkState: "",
  establishedYear: "",
  parkArea: "",
  famousFor: "",
  reserveStates: "",
  reserveEstablishedYear: "",
  coreArea: "",
  unescoStatus: "",
  locationState: "",
  significance: "",
  nearbyLandmark: "",
  upscFact: "",
  imageUrl: "",
  pdfUrl: "",
  thumbnailUrl: "",
  status: "draft",
};

const labelCls = "mb-1.5 block text-[13px] font-semibold text-[var(--color-ink-2)]";
const inputCls = "map-form-input";
const fileInputCls = "map-form-input map-form-file";

export default function MapForm({ initialMap = null, user }) {
  const router = useRouter();
  const isEditing = Boolean(initialMap?.id);
  const [form, setForm] = useState(EMPTY_FORM);
  const [slugEdited, setSlugEdited] = useState(isEditing);
  const [imageFile, setImageFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!initialMap) return;
    setForm({
      title: initialMap.title || "",
      slug: initialMap.slug || "",
      category: initialMap.category || "india-states",
      region: initialMap.region || "",
      capital: initialMap.capital || "",
      districtsCount: initialMap.districtsCount ?? "",
      area: initialMap.area || "",
      origin: initialMap.origin || "",
      mouth: initialMap.mouth || "",
      lengthKm: initialMap.lengthKm || "",
      statesCovered: initialMap.statesCovered || "",
      tributaries: initialMap.tributaries || "",
      highestPeak: initialMap.highestPeak || "",
      mountainLengthKm: initialMap.mountainLengthKm || "",
      mountainStatesCovered: initialMap.mountainStatesCovered || "",
      formedEra: initialMap.formedEra || "",
      parkState: initialMap.parkState || "",
      establishedYear: initialMap.establishedYear || "",
      parkArea: initialMap.parkArea || "",
      famousFor: initialMap.famousFor || "",
      reserveStates: initialMap.reserveStates || "",
      reserveEstablishedYear: initialMap.reserveEstablishedYear || "",
      coreArea: initialMap.coreArea || "",
      unescoStatus: initialMap.unescoStatus || "",
      locationState: initialMap.locationState || "",
      significance: initialMap.significance || "",
      nearbyLandmark: initialMap.nearbyLandmark || "",
      upscFact: initialMap.upscFact || "",
      imageUrl: initialMap.imageUrl || "",
      pdfUrl: initialMap.pdfUrl || "",
      thumbnailUrl: initialMap.thumbnailUrl || initialMap.imageUrl || "",
      status: initialMap.status || "draft",
    });
    setSlugEdited(true);
  }, [initialMap]);

  useEffect(() => {
    if (!imageFile) {
      setImagePreview(form.thumbnailUrl || form.imageUrl || "");
      return undefined;
    }
    const previewUrl = URL.createObjectURL(imageFile);
    setImagePreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [imageFile, form.thumbnailUrl, form.imageUrl]);

  const handleField = (event) => {
    const { name, value } = event.target;
    if (name === "slug") setSlugEdited(true);
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "title" && !slugEdited) next.slug = slugify(value);
      if (name === "slug") next.slug = slugify(value);
      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.slug.trim() || !form.category) {
      toast.error("Title, slug, and category are required.");
      return;
    }
    if (!isEditing && !imageFile) {
      toast.error("Upload a map image before creating.");
      return;
    }

    setSaving(true);
    try {
      const cleanSlug = slugify(form.slug);
      let imageUrl = form.imageUrl;
      let pdfUrl = form.pdfUrl;

      if (imageFile) imageUrl = await uploadMapFile(imageFile, cleanSlug, "image");
      if (pdfFile) pdfUrl = await uploadMapFile(pdfFile, cleanSlug, "pdf");

      const payload = {
        title: form.title.trim(),
        slug: cleanSlug,
        category: form.category,
        region: form.region.trim(),
        capital: form.capital.trim(),
        area: form.area.trim(),
        origin: form.origin.trim(),
        mouth: form.mouth.trim(),
        lengthKm: form.lengthKm.trim(),
        statesCovered: form.statesCovered.trim(),
        tributaries: form.tributaries.trim(),
        highestPeak: form.highestPeak.trim(),
        mountainLengthKm: form.mountainLengthKm.trim(),
        mountainStatesCovered: form.mountainStatesCovered.trim(),
        formedEra: form.formedEra.trim(),
        parkState: form.parkState.trim(),
        establishedYear: form.establishedYear.trim(),
        parkArea: form.parkArea.trim(),
        famousFor: form.famousFor.trim(),
        reserveStates: form.reserveStates.trim(),
        reserveEstablishedYear: form.reserveEstablishedYear.trim(),
        coreArea: form.coreArea.trim(),
        unescoStatus: form.unescoStatus.trim(),
        locationState: form.locationState.trim(),
        significance: form.significance.trim(),
        nearbyLandmark: form.nearbyLandmark.trim(),
        upscFact: form.upscFact.trim(),
        imageUrl,
        pdfUrl,
        thumbnailUrl: imageUrl,
        status: form.status,
        authorId: user?.uid || "",
        authorName: user?.displayName || user?.email || "Admin",
      };

      if (form.districtsCount !== "") {
        payload.districtsCount = Number(form.districtsCount);
      }

      Object.keys(payload).forEach((key) => {
        if (payload[key] === "" || Number.isNaN(payload[key])) delete payload[key];
      });

      if (isEditing) {
        await updateMap(initialMap.id, payload);
        toast.success("Map updated.");
      } else {
        await createMap(payload);
        toast.success("Map created.");
      }
      router.push("/admin/maps");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to save map.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card overflow-hidden">
      <div className="hairline-b bg-[var(--color-surface-alt)] px-5 py-4">
        <h2 className="text-[15px] font-semibold text-[var(--color-ink)]">
          {isEditing ? "Edit map" : "Add map"}
        </h2>
      </div>

      <div className="map-form-layout">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Title *</label>
              <input name="title" value={form.title} onChange={handleField} className={inputCls} required />
            </div>
            <div>
              <label className={labelCls}>Slug *</label>
              <input name="slug" value={form.slug} onChange={handleField} className={inputCls} required />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Category *</label>
              <select name="category" value={form.category} onChange={handleField} className={inputCls} required>
                {MAP_CATEGORIES.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Region</label>
              <input name="region" value={form.region} onChange={handleField} className={inputCls} />
            </div>
          </div>

          {form.category === "india-states" ? (
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className={labelCls}>Capital</label>
                <input name="capital" value={form.capital} onChange={handleField} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Districts</label>
                <input name="districtsCount" type="number" min="0" value={form.districtsCount} onChange={handleField} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Area</label>
                <input name="area" value={form.area} onChange={handleField} className={inputCls} />
              </div>
            </div>
          ) : null}

          {form.category === "river-systems" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Origin</label>
                <input name="origin" value={form.origin} onChange={handleField} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Mouth</label>
                <input name="mouth" value={form.mouth} onChange={handleField} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Length</label>
                <input name="lengthKm" value={form.lengthKm} onChange={handleField} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>States Covered</label>
                <input name="statesCovered" value={form.statesCovered} onChange={handleField} className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Tributaries</label>
                <input name="tributaries" value={form.tributaries} onChange={handleField} className={inputCls} />
              </div>
            </div>
          ) : null}

          {form.category === "mountain-ranges" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Highest Peak</label>
                <input name="highestPeak" value={form.highestPeak} onChange={handleField} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Length</label>
                <input name="mountainLengthKm" value={form.mountainLengthKm} onChange={handleField} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>States Covered</label>
                <input name="mountainStatesCovered" value={form.mountainStatesCovered} onChange={handleField} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Formed Era</label>
                <input name="formedEra" value={form.formedEra} onChange={handleField} className={inputCls} />
              </div>
            </div>
          ) : null}

          {form.category === "national-parks" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>State</label>
                <input name="parkState" value={form.parkState} onChange={handleField} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Established Year</label>
                <input name="establishedYear" value={form.establishedYear} onChange={handleField} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Area</label>
                <input name="parkArea" value={form.parkArea} onChange={handleField} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Famous For</label>
                <input name="famousFor" value={form.famousFor} onChange={handleField} className={inputCls} />
              </div>
            </div>
          ) : null}

          {form.category === "biosphere-reserves" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>States</label>
                <input name="reserveStates" value={form.reserveStates} onChange={handleField} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Established Year</label>
                <input name="reserveEstablishedYear" value={form.reserveEstablishedYear} onChange={handleField} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Core Area</label>
                <input name="coreArea" value={form.coreArea} onChange={handleField} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>UNESCO Status</label>
                <input name="unescoStatus" value={form.unescoStatus} onChange={handleField} className={inputCls} />
              </div>
            </div>
          ) : null}

          {form.category === "important-locations" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>State</label>
                <input name="locationState" value={form.locationState} onChange={handleField} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Significance</label>
                <input name="significance" value={form.significance} onChange={handleField} className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Nearby Landmark</label>
                <input name="nearbyLandmark" value={form.nearbyLandmark} onChange={handleField} className={inputCls} />
              </div>
            </div>
          ) : null}

          <div>
            <label className={labelCls}>UPSC fact</label>
            <textarea name="upscFact" value={form.upscFact} onChange={handleField} className={inputCls} rows={5} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Image upload {isEditing ? "" : "*"}</label>
              <input type="file" accept="image/*" onChange={(event) => setImageFile(event.target.files?.[0] || null)} className={fileInputCls} />
              <label className={`${labelCls} mt-3`}>Or image URL</label>
              <input name="imageUrl" value={form.imageUrl} onChange={handleField} placeholder="https://…" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>PDF upload</label>
              <input type="file" accept="application/pdf" onChange={(event) => setPdfFile(event.target.files?.[0] || null)} className={fileInputCls} />
              <label className={`${labelCls} mt-3`}>Or PDF URL</label>
              <input name="pdfUrl" value={form.pdfUrl} onChange={handleField} placeholder="https://…" className={inputCls} />
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
                <div className="grid h-full place-items-center text-[13px] text-[var(--color-ink-faint)]">No image selected</div>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="chip chip-primary">{categoryLabel(form.category)}</span>
              <span className={`chip ${form.status === "published" ? "chip-green" : "chip-amber"}`}>
                {form.status === "published" ? "Published" : "Draft"}
              </span>
            </div>
          </div>

          <div className="rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <label className={labelCls}>Status</label>
            <button
              type="button"
              role="switch"
              aria-checked={form.status === "published"}
              onClick={() => setForm((prev) => ({ ...prev, status: prev.status === "published" ? "draft" : "published" }))}
              className="flex w-full items-center justify-between rounded-[12px] border border-[var(--color-border)] px-3 py-2"
            >
              <span className="text-sm font-semibold text-[var(--color-ink)]">
                {form.status === "published" ? "Published" : "Draft"}
              </span>
              <span
                className="relative h-6 w-11 rounded-full transition-colors"
                style={{ background: form.status === "published" ? "var(--color-primary)" : "var(--color-border-strong)" }}
              >
                <span
                  className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform"
                  style={{ transform: form.status === "published" ? "translateX(22px)" : "translateX(2px)" }}
                />
              </span>
            </button>
          </div>
        </aside>
      </div>

      <div className="hairline-t flex flex-wrap justify-end gap-2 bg-[var(--color-surface-alt)] px-5 py-4">
        <Link href="/admin/maps" className="btn btn-ghost">Cancel</Link>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Saving..." : isEditing ? "Update map" : "Create map"}
        </button>
      </div>
    </form>
  );
}
