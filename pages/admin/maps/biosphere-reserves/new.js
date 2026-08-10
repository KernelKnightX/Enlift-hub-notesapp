import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import useAdminGate from "@/hooks/admin/useAdminGate";
import { toast } from "react-toastify";
import { createMap, uploadMapFile, slugify } from "@/lib/firestore/maps";
import { useRouter } from "next/router";

export default function NewReserve() {
  const { user, loading, isAdmin } = useAdminGate();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [region, setRegion] = useState("");
  const [reserveStates, setReserveStates] = useState("");
  const [reserveEstablishedYear, setReserveEstablishedYear] = useState("");
  const [coreArea, setCoreArea] = useState("");
  const [unescoStatus, setUnescoStatus] = useState("");
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
        category: 'biosphere-reserves',
        status,
        region: region.trim() || undefined,
        reserveStates: reserveStates.trim() || undefined,
        reserveEstablishedYear: reserveEstablishedYear.trim() || undefined,
        coreArea: coreArea.trim() || undefined,
        unescoStatus: unescoStatus.trim() || undefined,
        upscFact: upscFact.trim() || undefined,
        imageUrl: uploadedImageUrl || undefined,
        thumbnailUrl: uploadedImageUrl || undefined,
        pdfUrl: uploadedPdfUrl || undefined,
        authorId: user?.uid || '',
        authorName: user?.displayName || user?.email || 'Admin',
      };

      Object.keys(payload).forEach((k) => { if (payload[k] === undefined) delete payload[k]; });

      await createMap(payload);
      toast.success('Reserve created');
      router.push('/admin/maps/biosphere-reserves');
    } catch (err) {
      console.error(err);
      toast.error('Create failed');
    } finally { setSaving(false); }
  };

  return (
    <AdminLayout title="Add Biosphere Reserve" subtitle="Create reserve entry" backHref="/admin/maps/biosphere-reserves">
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

        <div className="grid gap-4 sm:grid-cols-2 mt-4">
          <div>
            <label className="block mb-1">Region</label>
            <input className="map-form-input" value={region} onChange={(e) => setRegion(e.target.value)} />
          </div>
          <div>
            <label className="block mb-1">Reserve States</label>
            <input className="map-form-input" value={reserveStates} onChange={(e) => setReserveStates(e.target.value)} />
          </div>
          <div>
            <label className="block mb-1">Established Year</label>
            <input className="map-form-input" value={reserveEstablishedYear} onChange={(e) => setReserveEstablishedYear(e.target.value)} />
          </div>
          <div>
            <label className="block mb-1">Core Area</label>
            <input className="map-form-input" value={coreArea} onChange={(e) => setCoreArea(e.target.value)} />
          </div>
          <div>
            <label className="block mb-1">UNESCO Status</label>
            <input className="map-form-input" value={unescoStatus} onChange={(e) => setUnescoStatus(e.target.value)} />
          </div>
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
          <button type="button" className="btn" onClick={() => router.push('/admin/maps/biosphere-reserves')}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Create Reserve'}</button>
        </div>
      </form>
    </AdminLayout>
  );
}
