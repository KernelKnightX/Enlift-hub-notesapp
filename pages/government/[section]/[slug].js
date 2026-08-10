import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';

export default function GovernmentItemPage() {
  const router = useRouter();
  const { section, slug } = router.query;
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!section || !slug) return;
    const q = query(collection(db, 'government'), where('section', '==', section), where('slug', '==', slug));
    const unsub = onSnapshot(q, (snap) => {
      const doc = snap.docs[0];
      setItem(doc ? { id: doc.id, ...doc.data() } : null);
      setLoading(false);
    }, (err) => {
      console.error('gov item load error', err);
      setLoading(false);
    });
    return () => unsub();
  }, [section, slug]);

  if (loading) return <div className="p-6">Loading…</div>;
  if (!item) return <div className="p-6">Not found</div>;

  return (
    <>
      <Head>
        <title>{item.title} — Government</title>
      </Head>
      <main className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-semibold mb-4">{item.title}</h1>
        {item.imageUrl ? <img src={item.imageUrl} alt="" className="mb-4 max-h-80 object-contain" /> : null}
        {item.summary ? <p className="mb-4 text-gray-700">{item.summary}</p> : null}
        <div className="prose">
          {/* If more fields exist, render them here — keep simple for now */}
          {item.pdfUrl ? <a href={item.pdfUrl} target="_blank" rel="noreferrer" className="underline">Open PDF</a> : null}
        </div>
      </main>
    </>
  );
}
