import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpRight, ArrowRight, BookOpen, Newspaper, ClipboardCheck, FileText,
  Calendar, GraduationCap, Sparkles, ChevronDown, Star,
  CheckCircle2, TrendingUp, Users, Menu, X, Coffee, Compass,
  MapPin, Flag, PenLine, Target, Award
} from 'lucide-react';
import SplashLoader from '@/components/landing/SplashLoader';
import {
  HeroFirstStepCard,
  HeroGlowFeatureRow,
} from '@/components/landing/HeroRoadmapShowcase';

/* ─────────────────────────────────────────────
   MOCK DATA — TODO(firestore): each block below marks
   exactly where a Firestore read should replace the
   static array. Shape is kept 1:1 so swapping is a
   drop-in once collections/fields are finalised.
───────────────────────────────────────────── */

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
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 1400);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <AnimatePresence initial={false}>{!ready && <SplashLoader key="splash" />}</AnimatePresence>

      <div style={{ opacity: ready ? 1 : 0, transition: 'opacity .5s ease' }}>

        {/* ─────────── HERO ─────────── */}
        <section className="relative overflow-hidden" data-testid="landing-hero">
          <div className="max-w-[1240px] mx-auto px-6 md:px-10 pt-12 md:pt-16 pb-12 md:pb-16">
            <div className="grid grid-cols-12 gap-5 md:gap-8 items-start">
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
                  className="mt-5 max-w-[1400px] text-[17px] leading-[1.65]"
                  style={{ color: 'var(--color-ink-muted)' }}
                >
                  Notes Cafe is a preparation platform built for the moment before you've started — a clear, ordered roadmap from "I don't know where to begin" to your first Mains answer, backed by daily current affairs, ten years of PYQs, and honest mock tests.
                </motion.p>
              </div>

              {/* Video (original position + size) + first-step box */}
              <div className="col-span-12 lg:col-span-7 mt-5">
                <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: .8, delay: .3 }}
                  className="card overflow-hidden relative h-full"
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

              <div className="col-span-12 lg:col-span-5 mt-5 flex flex-col">
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: .5, delay: .35 }}
                  className="h-full"
                >
                  <HeroFirstStepCard compact />
                </motion.div>
              </div>

              <div className="col-span-12 mt-4">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <HeroGlowFeatureRow />
                </motion.div>
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
      </div>
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