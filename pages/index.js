import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, BookOpen, Newspaper, ChevronDown, Compass,
  PenLine, Target, Award,
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

        <div className="landing-below">
          {/* ─────────── ROADMAP ─────────── */}
          <section id="roadmap" className="landing-roadmap" data-testid="roadmap-section">
            <div className="landing-roadmap__inner">
              <header className="landing-roadmap__head">
                <div className="landing-roadmap__eyebrow">The zero-to-hero roadmap</div>
                <h2 className="landing-roadmap__title">
                  Six stages, in the order they <em>actually matter</em>.
                </h2>
                <p className="landing-roadmap__sub">
                  From understanding the exam to your first Mains answer — one clear sequence, no syllabus dump on day one.
                </p>
              </header>

              <div className="landing-roadmap__grid">
                {ROADMAP.map((stg, i) => (
                  <motion.article
                    key={stg.stage}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.4, delay: i * 0.04 }}
                    className="landing-roadmap__card"
                    data-testid={`roadmap-stage-${stg.stage}`}
                  >
                    <div className="landing-roadmap__card-top">
                      <span className="landing-roadmap__stage">{stg.stage}</span>
                      <span className="landing-roadmap__phase">{stg.phase}</span>
                    </div>
                    <div className="landing-roadmap__icon">
                      <stg.icon size={18} strokeWidth={1.6} />
                    </div>
                    <h3 className="landing-roadmap__card-title">{stg.title}</h3>
                    <p className="landing-roadmap__card-body">{stg.body}</p>
                  </motion.article>
                ))}
              </div>

              <div className="landing-roadmap__cta">
                <Link href="/register" className="btn btn-primary" data-testid="roadmap-cta">
                  Start at stage 00, free <ArrowRight size={15} strokeWidth={2} />
                </Link>
              </div>
            </div>
          </section>

          {/* ─────────── EXAMS (compact) ─────────── */}
          <section id="exams" className="landing-exams" data-testid="exams-section">
            <div className="landing-exams__inner">
              <div className="landing-exams__label">Exams we cover</div>
              <div className="landing-exams__grid">
                {EXAMS.map((e) => (
                  <div
                    key={e.code}
                    className="landing-exams__pill"
                    data-testid={`exam-${e.code.replace(/\W/g, '')}`}
                  >
                    <span className="landing-exams__code">{e.code}</span>
                    <span className="landing-exams__name">{e.name}</span>
                    <span className="landing-exams__mode">{e.mode}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ─────────── FAQ ─────────── */}
          <section id="faq" className="landing-faq" data-testid="faq-section">
            <div className="landing-faq__inner">
              <div className="landing-faq__intro">
                <div className="landing-faq__eyebrow">Beginner questions</div>
                <h2 className="landing-faq__title">
                  Honest answers <em>before you start</em>.
                </h2>
                <p className="landing-faq__sub">
                  The questions every new aspirant asks — answered without coaching jargon.
                </p>
              </div>

              <div className="landing-faq__list">
                {FAQS.map((f, i) => {
                  const open = openFaq === i;
                  return (
                    <div
                      key={i}
                      className={`landing-faq__item${open ? ' is-open' : ''}`}
                      data-testid={`faq-item-${i}`}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaq(open ? -1 : i)}
                        className="landing-faq__trigger"
                        aria-expanded={open}
                      >
                        <span className="landing-faq__question">{f.q}</span>
                        <ChevronDown size={18} strokeWidth={1.5} className="landing-faq__chevron" />
                      </button>
                      <AnimatePresence initial={false}>
                        {open && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: [0.2, 0.7, 0.2, 1] }}
                            style={{ overflow: 'hidden' }}
                          >
                            <p className="landing-faq__answer">{f.a}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ─────────── FINAL CTA ─────────── */}
          <section className="landing-cta">
            <div className="landing-cta__mesh" aria-hidden />
            <div className="landing-cta__inner">
              <div className="landing-cta__eyebrow">Ready when you are</div>
              <h2 className="landing-cta__title">
                You don&apos;t need to know everything.
                <br />
                <em>You just need stage 00.</em>
              </h2>
              <p className="landing-cta__sub">
                Create a free account and start with the first step — no credit card, no syllabus overwhelm.
              </p>
              <div className="landing-cta__actions">
                <Link href="/register" className="landing-cta__btn-primary" data-testid="footer-cta-register">
                  Get started, it&apos;s free <ArrowRight size={15} />
                </Link>
                <Link href="/login" className="landing-cta__btn-ghost" data-testid="footer-cta-login">
                  I already have an account
                </Link>
              </div>
            </div>
          </section>
        </div>
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