import Head from 'next/head';
import { useEffect, useMemo, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { SchemePageLayout } from '../../../components/public/SchemePageLayout';
import { ResourceLayout } from '../../../components/public/SharedComponents';
import { Globe, MapPin, Layers, Users } from 'lucide-react';

/**
 * Template for using SchemePageLayout with different content types (Maps, Atlases, etc.)
 * To adapt this for other pages:
 * 1. Change the collection name from 'government' to your data collection
 * 2. Change the section filter from 'schemes' to your section type
 * 3. Update the title, description, and heroImage paths
 * 4. Modify the statistics to match your data
 * 5. Adjust the categories based on your data fields
 */

export default function MapsAtlasPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // TODO: Change collection name and section based on your data structure
    const qref = query(
      collection(db, 'government'),
      where('section', '==', 'maps'),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(qref, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setItems(data);
      setLoading(false);
    }, (err) => {
      console.error('items load err', err);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Derive categories from backend data
  const categories = useMemo(() => {
    const s = new Set();
    items.forEach((it) => {
      if (it.category) s.add(it.category);
    });
    return Array.from(s).sort();
  }, [items]);

  // Create statistics from data
  const statistics = useMemo(() => {
    const uniqueRegions = new Set();
    items.forEach((item) => {
      if (item.region) uniqueRegions.add(item.region);
    });

    return [
      {
        icon: Globe,
        number: `${items.length}+`,
        label: 'Maps',
        description: 'Geographical maps listed',
      },
      {
        icon: MapPin,
        number: `${uniqueRegions.size}+`,
        label: 'Regions',
        description: 'Regions covered',
      },
      {
        icon: Layers,
        number: 'Updated',
        label: 'Regularly',
        description: 'Accurate & current',
      },
      {
        icon: Users,
        number: 'Curated',
        label: 'for UPSC',
        description: 'Aspirants',
      },
    ];
  }, [items]);

  return (
    <>
      <Head>
        <title>Maps & Atlas | Notes Cafe</title>
        <meta name="description" content="Explore geographical maps, atlases, and geographical resources for UPSC preparation." />
        <meta property="og:title" content="Maps & Atlas | Notes Cafe" />
        <meta property="og:description" content="Explore geographical maps, atlases, and geographical resources for UPSC preparation." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://www.notescafe.in/maps/atlas" />
      </Head>

      <ResourceLayout
        eyebrow="Geography"
        title="Maps & Atlas"
        description="Explore geographical maps and atlases for UPSC preparation."
        breadcrumbs={[{ label: 'Maps', href: '/maps' }, { label: 'Atlas' }]}
      >
        <SchemePageLayout
          title="Maps & Atlas"
          description="Explore geographical maps, atlases, and geographical resources for UPSC preparation."
          heroImage="/images/maps-hero.png"
          schemes={items}
          categories={categories}
          loading={loading}
          searchQuery={searchQuery}
          onSearch={setSearchQuery}
          statistics={statistics}
        />
      </ResourceLayout>
    </>
  );
}
