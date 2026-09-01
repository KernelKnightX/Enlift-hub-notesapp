import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Search,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Bookmark,
  Building2,
  Landmark,
  HeartPulse,
  GraduationCap,
  IndianRupee,
  Sprout,
  Users,
  BriefcaseBusiness,
  Clock3,
  Compass,
  Wallet,
  Home as HomeIcon,
  Scale,
  Leaf,
  ShieldCheck,
} from 'lucide-react';

/* =========================================================
   ICON RESOLVER — maps a Firestore-stored icon key (string)
   to a lucide-react component. Used for categories so tags
   and their icons are fully backend-driven.
========================================================== */

const ICON_MAP = {
  agriculture: Sprout,
  health: HeartPulse,
  education: GraduationCap,
  finance: IndianRupee,
  rural: Landmark,
  'rural-development': Landmark,
  women: Users,
  'women-child': Users,
  employment: BriefcaseBusiness,
  housing: HomeIcon,
  legal: Scale,
  environment: Leaf,
  welfare: ShieldCheck,
  finance2: Wallet,
  default: Compass,
};

function resolveIcon(icon) {
  if (!icon) return null;
  if (typeof icon !== 'string') return icon; // already a component
  const key = icon.toLowerCase().trim();
  return ICON_MAP[key] || ICON_MAP.default;
}

/* =========================================================
   CATEGORY PILL
========================================================= */

function CategoryButton({ label, isActive, onClick, icon: Icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-[13px] font-medium border transition-all duration-200"
      style={
        isActive
          ? { background: 'var(--color-primary)', color: '#fff', borderColor: 'var(--color-primary)' }
          : { background: 'var(--color-surface)', color: 'var(--color-ink)', borderColor: 'var(--color-border)' }
      }
    >
      {Icon && <Icon size={14} strokeWidth={1.8} />}
      {label}
    </button>
  );
}

/* =========================================================
   STAT STRIP
========================================================= */

