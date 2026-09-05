import Link from 'next/link';
import { ArrowRight, Landmark } from 'lucide-react';
import { ResourceCard, SectionHeader, ResourceLayout } from '@/components/public/SharedComponents';
import { publicNavigation } from '@/config/publicNavigation';

const governmentNav = publicNavigation.find((item) => item.href === '/government');
const sections = governmentNav?.children || [];

export default function GovernmentLandingPage() {
  return (
    <ResourceLayout
      eyebrow="Government"
      title="Government resources for polity and public policy."
      description="Schemes, constitution articles, important acts, and ministries — published from the admin office."
    >
      <section className="max-w-[1240px] mx-auto px-6 md:px-10 py-8 md:py-12">
        <SectionHeader
          eyebrow="Sections"
          title="Choose a government topic to explore."
          description="Four focused sections for exam-relevant polity and governance reading."
        />
        <div className="mt-8 grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {sections.map((item) => (
            <ResourceCard
              key={item.href}
              icon={Landmark}
              title={item.label}
              description={`Open ${item.label.toLowerCase()} for UPSC-focused notes and published entries.`}
              href={item.href}
              meta="Government"
              tags={['Polity', 'Public']}
              accent="primary"
            />
          ))}
        </div>
        <div className="mt-10">
          <Link href="/study-material" className="inline-flex items-center gap-2 font-semibold" style={{ color: 'var(--color-primary)' }}>
            Browse study material <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </ResourceLayout>
  );
}
