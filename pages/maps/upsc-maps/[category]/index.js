import Head from "next/head";
import Link from "next/link";
import { ArrowRight, Map } from "lucide-react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebase/config";
import { MAP_CATEGORIES, formatLengthKm, normalizeLengthKm } from "@/lib/firestore/maps";
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
    emptyTitle: "No state maps published yet.",
    emptyDescription: "Published state maps will appear here once they are available.",
  },
  "biosphere-reserves": {
    eyebrow: "Maps & Atlas · India",
    title: "Biosphere Reserves of India",
    description: "Explore India's protected biosphere reserves and biodiversity hotspots.",
    heading: "Biosphere Reserves",
    sectionDescription: "Discover India's biosphere reserves and their ecological significance.",
    metaTitle: "Biosphere Reserves Maps | UPSC Maps and Atlas Resources | Notes Cafe",
    metaDescription: "Explore India's biosphere reserves for UPSC geography preparation.",
    emptyTitle: "No biosphere reserve maps published yet.",
    emptyDescription: "Published biosphere reserve maps will appear here once they are available.",
  },
  "river-systems": {
    eyebrow: "Maps & Atlas · India",
    title: "River Systems of India",
    description: "Explore India's major river systems and their geographical significance.",
    heading: "River Systems",
    sectionDescription: "Discover India's river systems and their importance for UPSC.",
    metaTitle: "River Systems Maps | UPSC Maps and Atlas Resources | Notes Cafe",
    metaDescription: "Explore India's river systems for UPSC geography preparation.",
    emptyTitle: "No river system maps published yet.",
    emptyDescription: "Published river maps will appear here once they are available.",
  },
  "mountain-ranges": {
    eyebrow: "Maps & Atlas · India",
    title: "Mountain Ranges of India",
    description: "Explore India's major mountain ranges and highland regions.",
    heading: "Mountain Ranges",
    sectionDescription: "Discover India's mountain ranges and their geographical features.",
    metaTitle: "Mountain Ranges Maps | UPSC Maps and Atlas Resources | Notes Cafe",
    metaDescription: "Explore India's mountain ranges for UPSC geography preparation.",
    emptyTitle: "No mountain range maps published yet.",
    emptyDescription: "Published mountain range maps will appear here once they are available.",
  },
  "national-parks": {
    eyebrow: "Maps & Atlas · India",
    title: "National Parks of India",
    description: "Explore India's national parks and protected wildlife areas.",
    heading: "National Parks",
    sectionDescription: "Discover India's national parks and their ecological importance.",
    metaTitle: "National Parks Maps | UPSC Maps and Atlas Resources | Notes Cafe",
    metaDescription: "Explore India's national parks for UPSC geography preparation.",
    emptyTitle: "No national park maps published yet.",
    emptyDescription: "Published national park maps will appear here once they are available.",
  },
  "important-locations": {
    eyebrow: "Maps & Atlas · India",
    title: "Important Locations of India",
    description: "Explore strategically important locations across India.",
    heading: "Important Locations",
    sectionDescription: "Discover important locations for UPSC map-based questions.",
    metaTitle: "Important Locations Maps | UPSC Maps and Atlas Resources | Notes Cafe",
    metaDescription: "Explore important locations for UPSC geography preparation.",
    emptyTitle: "No location maps published yet.",
    emptyDescription: "Published location maps will appear here once they are available.",
  },
};

const getCategoryConfig = (category) => {
  if (CATEGORY_LABELS[category]) {
    return CATEGORY_LABELS[category];
  }

  const formatted = category?.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ") || "Maps";
  return {
    eyebrow: "Maps & Atlas · India",
    title: formatted,
    description: `Explore ${formatted.toLowerCase()} and their geographical significance.`,
    heading: formatted,
    sectionDescription: `Discover ${formatted.toLowerCase()} for UPSC preparation.`,
    metaTitle: `${formatted} Maps | UPSC Maps and Atlas Resources | Notes Cafe`,
    metaDescription: `Explore ${formatted.toLowerCase()} for UPSC geography preparation.`,
    emptyTitle: `No ${formatted.toLowerCase()} maps published yet.`,
    emptyDescription: `Published ${formatted.toLowerCase()} maps will appear here once they are available.`,
  };
};

