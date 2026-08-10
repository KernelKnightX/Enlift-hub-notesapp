import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { ArrowRight, Map, Search } from "lucide-react";
import { MAP_CATEGORIES, categoryLabel, getPublishedMaps } from "@/lib/firestore/maps";

export default function UpscMapsCategoryPage() {
  const router = useRouter();
  const routeCategory = router.query.category || router.asPath.split("?")[0].split("/").filter(Boolean)[2] || "";
  const [maps, setMaps] = useState([]);
  const [loading, setLoading] = useState(true);

  const selectedCategory = useMemo(
    () => MAP_CATEGORIES.find((item) => item.value === routeCategory),
    [routeCategory],
  );

  useEffect(() => {
    if (!router.isReady) return;
    if (!selectedCategory) {
      setMaps([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const items = await getPublishedMaps(selectedCategory.value);
        if (!cancelled) setMaps(items);
      } catch (error) {
        console.error(error);
        if (!cancelled) setMaps([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router.isReady, selectedCategory]);

  const pageLabel = selectedCategory?.label || categoryLabel(routeCategory);
  const title = `${pageLabel} UPSC Maps | Notes Cafe`;
  const description = `Explore published ${pageLabel.toLowerCase()} map resources for UPSC geography revision.`;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
      </Head>

      <main className="bg-[var(--color-bg)]">
        <section className="hairline-b bg-[var(--color-surface)]">
          <div className="mx-auto max-w-[1240px] px-6 py-12 md:px-9 md:py-10">
            <div>
              <Link href="/maps/upsc-maps" className="chip chip-primary">Maps & Atlas</Link>
              <h1 className="hero-display mt-4 text-[34px] leading-[1.05] text-[var(--color-ink)] md:text-[48px] lg:text-[56px]">
                {pageLabel} maps for sharper geography revision.
              </h1>
              <p className="mt-5 text-[15px] leading-7 text-[var(--color-ink-muted)] md:text-[17px]">
                Browse published map resources in this category, then open each entry for facts, metadata, and downloads.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1240px] px-6 py-8 md:px-10 md:py-10">
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="card p-3">
                  <div className="skeleton aspect-[4/3]" />
                  <div className="skeleton mt-4 h-4 w-3/4" />
                  <div className="skeleton mt-2 h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : !selectedCategory ? (
            <div className="card p-12 text-center">
              <Search className="mx-auto mb-3 text-[var(--color-primary)]" size={32} strokeWidth={1.6} />
              <div className="font-semibold text-[var(--color-ink)]">Map category not found.</div>
              <Link href="/maps/upsc-maps" className="btn btn-primary mt-5">Back to maps</Link>
            </div>
          ) : maps.length === 0 ? (
            <div className="card p-12 text-center">
              <Search className="mx-auto mb-3 text-[var(--color-primary)]" size={32} strokeWidth={1.6} />
              <div className="font-semibold text-[var(--color-ink)]">No maps in this category yet.</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {maps.map((item) => (
                <Link key={item.id} href={`/maps/upsc-maps/${item.category}/${item.slug}`} className="card card-hover overflow-hidden">
                  <div className="aspect-[4/3] bg-[var(--color-surface-alt)]">
                    {item.thumbnailUrl || item.imageUrl ? (
                      <img src={item.thumbnailUrl || item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full place-items-center text-[var(--color-primary)]">
                        <Map size={30} strokeWidth={1.6} />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="mb-3 flex flex-wrap gap-2">
                      <span className="chip chip-primary">{categoryLabel(item.category)}</span>
                      {item.region ? <span className="chip">{item.region}</span> : null}
                    </div>
                    <h2 className="clamp-2 text-[16px] font-semibold leading-snug text-[var(--color-ink)]">{item.title}</h2>
                    <div className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--color-primary)]">
                      Open map <ArrowRight size={14} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
