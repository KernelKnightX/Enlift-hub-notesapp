import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Map } from "lucide-react";
import { getPublishedMaps } from "@/lib/firestore/maps";
import ResourceHero from "@/components/public/ResourceHero";

function MapCard({ item, index }) {
  const href = `/maps/upsc-maps/${item.category}/${item.slug}`;

  return (
    <Link href={href} className="maps-upsc__card">
      <div className="maps-upsc__card-image">
        <span className="maps-upsc__card-badge">Atlas map</span>
        {(item.thumbnailUrl || item.imageUrl) ? (
          <img src={item.thumbnailUrl || item.imageUrl} alt={item.title} />
        ) : (
          <div className="maps-upsc__card-placeholder" aria-hidden="true">
            <Map size={28} strokeWidth={1.5} />
          </div>
        )}
      </div>
      <div className="maps-upsc__card-content">
        <div className="maps-upsc__card-body">
          <h2 className="maps-upsc__card-title">{item.title}</h2>
          <p className="maps-upsc__card-meta">{item.region || "India map"}</p>
        </div>
        <span className="maps-upsc__card-action">
          View details <ArrowRight size={14} strokeWidth={1.8} />
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

  const visibleMaps = useMemo(() => maps.slice(0, 12), [maps]);

  return (
    <main className="maps-upsc">
      <ResourceHero
        withSeo={false}
        eyebrow="Maps & Atlas"
        title="Explore India through Maps"
        description="Browse state-wise maps and visual geography resources published from the admin office."
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
        ) : visibleMaps.length === 0 ? (
          <div className="maps-upsc__empty-note">
            <Map size={28} strokeWidth={1.5} style={{ margin: '0 auto 12px', color: 'var(--color-ink-faint)' }} />
            <p>No India state maps have been published yet.</p>
            <p className="maps-upsc__empty-sub">Maps added from Admin → Maps & Atlas will appear here.</p>
          </div>
        ) : (
          <div className="maps-upsc__grid">
            {visibleMaps.map((item, index) => (
              <MapCard key={item.id || item.slug} item={item} index={index} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
