import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { ArrowRight, ChevronRight, Search, Target } from "lucide-react";
import { getPublishedMaps } from "@/lib/firestore/maps";

const FALLBACK_CARDS = [
  { id: "gov-1", title: "Government Map A", region: "National", slug: "government-map-a" },
  { id: "gov-2", title: "Government Map B", region: "National", slug: "government-map-b" },
  { id: "gov-3", title: "Government Map C", region: "National", slug: "government-map-c" },
  { id: "gov-4", title: "Government Map D", region: "National", slug: "government-map-d" },
  { id: "gov-5", title: "Government Map E", region: "National", slug: "government-map-e" },
  { id: "gov-6", title: "Government Map F", region: "National", slug: "government-map-f" },
];

function MiniCard({ seed = 0, title }) {
  const cells = Array.from({ length: 18 });
  const STATE_SWATCHES = [
    "#f04f4f",
    "#f5c65b",
    "#66c28d",
    "#52a8e8",
    "#8b6eea",
    "#e888ca",
    "#f08b58",
    "#3fb6b2",
    "#9ace5a",
    "#d95b82",
  ];
  return (
    <div className="maps-upsc__mini-map" aria-hidden="true">
      {cells.map((_, index) => (
        <span
          key={`${title}-${index}`}
          style={{
            "--tile-color": STATE_SWATCHES[(index + seed) % STATE_SWATCHES.length],
            "--tile-x": `${(index % 5) * 18 + (index % 2) * 4}px`,
            "--tile-y": `${Math.floor(index / 5) * 17 + (index % 3) * 3}px`,
            "--tile-rotate": `${((index + seed) % 7) - 3}deg`,
          }}
        />
      ))}
    </div>
  );
}

function MapCard({ item, index, isFallback }) {
  const href = isFallback ? "/government" : `/government/${item.category}/${item.slug}`;

  return (
    <Link href={href} className="maps-upsc__card">
      <div className="maps-upsc__card-image">
        {!isFallback && (item.thumbnailUrl || item.imageUrl) ? (
          <img src={item.thumbnailUrl || item.imageUrl} alt={item.title} />
        ) : (
          <MiniCard title={item.title} seed={index} />
        )}
      </div>
      <div className="maps-upsc__card-content">
        <h2 className="maps-upsc__card-title">{item.title}</h2>
        <p className="maps-upsc__card-region">{item.region || "Government map"}</p>
        <span className="maps-upsc__card-action">
          Open map <ArrowRight size={14} strokeWidth={1.8} />
        </span>
      </div>
    </Link>
  );
}

export default function GovernmentMapsPage() {
  const [maps, setMaps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // show all published maps for government overview by default
        const items = await getPublishedMaps("all");
        if (!cancelled) setMaps(items);
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const visibleMaps = useMemo(() => maps.slice(0, 6), [maps]);
  const cards = visibleMaps.length > 0 ? visibleMaps : FALLBACK_CARDS;
  const usingFallback = !loading && visibleMaps.length === 0;

  return (
    <>
      <Head>
        <title>Government Maps and Resources | Notes Cafe</title>
        <meta name="description" content="Explore government maps and related geographic resources." />
      </Head>

      <main className="maps-upsc">
        <section className="maps-upsc__hero">
          <div className="maps-upsc__container maps-upsc__hero-inner">
            <div className="maps-upsc__hero-content">
              <span className="maps-upsc__eyebrow">Maps &amp; Atlas · Government</span>
              <h1 className="maps-upsc__title">
                Explore Government <span>Maps</span>
              </h1>
              <p className="maps-upsc__description">
                Browse government maps, administrative boundaries, and policy-related geographic data.
              </p>
            </div>
            <div
              className="maps-upsc__hero-art"
              aria-hidden="true"
            />
          </div>
        </section>

        <section className="maps-upsc__container maps-upsc__maps-section">
          <div className="maps-upsc__section-header">
            <div>
              <h2 className="maps-upsc__section-heading">Government Maps</h2>
              <p className="maps-upsc__section-description">Explore government maps and spatial datasets.</p>
            </div>
          </div>

          {loading ? (
            <div className="maps-upsc__loading">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="maps-upsc__loading-card">
                  <div className="skeleton maps-upsc__loading-image" />
                  <div className="skeleton maps-upsc__loading-title" />
                  <div className="skeleton maps-upsc__loading-text" />
                  <div className="skeleton maps-upsc__loading-action" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="maps-upsc__grid">
                {cards.map((item, index) => (
                  <MapCard
                    key={item.id || item.slug}
                    item={item}
                    index={index}
                    isFallback={usingFallback}
                  />
                ))}
              </div>

              {usingFallback && (
                <div className="maps-upsc__empty-note">
                  <Search size={15} strokeWidth={1.8} />
                  Publish government maps from admin to replace these preview cards.
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </>
  );
}
