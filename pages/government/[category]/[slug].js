import Link from 'next/link';
import { useRouter } from 'next/router';
import SeoHead from '@/components/seo/SeoHead';
import ContentDetailPage from '@/components/public/ContentDetailPage';
import { db } from '@/firebase/config';
import {
  collection,
  getDocs,
  limit,
  query,
  where,
} from 'firebase/firestore';

export default function GovernmentDetailPage({
  item,
  map,
  relatedItems,
  relatedMaps,
}) {
  const router = useRouter();
  const resource = item || map;
  const related = relatedItems || relatedMaps || [];

  if (!resource) {
    return (
      <div className="map-detail">
        <div className="map-detail__empty">
          <p className="map-detail__empty-text">This government resource could not be found.</p>
          <Link href="/government" className="btn btn-primary">
            Back to Government
          </Link>
        </div>
      </div>
    );
  }

  const seoDescription =
    resource.summary ||
    resource.upscFact ||
    resource.description ||
    `${resource.title} for UPSC polity and government studies on Notes Cafe.`;

  return (
    <div className="map-detail">
      <SeoHead
        title={`${resource.title} | UPSC Government Resource | Notes Cafe`}
        description={String(seoDescription).slice(0, 170)}
        path={router.asPath}
        image={resource.imageUrl || resource.thumbnailUrl}
      />
      <ContentDetailPage
        item={resource}
        relatedItems={related}
        type="government"
        baseHref="/government"
        baseLabel="Government"
      />
    </div>
  );
}

export async function getStaticPaths() {
  const q = query(
    collection(db, 'government'),
    where('status', '==', 'published')
  );
  const snap = await getDocs(q);
  const paths = snap.docs.map((doc) => {
    const data = doc.data();
    return {
      params: {
        category: data.section,
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
    collection(db, 'government'),
    where('status', '==', 'published'),
    where('section', '==', category),
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
  const item = serializeItem({
    id: doc.id,
    category,
    ...doc.data(),
  });

  const relatedQuery = query(
    collection(db, 'government'),
    where('status', '==', 'published'),
    where('section', '==', category),
    limit(8)
  );
  const relatedSnap = await getDocs(relatedQuery);
  const relatedItems = relatedSnap.docs
    .map((relatedDoc) => serializeItem({
      id: relatedDoc.id,
      category,
      ...relatedDoc.data(),
    }))
    .filter((relatedItem) => relatedItem.slug !== slug)
    .slice(0, 5);

  return {
    props: {
      item,
      map: item,
      relatedItems,
      relatedMaps: relatedItems,
    },
    revalidate: 60,
  };
}

function serializeItem(item) {
  return Object.fromEntries(
    Object.entries(item).map(([key, value]) => {
      if (value?.toDate) return [key, value.toDate().toISOString()];
      return [key, value];
    })
  );
}
