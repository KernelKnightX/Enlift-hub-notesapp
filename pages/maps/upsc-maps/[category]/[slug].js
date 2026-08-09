import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Download, FileDown, ImageDown, MapPinned } from "lucide-react";
import { categoryLabel, getMapBySlug } from "@/lib/firestore/maps";

const CATEGORY_METADATA = {
  "river-systems": [
    ["Origin", "origin"],
    ["Mouth", "mouth"],
    ["Length", "lengthKm"],
    ["States Covered", "statesCovered"],
    ["Tributaries", "tributaries"],
  ],
  "mountain-ranges": [
    ["Highest Peak", "highestPeak"],
    ["Length", "mountainLengthKm"],
    ["States Covered", "mountainStatesCovered"],
    ["Formed Era", "formedEra"],
  ],
  "national-parks": [
    ["State", "parkState"],
    ["Established Year", "establishedYear"],
    ["Area", "parkArea"],
    ["Famous For", "famousFor"],
  ],
  "biosphere-reserves": [
    ["States", "reserveStates"],
    ["Established Year", "reserveEstablishedYear"],
    ["Core Area", "coreArea"],
    ["UNESCO Status", "unescoStatus"],
  ],
  "important-locations": [
    ["State", "locationState"],
    ["Significance", "significance"],
    ["Nearby Landmark", "nearbyLandmark"],
  ],
  "india-states": [
    ["Capital", "capital"],
    ["Districts", "districtsCount"],
    ["Region", "region"],
    ["Area", "area"],
  ],
};

export default function UpscMapDetailPage() {
  const router = useRouter();
  const routeParts = router.asPath.split("?")[0].split("/").filter(Boolean);
  const routeCategory = router.query.category || routeParts[2] || "";
  const routeSlug = router.query.slug || routeParts[3] || "";
  const [mapItem, setMapItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!router.isReady || !routeSlug) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const item = await getMapBySlug(routeSlug);
        if (!cancelled) setMapItem(item?.category === routeCategory ? item : null);
      } catch (error) {
        console.error(error);
        if (!cancelled) setMapItem(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router.isReady, routeCategory, routeSlug]);

  const metadata = useMemo(() => {
    if (!mapItem) return [];
    const fields = CATEGORY_METADATA[mapItem.category] || [];
    return fields
      .map(([label, key]) => [label, mapItem[key]])
      .filter(([, value]) => value !== undefined && value !== null && value !== "");
  }, [mapItem]);

  const backHref = routeCategory ? `/maps/upsc-maps/${routeCategory}` : "/maps/upsc-maps";
  const title = mapItem ? `${mapItem.title} UPSC Map | Notes Cafe` : "UPSC Map | Notes Cafe";
  const description = mapItem?.upscFact || "Explore this UPSC map resource from Notes Cafe with image and PDF downloads.";

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        {mapItem?.imageUrl ? <meta property="og:image" content={mapItem.imageUrl} /> : null}
      </Head>

      <main className="bg-[var(--color-bg)]">
        {loading ? (
          <div className="mx-auto max-w-[1240px] px-6 py-12 md:px-10">
            <div className="skeleton h-8 w-64" />
            <div className="skeleton mt-6 aspect-[16/9] w-full" />
          </div>
        ) : !mapItem ? (
          <div className="mx-auto max-w-[900px] px-6 py-16 text-center md:px-10">
            <MapPinned className="mx-auto mb-3 text-[var(--color-primary)]" size={36} strokeWidth={1.6} />
            <h1 className="hero-display text-[28px] text-[var(--color-ink)]">Map not found</h1>
            <p className="mt-3 text-[var(--color-ink-muted)]">No published map is available for this URL.</p>
            <Link href="/maps/upsc-maps" className="btn btn-primary mt-6">Back to maps</Link>
          </div>
        ) : (
          <>
            <section className="hairline-b bg-[var(--color-surface)]">
              <div className="mx-auto max-w-[1240px] px-6 py-10 md:px-10 md:py-12">
                <Link href={backHref} className="chip chip-primary">Maps & Atlas</Link>
                <h1 className="hero-display mt-4 max-w-4xl text-[34px] leading-[1.08] text-[var(--color-ink)] md:text-[52px]">
                  {mapItem.title}
                </h1>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="chip chip-primary">{categoryLabel(mapItem.category)}</span>
                  {mapItem.region ? <span className="chip">{mapItem.region}</span> : null}
                </div>
              </div>
            </section>

            <section className="mx-auto grid max-w-[1240px] gap-6 px-6 py-8 md:px-10 lg:grid-cols-[1fr_360px]">
              <div className="card overflow-hidden">
                <img src={mapItem.imageUrl} alt={mapItem.title} className="w-full object-contain" />
              </div>

              <aside className="space-y-4">
                {mapItem.upscFact ? (
                  <div className="card p-5" style={{ background: "var(--color-primary-tint)" }}>
                    <div className="eyebrow text-[var(--color-primary)]">UPSC Fact</div>
                    <p className="mt-3 text-[15px] leading-7 text-[var(--color-ink)]">{mapItem.upscFact}</p>
                  </div>
                ) : null}

                {metadata.length > 0 ? (
                  <div className="card divide-y divide-[var(--color-border)] overflow-hidden">
                    {metadata.map(([label, value]) => (
                      <div key={label} className="flex items-center justify-between gap-4 px-5 py-4">
                        <span className="text-[13px] font-semibold text-[var(--color-ink-muted)]">{label}</span>
                        <span className="text-right text-[14px] font-semibold text-[var(--color-ink)]">{value}</span>
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className="card p-5">
                  <div className="mb-4 flex items-center gap-2 font-semibold text-[var(--color-ink)]">
                    <Download size={17} strokeWidth={1.7} /> Downloads
                  </div>
                  <div className="grid gap-2">
                    {mapItem.imageUrl ? (
                      <a href={mapItem.imageUrl} target="_blank" rel="noreferrer" download className="btn btn-primary justify-center">
                        <ImageDown size={16} /> Image
                      </a>
                    ) : null}
                    {mapItem.pdfUrl ? (
                      <a href={mapItem.pdfUrl} target="_blank" rel="noreferrer" download className="btn btn-ghost justify-center">
                        <FileDown size={16} /> PDF
                      </a>
                    ) : null}
                  </div>
                </div>
              </aside>
            </section>
          </>
        )}
      </main>
    </>
  );
}
