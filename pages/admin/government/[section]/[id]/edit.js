import { useEffect, useState } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import useAdminGate from "@/hooks/admin/useAdminGate";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { getGovItemById, updateGovItem, isValidSection, sectionLabel } from "@/lib/firestore/government";
import { uploadMapFile, slugify } from "@/lib/firestore/maps";

export default function EditGovernmentItem() {
  const { user, loading, isAdmin } = useAdminGate();
  const router = useRouter();
  const { section, id } = router.query;

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [region, setRegion] = useState("");
  const [summary, setSummary] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState("");
  const [status, setStatus] = useState("draft");
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAdmin || !id) return;
    let cancelled = false;
    getGovItemById(id).then((item) => {
      if (cancelled) return;
      if (!item) {
        toast.error("Item not found.");
        router.replace(`/admin/government/${section || ""}`);
        return;
      }
      setTitle(item.title || "");
      setSlug(item.slug || "");
      setRegion(item.region || "");
      setSummary(item.summary || "");
      setImageUrl(item.imageUrl || item.thumbnailUrl || "");
      setPdfUrl(item.pdfUrl || "");
      setStatus(item.status || "draft");
      setReady(true);
    }).catch((error) => {
      console.error(error);
      toast.error("Could not load this item.");
    });
    return () => { cancelled = true; };
  }, [isAdmin, id, router, section]);

  if (loading || (isAdmin && id && !ready)) {
    return (
      <div className="grid min-h-screen place-items-center bg-[var(--color-bg)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-border-strong)] border-t-[var(--color-primary)]" />
      </div>
    );
  }
  if (!isAdmin) return null;

  if (router.isReady && !isValidSection(section)) {
    return (
      <AdminLayout title="Government" subtitle="Unknown section">
        <div className="card p-12 text-center">Unknown section</div>
      </AdminLayout>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim() || !status) return toast.error("Title, slug and status required");
    setSaving(true);
    try {
      const cleanSlug = slugify(slug);
      let uploadedImageUrl = imageUrl;
      let uploadedPdfUrl = pdfUrl;
      if (imageFile) uploadedImageUrl = await uploadMapFile(imageFile, cleanSlug, "image");
      if (pdfFile) uploadedPdfUrl = await uploadMapFile(pdfFile, cleanSlug, "pdf");

      const payload = {
        title: title.trim(),
        slug: cleanSlug,
        section,
        status,
        region: region.trim() || undefined,
        summary: summary.trim() || undefined,
        imageUrl: uploadedImageUrl || undefined,
        thumbnailUrl: uploadedImageUrl || undefined,
        pdfUrl: uploadedPdfUrl || undefined,
        authorId: user?.uid || "",
        authorName: user?.displayName || user?.email || "Admin",
      };
      Object.keys(payload).forEach((k) => { if (payload[k] === undefined) delete payload[k]; });
      await updateGovItem(id, payload);
      toast.success("Item updated.");
      router.push(`/admin/government/${section}`);
    } catch (err) {
      console.error(err);
      toast.error("Update failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      title={`Edit ${sectionLabel(section)}`}
      subtitle="Update the public government page for this item."
      backHref={`/admin/government/${section}`}
    >
      <form onSubmit={handleSubmit} className="card p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block mb-1">Title *</label>
            <input className="map-form-input" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="block mb-1">Slug *</label>
            <input className="map-form-input" value={slug} onChange={(e) => setSlug(e.target.value)} />
          </div>
        </div>
        <div className="mt-4">
          <label className="block mb-1">Region</label>
          <input className="map-form-input" value={region} onChange={(e) => setRegion(e.target.value)} />
        </div>
        <div className="mt-4">
          <label className="block mb-1">Summary</label>
          <textarea className="map-form-input" rows={4} value={summary} onChange={(e) => setSummary(e.target.value)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 mt-4">
          <div>
            <label className="block mb-1">Replace image</label>
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="map-form-file" />
            <div className="mt-2">Image URL</div>
            <input className="map-form-input" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
          </div>
          <div>
            <label className="block mb-1">Replace PDF</label>
            <input type="file" accept="application/pdf" onChange={(e) => setPdfFile(e.target.files?.[0] || null)} className="map-form-file" />
            <div className="mt-2">PDF URL</div>
            <input className="map-form-input" value={pdfUrl} onChange={(e) => setPdfUrl(e.target.value)} />
          </div>
        </div>
        <div className="mt-4">
          <label className="block mb-1">Status</label>
          <select className="map-form-input" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" className="btn" onClick={() => router.push(`/admin/government/${section}`)}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving..." : "Save changes"}</button>
        </div>
      </form>
    </AdminLayout>
  );
}
