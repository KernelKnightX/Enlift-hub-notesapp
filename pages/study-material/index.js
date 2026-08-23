import Head from 'next/head';
import Link from 'next/link';
import { Search, ArrowRight, Sparkles } from 'lucide-react';
import { ResourceCard, SectionHeader, ResourceLayout } from '@/components/public/SharedComponents';
import { studyMaterialFaqs, studyMaterialResources } from '@/data/study-material';

const resources = studyMaterialResources;
const faqs = studyMaterialFaqs;

export default function StudyMaterialLandingPage() {
  return (
    <>
      <Head>
        <title>UPSC Study Material and Free Resources | Notes Cafe</title>
        <meta name="description" content="Explore free UPSC study material including the syllabus, NCERT books, monthly magazines, and current affairs resources for better preparation." />
        <meta property="og:title" content="UPSC Study Material and Free Resources | Notes Cafe" />
        <meta property="og:description" content="Explore free UPSC study material including the syllabus, NCERT books, monthly magazines, and current affairs resources for better preparation." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://www.notescafe.in/study-material" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map((item) => ({ '@type': 'Question', name: item.q, acceptedAnswer: { '@type': 'Answer', text: item.a } })) }) }} />
      </Head>

      <ResourceLayout eyebrow="Study Material" title="A premium study material hub for UPSC preparation." description="Browse, search, and move forward with the most useful public resources from the syllabus to notes and current-affairs support." breadcrumbs={[{ label: 'Study Material' }]}>
        <section className="max-w-[1240px] mx-auto px-6 md:px-10 pb-8">
          <div className="rounded-[28px] border p-6 md:p-8" style={{ background: 'linear-gradient(135deg, var(--color-surface) 0%, var(--color-surface-alt) 100%)', borderColor: 'var(--color-border)' }}>
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-primary)' }}><Sparkles size={13} strokeWidth={1.8} />Discover smarter prep</div>
                <h2 className="mt-4 font-serif text-[28px] md:text-[34px] leading-[1.06]">Search the right resource at the right moment.</h2>
                <p className="mt-3 text-[15px] leading-[1.75]" style={{ color: 'var(--color-ink-muted)' }}>A calm, search-first experience for aspirants who want clarity instead of clutter.</p>
              </div>
              <div className="rounded-2xl border px-4 py-3 flex items-center gap-3 min-w-[260px]" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
                <Search size={16} strokeWidth={1.8} style={{ color: 'var(--color-ink-muted)' }} />
                <span className="text-[14px]" style={{ color: 'var(--color-ink-muted)' }}>Search syllabus, books, notes...</span>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-[1240px] mx-auto px-6 md:px-10 py-8 md:py-12">
          <SectionHeader eyebrow="Curated resources" title="Every resource card is designed for quick decisions." description="Choose a topic, understand the value in seconds, and move to the next step without friction." />
          <div className="mt-8 grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {resources.map((item) => (
              <ResourceCard key={item.title} icon={item.icon} title={item.title} description={item.description} href={item.href} meta={item.meta} tags={item.tags} accent={item.accent} />
            ))}
          </div>
        </section>

        <section className="max-w-[1240px] mx-auto px-6 md:px-10 py-8 md:py-12">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-6">
            <div className="card p-7 md:p-8">
              <div className="eyebrow">Related ideas</div>
              <h3 className="mt-3 font-serif text-[24px] leading-[1.12]">Pair your reading with the right next step.</h3>
              <div className="mt-6 space-y-3">
                {[
                  { label: 'UPSC calendar', href: '/planning-tools/upsc-calendar' },
                  { label: 'Best NCERT books', href: '/study-material/ncert-books' },
                  { label: 'UPSC maps overview', href: '/maps/upsc-maps' },
                ].map((item) => (
                  <Link key={item.label} href={item.href} className="flex items-center justify-between rounded-2xl border px-4 py-3" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
                    <span className="font-medium">{item.label}</span>
                    <ArrowRight size={14} strokeWidth={1.9} style={{ color: 'var(--color-primary)' }} />
                  </Link>
                ))}
              </div>
            </div>
            <div className="card p-7 md:p-8" style={{ background: 'var(--color-surface-alt)' }}>
              <div className="eyebrow">FAQ</div>
              <h3 className="mt-3 font-serif text-[24px] leading-[1.12]">Useful answers for first-time visitors.</h3>
              <div className="mt-6 space-y-4">
                {faqs.map((item) => (
                  <div key={item.q} className="rounded-2xl border p-4" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
                    <div className="font-semibold">{item.q}</div>
                    <p className="mt-2 text-[14px] leading-[1.7]" style={{ color: 'var(--color-ink-muted)' }}>{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </ResourceLayout>
    </>
  );
}
