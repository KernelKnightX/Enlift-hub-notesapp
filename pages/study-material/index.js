import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ResourceCard, SectionHeader, ResourceLayout } from '@/components/public/SharedComponents';
import { studyMaterialFaqs, studyMaterialResources } from '@/data/study-material';

const resources = studyMaterialResources;
const faqs = studyMaterialFaqs;

export default function StudyMaterialLandingPage() {
  return (
    <ResourceLayout
      eyebrow="Study Material"
      title="Syllabus and monthly magazines for UPSC."
      description="Two essentials for beta: the official exam map, and monthly current affairs magazines — nothing extra until content is ready."
      breadcrumbs={[{ label: 'Study Material' }]}
    >
      <section className="max-w-[1240px] mx-auto px-6 md:px-10 py-8 md:py-12">
        <SectionHeader
          eyebrow="Public library"
          title="Syllabus first, magazines when you need CA revision."
          description="A small, honest library for beta — admin-published content only, no placeholder PDFs."
        />
        <div className="mt-8 grid md:grid-cols-2 gap-5 max-w-3xl">
          {resources.map((item) => (
            <ResourceCard
              key={item.title}
              icon={item.icon}
              title={item.title}
              description={item.description}
              href={item.href}
              meta={item.meta}
              tags={item.tags}
              accent={item.accent}
            />
          ))}
        </div>
      </section>

      <section className="max-w-[1240px] mx-auto px-6 md:px-10 py-8 md:py-12">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-6">
          <div className="card p-7 md:p-8">
            <div className="eyebrow">Related</div>
            <h3 className="mt-3 font-serif text-[24px] leading-[1.12]">What to pair with the syllabus.</h3>
            <div className="mt-6 space-y-3">
              {[
                { label: 'UPSC calendar', href: '/planning-tools/upsc-calendar' },
                { label: 'Monthly magazines', href: '/study-material/standard-books' },
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
            <h3 className="mt-3 font-serif text-[24px] leading-[1.12]">Common questions.</h3>
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
  );
}
