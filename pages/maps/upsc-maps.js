import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { ArrowRight, Map, Search } from "lucide-react";
import { getPublishedMaps } from "@/lib/firestore/maps";

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

  return (
    <>
      <Head>
        <title>UPSC Maps and Atlas Resources | Notes Cafe</title>
        <meta name="description" content="Explore published UPSC maps for India, world geography, rivers, mountains, parks, reserves, and important locations." />
        <meta property="og:title" content="UPSC Maps and Atlas Resources | Notes Cafe" />
        <meta property="og:description" content="Explore published UPSC maps for India, world geography, rivers, mountains, parks, reserves, and important locations." />
      </Head>

      <main className="bg-[var(--color-bg)]">
        <section className="hairline-b bg-[var(--color-surface)]">
          <div className="mx-auto max-w-[1240px] px-6 py-12 md:px-9 md:py-10">
            <div>
          
              <h1 className="hero-display text-[34px] leading-[1.05] text-[var(--color-ink)] md:whitespace-nowrap md:text-[48px] lg:text-[56px]">
                India maps for sharper geography revision.
              </h1>
              <p className="mt-5 text-[15px] leading-7 text-[var(--color-ink-muted)] md:whitespace-nowrap md:text-[17px]">
                Browse published India map resources, then open each entry for facts, metadata, and downloads.
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
          ) : maps.length === 0 ? (
            <div className="card p-12 text-center">
              <Search className="mx-auto mb-3 text-[var(--color-primary)]" size={32} strokeWidth={1.6} />
              <div className="font-semibold text-[var(--color-ink)]">No India maps published yet.</div>
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
