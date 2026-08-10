import Head from 'next/head';
import Link from 'next/link';
import { ArrowRight, BookOpen, Sparkles, CheckCircle2, Trophy, Users } from 'lucide-react';
import { SectionHeader, ResourceLayout } from '../components/public/SharedComponents';
import { coursePaths, courseTestimonials } from '@/data/courses';

const paths = coursePaths;
const testimonials = courseTestimonials;

export default function CoursesPage() {
  return (
    <>
      <Head>
        <title>UPSC Courses for Beginners and Serious Aspirants | Notes Cafe</title>
        <meta name="description" content="Explore premium UPSC courses for foundation, prelims, mains, CSAT, optional subjects, and mentorship with a calm, structured learning path." />
        <meta property="og:title" content="UPSC Courses for Beginners and Serious Aspirants | Notes Cafe" />
        <meta property="og:description" content="Explore premium UPSC courses for foundation, prelims, mains, CSAT, optional subjects, and mentorship with a calm, structured learning path." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://www.notescafe.in/courses" />
      </Head>

      <ResourceLayout eyebrow="Courses" title="Premium UPSC courses that make the first step feel clear." description="Choose a focused pathway for foundation, prelims, mains, or mentorship without the noise of overloaded sales language." breadcrumbs={[{ label: 'Courses' }]}>
        <section className="max-w-[1240px] mx-auto px-6 md:px-10 pb-8">
          <div className="rounded-[28px] border p-6 md:p-8" style={{ background: 'linear-gradient(135deg, var(--color-surface) 0%, var(--color-surface-alt) 100%)', borderColor: 'var(--color-border)' }}>
            <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-primary)' }}><Sparkles size={13} strokeWidth={1.8} />Learn with clarity</div>
                <h2 className="mt-4 font-serif text-[28px] md:text-[34px] leading-[1.06]">A premium course experience for every stage of the UPSC journey.</h2>
                <p className="mt-3 text-[15px] leading-[1.75]" style={{ color: 'var(--color-ink-muted)' }}>The public experience now feels more like a polished SaaS product: defined paths, clear value, and serious trust signals.</p>
              </div>
              <div className="rounded-[24px] border p-6" style={{ background: 'rgba(255,255,255,0.82)', borderColor: 'var(--color-border)' }}>
                <div className="font-serif text-[24px] leading-[1.08]">Built for both first-timers and repeaters.</div>
                <div className="mt-4 space-y-3">
                  {['Structured guidance', 'Clear learning paths', 'Premium positioning'].map((item) => <div key={item} className="flex items-center gap-3"><CheckCircle2 size={15} strokeWidth={2} style={{ color: 'var(--color-primary)' }} /><span className="text-[14px]">{item}</span></div>)}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-[1240px] mx-auto px-6 md:px-10 py-8 md:py-12">
          <SectionHeader eyebrow="Learning paths" title="Choose the path that fits your stage." description="Each track is designed as a clear next step rather than a generic course list." />
          <div className="mt-8 grid md:grid-cols-3 gap-4">
            {paths.map((item) => (
              <div key={item.title} className="card card-hover p-6 h-full">
                <div className="flex items-center justify-between">
                  <div className="rounded-2xl p-2.5" style={{ background: 'var(--color-primary-tint)', color: 'var(--color-primary)' }}><BookOpen size={17} strokeWidth={1.8} /></div>
                  <span className="chip chip-primary">{item.badge}</span>
                </div>
                <h3 className="mt-5 font-serif text-[20px] leading-[1.12]">{item.title}</h3>
                <p className="mt-3 text-[14px] leading-[1.7]" style={{ color: 'var(--color-ink-muted)' }}>{item.description}</p>
                <Link href={item.href} className="mt-6 inline-flex items-center gap-2 font-medium text-[14px]" style={{ color: 'var(--color-primary)' }}>Explore path <ArrowRight size={14} strokeWidth={1.9} /></Link>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-[1240px] mx-auto px-6 md:px-10 py-8 md:py-12">
          <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-6">
            <div className="card p-7 md:p-8">
              <div className="eyebrow">Pricing and access</div>
              <h3 className="mt-3 font-serif text-[24px] leading-[1.12]">Premium value with a calm, respectful purchase experience.</h3>
              <div className="mt-6 space-y-3">
                {['Clear paths for beginners and repeaters', 'Premium structure without clutter', 'Supportive next steps for serious prep'].map((item) => <div key={item} className="flex items-start gap-3"><Trophy size={15} strokeWidth={2} style={{ color: 'var(--color-primary)', marginTop: 4 }} /><div className="text-[14px] leading-[1.7]" style={{ color: 'var(--color-ink-muted)' }}>{item}</div></div>)}
              </div>
            </div>
            <div className="card p-7 md:p-8" style={{ background: 'var(--color-surface-alt)' }}>
              <div className="eyebrow">Testimonials</div>
              <div className="mt-6 space-y-4">
                {testimonials.map((item) => <div key={item.name} className="rounded-2xl border p-4" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}><div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em]" style={{ color: 'var(--color-primary)' }}><Users size={13} strokeWidth={1.8} /> Student feedback</div><p className="mt-3 text-[14px] leading-[1.7]" style={{ color: 'var(--color-ink-muted)' }}>&ldquo;{item.quote}&rdquo;</p><div className="mt-3 font-semibold text-[13px]">{item.name}</div></div>)}
              </div>
            </div>
          </div>
        </section>
      </ResourceLayout>
    </>
  );
}
