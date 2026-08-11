import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';

export default function GovernmentSectionPage() {
  const router = useRouter();
  const { section } = router.query;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!section) return;
    const q = query(
      collection(db, 'government'),
      where('section', '==', section),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => {
      console.error('gov section load error', err);
      setLoading(false);
    });
    return () => unsub();
  }, [section]);

  return (
    <>
      <Head>
        <title>{section ? section.replace('-', ' ') : 'Government'} - Government resources</title>
      </Head>
      <main className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-semibold mb-4">{section?.replace('-', ' ') || 'Government'}</h1>
        {loading ? (
          <div>Loading…</div>
        ) : items.length === 0 ? (
          <div>No items yet.</div>
        ) : (
          <ul className="space-y-4">
            {items.map((it) => (
              <li key={it.id} className="p-4 border rounded">
                <Link href={`/government/${section}/${it.slug}`} className="font-medium text-lg">{it.title}</Link>
                {it.summary ? <p className="text-sm text-gray-600">{it.summary}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