function StatStrip({ statistics = [] }) {
  if (!statistics.length) return null;

  return (
    <div className="rounded-[24px] border overflow-hidden" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-alt)' }}>
      <div className="grid grid-cols-2 md:grid-cols-4">
        {statistics.slice(0, 4).map((stat, index) => {
          const Icon = stat.icon;

          return (
            <div
              key={index}
              className="flex items-center gap-4 px-5 py-5 md:px-7"
              style={index !== 0 ? { borderLeft: '1px solid var(--color-border)' } : undefined}
            >
              <div
                className="rounded-2xl p-3 shrink-0"
                style={{ background: 'var(--color-primary-tint)', color: 'var(--color-primary)' }}
              >
                {Icon && <Icon size={18} strokeWidth={1.8} />}
              </div>

              <div>
                <div className="font-semibold text-[16px] leading-tight">{stat.number}</div>
                <div className="mt-1 text-[12px]" style={{ color: 'var(--color-ink-muted)' }}>
                  {stat.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   FEATURED SCHEME
========================================================= */

function schemeDetailHref(sectionSlug, scheme) {
  return `/government/${sectionSlug}/${scheme?.slug || scheme?.id}`;
}

function FeaturedSchemeCard({ scheme, sectionSlug = 'schemes' }) {
  if (!scheme) return null;

  const hasHighlights = Array.isArray(scheme.highlights) && scheme.highlights.length > 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.35 }}
      className="card overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #fff 0%, var(--color-surface-alt) 100%)' }}
    >
      <div className={`grid ${hasHighlights ? 'lg:grid-cols-[1.15fr_1fr_0.85fr]' : 'lg:grid-cols-[1.15fr_1fr]'}`}>

        {/* LEFT CONTENT */}
        <div className="p-6 md:p-8 flex flex-col justify-center">
          <div
            className="inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-primary-tint)', color: 'var(--color-primary)' }}
          >
            <span>★</span>
            Featured Scheme
          </div>

          <h3 className="mt-4 font-serif text-[22px] md:text-[25px] leading-[1.18]" style={{ letterSpacing: '-0.01em' }}>
            {scheme.title}
          </h3>

          {scheme.summary && (
            <p className="mt-3 text-[13.5px] leading-[1.7] max-w-[480px]" style={{ color: 'var(--color-ink-muted)' }}>
              {scheme.summary}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px]" style={{ color: 'var(--color-ink-muted)' }}>
            {scheme.ministry && (
              <span className="flex items-center gap-1.5">
                <Building2 size={13} strokeWidth={1.7} />
                {scheme.ministry}
              </span>
            )}
            {scheme.year && (
              <span className="flex items-center gap-1.5">
                <Clock3 size={13} strokeWidth={1.7} />
                {scheme.year}
              </span>
            )}
            {scheme.region && (
              <span className="flex items-center gap-1.5">
                <Landmark size={13} strokeWidth={1.7} />
                {scheme.region}
              </span>
            )}
          </div>

          <Link href={schemeDetailHref(sectionSlug, scheme)} className="btn btn-primary mt-6 w-fit">
            View Scheme Details
            <ArrowRight size={15} strokeWidth={2} />
          </Link>
        </div>

        {/* CENTER IMAGE */}
        <div
          className="relative flex flex-col items-center justify-center gap-2 p-6"
          style={{
            borderLeft: '1px solid var(--color-border)',
            borderRight: hasHighlights ? '1px solid var(--color-border)' : 'none',
          }}
        >
          {scheme.image ? (
            <>
              <img src={scheme.image} alt={scheme.title} className="max-h-[170px] w-auto object-contain" />
              {scheme.imageCaption && (
                <span className="text-[12px] font-semibold" style={{ color: 'var(--color-primary)' }}>
                  {scheme.imageCaption}
                </span>
              )}
            </>
          ) : (
            <div className="rounded-2xl p-6" style={{ background: 'var(--color-primary-tint)', color: 'var(--color-primary)' }}>
              <Landmark size={40} strokeWidth={1.4} />
            </div>
          )}
        </div>

        {/* RIGHT STATS */}
        {hasHighlights && (
        <div className="hidden lg:flex flex-col justify-center gap-5 p-6">
          {scheme.highlights.slice(0, 3).map((item, index) => (
            <div key={index}>
              <div className="flex items-center gap-2">
                <div className="rounded-xl p-2" style={{ background: 'var(--color-surface-alt)', color: 'var(--color-primary)' }}>
                  {item.icon ? <item.icon size={15} strokeWidth={1.8} /> : <Users size={15} strokeWidth={1.8} />}
                </div>
                <span className="text-[11px]" style={{ color: 'var(--color-ink-muted)' }}>{item.label}</span>
              </div>
              <strong className="ml-9 block text-[14px]" style={{ color: 'var(--color-primary)' }}>
                {item.value}
              </strong>
              {item.subLabel && (
                <span className="ml-9 block text-[10px]" style={{ color: 'var(--color-ink-muted)' }}>{item.subLabel}</span>
              )}
            </div>
          ))}
        </div>
        )}
      </div>
    </motion.article>
  );
}

/* =========================================================
   SCHEME CARD
========================================================= */

export function SchemeCard({ scheme, onSave, sectionSlug = 'schemes' }) {
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsSaved((previous) => !previous);
    onSave?.(scheme.id);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
      className="card card-hover overflow-hidden flex h-full flex-col"
    >
      {/* IMAGE TILE */}
      <div className="relative h-[128px] flex items-center justify-center" style={{ background: 'var(--color-surface-alt)' }}>
        {scheme?.sector && (
          <span className="chip chip-primary absolute left-3 top-3">{scheme.sector}</span>
        )}

        {scheme?.image ? (
          <img src={scheme.image} alt={scheme.title} className="h-[68px] w-auto object-contain" />
        ) : (
          <Landmark size={34} strokeWidth={1.4} style={{ color: 'var(--color-primary)' }} />
        )}
      </div>

      {/* CONTENT */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-serif text-[16px] leading-[1.3] line-clamp-2">{scheme?.title}</h3>

        {scheme?.ministry && (
          <p className="mt-2 text-[11.5px] leading-[1.4]" style={{ color: 'var(--color-ink-muted)' }}>
            {scheme.ministry}
          </p>
        )}

        {(scheme?.year || scheme?.region) && (
          <div className="mt-1.5 flex items-center gap-2 text-[11.5px]" style={{ color: 'var(--color-ink-muted)' }}>
            {scheme?.year && <span>{scheme.year}</span>}
            {scheme?.year && scheme?.region && <span>•</span>}
            {scheme?.region && <span>{scheme.region}</span>}
          </div>
        )}

        {scheme?.summary && (
          <p className="mt-2 text-[12.5px] leading-[1.6] line-clamp-2" style={{ color: 'var(--color-ink-muted)' }}>
            {scheme.summary}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-4">
          <Link
            href={schemeDetailHref(sectionSlug, scheme)}
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold"
            style={{ color: 'var(--color-primary)' }}
          >
            View Details
            <ArrowRight size={13} strokeWidth={1.9} />
          </Link>

          <button
            type="button"
            onClick={handleSave}
            aria-label="Save scheme"
            className="flex h-8 w-8 items-center justify-center rounded-full transition-colors"
            style={{ color: isSaved ? 'var(--color-primary)' : 'var(--color-ink-muted)' }}
          >
            <Bookmark size={16} strokeWidth={1.8} fill={isSaved ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
    </motion.article>
  );
}

/* =========================================================
   FILTER BAR
========================================================= */

function FilterBar() {
  return (
    <div className="card overflow-hidden">
      <div className="grid grid-cols-2 md:grid-cols-5">
        <FilterItem label="Filter by Ministry" value="All Ministries" />
        <FilterItem label="Filter by Sector" value="All Sectors" />
        <FilterItem label="Scheme Type" value="All Types" />
        <FilterItem label="Year" value="All Years" />
        <FilterItem label="Sort by" value="Latest First" last />
      </div>
    </div>
  );
}

function FilterItem({ label, value, last }) {
  return (
    <button
      type="button"
      className="flex min-h-[62px] flex-col justify-center px-4 md:px-5 text-left transition-colors hover:bg-[var(--color-surface-alt)]"
      style={!last ? { borderRight: '1px solid var(--color-border)' } : undefined}
    >
      <span className="text-[10px]" style={{ color: 'var(--color-ink-muted)' }}>{label}</span>
      <span className="mt-1 flex items-center justify-between text-[12.5px] font-semibold">
        {value}
        <ChevronDown size={14} strokeWidth={1.8} style={{ color: 'var(--color-ink-muted)' }} />
      </span>
    </button>
  );
}

/* =========================================================
   HERO
   Custom hero for this page — breadcrumb, title, description,
   search bar and an optional background illustration (e.g. an
   India Gate image) that fades in from the right, matching the
   reference design. This replaces the generic PageBanner for
   the schemes page specifically.
========================================================== */

function SchemesHero({ title, description, breadcrumbs = [], heroImage, searchQuery, onSearch, searchPlaceholder }) {
  return (
    <section className="relative overflow-hidden border-b" style={{ borderColor: 'var(--color-border)' }}>
      {heroImage && (
        <img
          src={heroImage}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 h-full w-[46%] object-cover object-left"
          style={{
            opacity: 0.95,
            maskImage: 'linear-gradient(to right, transparent 0%, black 30%, black 100%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 30%, black 100%)',
          }}
        />
      )}

      <div className="relative max-w-[1240px] mx-auto px-6 md:px-10 pt-8 pb-8 md:pt-10 md:pb-10">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[13px]" style={{ color: 'var(--color-ink-muted)' }}>
          <Link href="/" className="hover:text-[var(--color-primary)]">Home</Link>
          {breadcrumbs.map((crumb) => (
            <span key={crumb.label} className="flex items-center gap-2">
              <ChevronRight size={13} strokeWidth={1.6} />
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-[var(--color-primary)]">{crumb.label}</Link>
              ) : (
                <span style={{ color: 'var(--color-ink)' }}>{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>

        <div className="relative z-10 max-w-[640px] mt-4">
          <h1 className="font-serif text-[32px] md:text-[40px] leading-[1.06]" style={{ letterSpacing: '-0.02em' }}>
            {title}
          </h1>

          {description && (
            <p className="mt-3 text-[14.5px] md:text-[15px] leading-[1.7] max-w-[520px]" style={{ color: 'var(--color-ink-muted)' }}>
              {description}
            </p>
          )}

          <div className="relative mt-5 max-w-[500px]">
            <Search size={17} strokeWidth={1.8} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-ink-muted)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => onSearch?.(event.target.value)}
              placeholder={searchPlaceholder || 'Search schemes by name, ministry, keyword...'}
              className="h-[48px] w-full rounded-full border pl-11 pr-5 text-[13.5px] outline-none transition-shadow focus:ring-2"
              style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   MAIN
========================================================= */

export function SchemePageLayout({
  title = 'Government Schemes',
  description = 'Explore major Government of India schemes, programmes and initiatives across different sectors.',
  breadcrumbs = [{ label: 'Government', href: '/government' }, { label: 'Schemes' }],
  heroImage,
  schemes = [],
  categories = [],
  loading = false,
  onSearch,
  searchQuery = '',
  statistics = [],
  sectionSlug = 'schemes',
  gridTitle = 'Explore Government Schemes',
  itemLabel = 'schemes',
  searchPlaceholder = 'Search schemes by name, ministry, keyword...',
  showFilterBar = true,
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [itemsToShow, setItemsToShow] = useState(8);

  const featured = useMemo(() => {
    return schemes.find((scheme) => scheme?.featured) || schemes[0];
  }, [schemes]);

  const filtered = useMemo(() => {
    if (!Array.isArray(schemes)) return [];

    return schemes.filter((scheme) => {
      if (selectedCategory !== 'All' && scheme?.sector !== selectedCategory) return false;
      if (!searchQuery) return true;

      const searchText = `${scheme?.title || ''} ${scheme?.summary || ''} ${scheme?.ministry || ''} ${scheme?.sector || ''}`.toLowerCase();
      return searchText.includes(searchQuery.toLowerCase());
    });
  }, [schemes, selectedCategory, searchQuery]);

  const displayedSchemes = filtered.slice(0, itemsToShow);
  const hasMore = filtered.length > itemsToShow;

  // categories can arrive as plain strings (["Health", ...]) or as
  // backend-managed objects ({ label, icon }) — normalize either way.
  const normalizedCategories = categories.map((category) =>
    typeof category === 'string' ? { label: category, icon: null } : category
  );

  return (
    <>
      <SchemesHero
        title={title}
        description={description}
        breadcrumbs={breadcrumbs}
        heroImage={heroImage}
        searchQuery={searchQuery}
        onSearch={onSearch}
        searchPlaceholder={searchPlaceholder}
      />

      {/* CATEGORY PILLS */}
      {normalizedCategories.length > 0 ? (
      <section className="max-w-[1240px] mx-auto px-6 md:px-10 pt-6 pb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <CategoryButton label="All Schemes" isActive={selectedCategory === 'All'} onClick={() => setSelectedCategory('All')} />
          {normalizedCategories.map((category) => (
            <CategoryButton
              key={category.label}
              label={category.label}
              icon={resolveIcon(category.icon) || ICON_MAP[category.label?.toLowerCase()]}
              isActive={selectedCategory === category.label}
              onClick={() => setSelectedCategory(category.label)}
            />
          ))}
        </div>
      </section>
      ) : null}

      {/* FEATURED */}
      {!loading && featured && (
        <section className="max-w-[1240px] mx-auto px-6 md:px-10 pb-6">
          <FeaturedSchemeCard scheme={featured} sectionSlug={sectionSlug} />
        </section>
      )}

      {/* STATS */}
      {!loading && statistics.length > 0 && (
        <section className="max-w-[1240px] mx-auto px-6 md:px-10 pb-8">
          <StatStrip statistics={statistics} />
        </section>
      )}

      {/* FILTER BAR */}
      {showFilterBar ? (
      <section className="max-w-[1240px] mx-auto px-6 md:px-10 pb-8">
        <FilterBar />
      </section>
      ) : null}

      {/* GRID */}
      <section className="max-w-[1240px] mx-auto px-6 md:px-10 pb-16">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="font-serif text-[22px]">{gridTitle}</h2>
            <p className="mt-1 text-[12.5px]" style={{ color: 'var(--color-ink-muted)' }}>
              {filtered.length} {itemLabel} available
            </p>
          </div>
        </div>

        {loading && (
          <div className="py-20 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2" style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-primary)' }} />
            <p className="mt-3 text-[13px]" style={{ color: 'var(--color-ink-muted)' }}>Loading {itemLabel}...</p>
          </div>
        )}

        {!loading && displayedSchemes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {displayedSchemes.map((scheme) => (
              <SchemeCard key={scheme.id} scheme={scheme} sectionSlug={sectionSlug} />
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="py-20 text-center">
            <Search size={36} strokeWidth={1.4} className="mx-auto" style={{ color: 'var(--color-ink-muted)' }} />
            <h3 className="mt-4 font-serif text-[19px]">No {itemLabel} found</h3>
            <p className="mt-2 text-[13px]" style={{ color: 'var(--color-ink-muted)' }}>
              {searchQuery
                ? 'Try adjusting your search or filters.'
                : `Published ${itemLabel} will appear here once they are added from admin.`}
            </p>
          </div>
        )}

        {!loading && hasMore && (
          <div className="flex justify-center pt-8">
            <button type="button" onClick={() => setItemsToShow((previous) => previous + 8)} className="btn btn-ghost">
              Load More
              <ChevronDown size={14} strokeWidth={1.8} />
            </button>
          </div>
        )}
      </section>
    </>
  );
}