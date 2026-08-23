import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { ArrowRight, Map } from "lucide-react";
import { getPublishedMaps } from "@/lib/firestore/maps";
import ResourceHero from "@/components/public/ResourceHero";

const CATEGORY_LABELS = {
  "india-states": {
    eyebrow: "Maps & Atlas · India",
    title: "Explore India through Maps",
    description: "Browse state-wise maps and visual geography resources.",
    heading: "India States",
    sectionDescription: "Explore state-wise administrative maps and important geographic details.",
    metaTitle: "India States Maps | UPSC Maps and Atlas Resources | Notes Cafe",
    metaDescription: "Explore India state maps for UPSC preparation.",
  },
  "biosphere-reserves": {
    eyebrow: "Maps & Atlas · India",
    title: "Biosphere Reserves of India",
    description: "Explore India's protected biosphere reserves and biodiversity hotspots.",
    heading: "Biosphere Reserves",
    sectionDescription: "Discover India's biosphere reserves and their ecological significance.",
    metaTitle: "Biosphere Reserves Maps | UPSC Maps and Atlas Resources | Notes Cafe",
    metaDescription: "Explore India's biosphere reserves for UPSC geography preparation.",
  },
  "river-systems": {
    eyebrow: "Maps & Atlas · India",
    title: "River Systems of India",
    description: "Explore India's major river systems and their geographical significance.",
    heading: "River Systems",
    sectionDescription: "Discover India's river systems and their importance for UPSC.",
    metaTitle: "River Systems Maps | UPSC Maps and Atlas Resources | Notes Cafe",
    metaDescription: "Explore India's river systems for UPSC geography preparation.",
  },
  "mountain-ranges": {
    eyebrow: "Maps & Atlas · India",
    title: "Mountain Ranges of India",
    description: "Explore India's major mountain ranges and highland regions.",
    heading: "Mountain Ranges",
    sectionDescription: "Discover India's mountain ranges and their geographical features.",
    metaTitle: "Mountain Ranges Maps | UPSC Maps and Atlas Resources | Notes Cafe",
    metaDescription: "Explore India's mountain ranges for UPSC geography preparation.",
  },
  "national-parks": {
    eyebrow: "Maps & Atlas · India",
    title: "National Parks of India",
    description: "Explore India's national parks and protected wildlife areas.",
    heading: "National Parks",
    sectionDescription: "Discover India's national parks and their ecological importance.",
    metaTitle: "National Parks Maps | UPSC Maps and Atlas Resources | Notes Cafe",
    metaDescription: "Explore India's national parks for UPSC geography preparation.",
  },
};

const getCategoryConfig = (category) => {
  if (CATEGORY_LABELS[category]) {
    return CATEGORY_LABELS[category];
  }
  
  const formatted = category?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || 'Maps';
  return {
    eyebrow: "Maps & Atlas · India",
    title: formatted,
    description: `Explore ${formatted.toLowerCase()} and their geographical significance.`,
    heading: formatted,
    sectionDescription: `Discover ${formatted.toLowerCase()} for UPSC preparation.`,
    metaTitle: `${formatted} Maps | UPSC Maps and Atlas Resources | Notes Cafe`,
    metaDescription: `Explore ${formatted.toLowerCase()} for UPSC geography preparation.`,
  };
};

export default function UpscMapsPage() {
  const router = useRouter();
  const { category } = router.query;
  const config = getCategoryConfig(category);

  const [maps, setMaps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!category) return;
    
    let cancelled = false;

    (async () => {
      try {
        const items = await getPublishedMaps(category);

        if (!cancelled) {
          setMaps(items);
        }
      } catch (error) {
        console.error(error);

        if (!cancelled) {
          setMaps([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [category]);

  return (
    <>
      <Head>
        <title>{config.metaTitle}</title>

        <meta
          name="description"
          content={config.metaDescription}
        />

        <meta
          property="og:title"
          content={config.metaTitle}
        />

        <meta
          property="og:description"
          content={config.metaDescription}
        />
      </Head>

      <main className="maps-upsc">
        {/* =====================================================
            HERO
        ====================================================== */}

        <ResourceHero
          withSeo={false}
          eyebrow={config.eyebrow}
          title={config.title}
          description={config.description}
        />

        {/* =====================================================
            CATEGORY SECTION
        ====================================================== */}

        <section className="maps-upsc__maps-section">
          <div className="maps-upsc__container">

            <div className="maps-upsc__section-header">
              <div>
                <h2 className="maps-upsc__section-heading">
                  {config.heading}
                </h2>

                <p className="maps-upsc__section-description">
                  {config.sectionDescription}
                </p>
              </div>
            </div>

            {/* =================================================
                LOADING
            ================================================== */}

            {loading ? (
              <div className="maps-upsc__loading">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="maps-upsc__loading-card"
                  >
                    <div className="maps-upsc__loading-image skeleton" />

                    <div className="maps-upsc__loading-title skeleton" />

                    <div className="maps-upsc__loading-action skeleton" />
                  </div>
                ))}
              </div>
            ) : maps.length === 0 ? (
              /* =================================================
                  EMPTY STATE
              ================================================== */

              <div className="maps-upsc__empty">
                <div className="maps-upsc__empty-icon">
                  <Map size={22} strokeWidth={1.7} />
                </div>

                <h2 className="maps-upsc__empty-title">
                  No India maps published yet.
                </h2>

                <p className="maps-upsc__empty-description">
                  Published state maps will appear here once they
                  are available.
                </p>
              </div>
            ) : (
              /* =================================================
                  MAP GRID
              ================================================== */

              <div className="maps-upsc__grid">
                {maps.map((item) => (
                  <Link
                    key={item.id}
                    href={`/maps/upsc-maps/${item.category}/${item.slug}`}
                    className="maps-upsc__card"
                  >
                    {/* MAP IMAGE */}

                    <div className="maps-upsc__card-image">
                      {item.thumbnailUrl || item.imageUrl ? (
                        <img
                          src={item.thumbnailUrl || item.imageUrl}
                          alt={item.title}
                        />
                      ) : (
                        <div className="maps-upsc__card-placeholder">
                          <Map
                            size={30}
                            strokeWidth={1.6}
                          />
                        </div>
                      )}
                    </div>

                    {/* CARD CONTENT */}

                    <div className="maps-upsc__card-content">
                      <h2 className="maps-upsc__card-title">
                        {item.title}
                      </h2>

                      <div className="maps-upsc__card-action">
                        <span>Open map</span>

                        <ArrowRight size={14} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

          </div>
        </section>
      </main>
    </>
  );
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: "blocking",
  };
}

export async function getStaticProps() {
  return {
    props: {},
    revalidate: 60,
  };
}
