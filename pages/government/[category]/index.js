import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import GovernmentContentPage from "@/components/public/GovernmentContentPage";
import { getPublishedGovernment } from "@/lib/firestore/government";
import { getHeroImage } from "@/lib/heroImages";

const CATEGORY_LABELS = {
  schemes: {
    title: "Government Schemes",
    description: "Explore major government schemes, their scope, and geographic implementation.",
    gridTitle: "Explore Government Schemes",
    itemLabel: "schemes",
    searchPlaceholder: "Search schemes by name, ministry, keyword...",
    metaTitle: "Government Schemes | Notes Cafe",
    metaDescription: "Maps and references for Government Schemes and their geographic reach.",
    showFilterBar: true,
  },
  "constitution-articles": {
    title: "Constitution Articles",
    description: "Explore important constitutional provisions and their interpretation.",
    gridTitle: "Explore Constitution Articles",
    itemLabel: "articles",
    searchPlaceholder: "Search constitution articles...",
    metaTitle: "Constitution Articles | Notes Cafe",
    metaDescription: "Reference maps and notes for Constitution Articles.",
  },
  "important-acts": {
    title: "Important Acts",
    description: "Explore major laws and acts and regional implementation notes.",
    gridTitle: "Explore Important Acts",
    itemLabel: "acts",
    searchPlaceholder: "Search important acts...",
    metaTitle: "Important Acts | Notes Cafe",
    metaDescription: "Maps and summaries for major government acts.",
  },
  committees: {
    title: "Committees",
    description: "Explore government committees, their mandates and reports.",
    gridTitle: "Explore Committees",
    itemLabel: "committees",
    searchPlaceholder: "Search committees...",
    metaTitle: "Committees | Notes Cafe",
    metaDescription: "Maps and references for government committees and findings.",
  },
  ministries: {
    title: "Ministries",
    description: "Explore ministries, departments and their geographic responsibilities.",
    gridTitle: "Explore Ministries",
    itemLabel: "ministries",
    searchPlaceholder: "Search ministries...",
    metaTitle: "Ministries | Notes Cafe",
    metaDescription: "Maps and references for government ministries and departments.",
  },
  "reports-indices": {
    title: "Reports & Indices",
    description: "Explore major government reports and indices with geographic context.",
    gridTitle: "Explore Reports & Indices",
    itemLabel: "reports",
    searchPlaceholder: "Search reports and indices...",
    metaTitle: "Reports & Indices | Notes Cafe",
    metaDescription: "Government reports, indices and maps for policy reference.",
  },
};
CATEGORY_LABELS["reports-and-indices"] = CATEGORY_LABELS["reports-indices"];

const getCategoryConfig = (category) => {
  if (CATEGORY_LABELS[category]) {
    return CATEGORY_LABELS[category];
  }

  const formatted = category?.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ") || "Government";
  return {
    title: formatted,
    description: `Explore ${formatted.toLowerCase()} and their policy / administrative significance.`,
    gridTitle: `Explore ${formatted}`,
    itemLabel: "items",
    searchPlaceholder: `Search ${formatted.toLowerCase()}...`,
    metaTitle: `${formatted} | Notes Cafe`,
    metaDescription: `Explore ${formatted.toLowerCase()} for government reference.`,
  };
};

function mapGovernmentItem(item) {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    summary: item.summary || item.objective || item.provision || item.mandate || item.upscFact,
    ministry: item.ministry || item.department || item.publisher,
    year: item.launchYear || item.year || item.releaseYear || item.establishedYear,
    region: item.region,
    sector: item.sector || item.region || item.ministry,
    image: item.thumbnailUrl || item.imageUrl,
    featured: item.featured,
  };
}

export default function GovernmentCategoryPage() {
  const router = useRouter();
  const { category } = router.query;
  const config = getCategoryConfig(category);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!category) return undefined;

    let cancelled = false;

    (async () => {
      try {
        const published = await getPublishedGovernment(category);
        if (!cancelled) setItems(published.map(mapGovernmentItem));
      } catch (error) {
        console.error(error);
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [category]);

  const heroImage = useMemo(() => {
    if (!category) return null;
    return getHeroImage(`/government/${category}`);
  }, [category]);

  const breadcrumbs = useMemo(() => {
    if (!category) return null;
    return [
      { label: "Government", href: "/government" },
      { label: config.title },
    ];
  }, [category, config.title]);

  return (
    <>
      <Head>
        <title>{config.metaTitle}</title>
        <meta name="description" content={config.metaDescription} />
        <meta property="og:title" content={config.metaTitle} />
        <meta property="og:description" content={config.metaDescription} />
      </Head>

      <GovernmentContentPage
        sectionSlug={category}
        config={{
          title: config.title,
          description: config.description,
          heroImage,
          gridTitle: config.gridTitle,
          itemLabel: config.itemLabel,
          searchPlaceholder: config.searchPlaceholder,
          showFilterBar: config.showFilterBar,
        }}
        items={items}
        loading={loading || !category}
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
        breadcrumbs={breadcrumbs}
      />
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
