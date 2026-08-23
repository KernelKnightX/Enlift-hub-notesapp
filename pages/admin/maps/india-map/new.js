import { useState } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import useAdminGate from "@/hooks/admin/useAdminGate";
import { toast } from "react-toastify";
import { createMap, uploadMapFile, slugify } from "@/lib/firestore/maps";
import { useRouter } from "next/router";

export default function NewIndiaMap() {
  const { user, loading, isAdmin } = useAdminGate();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [region, setRegion] = useState("");
  const [capital, setCapital] = useState("");
  const [districtsCount, setDistrictsCount] = useState("");
  const [area, setArea] = useState("");
  const [upscFact, setUpscFact] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState("");
  const [status, setStatus] = useState("draft");
  const [saving, setSaving] = useState(false);

  if (loading) return null;
  if (!isAdmin) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim() || !status) return toast.error('Title, slug and status required');
    if (!imageFile && !imageUrl) return toast.error('Provide an image file or image URL');
    setSaving(true);
    try {
      const cleanSlug = slugify(slug);
      let uploadedImageUrl = imageUrl;
      let uploadedPdfUrl = pdfUrl;
      if (imageFile) uploadedImageUrl = await uploadMapFile(imageFile, cleanSlug, 'image');
      if (pdfFile) uploadedPdfUrl = await uploadMapFile(pdfFile, cleanSlug, 'pdf');

      const payload = {
        title: title.trim(),
        slug: cleanSlug,
        category: 'india-states',
        status,
        region: region.trim() || undefined,
        capital: capital.trim() || undefined,
        districtsCount: districtsCount !== '' ? Number(districtsCount) : undefined,
        area: area.trim() || undefined,
        upscFact: upscFact.trim() || undefined,
        imageUrl: uploadedImageUrl || undefined,
        thumbnailUrl: uploadedImageUrl || undefined,
        pdfUrl: uploadedPdfUrl || undefined,
        authorId: user?.uid || '',
        authorName: user?.displayName || user?.email || 'Admin',
      };

      // remove empty
      Object.keys(payload).forEach((k) => { if (payload[k] === undefined) delete payload[k]; });

      await createMap(payload);
      toast.success('India map created');
      router.push('/admin/maps/india-map');
    } catch (err) {
      console.error(err);
      toast.error('Create failed');
    } finally { setSaving(false); }
  };

  return (
    <AdminLayout title="Add India Map" subtitle="Create India state map" backHref="/admin/maps/india-map">
      <form onSubmit={handleSubmit} className="card p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block mb-1">Title *</label>
            <input className="map-form-input" value={title} onChange={(e) => { setTitle(e.target.value); if (!slug) setSlug(slugify(e.target.value)); }} />
          </div>
          <div>
            <label className="block mb-1">Slug *</label>
            <input className="map-form-input" value={slug} onChange={(e) => setSlug(e.target.value)} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 mt-4">
          <div>
            <label className="block mb-1">Region</label>
            <input className="map-form-input" value={region} onChange={(e) => setRegion(e.target.value)} />
          </div>
          <div>
            <label className="block mb-1">Capital</label>
            <input className="map-form-input" value={capital} onChange={(e) => setCapital(e.target.value)} />
          </div>
          <div>
            <label className="block mb-1">Districts Count</label>
            <input type="number" min="0" className="map-form-input" value={districtsCount} onChange={(e) => setDistrictsCount(e.target.value)} />
          </div>
        </div>

        <div className="mt-4">
          <label className="block mb-1">Area</label>
          <input className="map-form-input" value={area} onChange={(e) => setArea(e.target.value)} />
        </div>

        <div className="mt-4">
          <label className="block mb-1">UPSC fact</label>
          <textarea className="map-form-input" rows={4} value={upscFact} onChange={(e) => setUpscFact(e.target.value)} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 mt-4">
          <div>
            <label className="block mb-1">Image upload *</label>
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="map-form-file" />
            <div className="mt-2">Or image URL</div>
            <input className="map-form-input" placeholder="https://..." value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
          </div>
          <div>
            <label className="block mb-1">PDF upload</label>
            <input type="file" accept="application/pdf" onChange={(e) => setPdfFile(e.target.files?.[0] || null)} className="map-form-file" />
            <div className="mt-2">Or PDF URL</div>
            <input className="map-form-input" placeholder="https://..." value={pdfUrl} onChange={(e) => setPdfUrl(e.target.value)} />
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
          <button type="button" className="btn" onClick={() => router.push('/admin/maps/india-map')}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Create India Map'}</button>
        </div>
      </form>
    </AdminLayout>
  );
}
