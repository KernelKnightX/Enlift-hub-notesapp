import Head from 'next/head';
import Link from 'next/link';
import { Landmark, Search, Sparkles, ArrowRight } from 'lucide-react';
import { SectionHeader, ResourceLayout } from '../../components/public/SharedComponents';
import { governmentResources } from '@/data/government';

const resources = governmentResources;

export default function GovernmentLandingPage() {
  return (
    <>
      <Head>
        <title>Government Resources for UPSC Preparation | Notes Cafe</title>
        <meta name="description" content="Explore government schemes, constitutional articles, amendments, acts, committees, ministries, and policy resources for UPSC preparation." />
        <meta property="og:title" content="Government Resources for UPSC Preparation | Notes Cafe" />
        <meta property="og:description" content="Explore government schemes, constitutional articles, amendments, acts, committees, ministries, and policy resources for UPSC preparation." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://www.notescafe.in/government" />
      </Head>

      <ResourceLayout eyebrow="Government" title="A premium government resource hub for policy and governance learning." description="Turn a dense subject area into a calm, searchable experience with strong internal structure and better discoverability." breadcrumbs={[{ label: 'Government' }]}>
        <section className="max-w-[1240px] mx-auto px-6 md:px-10 pb-8">
          <div className="rounded-[28px] border p-6 md:p-8" style={{ background: 'linear-gradient(135deg, var(--color-surface) 0%, var(--color-surface-alt) 100%)', borderColor: 'var(--color-border)' }}>
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-primary)' }}><Sparkles size={13} strokeWidth={1.8} />Policy clarity</div>
                <h2 className="mt-4 font-serif text-[28px] md:text-[34px] leading-[1.06]">Browse the essential government resources without feeling overwhelmed.</h2>
                <p className="mt-3 text-[15px] leading-[1.75]" style={{ color: 'var(--color-ink-muted)' }}>The public experience now turns governance content into a high-trust, easy-to-browse knowledge layer for UPSC preparation.</p>
              </div>
              <div className="rounded-2xl border px-4 py-3 flex items-center gap-3 min-w-[240px]" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
                <Search size={16} strokeWidth={1.8} style={{ color: 'var(--color-ink-muted)' }} />
                <span className="text-[14px]" style={{ color: 'var(--color-ink-muted)' }}>Search schemes, bodies, acts...</span>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-[1240px] mx-auto px-6 md:px-10 py-8 md:py-12">
          <SectionHeader eyebrow="Governance topics" title="Straightforward cards for policy, constitution, and administration." description="Move from broad concepts to the specific resources you need without getting lost in long lists." />
          <div className="mt-8 grid md:grid-cols-2 gap-4">
            {resources.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.title} href={item.href} className="card card-hover p-6 h-full">
                  <div className="flex items-center justify-between">
                    <div className="rounded-2xl p-2.5" style={{ background: 'var(--color-primary-tint)', color: 'var(--color-primary)' }}><Icon size={17} strokeWidth={1.8} /></div>
                    <span className="chip chip-primary">{item.badge}</span>
                  </div>
                  <h3 className="mt-5 font-serif text-[20px] leading-[1.12]">{item.title}</h3>
                  <p className="mt-3 text-[14px] leading-[1.7]" style={{ color: 'var(--color-ink-muted)' }}>{item.description}</p>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="max-w-[1240px] mx-auto px-6 md:px-10 py-8 md:py-12">
          <div className="card p-7 md:p-8" style={{ background: 'var(--color-surface-alt)' }}>
            <div className="eyebrow">Featured resources</div>
            <h3 className="mt-3 font-serif text-[24px] leading-[1.12]">A better entry point into public governance content.</h3>
            <div className="mt-6 grid md:grid-cols-3 gap-3">
              {[
                { label: 'Government schemes', href: '/government/schemes' },
                { label: 'Constitution articles', href: '/government/constitution-articles' },
                { label: 'Important acts', href: '/government/important-acts' },
              ].map((item) => <Link key={item.label} href={item.href} className="flex items-center justify-between rounded-2xl border px-4 py-3" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}><span className="font-medium">{item.label}</span><ArrowRight size={14} strokeWidth={1.9} style={{ color: 'var(--color-primary)' }} /></Link>)}
            </div>
          </div>
        </section>
      </ResourceLayout>
    </>
  );
}
