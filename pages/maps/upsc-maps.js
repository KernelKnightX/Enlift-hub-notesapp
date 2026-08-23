import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { ArrowRight, ChevronRight, Search, Target } from "lucide-react";
import { getPublishedMaps } from "@/lib/firestore/maps";
import ResourceHero from "@/components/public/ResourceHero";

const FALLBACK_STATES = [
  { id: "andhra-pradesh", title: "Andhra Pradesh", region: "South India", slug: "andhra-pradesh" },
  { id: "rajasthan", title: "Rajasthan", region: "North India", slug: "rajasthan" },
  { id: "telangana", title: "Telangana", region: "South India", slug: "telangana" },
  { id: "karnataka", title: "Karnataka", region: "South India", slug: "karnataka" },
  { id: "maharashtra", title: "Maharashtra", region: "West India", slug: "maharashtra" },
  { id: "gujarat", title: "Gujarat", region: "West India", slug: "gujarat" },
];

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

function MiniStateMap({ seed = 0, title }) {
  const cells = Array.from({ length: 18 });

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
  const href = isFallback
    ? "/maps/upsc-maps/india-states"
    : `/maps/upsc-maps/${item.category}/${item.slug}`;

  return (
    <Link href={href} className="maps-upsc__card">
      <div className="maps-upsc__card-image">
        {!isFallback && (item.thumbnailUrl || item.imageUrl) ? (
          <img src={item.thumbnailUrl || item.imageUrl} alt={item.title} />
        ) : (
          <MiniStateMap title={item.title} seed={index} />
        )}
      </div>
      <div className="maps-upsc__card-content">
        <h2 className="maps-upsc__card-title">{item.title}</h2>
        <p className="maps-upsc__card-region">{item.region || "India map"}</p>
        <span className="maps-upsc__card-action">
          Open map <ArrowRight size={14} strokeWidth={1.8} />
        </span>
      </div>
    </Link>
  );
}

export default function UpscMapsPage() {
  const [maps, setMaps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const items = await getPublishedMaps("india-states");
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
  const cards = visibleMaps.length > 0 ? visibleMaps : FALLBACK_STATES;
  const usingFallback = !loading && visibleMaps.length === 0;

  return (
    <>
      <Head>
        <title>UPSC Maps and Atlas Resources | Notes Cafe</title>
        <meta name="description" content="Explore published UPSC maps for India, world geography, rivers, mountains, parks, reserves, and important locations." />
        <meta property="og:title" content="UPSC Maps and Atlas Resources | Notes Cafe" />
        <meta property="og:description" content="Explore published UPSC maps for India, world geography, rivers, mountains, parks, reserves, and important locations." />
      </Head>

      <main className="maps-upsc">
        <ResourceHero
          withSeo={false}
          eyebrow="Maps & Atlas"
          title="Explore India through Maps"
          description="Browse state-wise maps and visual geography resources."
        />

        <section className="maps-upsc__container maps-upsc__maps-section">
          <div className="maps-upsc__section-header">
            <div>
              <h2 className="maps-upsc__section-heading">India States</h2>
              <p className="maps-upsc__section-description">
                Explore state-wise administrative maps
              </p>
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
                  Publish India state maps from admin to replace these preview cards.
                </div>
              )}
            </>
          )}


        </section>
      </main>
    </>
  );
}
