import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { ArrowRight, Map } from "lucide-react";
import { getPublishedMaps } from "@/lib/firestore/maps";

const CATEGORY_LABELS = {
  "schemes": {
    eyebrow: "Government",
    title: "Government Schemes",
    description: "Explore major government schemes, their scope, and geographic implementation.",
    heading: "Government Schemes",
    sectionDescription: "Discover central/state schemes and their spatial coverage.",
    metaTitle: "Government Schemes | Notes Cafe",
    metaDescription: "Maps and references for Government Schemes and their geographic reach.",
    heroImage: "/maps/schemes-hero-bg.svg",
  },
  "constitution-articles": {
    eyebrow: "Government",
    title: "Constitution Articles",
    description: "Explore important constitutional provisions and their interpretation.",
    heading: "Constitution Articles",
    sectionDescription: "Key articles and their relevance — with spatial/administrative context.",
    metaTitle: "Constitution Articles | Maps & Atlas | Notes Cafe",
    metaDescription: "Reference maps and notes for Constitution Articles.",
    heroImage: "/maps/constitution-articles-hero-bg.svg",
  },
  "important-acts": {
    eyebrow: "Government",
    title: "Important Acts",
    description: "Explore major laws and acts and regional implementation notes.",
    heading: "Important Acts",
    sectionDescription: "Maps and summaries for important statutes and their jurisdiction.",
    metaTitle: "Important Acts | Maps & Atlas | Notes Cafe",
    metaDescription: "Maps and summaries for major government acts.",
    heroImage: "/maps/important-acts-hero-bg.svg",
  },
  "committees": {
    eyebrow: "Government",
    title: "Committees",
    description: "Explore government committees, their mandates and reports.",
    heading: "Committees",
    sectionDescription: "Find committee reports, jurisdictional notes, and maps where applicable.",
    metaTitle: "Committees | Maps & Atlas | Notes Cafe",
    metaDescription: "Maps and references for government committees and findings.",
    heroImage: "/maps/committees-hero-bg.svg",
  },
  "ministries": {
    eyebrow: "Government",
    title: "Ministries",
    description: "Explore ministries, departments and their geographic responsibilities.",
    heading: "Ministries",
    sectionDescription: "Maps and organizational references for ministries and departments.",
    metaTitle: "Ministries | Maps & Atlas | Notes Cafe",
    metaDescription: "Maps and references for government ministries and departments.",
    heroImage: "/maps/ministries-hero-bg.svg",
  },
  "reports-indices": {
    eyebrow: "Government",
    title: "Reports & Indices",
    description: "Explore major government reports and indices with geographic context.",
    heading: "Reports & Indices",
    sectionDescription: "Key reports, indices and spatial analyses for policymaking.",
    metaTitle: "Reports & Indices | Maps & Atlas | Notes Cafe",
    metaDescription: "Government reports, indices and maps for policy reference.",
    heroImage: "/maps/reports-indices-hero-bg.svg",
  },
};

const getCategoryConfig = (category) => {
  if (CATEGORY_LABELS[category]) {
    return CATEGORY_LABELS[category];
  }
  
  const formatted = category?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || 'Maps';
  return {
    eyebrow: "Government",
    title: formatted,
    description: `Explore ${formatted.toLowerCase()} and their policy / administrative significance.`,
    heading: formatted,
    sectionDescription: `Discover ${formatted.toLowerCase()} related to government data and maps.`,
    metaTitle: `${formatted} Maps | Government Maps and Atlas | Notes Cafe`,
    metaDescription: `Explore ${formatted.toLowerCase()} for government reference.`,
    heroImage: `/maps/${category}-hero-bg.svg`,
  };
};

export default function GovernmentCategoryPage({ heroImage: propHeroImage }) {
  const router = useRouter();
  const { category } = router.query;
  const config = getCategoryConfig(category);
  const heroFromConfig = config?.heroImage;
  const hero = propHeroImage || heroFromConfig || "/maps/upsc-maps-hero-bg.svg";
  
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
        {/* HERO */}
        <section className="maps-upsc__hero">
          <div className="maps-upsc__container">
            <div className="maps-upsc__hero-inner">
              <div className="maps-upsc__hero-content">
                <div className="maps-upsc__eyebrow">
                  {config.eyebrow}
                </div>

                <h1 className="maps-upsc__title">
                  {config.title}
                </h1>

                <p className="maps-upsc__description">
                  {config.description}
                </p>
              </div>

              <div
                className="maps-upsc__hero-art"
                aria-hidden="true"
                style={{
                  backgroundImage: `linear-gradient(90deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.92) 12%, rgba(255,255,255,0.78) 26%, rgba(255,255,255,0.45) 44%, rgba(255,255,255,0) 62%), url("${hero}")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'left center, right center',
                  backgroundSize: '100% 100%, cover',
                }}
              />
            </div>
          </div>
        </section>

        {/* CATEGORY SECTION */}
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

              <div className="maps-upsc__empty">
                <div className="maps-upsc__empty-icon">
                  <Map size={22} strokeWidth={1.7} />
                </div>

                <h2 className="maps-upsc__empty-title">
                  No government maps published yet.
                </h2>

                <p className="maps-upsc__empty-description">
                  Published government maps will appear here once they are available.
                </p>
              </div>
            ) : (

              <div className="maps-upsc__grid">
                {maps.map((item) => (
                  <Link
                    key={item.id}
                    href={`/maps/government/${item.category}/${item.slug}`}
                    className="maps-upsc__card"
                  >
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

export async function getStaticProps({ params }) {
  const { category } = params || {};
  let heroImage = "/maps/upsc-maps-hero-bg.svg";

  try {
    const fs = require('fs');
    const path = require('path');
    if (category) {
      const mapsDir = path.join(process.cwd(), 'public', 'maps');
      const exts = ['svg', 'png', 'jpg', 'jpeg', 'webp'];

      for (const ext of exts) {
        const candidate = path.join(mapsDir, `${category}-hero-bg.${ext}`);
        if (fs.existsSync(candidate)) {
          heroImage = `/maps/${category}-hero-bg.${ext}`;
          break;
        }
      }

      if (heroImage === "/maps/upsc-maps-hero-bg.svg") {
        const files = fs.readdirSync(mapsDir);
        const tokens = category.split('-').map(t => t.replace(/[-\\/\\^$*+?.()|[\]{}]/g, '\\$&'));
        const tokenPatterns = tokens.map(t => `${t}(?:s)?`);
        const regex = new RegExp(`(?:${tokenPatterns.join('|')}).*hero-bg\\.(` + exts.join('|') + `)$`, 'i');
        const match = files.find((f) => regex.test(f));
        if (match) {
          heroImage = `/maps/${match}`;
        } else if (CATEGORY_LABELS[category]?.heroImage) {
          heroImage = CATEGORY_LABELS[category].heroImage;
        }
      }
    }
  } catch (e) {
    // ignore
  }

  return {
    props: { heroImage },
    revalidate: 60,
  };
}