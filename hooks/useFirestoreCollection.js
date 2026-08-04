/**
 * useFirestoreCollection — subscribes to a Firestore collection with a mock-data fallback.
 *
 * If the collection is empty OR NEXT_PUBLIC_DEMO_MODE is on with no user auth,
 * it returns the provided fallback array (mock) so the design still renders.
 *
 * Once your admin dashboard publishes real content into the collection, that
 * real data automatically replaces the mock — no code changes needed.
 */
import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot, limit as fsLimit } from 'firebase/firestore';
import { db } from '../firebase/config';

export default function useFirestoreCollection({
  name,               // e.g. 'currentAffairs'
  where: whereClauses = [],   // [ ['isActive','==',true] ]
  orderBy: orderByField,      // 'createdAt' | ['createdAt', 'desc']
  limit,                       // optional numeric limit
  fallback = [],               // mock array shown when Firestore is empty / errors
  transform,                   // (docs) => docs   optional mapper
}) {
  const [data, setData] = useState(fallback);
  const [source, setSource] = useState('mock');    // 'mock' | 'firestore' | 'loading'
  const [error, setError] = useState(null);

  useEffect(() => {
    setSource('loading');
    let unsub = () => {};
    try {
      const parts = [collection(db, name)];
      for (const w of whereClauses) parts.push(where(...w));
      if (orderByField) {
        const [f, dir] = Array.isArray(orderByField) ? orderByField : [orderByField, 'desc'];
        parts.push(orderBy(f, dir));
      }
      if (limit) parts.push(fsLimit(limit));
      const q = query(...parts);

      unsub = onSnapshot(
        q,
        (snap) => {
          const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          if (docs.length === 0) {
            setData(fallback);
            setSource('mock');
          } else {
            setData(transform ? transform(docs) : docs);
            setSource('firestore');
          }
        },
        (err) => {
          if (typeof console !== 'undefined' && console.warn) {
            console.warn(`[firestore:${name}] read failed, using mock:`, err.code || err.message);
          }
          setError(err);
          setData(fallback);
          setSource('mock');
        }
      );
    } catch (err) {
      setError(err);
      setData(fallback);
      setSource('mock');
    }
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, JSON.stringify(whereClauses), JSON.stringify(orderByField), limit]);

  return { data, source, error, isMock: source === 'mock' };
}
