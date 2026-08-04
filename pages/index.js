import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import useFirestoreCollection from '../hooks/useFirestoreCollection';
import {
  ArrowUpRight, ArrowRight, BookOpen, Newspaper, ClipboardCheck, FileText,
  Calendar, GraduationCap, Sparkles, Play, ChevronRight, ChevronDown, Star,
  CheckCircle2, TrendingUp, Users, Clock, Menu, X, Coffee, Compass,
  MapPin, Flag, PenLine, Target, Award, Bell
} from 'lucide-react';
import Navbar from '../components/common/NavBar';
import LandingFooter from '../components/landing/LandingFooter';
import SplashLoader from '../components/landing/SplashLoader';

/* ─────────────────────────────────────────────
   MOCK DATA — TODO(firestore): each block below marks
   exactly where a Firestore read should replace the
   static array. Shape is kept 1:1 so swapping is a
   drop-in once collections/fields are finalised.
───────────────────────────────────────────── */

// TODO(firestore): collection('notices').where('active','==',true).orderBy('publishedAt','desc').limit(8)
// Admin-managed: whoever publishes a new result / vacancy / answer key writes
// one doc here — kind drives the chip color, everything else is free text.
const NOTICES = [
  { id: 1, kind: 'result',      label: 'Result',       text: 'UPSC CSE 2026 Prelims result declared — check your roll number', href: '/updates/cse-prelims-result-2026' },
  { id: 2, kind: 'recruitment', label: 'Vacancy',      text: 'CAPF Assistant Commandant 2026 notification out — 322 posts',    href: '/updates/capf-ac-2026' },
  { id: 3, kind: 'answerkey',   label: 'Answer Key',   text: 'CDS (II) 2026 official answer key released',                     href: '/updates/cds-2-answer-key-2026' },
  { id: 4, kind: 'admitcard',   label: 'Admit Card',   text: 'IFoS Mains 2026 admit cards now available for download',         href: '/updates/ifos-mains-admit-card' },
  { id: 5, kind: 'recruitment', label: 'Vacancy',      text: 'Engineering Services Exam 2027 notification expected next week', href: '/updates/ese-2027-notification' },
];

const NOTICE_CHIP = {
  result: 'chip-primary',
  recruitment: 'chip-accent',
  answerkey: 'chip-gold',
  admitcard: 'chip-primary',
  info: 'chip-primary',
  success: 'chip-green',
  warning: 'chip-amber',
  error: 'chip-accent',
};

// TODO(firestore): collection('currentAffairs').orderBy('date','desc').limit(4)
const CURRENT_AFFAIRS = [
  { id: 1, date: '28 JAN', category: 'Polity', title: 'The Election Commission tables new voter roll transparency framework', mins: 4, tag: 'Prelims + Mains' },
  { id: 2, date: '28 JAN', category: 'Economy', title: 'RBI signals policy pivot: what the December MPC minutes reveal', mins: 5, tag: 'Mains GS-III' },
  { id: 3, date: '27 JAN', category: 'Environment', title: 'IPCC AR6 synthesis and India\'s revised NDC targets: a reader', mins: 6, tag: 'Prelims + Mains' },
  { id: 4, date: '27 JAN', category: 'International', title: 'Quad ministerial 2026 — reading between the joint statements', mins: 5, tag: 'GS-II' },
];

// TODO(firestore): collection('notes').where('featured','==',true).limit(3)
const FREE_NOTES = [
  { subject: 'Modern History', title: 'Revolt of 1857 — causes, spread & aftermath', pages: 12, updated: 'Jan 24' },
  { subject: 'Polity', title: 'Fundamental Rights vs Directive Principles', pages: 9, updated: 'Jan 22' },
  { subject: 'Geography', title: 'Indian monsoon systems — a visual primer', pages: 14, updated: 'Jan 20' },
];

// TODO(firestore): collection('videos').where('free','==',true)
const FREE_VIDEOS = [
  { title: 'UPSC prep from absolute zero: the first 30 days', tutor: 'Aditi Rao', duration: '18:24', tag: 'Getting Started' },
  { title: 'How to answer UPSC Mains GS-II questions', tutor: 'Rohan Menon', duration: '24:10', tag: 'Answer Writing' },
];

