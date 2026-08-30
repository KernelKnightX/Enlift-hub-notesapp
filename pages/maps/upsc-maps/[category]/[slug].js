import Link from 'next/link';
import { useRouter } from 'next/router';
import SeoHead from '@/components/seo/SeoHead';
import ContentDetailPage from '@/components/public/ContentDetailPage';
import { normalizeLengthKm } from '@/lib/firestore/maps';
import { db } from '@/firebase/config';
import {
  collection,
  getDocs,
  limit,
  query,
  where,
} from 'firebase/firestore';

export default function MapDetailPage({ map, relatedMaps }) {
  const router = useRouter();

  if (!map) {
    return (
      <div className="map-detail">
        <div className="map-detail__empty">
          <p className="map-detail__empty-text">This map could not be found.</p>
          <Link href="/maps/upsc-maps" className="btn btn-primary">
            Back to Maps
          </Link>
        </div>
      </div>
    );
  }

  const seoDescription =
    map.upscFact ||
    map.description ||
    map.summary ||
    `${map.title} map for UPSC geography and map-based questions. Notes Cafe atlas.`;

  return (
    <div className="map-detail">
      <SeoHead
        title={`${map.title} | UPSC Map | Notes Cafe`}
        description={String(seoDescription).slice(0, 170)}
        path={router.asPath}
        image={map.imageUrl || map.thumbnailUrl}
      />
      <ContentDetailPage
        item={map}
        relatedItems={relatedMaps}
        type="maps"
        baseHref="/maps/upsc-maps"
        baseLabel="Maps & Atlas"
      />
    </div>
  );
}

export async function getStaticPaths() {
  const q = query(
    collection(db, 'maps'),
    where('status', '==', 'published')
  );
  const snap = await getDocs(q);
  const paths = snap.docs.map((doc) => {
    const data = doc.data();
    return {
      params: {
        category: data.category,
        slug: data.slug,
      },
    };
  });

  return {
    paths,
    fallback: 'blocking',
  };
}

export async function getStaticProps({ params }) {
  const { category, slug } = params;
  const q = query(
    collection(db, 'maps'),
    where('status', '==', 'published'),
    where('category', '==', category),
    where('slug', '==', slug),
    limit(1)
  );

  const snap = await getDocs(q);
  if (snap.empty) {
    return {
      notFound: true,
      revalidate: 60,
    };
  }

  const doc = snap.docs[0];
  const map = serializeItem({
    id: doc.id,
    ...doc.data(),
  });

  let relatedMaps = [];
  const relatedQuery = query(
    collection(db, 'maps'),
    where('status', '==', 'published'),
    where('category', '==', category),
    limit(12)
  );
  const relatedSnap = await getDocs(relatedQuery);
  relatedMaps = relatedSnap.docs
    .map((relatedDoc) => serializeItem({
      id: relatedDoc.id,
      ...relatedDoc.data(),
    }))
    .filter((item) => item.slug !== slug)
    .slice(0, 7);

  return {
    props: {
      map,
      relatedMaps,
    },
    revalidate: 60,
  };
}

function serializeItem(item) {
  return Object.fromEntries(
    Object.entries(item).map(([key, value]) => {
      if (value?.toDate) return [key, value.toDate().toISOString()];
      if (key === 'lengthKm') return [key, normalizeLengthKm(value)];
      return [key, value];
    }).filter(([, value]) => value !== undefined)
  );
}
