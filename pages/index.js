import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpRight, ArrowRight, BookOpen, Newspaper, ClipboardCheck, FileText,
  Calendar, GraduationCap, Sparkles, Play, Lock, ChevronRight, Star,
  CheckCircle2, TrendingUp, Users, Clock, Menu, X, Coffee
} from 'lucide-react';
import LandingNav from '../components/landing/LandingNav';
import LandingFooter from '../components/landing/LandingFooter';
import SplashLoader from '../components/landing/SplashLoader';

/* ─────────────────────────────────────────────
   MOCK DATA — swap with Firestore reads later
───────────────────────────────────────────── */
const CURRENT_AFFAIRS = [
  { id: 1, date: '28 JAN', category: 'Polity', title: 'The Election Commission tables new voter roll transparency framework', mins: 4, tag: 'Prelims + Mains' },
  { id: 2, date: '28 JAN', category: 'Economy', title: 'RBI signals policy pivot: what the December MPC minutes reveal', mins: 5, tag: 'Mains GS-III', premium: true },
  { id: 3, date: '27 JAN', category: 'Environment', title: 'IPCC AR6 synthesis and India\'s revised NDC targets: a reader', mins: 6, tag: 'Prelims + Mains' },
  { id: 4, date: '27 JAN', category: 'International', title: 'Quad ministerial 2026 — reading between the joint statements', mins: 5, tag: 'GS-II', premium: true },
];

const FREE_NOTES = [
  { subject: 'Modern History', title: 'Revolt of 1857 — causes, spread & aftermath', pages: 12, updated: 'Jan 24' },
  { subject: 'Polity', title: 'Fundamental Rights vs Directive Principles', pages: 9, updated: 'Jan 22' },
  { subject: 'Geography', title: 'Indian monsoon systems — a visual primer', pages: 14, updated: 'Jan 20' },
];

const FREE_VIDEOS = [
  { title: 'How to answer UPSC Mains GS-II questions', tutor: 'Aditi Rao', duration: '18:24', tag: 'Answer Writing' },
  { title: 'The One-Year Prelims Blueprint', tutor: 'Rohan Menon', duration: '24:10', tag: 'Strategy' },
];

const EXAMS = [
  { name: 'Civil Services Prelims', code: 'UPSC CSE-P', mode: 'Objective · 2 papers', color: 'primary' },
  { name: 'Civil Services Mains',   code: 'UPSC CSE-M', mode: 'Descriptive · 9 papers', color: 'accent' },
  { name: 'CAPF (AC)',              code: 'UPSC CAPF', mode: 'Paper I + II + PET', color: 'gold' },
  { name: 'CDS Examination',        code: 'UPSC CDS',  mode: '3 papers + SSB', color: 'primary' },
  { name: 'Indian Forest Service',  code: 'IFoS',      mode: 'Mains + Interview', color: 'accent' },
  { name: 'Engineering Services',   code: 'ESE',       mode: 'Prelims + Mains + PT', color: 'gold' },
];

const FEATURES = [
  { n: '01', icon: Newspaper,      title: 'Editorial Current Affairs', body: 'Not a news dump. A daily reader curated by writers, mapped to Prelims + Mains + PYQ relevance.' },
  { n: '02', icon: BookOpen,       title: 'Notes that feel like paper', body: 'Distraction-free editor, autosave, print-ready PDF export, and cross-device sync.' },
  { n: '03', icon: ClipboardCheck, title: 'Mocks calibrated to reality', body: 'Prelims / Mains / CAPF / CDS — with subject cutoffs and honest analytics, not vanity scores.' },
  { n: '04', icon: FileText,       title: 'Ten years of PYQs',          body: 'Every question, every year — filterable by subject, topic and year of appearance.' },
  { n: '05', icon: Calendar,       title: 'A planner that respects time', body: 'A weekly canvas for your prep — priorities, blocked hours, deadlines. No gamified guilt trips.' },
  { n: '06', icon: TrendingUp,     title: 'Progress you can trust',      body: 'Study time, mock trends, weak-topic radar. Analytics designed for insight, not addiction.' },
];

const PRESS = [
  'Featured in Civil Services Today',
  'Editorial partner — Insight Weekly',
  'Recommended by 2024 rankers',
  'Built with UPSC alumni',
];