// The core differentiator for a zero-to-hero positioning: an explicit,
// ordered path. Order carries real information here, so numbering it is
// earned rather than decorative.
const ROADMAP = [
  {
    stage: '00',
    phase: 'Week 1',
    title: 'Understand the exam, honestly',
    body: 'Eligibility, the three-stage format, what actually gets tested, and why most beginners quit in month one without ever knowing why.',
    icon: Compass,
  },
  {
    stage: '01',
    phase: 'Months 1–3',
    title: 'Build the NCERT foundation',
    body: 'History, polity, geography, economy — in that order, before a single current affairs article. Skipping this is the most common beginner mistake.',
    icon: BookOpen,
  },
  {
    stage: '02',
    phase: 'Ongoing from month 2',
    title: 'Start the daily current affairs habit',
    body: 'One newspaper, twenty minutes, every day — not two hours of scattered PDFs. Small and consistent beats long and sporadic.',
    icon: Newspaper,
  },
  {
    stage: '03',
    phase: 'Month 4 onward',
    title: 'Learn to write Mains answers',
    body: 'Structure, word limits, and how examiners actually score — with feedback, not just more reading.',
    icon: PenLine,
  },
  {
    stage: '04',
    phase: 'Month 6 onward',
    title: 'Test yourself, honestly',
    body: 'Sectional and full-length mocks with real cutoffs and analytics — not vanity scores designed to make you feel good.',
    icon: Target,
  },
  {
    stage: '05',
    phase: 'Final year',
    title: 'Mains, optional subject & interview',
    body: 'Choosing an optional you can sustain, deepening answer quality, and preparing for the Board — the stage most guides skip entirely.',
    icon: Award,
  },
];

const FAQS = [
  {
    q: "I don't know anything about UPSC. Where do I even start?",
    a: 'Start with understanding the exam itself — the stages, the syllabus shape, and realistic timelines — before opening a single book. Our roadmap below is built for exactly this starting point; it tells you what to do in week one, not just what to eventually cover.',
  },
  {
    q: 'Do I need to join a coaching institute to begin?',
    a: "No — thousands of selections happen through self-study every year. Coaching can help with structure and peer pressure, but it isn't a prerequisite to start. What matters early on is a clear sequence, not a classroom.",
  },
  {
    q: 'How many hours a day should a beginner study?',
    a: "Less than you think, at first. Two to three focused hours of NCERT reading in month one builds a stronger base than six unfocused hours. Depth of habit matters more than hour count in the beginning.",
  },
  {
    q: 'Is current affairs really that important from day one?',
    a: "Not from day one, no — and this is where most beginners go wrong. Current affairs only makes sense once you have a static foundation to attach it to. We introduce it deliberately in month two, not week one.",
  },
  {
    q: 'How is this different from just reading the newspaper myself?',
    a: 'The newspaper does not tell you which parts matter for the exam, tag them to past questions, or tell you when to start reading it relative to your prep stage. That editorial judgment — not the raw news — is what we add.',
  },
  {
    q: 'Which optional subject should I choose?',
    a: 'That decision belongs later — after your foundation stage, once you know your own reading speed and interest, not before. It is stage five of the roadmap below, deliberately, not stage one.',
  },
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
  { n: '01', icon: Compass,        title: 'A roadmap, not a syllabus dump', body: "Told what to do this week, not handed the entire UPSC syllabus on day one and left to figure out sequencing yourself." },
  { n: '02', icon: Newspaper,      title: 'Editorial Current Affairs', body: 'Introduced at the right stage of your prep, mapped to Prelims + Mains + PYQ relevance — not a firehose from day one.' },
  { n: '03', icon: BookOpen,       title: 'Notes that feel like paper', body: 'Distraction-free editor, autosave, print-ready PDF export, and cross-device sync.' },
  { n: '04', icon: ClipboardCheck, title: 'Mocks calibrated to reality', body: 'Prelims / Mains / CAPF / CDS — with subject cutoffs and honest analytics, not vanity scores.' },
  { n: '05', icon: FileText,       title: 'Ten years of PYQs',          body: 'Every question, every year — filterable by subject, topic and year of appearance.' },
  { n: '06', icon: TrendingUp,     title: 'Progress you can trust',      body: 'Study time, mock trends, weak-topic radar. Analytics designed for insight, not addiction.' },
];

