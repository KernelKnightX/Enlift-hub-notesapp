import Head from 'next/head';
import Link from 'next/link';
import { Clock3, ArrowRight } from 'lucide-react';
import { SectionHeader, ResourceLayout } from '@/components/public/SharedComponents';
import { planningTools } from '@/data/planning-tools';

const tools = planningTools;

export default function PlanningToolsLandingPage() {
  return (
    <>
      <Head>
        <title>Free UPSC Planning Tools and Study Resources | Notes Cafe</title>
        <meta name="description" content="Use free UPSC planning tools including a calendar, study planner, revision planner, pomodoro timer, timetable, and goal tracker for better preparation." />
        <meta property="og:title" content="Free UPSC Planning Tools and Study Resources | Notes Cafe" />
        <meta property="og:description" content="Use free UPSC planning tools including a calendar, study planner, revision planner, pomodoro timer, timetable, and goal tracker for better preparation." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://www.notescafe.in/planning-tools" />
      </Head>

      <ResourceLayout eyebrow="Planning Tools" title="Premium planning tools for a calmer UPSC routine." description="These resources are designed to support structure, consistency, and steady momentum without creating more friction.">

        <section className="max-w-[1240px] mx-auto px-6 md:px-10 py-8 md:py-12">
          <SectionHeader eyebrow="Tool cards" title="Premium tool cards for better routines and better focus." description="These are light, useful resources made to feel part of a high-quality public product rather than a collection of utility pages." />
          <div className="mt-8 grid md:grid-cols-2 gap-4">
            {tools.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.title} href={item.href} className="card card-hover p-6 h-full">
                  <div className="flex items-center justify-between">
                    <div className="rounded-2xl p-2.5" style={{ background: 'var(--color-primary-tint)', color: 'var(--color-primary)' }}><Icon size={17} strokeWidth={1.8} /></div>
                    <span className="chip chip-primary">{item.difficulty}</span>
                  </div>
                  <h3 className="mt-5 font-serif text-[20px] leading-[1.12]">{item.title}</h3>
                  <p className="mt-3 text-[14px] leading-[1.7]" style={{ color: 'var(--color-ink-muted)' }}>{item.description}</p>
                  <div className="mt-5 flex items-center justify-between text-[12px]" style={{ color: 'var(--color-ink-muted)' }}>
                    <span><Clock3 size={12} className="inline mr-1" strokeWidth={1.8} />{item.usage}</span>
                    <span className="font-semibold" style={{ color: 'var(--color-primary)' }}>Open tool <ArrowRight size={12} className="inline ml-1" strokeWidth={1.9} /></span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </ResourceLayout>
    </>
  );
}
