import Head from 'next/head';
import Link from 'next/link';
import * as Lucide from 'lucide-react';

function renderIcon(iconName) {
  switch (iconName) {
    case 'book':
      return Lucide.BookOpen;
    case 'map':
      return Lucide.Map;
    case 'government':
      return Lucide.Landmark;
    case 'calendar':
      return Lucide.CalendarDays;
    case 'plan':
      return Lucide.Compass;
    default:
      return Lucide.Sparkles;
  }
}

export default function PublicPageLayout({ page, children }) {
  if (!page) return null;

  const HeroIcon = renderIcon(page.icon);

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: (page.faqs || []).map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  return (
    <>
      <Head>
        <title>{page.seoTitle}</title>
        <meta name="description" content={page.metaDescription} />
        <meta name="robots" content="index,follow" />
        <meta property="og:title" content={page.seoTitle} />
        <meta property="og:description" content={page.metaDescription} />
        <meta property="og:type" content="website" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqSchema),
          }}
        />
      </Head>

      {children ? (
        // If a page supplies custom children, render them directly
        // so About (and other pages) control the layout.
        children
      ) : (
        // Fallback to the generic public page template
        // when no children are provided.
        <main style={{ background: 'var(--color-bg)' }}>
          <section className="max-w-[1240px] mx-auto px-6 md:px-10 pt-16 pb-12 md:pt-24 md:pb-20">
            <nav
              aria-label="Breadcrumb"
              className="flex flex-wrap items-center gap-2 text-[13px]"
              style={{ color: 'var(--color-ink-muted)' }}
            >
              <Link
                href="/"
                className="hover:text-[var(--color-primary)]"
              >
                Home
              </Link>

              {page.breadcrumbs?.map((crumb, index) => (
                <span
                  key={crumb.label}
                  className="flex items-center gap-2"
                >
                  <Lucide.ChevronRight
                    size={13}
                    strokeWidth={1.6}
                  />

                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      className="hover:text-[var(--color-primary)]"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span style={{ color: 'var(--color-ink)' }}>
                      {crumb.label}
                    </span>
                  )}
                </span>
              ))}
            </nav>

            <div className="mt-8 grid lg:grid-cols-[1.15fr_0.85fr] gap-8 items-start">
              <div className="card p-8 md:p-10">
                <div
                  className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]"
                  style={{
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-primary)',
                    background: 'var(--color-primary-tint)',
                  }}
                >
                  <HeroIcon size={14} />
                  {page.eyebrow}
                </div>

                <h1
                  className="mt-5 font-serif text-[34px] md:text-[46px] leading-[1.08]"
                  style={{ letterSpacing: '-0.02em' }}
                >
                  {page.heroTitle}
                </h1>

                <p
                  className="mt-4 text-[16px] leading-[1.75] max-w-[720px]"
                  style={{ color: 'var(--color-ink-muted)' }}
                >
                  {page.heroDescription}
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/register" className="btn btn-primary">
                    Get free access
                    <Lucide.ArrowRight size={15} strokeWidth={2} />
                  </Link>

                  <Link href="/contact" className="btn btn-ghost">
                    Ask for support
                  </Link>
                </div>

                <div className="mt-8 grid sm:grid-cols-3 gap-3">
                  {page.stats?.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl border p-4"
                      style={{
                        borderColor: 'var(--color-border)',
                        background: 'var(--color-surface-alt)',
                      }}
                    >
                      <div
                        className="font-semibold text-[20px]"
                        style={{ color: 'var(--color-primary)' }}
                      >
                        {stat.value}
                      </div>

                      <div
                        className="mt-1 text-[12px]"
                        style={{ color: 'var(--color-ink-muted)' }}
                      >
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="card p-7 md:p-8"
                style={{
                  background:
                    'linear-gradient(135deg, #fff 0%, var(--color-surface-alt) 100%)',
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="eyebrow">Search</div>

                    <div className="font-serif text-[24px] mt-2">
                      Find the right resource faster
                    </div>
                  </div>

                  <div
                    className="rounded-2xl p-3"
                    style={{
                      background: 'var(--color-primary-tint)',
                      color: 'var(--color-primary)',
                    }}
                  >
                    <Lucide.Search size={18} strokeWidth={1.8} />
                  </div>
                </div>

                <div
                  className="mt-6 rounded-2xl border p-4"
                  style={{
                    borderColor: 'var(--color-border)',
                    background: 'var(--color-surface)',
                  }}
                >
                  <div
                    className="flex items-center gap-3 rounded-xl border px-3 py-3"
                    style={{
                      borderColor: 'var(--color-border)',
                    }}
                  >
                    <Lucide.Search
                      size={16}
                      strokeWidth={1.8}
                      style={{
                        color: 'var(--color-ink-muted)',
                      }}
                    />

                    <input
                      aria-label="Search resources"
                      className="w-full border-0 outline-none bg-transparent text-[14px]"
                      placeholder={`Search ${
                        page.eyebrow?.toLowerCase() || 'resources'
                      }...`}
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {[
                      'Free',
                      'PDF',
                      'Beginner Friendly',
                      'Trusted',
                    ].map((pill) => (
                      <span
                        key={pill}
                        className="chip chip-primary"
                      >
                        {pill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {page.highlights?.map((item) => (
                    <div
                      key={item.title}
                      className="flex items-start gap-3 rounded-2xl border p-3"
                      style={{
                        borderColor: 'var(--color-border)',
                      }}
                    >
                      <Lucide.CheckCircle2
                        size={17}
                        strokeWidth={1.8}
                        style={{
                          color: 'var(--color-primary)',
                          marginTop: 2,
                        }}
                      />

                      <div>
                        <div className="font-semibold text-[14px]">
                          {item.title}
                        </div>

                        <div
                          className="mt-1 text-[13px]"
                          style={{
                            color: 'var(--color-ink-muted)',
                          }}
                        >
                          {item.body}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="max-w-[1240px] mx-auto px-6 md:px-10 pb-10">
            <div className="grid md:grid-cols-3 gap-4">
              {page.cards?.map((card) => (
                <div
                  key={card.title}
                  className="card p-6 md:p-7"
                >
                  <div
                    className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em]"
                    style={{
                      color: 'var(--color-primary)',
                    }}
                  >
                    <Lucide.FileText
                      size={14}
                      strokeWidth={1.7}
                    />

                    {card.kicker}
                  </div>

                  <h2
                    className="mt-3 font-serif text-[22px] leading-[1.2]"
                    style={{
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {card.title}
                  </h2>

                  <p
                    className="mt-3 text-[14px] leading-[1.7]"
                    style={{
                      color: 'var(--color-ink-muted)',
                    }}
                  >
                    {card.body}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="max-w-[1240px] mx-auto px-6 md:px-10 py-12 md:py-16">
            <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8 items-start">
              <div className="card p-7 md:p-8">
                <div className="eyebrow">
                  Structured content
                </div>

                <h2 className="mt-3 font-serif text-[28px] md:text-[32px] leading-[1.1]">
                  What you will find on this page
                </h2>

                <div className="mt-6 space-y-3">
                  {page.checklist?.map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-3"
                    >
                      <Lucide.CheckCircle2
                        size={16}
                        strokeWidth={1.8}
                        style={{
                          color: 'var(--color-primary)',
                          marginTop: 3,
                        }}
                      />

                      <div
                        style={{
                          color: 'var(--color-ink-muted)',
                        }}
                      >
                        {item}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="card p-7 md:p-8"
                style={{
                  background: 'var(--color-surface-alt)',
                }}
              >
                <div className="eyebrow">
                  Free resources
                </div>

                <h2 className="mt-3 font-serif text-[28px] md:text-[32px] leading-[1.1]">
                  Best next steps for your preparation
                </h2>

                <div className="mt-6 space-y-3">
                  {page.related?.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="flex items-center justify-between rounded-2xl border p-4"
                      style={{
                        borderColor: 'var(--color-border)',
                        background: 'var(--color-surface)',
                      }}
                    >
                      <span className="font-medium">
                        {item.label}
                      </span>

                      <Lucide.ArrowRight
                        size={15}
                        strokeWidth={1.8}
                        style={{
                          color: 'var(--color-primary)',
                        }}
                      />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="max-w-[1240px] mx-auto px-6 md:px-10 py-12 md:py-16">
            <div className="card p-7 md:p-8">
              <div className="eyebrow">FAQ</div>

              <h2 className="mt-3 font-serif text-[28px] md:text-[32px] leading-[1.1]">
                Answers to the questions aspirants ask most
              </h2>

              <div className="mt-8 space-y-4">
                {page.faqs?.map((item, index) => (
                  <div
                    key={item.q}
                    className="rounded-2xl border p-4"
                    style={{
                      borderColor: 'var(--color-border)',
                    }}
                  >
                    <div className="font-semibold">
                      {index + 1}. {item.q}
                    </div>

                    <div
                      className="mt-2 text-[14px] leading-[1.7]"
                      style={{
                        color: 'var(--color-ink-muted)',
                      }}
                    >
                      {item.a}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      )}
    </>
  );
}