/* ─────────────────────────────────────────── */
export default function Home() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [caIndex, setCaIndex] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);
  const { data: notices, isMock: noticesMock } = useFirestoreCollection({
    name: 'adminNotifications',
    where: [['isActive', '==', true], ['target', 'in', ['home', 'both']]],
    orderBy: ['createdAt', 'desc'],
    limit: 8,
    fallback: NOTICES,
    transform: (docs) => docs.map((d) => ({
      id: d.id,
      kind: d.kind || d.type || 'info',
      label: d.label || (d.type ? d.type.toUpperCase() : 'Update'),
      text: d.message || d.text || '',
      href: d.href || '/',
    })),
  });

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

        {/* ─────────── STICKY NAV + NOTICE TICKER ───────────
            Navbar sits inside a solid-background wrapper so it reads as
            a distinct band from the hero below it, rather than floating
            transparently over the content. The ticker is a second, thinner
            band directly beneath it — its own row, its own job. */}
        <div className="sticky top-0 z-50" style={{ background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
          <Navbar showOnLanding />

          <div className="notice-ticker hairline-t" data-testid="notice-ticker" style={{ background: 'var(--color-surface-alt)' }}>
            <div className="flex items-center gap-2 pl-4 md:pl-6 pr-3 shrink-0" style={{ borderRight: '1px solid var(--color-border)' }}>
              <Bell size={12} strokeWidth={2} style={{ color: 'var(--color-accent)' }} />
              <span className="text-[10.5px] font-mono tracking-wide hidden sm:inline" style={{ color: 'var(--color-ink-faint)' }}>
                UPDATES
              </span>
            </div>
            <div className="notice-ticker-viewport">
              <div className="notice-ticker-track">
                {[...notices, ...notices].map((n, i) => {
                  const isExternal = /^https?:\/\//.test(n.href);
                  const chipClass = NOTICE_CHIP[n.kind] || NOTICE_CHIP[n.type] || 'chip-primary';
                  const item = (
                    <a
                      href={n.href || '#'}
                      className="notice-item"
                      target={isExternal ? '_blank' : '_self'}
                      rel={isExternal ? 'noreferrer noopener' : undefined}
                      tabIndex={i >= notices.length ? -1 : 0}
                    >
                      <span className={`chip ${chipClass}`} style={{ padding: '2px 8px', fontSize: 10 }}>
                        {n.label}
                      </span>
                      <span className="notice-text">{n.text}</span>
                    </a>
                  );
                  return item;
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ─────────── HERO ─────────── */}
        <section className="relative overflow-hidden" data-testid="landing-hero">
          <div className="max-w-[1240px] mx-auto px-6 md:px-10 pt-16 md:pt-20 pb-16 md:pb-24">
            <div className="grid grid-cols-12 gap-6 md:gap-10 items-start">
              {/* Full-width headline block */}
              <div className="col-span-12">
 

                <motion.h1
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: .7, delay: .1, ease: [.2,.7,.2,1] }}
                  className="hero-display"
                  style={{
                    fontSize: 'clamp(34px, 5.2vw, 80px)',
                    lineHeight: 1.05,
                    letterSpacing: '-0.045em',
                    maxWidth: '1200px',
                  }}
                >
                  New to UPSC? Start exactly <span className="grad-text font-italic-serif" style={{ fontSize: '1.02em' }}>here</span>.
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: .6, delay: .25 }}
                  className="mt-7 max-w-[1400px] text-[17px] leading-[1.65]"
                  style={{ color: 'var(--color-ink-muted)' }}
                >
                  Notes Cafe is a preparation platform built for the moment before you've started — a clear, ordered roadmap from "I don't know where to begin" to your first Mains answer, backed by daily current affairs, ten years of PYQs, and honest mock tests.
                </motion.p>
              </div>

              {/* Hero video box */}
              <div className="col-span-12 lg:col-span-7 mt-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: .8, delay: .3 }}
                  className="card overflow-hidden relative"
                  style={{ background: 'var(--color-ink)', minHeight: 340 }}
                  data-testid="hero-illustration"
                >
                  <video
                    src="/videos/UPPPSC.mp4"
                    autoPlay
                    muted
                    loop
                    playsInline
                    controls={false}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </motion.div>
              </div>

              {/* CTA column, beside the illustration */}
              <div className="col-span-12 lg:col-span-5 mt-10 flex flex-col justify-center h-full">
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: .5, delay: .4 }}
                  className="card p-7 md:p-8 h-full flex flex-col justify-center"
                >
                  <div className="eyebrow mb-3">Your very first step</div>
                  <div className="font-serif text-[22px] leading-[1.3] mb-6" style={{ letterSpacing: '-0.01em' }}>
                    Six stages, zero to Mains — see exactly where to begin.
                  </div>
                  <div className="flex flex-col gap-3">
                    <Link href="#roadmap" className="btn btn-primary justify-center" data-testid="hero-cta-roadmap">
                      See the zero-to-hero roadmap <ArrowRight size={16} strokeWidth={2} />
                    </Link>
                    <Link href="/register" className="btn btn-ghost justify-center" data-testid="hero-cta-signup">
                      Get started, it&apos;s free <ArrowUpRight size={15} strokeWidth={1.75} />
                    </Link>
                  </div>

                </motion.div>
              </div>
            </div>

            {/* Hairline stats */}
            <div className="mt-16 md:mt-20 hairline-t hairline-b">
              <div className="grid grid-cols-2 md:grid-cols-4">
                {[
                  { n: '6',     l: 'Stages, zero to Mains' },
                  { n: '10',    l: 'Years of PYQs archived' },
                  { n: '500+',  l: 'Mock tests, calibrated' },
                  { n: 'Daily', l: 'Editorial brief · 7:15 IST' },
                ].map((s, i) => (
                  <div key={i} className={`py-8 md:py-10 px-4 md:px-6 ${i < 3 ? 'md:hairline-r' : ''} ${i < 2 ? 'hairline-b md:hairline-b-0' : ''}`}
                       style={{ borderRight: i < 3 ? '1px solid var(--color-border)' : 'none' }}>
                    <div className="display-num text-[42px] md:text-[56px] flex items-center gap-2" style={{ color: 'var(--color-primary)' }}>
                      {s.n}
                    </div>
                    <div className="mt-2 text-[13px]" style={{ color: 'var(--color-ink-muted)' }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─────────── ZERO TO HERO ROADMAP ─────────── */}
        <section id="roadmap" className="hairline-t hairline-b" style={{ background: 'var(--color-surface-alt)' }} data-testid="roadmap-section">
          <div className="max-w-[1240px] mx-auto px-6 md:px-10 py-24 md:py-32">
            <div className="grid grid-cols-12 gap-6 md:gap-10 items-end mb-14">
              <div className="col-span-12 md:col-span-8">
                <div className="eyebrow mb-4">The Zero-to-Hero Roadmap</div>
                <h2 className="font-serif" style={{ fontSize: 'clamp(32px, 4.2vw, 56px)', lineHeight: 1.08, letterSpacing: '-0.02em', fontWeight: 460 }}>
                  You don&apos;t need a plan.<br />
                  <em style={{ fontStyle: 'italic', color: 'var(--color-accent)' }}>You need this one.</em>
                </h2>
              </div>
              <div className="col-span-12 md:col-span-4 md:text-right">
                <p className="text-[15px]" style={{ color: 'var(--color-ink-muted)' }}>
                  Six stages, in the order they actually matter — built for the version of you that hasn&apos;t opened a single book yet.
                </p>
              </div>
            </div>

            <div className="flex flex-col">
              {ROADMAP.map((stg, i) => (
                <motion.div
                  key={stg.stage}
                  initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: .45, delay: i * 0.04 }}
                  className="grid grid-cols-12 gap-4 md:gap-8 py-7 hairline-b last:border-b-0"
                  data-testid={`roadmap-stage-${stg.stage}`}
                >
                  <div className="col-span-3 md:col-span-2 flex items-start gap-3">
                    <span className="font-serif italic text-[20px]" style={{ color: 'var(--color-accent)' }}>{stg.stage}</span>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                         style={{ background: 'var(--color-primary-tint)', color: 'var(--color-primary)' }}>
                      <stg.icon size={18} strokeWidth={1.5} />
                    </div>
                  </div>
                  <div className="col-span-9 md:col-span-2">
                    <div className="text-[11px] font-mono mt-2" style={{ color: 'var(--color-ink-faint)' }}>{stg.phase.toUpperCase()}</div>
                  </div>
                  <div className="col-span-12 md:col-span-8">
                    <div className="font-serif text-[21px] leading-[1.25]" style={{ letterSpacing: '-0.01em' }}>{stg.title}</div>
                    <p className="mt-2 text-[14.5px] leading-[1.65] max-w-[640px]" style={{ color: 'var(--color-ink-muted)' }}>{stg.body}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-12 flex justify-center">
              <Link href="/register" className="btn btn-primary" data-testid="roadmap-cta">
                Start at stage 00, free <ArrowRight size={15} strokeWidth={2} />
              </Link>
            </div>
          </div>
        </section>

        {/* ─────────── TODAY'S FREE CONTENT ─────────── */}
        <section id="today" className="max-w-[1240px] mx-auto px-6 md:px-10 py-24 md:py-32" data-testid="today-section">
          <div className="grid grid-cols-12 gap-6 md:gap-10 items-end mb-14">
            <div className="col-span-12 md:col-span-8">
              <div className="eyebrow mb-4">Your first week · No login required</div>
              <h2 className="font-serif" style={{ fontSize: 'clamp(32px, 4.2vw, 56px)', lineHeight: 1.08, letterSpacing: '-0.02em', fontWeight: 460 }}>
                A real look at what<br />the habit <em style={{ fontStyle: 'italic', color: 'var(--color-accent)' }}>actually feels like</em>.
              </h2>
            </div>
            <div className="col-span-12 md:col-span-4 md:text-right">
              <p className="text-[15px]" style={{ color: 'var(--color-ink-muted)' }}>
                Current affairs, notes, and lectures — try the exact daily rhythm before you commit to anything.
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
                    <div className="eyebrow mb-1.5">Notes Library</div>
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
                    <div className="eyebrow mb-1.5">Video Lectures</div>
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
                  We chose depth over breadth. Every module solves one specific problem in the journey from zero to the interview — and nothing else.
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
              <div className="eyebrow mb-4">Once you've found your footing</div>
              <h2 className="font-serif" style={{ fontSize: 'clamp(32px, 4.2vw, 56px)', lineHeight: 1.08, letterSpacing: '-0.02em', fontWeight: 460 }}>
                Built for the entire<br />UPSC universe — not just CSE.
              </h2>
            </div>
            <div className="col-span-12 md:col-span-4 md:text-right">
              <p className="text-[15px]" style={{ color: 'var(--color-ink-muted)' }}>
                Whichever service you eventually target, the roadmap and tools speak the same rigorous language.
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
                  Built for the version<br />of you that <em style={{ fontStyle: 'italic', color: 'var(--color-accent)' }}>hasn&apos;t started</em>.
                </h2>
                <p className="mt-6 text-[15.5px] leading-[1.7]" style={{ color: '#B7BFB8' }}>
                  Most platforms are built for aspirants already three months in. We start one step earlier — at "I don't know where to begin" — with the calm interface, editorial voice, and sequencing that a total beginner actually needs.
                </p>
                <div className="mt-10 flex flex-wrap gap-2">
                  {['No streak guilt', 'No push-notification spam', 'No paywalled fundamentals', 'No syllabus dumped on day one'].map((k, i) => (
                    <span key={i} className="chip" style={{ background: 'transparent', color: '#B7BFB8', borderColor: '#2A3631' }}>{k}</span>
                  ))}
                </div>
              </div>

              <div className="col-span-12 lg:col-span-7">
                <div className="grid grid-cols-2 gap-4 md:gap-6">
                  {[
                    { n: '01', t: 'Orient', b: 'Understand the exam before opening a book.' },
                    { n: '02', t: 'Read', b: 'A daily editorial brief. No 40-page PDFs.' },
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

        {/* ─────────── FAQ FOR BEGINNERS ─────────── */}
        <section id="faq" className="max-w-[1240px] mx-auto px-6 md:px-10 py-24 md:py-32" data-testid="faq-section">
          <div className="grid grid-cols-12 gap-6 md:gap-10 mb-14">
            <div className="col-span-12 md:col-span-6">
              <div className="eyebrow mb-4">Questions every beginner asks</div>
              <h2 className="font-serif" style={{ fontSize: 'clamp(32px, 4.2vw, 56px)', lineHeight: 1.08, letterSpacing: '-0.02em', fontWeight: 460 }}>
                Before you start,<br />
                <em style={{ fontStyle: 'italic', color: 'var(--color-accent)' }}>the honest answers</em>.
              </h2>
            </div>
          </div>

          <div className="max-w-[820px]">
            {FAQS.map((f, i) => {
              const open = openFaq === i;
              return (
                <div key={i} className="hairline-b last:border-b-0" data-testid={`faq-item-${i}`}>
                  <button
                    onClick={() => setOpenFaq(open ? -1 : i)}
                    className="w-full flex items-center justify-between gap-6 py-6 text-left"
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                    aria-expanded={open}
                  >
                    <span className="font-serif text-[18px] md:text-[20px]" style={{ letterSpacing: '-0.005em' }}>{f.q}</span>
                    <ChevronDown
                      size={18} strokeWidth={1.5}
                      style={{
                        color: 'var(--color-ink-muted)', flexShrink: 0,
                        transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform .25s ease',
                      }}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: .25, ease: [.2,.7,.2,1] }}
                        style={{ overflow: 'hidden' }}
                      >
                        <p className="pb-6 text-[15px] leading-[1.7] max-w-[680px]" style={{ color: 'var(--color-ink-muted)' }}>
                          {f.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        {/* ─────────── FINAL CTA ─────────── */}
        <section className="hairline-t" style={{ background: 'var(--color-surface-alt)' }}>
          <div className="max-w-[1240px] mx-auto px-6 md:px-10 py-20 md:py-28 text-center">
            <div className="eyebrow mb-4">A last word</div>
            <h2 className="font-serif max-w-[820px] mx-auto" style={{ fontSize: 'clamp(28px, 3.6vw, 46px)', lineHeight: 1.15, letterSpacing: '-0.02em', fontWeight: 460 }}>
              You don&apos;t need to know everything to begin.
              <em style={{ fontStyle: 'italic', color: 'var(--color-accent)' }}> You just need stage 00.</em>
            </h2>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Link href="/register" className="btn btn-primary" data-testid="footer-cta-register">
                Get started, it&apos;s free <ArrowRight size={15} />
              </Link>
              <Link href="/login" className="btn btn-ghost" data-testid="footer-cta-login">
                I already have an account
              </Link>
            </div>
          </div>
        </section>

        <LandingFooter />
      </div>

      <style jsx>{`
        .notice-ticker {
          display: flex;
          align-items: center;
          height: 36px;
          overflow: hidden;
        }
        .notice-ticker-viewport {
          flex: 1;
          overflow: hidden;
          position: relative;
          height: 100%;
        }
        .notice-ticker-track {
          display: flex;
          align-items: center;
          gap: 2.5rem;
          height: 100%;
          white-space: nowrap;
          width: max-content;
          animation: ticker-scroll 34s linear infinite;
          padding-left: 1.5rem;
        }
        .notice-ticker:hover .notice-ticker-track {
          animation-play-state: paused;
        }
        .notice-item {
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          color: var(--color-ink-muted);
          font-size: 12.5px;
        }
        .notice-item:hover {
          color: var(--color-ink);
        }
        .notice-text {
          white-space: nowrap;
        }
        @keyframes ticker-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .notice-ticker-track {
            animation: none;
          }
        }
      `}</style>
    </>
  );
}

/*
TODO(firestore): Once your collections are finalised, swap the mock
arrays above for a real fetch, e.g.:

  export async function getStaticProps() {
    const db = getFirestore(app);
    const caSnap = await getDocs(
      query(collection(db, 'currentAffairs'), orderBy('date', 'desc'), limit(4))
    );
    const currentAffairs = caSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    const noticesSnap = await getDocs(
      query(collection(db, 'notices'), where('active', '==', true), orderBy('publishedAt', 'desc'), limit(8))
    );
    const notices = noticesSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    return { props: { currentAffairs, notices }, revalidate: 900 }; // 15 min ISR
  }

Keep the field names (date, category, title, mins, tag / kind, label, text, href)
aligned with what's used in the JSX above, or update both together.
*/