/* ─────────────────────────────────────────── */
export default function Home() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [caIndex, setCaIndex] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 1400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const i = setInterval(() => setCaIndex(x => (x + 1) % CURRENT_AFFAIRS.length), 4200);
    return () => clearInterval(i);
  }, []);

  const today = useMemo(() => new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }), []);

  return (
    <>
      <AnimatePresence>{!ready && <SplashLoader key="splash" />}</AnimatePresence>

      <div style={{ opacity: ready ? 1 : 0, transition: 'opacity .5s ease' }}>
        <LandingNav />

        {/* ─────────── HERO ─────────── */}
        <section className="relative overflow-hidden" data-testid="landing-hero">
          <div className="max-w-[1240px] mx-auto px-6 md:px-10 pt-28 md:pt-36 pb-16 md:pb-24">
            <div className="grid grid-cols-12 gap-6 md:gap-10 items-end">
              {/* Left: headline block */}
              <div className="col-span-12 lg:col-span-8">
                <motion.div
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: .6, ease: [.2,.7,.2,1] }}
                  className="flex items-center gap-3 mb-8"
                >
                  <span className="chip chip-accent" data-testid="hero-eyebrow">
                    <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--color-accent)' }} />
                    Issue 07 · {today}
                  </span>
                  <span className="hidden md:inline-flex items-center gap-2 text-[12px] font-medium tracking-wide" style={{ color: 'var(--color-ink-muted)' }}>
                    <Clock size={13} strokeWidth={1.5} /> 3-minute read of today&apos;s brief
                  </span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: .7, delay: .1, ease: [.2,.7,.2,1] }}
                  className="hero-display"
                  style={{
                    fontSize: 'clamp(44px, 6.4vw, 92px)',
                    lineHeight: 1.02,
                    letterSpacing: '-0.045em',
                  }}
                >
                  A quieter, sharper way<br />
                  to prepare for the <span className="grad-text font-italic-serif" style={{ fontSize: '1.02em' }}>civil services</span>.
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: .6, delay: .25 }}
                  className="mt-8 max-w-[560px] text-[17px] leading-[1.65]"
                  style={{ color: 'var(--color-ink-muted)' }}
                >
                  Notes Cafe is an editorial preparation platform built for UPSC aspirants — daily current affairs, ten years of PYQs, honest mock tests, and a notes system that finally respects your time.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: .5, delay: .4 }}
                  className="mt-10 flex flex-wrap items-center gap-3"
                >
                  <Link href="/register" className="btn btn-primary" data-testid="hero-cta-signup">
                    Start free — no card required <ArrowRight size={16} strokeWidth={2} />
                  </Link>
                  <Link href="#today" className="btn btn-ghost" data-testid="hero-cta-preview">
                    Read today&apos;s brief <ArrowUpRight size={15} strokeWidth={1.75} />
                  </Link>
                  <span className="hidden md:inline-flex items-center gap-2 text-[12.5px] ml-2" style={{ color: 'var(--color-ink-faint)' }}>
                    <CheckCircle2 size={14} strokeWidth={1.5} /> Free tier includes current affairs, notes & lectures
                  </span>
                </motion.div>
              </div>

              {/* Right: floating brief card */}
              <div className="col-span-12 lg:col-span-4 relative">
                <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: .8, delay: .3 }}
                  className="card p-6 relative overflow-hidden"
                  style={{ background: 'var(--color-ink)', color: 'var(--color-bg)', borderColor: 'transparent' }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Coffee size={16} strokeWidth={1.6} style={{ color: 'var(--color-accent)' }} />
                      <span className="eyebrow" style={{ color: '#B7BFB8' }}>The Morning Brief</span>
                    </div>
                    <span className="text-[11px] font-mono" style={{ color: '#8A9993' }}>07:24 IST</span>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={caIndex}
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: .4 }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[11px] font-mono" style={{ color: 'var(--color-accent)' }}>
                          {CURRENT_AFFAIRS[caIndex].category.toUpperCase()}
                        </span>
                        <span style={{ color: '#3A4640' }}>·</span>
                        <span className="text-[11px] font-mono" style={{ color: '#8A9993' }}>
                          {CURRENT_AFFAIRS[caIndex].tag}
                        </span>
                      </div>
                      <div className="font-serif text-[22px] leading-[1.2]" style={{ letterSpacing: '-0.01em' }}>
                        {CURRENT_AFFAIRS[caIndex].title}
                      </div>
                      <div className="mt-4 text-[12.5px] flex items-center gap-2" style={{ color: '#8A9993' }}>
                        <Clock size={12} strokeWidth={1.5} /> {CURRENT_AFFAIRS[caIndex].mins} min read
                        {CURRENT_AFFAIRS[caIndex].premium && (
                          <span className="chip chip-gold ml-2" style={{ background: 'rgba(161,127,58,0.15)', color: '#D6B679', borderColor: 'rgba(161,127,58,0.35)' }}>
                            <Lock size={10} /> Plus
                          </span>
                        )}
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  <div className="mt-6 flex gap-1.5">
                    {CURRENT_AFFAIRS.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCaIndex(i)}
                        data-testid={`brief-dot-${i}`}
                        style={{
                          height: 3, width: i === caIndex ? 28 : 12,
                          borderRadius: 999,
                          background: i === caIndex ? 'var(--color-accent)' : '#2A3631',
                          border: 'none', cursor: 'pointer', padding: 0,
                          transition: 'all .3s ease',
                        }}
                        aria-label={`Brief ${i + 1}`}
                      />
                    ))}
                  </div>

                  <div className="hairline-t mt-6 pt-4 flex items-center justify-between" style={{ borderColor: '#2A3631' }}>
                    <span className="text-[12px]" style={{ color: '#8A9993' }}>Delivered daily at 7:15 AM IST</span>
                    <Link href="/current-affairs" className="text-[12px] font-medium flex items-center gap-1" style={{ color: 'var(--color-bg)' }}>
                      Read all <ArrowUpRight size={13} strokeWidth={1.75} />
                    </Link>
                  </div>
                </motion.div>

                {/* small floating tag */}
                <motion.div
                  initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: .5, delay: .6 }}
                  className="hidden md:flex absolute -bottom-6 -left-6 items-center gap-2 px-3.5 py-2 rounded-full"
                  style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
                >
                  <Sparkles size={14} strokeWidth={1.5} style={{ color: 'var(--color-accent)' }} />
                  <span className="text-[12px] font-medium">100% free to read today</span>
                </motion.div>
              </div>
            </div>

            {/* Hairline stats */}
            <div className="mt-20 md:mt-28 hairline-t hairline-b">
              <div className="grid grid-cols-2 md:grid-cols-4">
                {[
                  { n: '10',    l: 'Years of PYQs archived' },
                  { n: '500+',  l: 'Mock tests, calibrated' },
                  { n: 'Daily', l: 'Editorial brief · 7:15 IST' },
                  { n: '4.9',   l: 'Aspirant satisfaction', star: true },
                ].map((s, i) => (
                  <div key={i} className={`py-8 md:py-10 px-4 md:px-6 ${i < 3 ? 'md:hairline-r' : ''} ${i < 2 ? 'hairline-b md:hairline-b-0' : ''}`}
                       style={{ borderRight: i < 3 ? '1px solid var(--color-border)' : 'none' }}>
                    <div className="display-num text-[42px] md:text-[56px] flex items-center gap-2" style={{ color: 'var(--color-primary)' }}>
                      {s.n}
                      {s.star && <Star size={16} fill="var(--color-gold)" style={{ color: 'var(--color-gold)' }} />}
                    </div>
                    <div className="mt-2 text-[13px]" style={{ color: 'var(--color-ink-muted)' }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─────────── PRESS STRIP ─────────── */}
        <section className="hairline-b" style={{ background: 'var(--color-surface-alt)' }}>
          <div className="max-w-[1240px] mx-auto px-6 md:px-10 py-5 flex flex-wrap items-center gap-x-10 gap-y-2 justify-center md:justify-between">
            {PRESS.map((p, i) => (
              <span key={i} className="text-[12px] tracking-wider" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
                &ldquo;{p}&rdquo;
              </span>
            ))}
          </div>
        </section>

        {/* ─────────── TODAY'S FREE CONTENT ─────────── */}
        <section id="today" className="max-w-[1240px] mx-auto px-6 md:px-10 py-24 md:py-32" data-testid="today-section">
          <div className="grid grid-cols-12 gap-6 md:gap-10 items-end mb-14">
            <div className="col-span-12 md:col-span-8">
              <div className="eyebrow mb-4">Freely accessible · No login required</div>
              <h2 className="font-serif" style={{ fontSize: 'clamp(32px, 4.2vw, 56px)', lineHeight: 1.08, letterSpacing: '-0.02em', fontWeight: 460 }}>
                Everything a serious aspirant<br />needs to <em style={{ fontStyle: 'italic', color: 'var(--color-accent)' }}>start today</em>.
              </h2>
            </div>
            <div className="col-span-12 md:col-span-4 md:text-right">
              <p className="text-[15px]" style={{ color: 'var(--color-ink-muted)' }}>
                We keep the essentials free — because your first month of prep shouldn&apos;t be a paywall.
              </p>
            </div>
          </div>

          {/* Bento */}
          <div className="grid grid-cols-12 gap-4 md:gap-6">
            {/* Big: Current Affairs feed */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: .5 }}
              className="col-span-12 lg:col-span-7 card overflow-hidden"
              data-testid="free-current-affairs"
            >
              <div className="p-6 md:p-8 hairline-b flex items-center justify-between">
                <div>
                  <div className="eyebrow mb-1.5">Daily Current Affairs</div>
                  <div className="font-serif text-[24px]" style={{ letterSpacing: '-0.01em' }}>The Morning Brief</div>
                </div>
                <Link href="/current-affairs" className="btn btn-ghost" style={{ padding: '0.5rem 1rem', fontSize: 12 }}>
                  Open reader <ArrowUpRight size={14} strokeWidth={1.75} />
                </Link>
              </div>
              <div>
                {CURRENT_AFFAIRS.map((it) => (
                  <div key={it.id} className="hairline-b last:border-b-0 p-5 md:p-6 flex gap-5 items-start group cursor-pointer"
                       style={{ transition: 'background .15s ease' }}
                       onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-alt)'}
                       onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div className="text-center min-w-[54px]">
                      <div className="font-mono text-[11px]" style={{ color: 'var(--color-ink-faint)' }}>{it.date}</div>
                      <div className="font-serif text-[15px] mt-0.5 italic" style={{ color: 'var(--color-accent)' }}>{it.category}</div>
                    </div>
                    <div className="flex-1">
                      <div className="font-serif text-[18px] leading-[1.35]" style={{ letterSpacing: '-0.005em' }}>{it.title}</div>
                      <div className="mt-2 flex items-center gap-3 text-[12px]" style={{ color: 'var(--color-ink-muted)' }}>
                        <span className="flex items-center gap-1"><Clock size={11} strokeWidth={1.5} /> {it.mins} min</span>
                        <span>·</span>
                        <span>{it.tag}</span>
                        {it.premium && (
                          <span className="chip chip-gold" style={{ marginLeft: 'auto' }}>
                            <Lock size={10} /> Plus
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight size={18} strokeWidth={1.5} style={{ color: 'var(--color-border-strong)' }} />
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right column: Free notes + free videos stacked */}
            <div className="col-span-12 lg:col-span-5 flex flex-col gap-4 md:gap-6">
              <motion.div
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: .5, delay: .1 }}
                className="card p-6 md:p-7"
                data-testid="free-notes-card"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="eyebrow mb-1.5">Free Notes Library</div>
                    <div className="font-serif text-[20px]">Handpicked, on the house.</div>
                  </div>
                  <Link href="/notes" className="chip chip-primary" style={{ background: 'transparent' }}>Browse all</Link>
                </div>
                <div className="flex flex-col gap-3">
                  {FREE_NOTES.map((n, i) => (
                    <div key={i} className="flex items-start gap-4 py-2.5 hairline-b last:border-b-0 pb-3">
                      <div className="min-w-[36px] h-[46px] rounded-md flex items-center justify-center font-serif italic"
                           style={{ background: 'var(--color-primary-tint)', color: 'var(--color-primary)', fontSize: 15, letterSpacing: '-0.01em' }}>
                        {n.subject.split(' ').map(w => w[0]).join('').slice(0,2)}
                      </div>
                      <div className="flex-1">
                        <div className="text-[11px] font-mono" style={{ color: 'var(--color-ink-faint)' }}>{n.subject.toUpperCase()}</div>
                        <div className="font-serif text-[15.5px] leading-[1.35] mt-0.5">{n.title}</div>
                        <div className="text-[11.5px] mt-1.5" style={{ color: 'var(--color-ink-muted)' }}>{n.pages} pages · Updated {n.updated}</div>
                      </div>
                      <button className="opacity-0 group-hover:opacity-100" style={{ color: 'var(--color-ink-muted)' }}>
                        <ArrowUpRight size={16} strokeWidth={1.5} />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: .5, delay: .2 }}
                className="card p-6 md:p-7"
                data-testid="free-videos-card"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="eyebrow mb-1.5">Free Video Lectures</div>
                    <div className="font-serif text-[20px]">Watch. Take notes. Repeat.</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {FREE_VIDEOS.map((v, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-[64px] h-[46px] rounded-lg relative overflow-hidden flex items-center justify-center"
                           style={{ background: 'var(--color-ink)', color: 'var(--color-bg)' }}>
                        <Play size={16} fill="currentColor" />
                      </div>
                      <div className="flex-1">
                        <div className="text-[11px] font-mono" style={{ color: 'var(--color-ink-faint)' }}>{v.tag.toUpperCase()}</div>
                        <div className="font-serif text-[15px] leading-[1.35]">{v.title}</div>
                        <div className="text-[11.5px] mt-1" style={{ color: 'var(--color-ink-muted)' }}>{v.tutor} · {v.duration}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ─────────── FEATURES BENTO ─────────── */}
        <section id="features" className="hairline-t hairline-b" style={{ background: 'var(--color-surface-alt)' }} data-testid="features-section">
          <div className="max-w-[1240px] mx-auto px-6 md:px-10 py-24 md:py-32">
            <div className="grid grid-cols-12 gap-6 md:gap-10 items-end mb-14">
              <div className="col-span-12 md:col-span-7">
                <div className="eyebrow mb-4">The platform · At a glance</div>
                <h2 className="font-serif" style={{ fontSize: 'clamp(32px, 4.2vw, 56px)', lineHeight: 1.08, letterSpacing: '-0.02em', fontWeight: 460 }}>
                  Six tools, deeply considered.<br />
                  <em style={{ fontStyle: 'italic', color: 'var(--color-accent)' }}>Not sixty features you never open.</em>
                </h2>
              </div>
              <div className="col-span-12 md:col-span-5 md:text-right">
                <p className="text-[15px]" style={{ color: 'var(--color-ink-muted)' }}>
                  We chose depth over breadth. Every module is built to solve a specific problem in the UPSC preparation cycle — and nothing else.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-4 md:gap-6">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.n}
                  initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: .45, delay: i * 0.04 }}
                  className={`col-span-12 md:col-span-6 lg:col-span-4 card card-hover p-7 md:p-8`}
                  data-testid={`feature-card-${f.n}`}
                >
                  <div className="flex items-start justify-between mb-8">
                    <span className="font-serif italic text-[15px]" style={{ color: 'var(--color-accent)' }}>{f.n}</span>
                    <f.icon size={22} strokeWidth={1.5} style={{ color: 'var(--color-primary)' }} />
                  </div>
                  <h3 className="font-serif text-[22px] leading-[1.2]" style={{ letterSpacing: '-0.01em' }}>{f.title}</h3>
                  <p className="mt-3 text-[14.5px] leading-[1.65]" style={{ color: 'var(--color-ink-muted)' }}>{f.body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─────────── EXAM ECOSYSTEM ─────────── */}
        <section id="exams" className="max-w-[1240px] mx-auto px-6 md:px-10 py-24 md:py-32" data-testid="exams-section">
          <div className="grid grid-cols-12 gap-6 md:gap-10 items-end mb-14">
            <div className="col-span-12 md:col-span-8">
              <div className="eyebrow mb-4">The UPSC ecosystem</div>
              <h2 className="font-serif" style={{ fontSize: 'clamp(32px, 4.2vw, 56px)', lineHeight: 1.08, letterSpacing: '-0.02em', fontWeight: 460 }}>
                Built for the entire<br />UPSC universe — not just CSE.
              </h2>
            </div>
            <div className="col-span-12 md:col-span-4 md:text-right">
              <p className="text-[15px]" style={{ color: 'var(--color-ink-muted)' }}>
                Whichever service you&apos;re preparing for, the platform speaks the same rigorous language.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4">
            {EXAMS.map((e, i) => (
              <motion.div
                key={e.code}
                initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: .4, delay: i * 0.05 }}
                className="col-span-12 sm:col-span-6 lg:col-span-4 card card-hover p-6 md:p-7"
                data-testid={`exam-${e.code.replace(/\W/g,'')}`}
              >
                <div className={`chip chip-${e.color}`}>{e.code}</div>
                <div className="mt-5 font-serif text-[22px]" style={{ letterSpacing: '-0.01em' }}>{e.name}</div>
                <div className="mt-2 text-[13px]" style={{ color: 'var(--color-ink-muted)' }}>{e.mode}</div>
                <div className="mt-6 hairline-t pt-4 flex items-center justify-between text-[12.5px]" style={{ color: 'var(--color-ink-muted)' }}>
                  <span>PYQs · Mocks · Notes</span>
                  <ArrowUpRight size={15} strokeWidth={1.5} />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ─────────── DARK EDITORIAL: METHOD ─────────── */}
        <section className="relative overflow-hidden" style={{ background: 'var(--color-ink)', color: 'var(--color-bg)' }} data-testid="method-section">
          <div className="max-w-[1240px] mx-auto px-6 md:px-10 py-24 md:py-32">
            <div className="grid grid-cols-12 gap-6 md:gap-10 items-start">
              <div className="col-span-12 lg:col-span-5">
                <div className="eyebrow" style={{ color: '#8A9993' }}>The Notes Cafe method</div>
                <h2 className="font-serif mt-4" style={{ fontSize: 'clamp(32px, 4.2vw, 56px)', lineHeight: 1.05, letterSpacing: '-0.02em', fontWeight: 440 }}>
                  A quieter room to read,<br />write, <em style={{ fontStyle: 'italic', color: 'var(--color-accent)' }}>and remember</em>.
                </h2>
                <p className="mt-6 text-[15.5px] leading-[1.7]" style={{ color: '#B7BFB8' }}>
                  We reject the loud, gamified UX that treats aspirants like distracted teens.
                  Notes Cafe is designed for adults preparing for one of the world&apos;s toughest examinations — with the calm interface, editorial voice, and analytical rigour they deserve.
                </p>
                <div className="mt-10 flex flex-wrap gap-2">
                  {['No streak guilt', 'No push-notification spam', 'No paywalled fundamentals', 'No AI-slop content'].map((k, i) => (
                    <span key={i} className="chip" style={{ background: 'transparent', color: '#B7BFB8', borderColor: '#2A3631' }}>{k}</span>
                  ))}
                </div>
              </div>

              <div className="col-span-12 lg:col-span-7">
                <div className="grid grid-cols-2 gap-4 md:gap-6">
                  {[
                    { n: '01', t: 'Read', b: 'A daily editorial brief. No 40-page PDFs.' },
                    { n: '02', t: 'Note',  b: 'Structured, distraction-free writing.' },
                    { n: '03', t: 'Test',  b: 'Weekly mocks calibrated to the real exam.' },
                    { n: '04', t: 'Review',b: 'Weak-topic radar, then repeat with intent.' },
                  ].map((s, i) => (
                    <motion.div
                      key={s.n}
                      initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                      transition={{ duration: .5, delay: i * .08 }}
                      className="p-6 md:p-8 rounded-2xl"
                      style={{ background: '#141A17', border: '1px solid #2A3631' }}
                    >
                      <div className="font-serif italic text-[15px]" style={{ color: 'var(--color-accent)' }}>{s.n}</div>
                      <div className="font-serif text-[28px] mt-4" style={{ letterSpacing: '-0.01em' }}>{s.t}</div>
                      <div className="mt-3 text-[13.5px]" style={{ color: '#8A9993' }}>{s.b}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────── PRICING ─────────── */}
        <section id="pricing" className="max-w-[1240px] mx-auto px-6 md:px-10 py-24 md:py-32" data-testid="pricing-section">
          <div className="text-center mb-14">
            <div className="eyebrow mb-4">Simple, honest pricing</div>
            <h2 className="font-serif" style={{ fontSize: 'clamp(32px, 4.2vw, 56px)', lineHeight: 1.08, letterSpacing: '-0.02em', fontWeight: 460 }}>
              Free where it matters.<br />
              <em style={{ fontStyle: 'italic', color: 'var(--color-accent)' }}>Premium where it counts.</em>
            </h2>
          </div>

          <div className="grid grid-cols-12 gap-4 md:gap-6 max-w-[1000px] mx-auto">
            {/* Free */}
            <div className="col-span-12 md:col-span-6 card p-8 md:p-10" data-testid="plan-free">
              <div className="chip">Free forever</div>
              <div className="mt-6 flex items-baseline gap-2">
                <span className="display-num text-[64px]" style={{ color: 'var(--color-primary)' }}>₹0</span>
                <span className="text-[14px]" style={{ color: 'var(--color-ink-muted)' }}>/ month</span>
              </div>
              <p className="mt-2 text-[14px]" style={{ color: 'var(--color-ink-muted)' }}>For every aspirant getting started. Genuinely useful, not a taster.</p>
              <div className="hairline-t my-8" />
              <ul className="flex flex-col gap-3.5 text-[14.5px]">
                {['Daily editorial current affairs brief', 'Curated free study notes library', 'Selected free video lectures', 'Ten years of PYQ archive (view only)', 'Basic weekly planner'].map((x, i) => (
                  <li key={i} className="flex items-start gap-3"><CheckCircle2 size={16} strokeWidth={1.75} style={{ color: 'var(--color-primary)', marginTop: 2 }} /> {x}</li>
                ))}
              </ul>
              <Link href="/register" className="btn btn-ghost mt-10 w-full justify-center" data-testid="plan-free-cta">
                Create free account <ArrowRight size={15} />
              </Link>
            </div>

            {/* Premium */}
            <div className="col-span-12 md:col-span-6 card p-8 md:p-10 relative overflow-hidden"
                 style={{ background: 'var(--color-primary)', color: 'var(--color-bg)', borderColor: 'transparent' }}
                 data-testid="plan-plus">
              <div className="absolute top-6 right-6 chip chip-gold" style={{ background: 'rgba(161,127,58,0.2)', color: '#E8CB86', borderColor: 'rgba(161,127,58,0.4)' }}>
                <Sparkles size={11} /> Most chosen
              </div>
              <div className="chip" style={{ background: 'rgba(255,255,255,0.08)', color: '#B7BFB8', borderColor: 'rgba(255,255,255,0.12)' }}>Notes Cafe Plus</div>
              <div className="mt-6 flex items-baseline gap-2">
                <span className="display-num text-[64px]" style={{ color: 'var(--color-bg)' }}>₹399</span>
                <span className="text-[14px]" style={{ color: '#B7BFB8' }}>/ month</span>
              </div>
              <p className="mt-2 text-[14px]" style={{ color: '#B7BFB8' }}>Everything free, plus the full editorial + testing engine. Cancel anytime.</p>
              <div className="my-8" style={{ borderTop: '1px solid #2A3631' }} />
              <ul className="flex flex-col gap-3.5 text-[14.5px]">
                {['Unlimited mock tests (Prelims/Mains/CAPF/CDS)', 'Complete PYQ archive with solutions', 'Full note editor + PDF export', 'Analytics: weak topics, mock trends, streaks', 'Interactive syllabus tracker', 'Priority email support from ex-aspirants'].map((x, i) => (
                  <li key={i} className="flex items-start gap-3"><CheckCircle2 size={16} strokeWidth={1.75} style={{ color: 'var(--color-accent)', marginTop: 2 }} /> {x}</li>
                ))}
              </ul>
              <Link href="/register" className="btn btn-accent mt-10 w-full justify-center" data-testid="plan-plus-cta">
                Start 7-day free trial <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>

        {/* ─────────── FINAL CTA ─────────── */}
        <section className="hairline-t" style={{ background: 'var(--color-surface-alt)' }}>
          <div className="max-w-[1240px] mx-auto px-6 md:px-10 py-20 md:py-28 text-center">
            <div className="eyebrow mb-4">A last word</div>
            <h2 className="font-serif max-w-[820px] mx-auto" style={{ fontSize: 'clamp(28px, 3.6vw, 46px)', lineHeight: 1.15, letterSpacing: '-0.02em', fontWeight: 460 }}>
              You&apos;ve read enough marketing copy for today.
              <em style={{ fontStyle: 'italic', color: 'var(--color-accent)' }}> Now, read the brief.</em>
            </h2>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Link href="/register" className="btn btn-primary" data-testid="footer-cta-register">
                Start free — no card required <ArrowRight size={15} />
              </Link>
              <Link href="/login" className="btn btn-ghost" data-testid="footer-cta-login">
                I already have an account
              </Link>
            </div>
          </div>
        </section>

        <LandingFooter />
      </div>
    </>
  );
}
