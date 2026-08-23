import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { collection, deleteDoc, doc, getDoc, onSnapshot, orderBy, query, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useAuth } from '@/contexts/AuthContext';
import { db, storage } from '@/firebase/config';
import AdminLayout from '@/layouts/AdminLayout';

const EMPTY_FORM = { title: '', month: '', description: '', coverUrl: '', downloadUrl: '', pdfFile: null, isActive: true };
const inputClass = 'w-full rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]';

export default function AdminMonthlyMagazines() {
  const router = useRouter();
  const { user, authLoading, logout } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [magazines, setMagazines] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) { router.replace('/login'); return; }
    if (!user) return;
    let cancelled = false;
    getDoc(doc(db, 'users', user.uid)).then((snap) => {
      if (!snap.exists() || !snap.data()?.isAdmin) { router.replace('/'); return; }
      if (!cancelled) setIsAdmin(true);
    }).catch(() => router.replace('/')).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!isAdmin) return undefined;
    const unsubscribe = onSnapshot(
      query(collection(db, 'monthlyMagazines'), orderBy('publishedAt', 'desc')),
      (snapshot) => setMagazines(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))),
      (error) => { console.error(error); toast.error('Could not load magazines.'); },
    );
    return () => unsubscribe();
  }, [isAdmin]);

  const reset = () => { setForm(EMPTY_FORM); setEditingId(null); setCoverFile(null); };
  const edit = (item) => {
    setEditingId(item.id);
    setForm({ title: item.title || '', month: item.month || '', description: item.description || '', coverUrl: item.coverUrl || '', downloadUrl: item.downloadUrl || '', pdfFile: null, isActive: item.isActive !== false });
    setCoverFile(null);
  };
  const save = async (event) => {
    event.preventDefault();
    if (!form.title.trim() || (!form.pdfFile && !form.downloadUrl.trim())) { toast.error('Title and a PDF file or URL are required.'); return; }
    setSaving(true);
    try {
      let coverUrl = form.coverUrl.trim();
      let downloadUrl = form.downloadUrl.trim();
      if (coverFile) {
        const storageRef = ref(storage, `monthly-magazines/${Date.now()}_${coverFile.name}`);
        await uploadBytes(storageRef, coverFile);
        coverUrl = await getDownloadURL(storageRef);
      }
      if (form.pdfFile) {
        const storageRef = ref(storage, `monthly-magazines/${Date.now()}_${form.pdfFile.name}`);
        await uploadBytes(storageRef, form.pdfFile);
        downloadUrl = await getDownloadURL(storageRef);
      }
      const payload = { title: form.title.trim(), month: form.month.trim(), description: form.description.trim(), coverUrl, downloadUrl, isActive: form.isActive, updatedAt: serverTimestamp(), updatedBy: user.uid };
      if (editingId) {
        await updateDoc(doc(db, 'monthlyMagazines', editingId), payload);
        toast.success('Magazine updated.');
      } else {
        await addDoc(collection(db, 'monthlyMagazines'), { ...payload, publishedAt: serverTimestamp(), createdBy: user.uid });
        toast.success('Magazine published.');
      }
      reset();
    } catch (error) { console.error(error); toast.error('Could not save magazine.'); }
    finally { setSaving(false); }
  };
  const remove = async (id) => {
    if (!window.confirm('Delete this magazine?')) return;
    try { await deleteDoc(doc(db, 'monthlyMagazines', id)); toast.success('Magazine deleted.'); } catch (error) { console.error(error); toast.error('Could not delete magazine.'); }
  };

  if (loading || authLoading) return <div className="min-h-screen grid place-items-center">Loading...</div>;
  if (!isAdmin) return null;

  return (
    <AdminLayout
      title="Monthly Magazines"
      subtitle="Publish the covers and PDF links shown on the public magazine page."
    >
        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <form onSubmit={save} className="card space-y-4 p-5">
            <h2 className="text-lg font-semibold">{editingId ? 'Edit magazine' : 'Add magazine'}</h2>
            <label className="block text-sm font-semibold">Title<input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="UPSC Monthly Magazine" /></label>
            <label className="block text-sm font-semibold">Month label<input className={inputClass} value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} placeholder="June, 2026" /></label>
            <label className="block text-sm font-semibold">Description<textarea className={inputClass} rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
            <label className="block text-sm font-semibold">Cover image<input className={inputClass} type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} /></label>
            <label className="block text-sm font-semibold">Cover URL<input className={inputClass} type="url" value={form.coverUrl} onChange={(e) => setForm({ ...form, coverUrl: e.target.value })} placeholder="Optional if uploading a cover" /></label>
            <label className="block text-sm font-semibold">PDF file<input className={inputClass} type="file" accept="application/pdf,.pdf" onChange={(e) => setForm({ ...form, pdfFile: e.target.files?.[0] || null })} />{form.pdfFile && <span className="mt-1 block text-xs text-[var(--color-ink-muted)]">Selected: {form.pdfFile.name}</span>}</label>
            <label className="block text-sm font-semibold">Existing PDF URL <span className="font-normal text-[var(--color-ink-muted)]">(optional when uploading a file)</span><input className={inputClass} type="url" value={form.downloadUrl} onChange={(e) => setForm({ ...form, downloadUrl: e.target.value })} /></label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Visible on public page</label>
            <div className="flex gap-2"><button className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Update magazine' : 'Publish magazine'}</button>{editingId && <button type="button" className="btn btn-ghost" onClick={reset}>Cancel</button>}</div>
          </form>
          <section className="card p-5"><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold">Published and draft magazines</h2><span className="text-sm text-[var(--color-ink-muted)]">{magazines.length} items</span></div>
            <div className="space-y-3">{magazines.map((magazine) => <article key={magazine.id} className="flex flex-col gap-3 rounded-xl border border-[var(--color-border)] p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex min-w-0 items-center gap-3"><div className="h-16 w-14 shrink-0 overflow-hidden rounded bg-[var(--color-primary-tint)]">{magazine.coverUrl && <img className="h-full w-full object-cover" src={magazine.coverUrl} alt="" />}</div><div className="min-w-0"><h3 className="truncate font-semibold">{magazine.month || magazine.title}</h3><p className="truncate text-sm text-[var(--color-ink-muted)]">{magazine.title}</p><span className="text-xs">{magazine.isActive === false ? 'Draft' : 'Published'}</span></div></div><div className="flex gap-2"><button className="btn btn-ghost" onClick={() => edit(magazine)}>Edit</button><button className="btn btn-danger" onClick={() => remove(magazine.id)}>Delete</button></div></article>)}{magazines.length === 0 && <p className="py-10 text-center text-sm text-[var(--color-ink-muted)]">No magazines yet.</p>}</div>
          </section>
        </div>
    </AdminLayout>
  );
}
