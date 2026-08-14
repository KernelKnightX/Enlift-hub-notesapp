import Image from 'next/image';
import Link from 'next/link';

import {
  MapPin,
  Landmark,
  Grid3x3,
  Ruler,
  Waves,
  Languages,
  Lightbulb,
  ChevronRight,
} from 'lucide-react';

import { db } from '@/firebase/config';

import {
  collection,
  query,
  where,
  getDocs,
  limit,
} from 'firebase/firestore';


export default function MapDetailPage({ map, relatedMaps }) {

  if (!map) {
    return (
      <div className="map-detail">
        <div className="map-detail__empty">
          <p className="map-detail__empty-text">
            This map could not be found.
          </p>
          <Link
            href="/government"
            className="btn btn-primary"
          >
            Back to Maps
          </Link>
        </div>
      </div>
    );
  }

  const mapName = map.title?.replace('Map of ', '') || map.title;
  return (
    <div className="map-detail">
      <div className="map-detail__container">

        <div className="map-detail__breadcrumb">
          <Link href="/maps">Maps & Atlas</Link>
          <ChevronRight size={14} />
          <Link href="/government">Government</Link>
          <ChevronRight size={14} />
          <Link href={`/government/${map.category}`}>
            {map.category}
          </Link>
          <ChevronRight size={14} />
          <span className="map-detail__breadcrumb-current">
            {mapName}
          </span>
        </div>

        <div className="map-detail__header">
          <div className="map-detail__heading">
            <h1 className="map-detail__title">
              {map.title}
            </h1>

            <div className="map-detail__tags">

              {map.region && (
                <span className="chip">
                  {map.region}
                </span>
              )}

            </div>

          </div>

          {map.upscFact && (
            <div className="map-detail__quick-fact">
              <div className="map-detail__quick-fact-header">
                <div className="map-detail__quick-fact-icon">
                  <Lightbulb size={15} />
                </div>
                <span className="eyebrow map-detail__quick-fact-title">
                  Quick Fact
                </span>
              </div>
              <p className="map-detail__quick-fact-text">
                {map.upscFact}
              </p>
            </div>
          )}
        </div>

        <div className="map-detail__content-grid">

          <div className="map-viewer">

            <div className="map-viewer__canvas">

              <Image
                src={map.imageUrl}
                alt={map.title}
                fill
                priority
                className="map-viewer__image"
                sizes="(max-width: 900px) 100vw, 850px"
              />
            </div>
          </div>

          <div className="map-info">
            <h2 className="eyebrow map-info__title">
              Key Information
            </h2>

            <div className="map-info__list">
              <InfoRow
                icon={Landmark}
                label="Capital"
                value={map.capital}
              />
              <InfoRow
                icon={MapPin}
                label="Largest City"
                value={map.largestCity}
              />
              <InfoRow
                icon={Grid3x3}
                label="Districts"
                value={map.districtsCount}
              />
              <InfoRow
                icon={Ruler}
                label="Area"
                value={map.area}
              />
              <InfoRow
                icon={Grid3x3}
                label="Region"
                value={map.region}
              />
              <InfoRow
                icon={Waves}
                label="Coastline"
                value={map.coastlineKm}
              />
              <InfoRow
                icon={Languages}
                label="Official Language"
                value={map.officialLanguage}
              />
            </div>
          </div>
        </div>

        <section className="map-detail__section">
          <div className="map-detail__section-header">
            <h2 className="map-detail__section-title">
              {mapName} at a Glance
            </h2>
          </div>

          <div className="map-glance-grid">
            <GlanceCard
              icon={Landmark}
              label="Capital"
              value={map.capital}
            />

            <GlanceCard
              icon={MapPin}
              label="Largest City"
              value={map.largestCity}
            />

            <GlanceCard
              icon={Grid3x3}
              label="Districts"
              value={map.districtsCount}
            />

            <GlanceCard
              icon={Ruler}
              label="Area"
              value={map.area}
            />

            <GlanceCard
              icon={Waves}
              label="Coastline"
              value={map.coastlineKm}
            />

            <GlanceCard
              icon={Languages}
              label="Official Language"
              value={map.officialLanguage}
            />

          </div>

        </section>

        {(map.districtsCount || map.coastlineKm) && (
          <section className="map-detail__section">
            <div className="map-detail__section-header">
              <h2 className="map-detail__section-title">
                Map Highlights
              </h2>
            </div>

            <div className="map-highlight-grid">


              {map.districtsCount && (
                <HighlightCard
                  color="violet"
                  value={map.districtsCount}
                  label="Districts"
                  sub="Administrative Districts"
                />
              )}


              {map.coastlineKm && (
                <HighlightCard
                  color="cyan"
                  value={map.coastlineKm}
                  label="Coastline"
                  sub={`Along ${map.region || 'the region'}`}
                />
              )}

              {map.region && (
                <HighlightCard
                  color="green"
                  value={map.region}
                  label="Region"
                  sub="Geographical Region"
                />
              )}
            </div>
          </section>
        )}

        {map.importantLocations?.length > 0 && (
          <section className="map-detail__section">
            <div className="map-detail__section-header">
              <h2 className="map-detail__section-title">
                Important Locations
              </h2>
            </div>

            <div className="map-location-grid">
              {map.importantLocations.map((location, index) => (
                <div
                  key={`${location.name}-${index}`}
                  className="map-location-card"
                >
                  <div className="map-location-card__icon">
                    <MapPin size={16} />
                  </div>

                  <div className="map-location-card__content">
                    <p className="map-location-card__name">
                      {location.name}
                    </p>

                    {location.description && (
                      <p className="map-location-card__description">
                        {location.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {relatedMaps?.length > 0 && (
          <section className="map-detail__section map-related">
            <div className="map-detail__section-header">
              <h2 className="map-detail__section-title">
                Explore More Maps
              </h2>
            </div>

            <div className="map-related-grid">
              {relatedMaps.map((relatedMap) => (
                <Link
                  key={relatedMap.id}
                  href={`/government/${relatedMap.category}/${relatedMap.slug}`}
                  className="map-related-card"
                >
                  <div className="map-related-card__image">
                    <Image
                      src={
                        relatedMap.thumbnailUrl ||
                        relatedMap.imageUrl
                      }
                      alt={relatedMap.title}
                      fill
                      sizes="180px"
                    />
                  </div>
                  <div className="map-related-card__content">

                    <p className="map-related-card__title">
                      {relatedMap.title?.replace(
                        'Map of ',
                        ''
                      )}
                    </p>


                    {relatedMap.region && (

                      <p className="map-related-card__region">
                        {relatedMap.region}
                      </p>

                    )}


                    <span className="map-related-card__link">
                      View Map →
                    </span>

                  </div>

                </Link>

              ))}

            </div>

          </section>

        )}

      </div>

    </div>
  );
}


function InfoRow({
  icon: Icon,
  label,
  value,
}) {

  if (!value) {
    return null;
  }

  return (
    <div className="map-info__row">

      <span className="map-info__label">

        <Icon size={15} />

        {label}

      </span>


      <span className="map-info__value">
        {value}
      </span>

    </div>
  );
}


function GlanceCard({
  icon: Icon,
  label,
  value,
}) {
  if (!value) {
    return null;
  }
  return (
    <div className="map-glance-card">
      <div className="map-glance-card__icon">
        <Icon size={16} />
      </div>
      <p className="map-glance-card__label">
        {label}
      </p>
      <p className="map-glance-card__value">
        {value}
      </p>
    </div>
  );
}


function HighlightCard({
  color,
  value,
  label,
  sub,
}) {
  return (
    <div
      className={`map-highlight-card map-highlight-card--${color}`}
    >
      <p className="map-highlight-card__value">
        {value}
      </p>
      <p className="map-highlight-card__label">
        {label}
      </p>
      <p className="map-highlight-card__sub">
        {sub}
      </p>
      <div className="map-highlight-card__icon">
        <Waves size={18} />
      </div>
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
  const map = {
    id: doc.id,
    ...doc.data(),
  };


  if (map.createdAt?.toDate) {
    map.createdAt =
      map.createdAt.toDate().toISOString();
  }

  if (map.updatedAt?.toDate) {
    map.updatedAt =
      map.updatedAt.toDate().toISOString();
  }


  let relatedMaps = [];
  if (map.region) {
    const relatedQuery = query(
      collection(db, 'maps'),
      where('status', '==', 'published'),
      where('category', '==', category),
      where('region', '==', map.region),
      limit(6)
    );

    const relatedSnap =
      await getDocs(relatedQuery);
    relatedMaps = relatedSnap.docs

      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      .filter((item) => item.slug !== slug)
      .slice(0, 5)
      .map((item) => {
        if (item.createdAt?.toDate) {
          item.createdAt =
            item.createdAt.toDate().toISOString();
        }
        if (item.updatedAt?.toDate) {
          item.updatedAt =
            item.updatedAt.toDate().toISOString();
        }
        return item;
      });

  }
  return {
    props: {
      map,
      relatedMaps,
    },
    revalidate: 60,
  };
}