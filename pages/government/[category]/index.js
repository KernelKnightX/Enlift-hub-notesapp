import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { ArrowRight, Map } from "lucide-react";
import { getPublishedGovernment } from "@/lib/firestore/government";
import ResourceHero from "@/components/public/ResourceHero";

const CATEGORY_LABELS = {
  "schemes": {
    eyebrow: "Government",
    title: "Government Schemes",
    description: "Explore major government schemes, their scope, and geographic implementation.",
    heading: "Government Schemes",
    sectionDescription: "Discover central/state schemes and their spatial coverage.",
    metaTitle: "Government Schemes | Notes Cafe",
    metaDescription: "Maps and references for Government Schemes and their geographic reach.",
  },
  "constitution-articles": {
    eyebrow: "Government",
    title: "Constitution Articles",
    description: "Explore important constitutional provisions and their interpretation.",
    heading: "Constitution Articles",
    sectionDescription: "Key articles and their relevance — with spatial/administrative context.",
    metaTitle: "Constitution Articles | Maps & Atlas | Notes Cafe",
    metaDescription: "Reference maps and notes for Constitution Articles.",
  },
  "important-acts": {
    eyebrow: "Government",
    title: "Important Acts",
    description: "Explore major laws and acts and regional implementation notes.",
    heading: "Important Acts",
    sectionDescription: "Maps and summaries for important statutes and their jurisdiction.",
    metaTitle: "Important Acts | Maps & Atlas | Notes Cafe",
    metaDescription: "Maps and summaries for major government acts.",
  },
  "committees": {
    eyebrow: "Government",
    title: "Committees",
    description: "Explore government committees, their mandates and reports.",
    heading: "Committees",
    sectionDescription: "Find committee reports, jurisdictional notes, and maps where applicable.",
    metaTitle: "Committees | Maps & Atlas | Notes Cafe",
    metaDescription: "Maps and references for government committees and findings.",
  },
  "ministries": {
    eyebrow: "Government",
    title: "Ministries",
    description: "Explore ministries, departments and their geographic responsibilities.",
    heading: "Ministries",
    sectionDescription: "Maps and organizational references for ministries and departments.",
    metaTitle: "Ministries | Maps & Atlas | Notes Cafe",
    metaDescription: "Maps and references for government ministries and departments.",
  },
  "reports-indices": {
    eyebrow: "Government",
    title: "Reports & Indices",
    description: "Explore major government reports and indices with geographic context.",
    heading: "Reports & Indices",
    sectionDescription: "Key reports, indices and spatial analyses for policymaking.",
    metaTitle: "Reports & Indices | Maps & Atlas | Notes Cafe",
    metaDescription: "Government reports, indices and maps for policy reference.",
  },
};
CATEGORY_LABELS["reports-and-indices"] = CATEGORY_LABELS["reports-indices"];

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
  };
};

export default function GovernmentCategoryPage() {
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
        const items = await getPublishedGovernment(category);

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
        <ResourceHero
          withSeo={false}
          eyebrow={config.eyebrow}
          title={config.title}
          description={config.description}
        />

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
                  No items published yet.
                </h2>

                <p className="maps-upsc__empty-description">
                  Items in this government section will appear here once published.
                </p>
              </div>
            ) : (

              <div className="maps-upsc__grid">
                {maps.map((item) => (
                  <Link
                    key={item.id}
                    href={`/government/${item.section || category}/${item.slug}`}
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
                        <span>Open detail</span>

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