function serializeMap(item) {
  return Object.fromEntries(
    Object.entries(item).map(([key, value]) => {
      if (value?.toDate) return [key, value.toDate().toISOString()];
      if (key === "lengthKm") return [key, normalizeLengthKm(value)];
      return [key, value];
    }).filter(([, value]) => value !== undefined)
  );
}

function getCardSubtitle(item, category) {
  if (category === "river-systems") {
    const parts = [];
    const lengthLabel = formatLengthKm(item.lengthKm);
    if (lengthLabel) parts.push(lengthLabel);
    if (item.origin) parts.push(item.origin);
    return parts.join(" · ");
  }

  if (item.region) return item.region;
  if (item.statesCovered) return item.statesCovered;
  if (item.parkState) return item.parkState;
  return "";
}

export default function UpscMapsCategoryPage({ maps = [], category }) {
  const config = getCategoryConfig(category);

  return (
    <>
      <Head>
        <title>{config.metaTitle}</title>
        <meta name="description" content={config.metaDescription} />
        <meta property="og:title" content={config.metaTitle} />
        <meta property="og:description" content={config.metaDescription} />
      </Head>

      <main className="maps-upsc">
        <ResourceHero
          withSeo={false}
          path={`/maps/upsc-maps/${category}`}
          eyebrow={config.eyebrow}
          title={config.title}
          description={config.description}
        />

        <section className="maps-upsc__maps-section">
          <div className="maps-upsc__container">
            <div className="maps-upsc__section-header">
              <div>
                <h2 className="maps-upsc__section-heading">{config.heading}</h2>
                <p className="maps-upsc__section-description">{config.sectionDescription}</p>
              </div>
            </div>

            {maps.length === 0 ? (
              <div className="maps-upsc__empty">
                <div className="maps-upsc__empty-icon">
                  <Map size={22} strokeWidth={1.7} />
                </div>
                <h2 className="maps-upsc__empty-title">{config.emptyTitle}</h2>
                <p className="maps-upsc__empty-description">{config.emptyDescription}</p>
              </div>
            ) : (
              <div className="maps-upsc__grid">
                {maps.map((item) => {
                  const subtitle = getCardSubtitle(item, category);

                  return (
                  <Link
                    key={item.id}
                    href={`/maps/upsc-maps/${item.category}/${item.slug}`}
                    className="maps-upsc__card"
                  >
                    <div className="maps-upsc__card-image">
                      <span className="maps-upsc__card-badge">Atlas map</span>
                      {item.thumbnailUrl || item.imageUrl ? (
                        <img src={item.thumbnailUrl || item.imageUrl} alt={item.title} />
                      ) : (
                        <div className="maps-upsc__card-placeholder">
                          <Map size={30} strokeWidth={1.6} />
                        </div>
                      )}
                    </div>

                    <div className="maps-upsc__card-content">
                      <div className="maps-upsc__card-body">
                        <h2 className="maps-upsc__card-title">{item.title}</h2>
                        {subtitle ? (
                          <p className="maps-upsc__card-meta">{subtitle}</p>
                        ) : null}
                      </div>
                      <div className="maps-upsc__card-action">
                        <span>Open map</span>
                        <ArrowRight size={14} />
                      </div>
                    </div>
                  </Link>
                  );
                })}
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
    paths: MAP_CATEGORIES.map((item) => ({
      params: { category: item.value },
    })),
    fallback: "blocking",
  };
}

export async function getStaticProps({ params }) {
  const category = params?.category;

  if (!category) {
    return { notFound: true };
  }

  try {
    const snap = await getDocs(query(
      collection(db, "maps"),
      where("status", "==", "published"),
      where("category", "==", category),
    ));

    const maps = snap.docs
      .map((doc) => serializeMap({ id: doc.id, ...doc.data() }))
      .sort((left, right) => String(left.title || "").localeCompare(String(right.title || "")));

    return {
      props: {
        category,
        maps,
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error(`Failed to load maps for category ${category}:`, error);

    return {
      props: {
        category,
        maps: [],
      },
      revalidate: 60,
    };
  }
}
