import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  ClipboardCheck,
  FileText,
  Layers,
  MessageCircle,
  Newspaper,
  Play,
  Target,
  Users,
} from 'lucide-react';

const HERO_STAGES = [
  { num: '01', label: 'Foundation', sub: 'Build your base', icon: Layers },
  { num: '02', label: 'Prelims Prep', sub: 'Master the basics', icon: BookOpen },
  { num: '03', label: 'Prelims Practice', sub: 'PYQs & Tests', icon: Target },
  { num: '04', label: 'Mains Prep', sub: 'Answer writing', icon: FileText },
  { num: '05', label: 'Mains Practice', sub: 'Mocks & Improvement', icon: BarChart3 },
  { num: '06', label: 'Interview Ready', sub: 'Personality & Confidence', icon: MessageCircle },
];

const HERO_STATS = [
  { icon: Layers, value: '6 Stages', label: 'Zero to Mains' },
  { icon: BookOpen, value: 'Syllabus-led', label: 'Structured path' },
  { icon: Newspaper, value: 'Daily CA', label: 'Public desk' },
  { icon: ClipboardCheck, value: 'Student desk', label: 'Mocks & PYQs' },
];

const GLOW_FEATURES = [
  {
    title: 'Daily Current Affairs',
    sub: 'Updated every day',
    icon: Newspaper,
    tone: 'blue',
    href: '/current-affairs',
  },
  {
    title: 'PYQ Papers',
    sub: 'Sign in to download',
    icon: FileText,
    tone: 'green',
    href: '/login',
  },
  {
    title: 'Mock Tests',
    sub: 'Sign in to practice',
    icon: BarChart3,
    tone: 'orange',
    href: '/login',
  },
  {
    title: 'Free student account',
    sub: 'Notes, planner & more',
    icon: Users,
    tone: 'pink',
    href: '/register',
  },
];

export function HeroRoadmapPanel() {
  return (
    <div className="hero-roadmap-panel" data-testid="hero-roadmap-panel">
      <div className="hero-roadmap-panel__head">
        <div>
          <div className="hero-roadmap-panel__title">Your zero-to-hero roadmap ✨</div>
          <p className="hero-roadmap-panel__sub">
            A clear six-stage path to guide you from day one to success.
          </p>
        </div>
        <Link href="#roadmap" className="hero-roadmap-preview">
          <Play size={12} fill="currentColor" />
          Preview full roadmap
        </Link>
      </div>

      <div className="hero-roadmap-visual">
        <svg className="hero-roadmap-path" viewBox="0 0 720 160" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="heroRoadmapGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7c5cfc" />
              <stop offset="50%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#7c5cfc" />
            </linearGradient>
          </defs>
          <path
            d="M 40 110 C 120 40, 160 40, 240 95 S 360 130, 440 55 S 560 25, 680 85"
            stroke="url(#heroRoadmapGradient)"
            strokeWidth="3"
            fill="none"
          />
        </svg>

        <div className="hero-roadmap-nodes">
          {HERO_STAGES.map((stage) => (
            <div key={stage.num} className="hero-roadmap-node">
              <div className="hero-roadmap-node__circle">{stage.num}</div>
              <div className="hero-roadmap-node__icon">
                <stage.icon size={14} strokeWidth={1.75} />
              </div>
              <div className="hero-roadmap-node__label">{stage.label}</div>
              <div className="hero-roadmap-node__sub">{stage.sub}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="hero-roadmap-stats">
        {HERO_STATS.map((stat) => (
          <div key={stat.value} className="hero-roadmap-stat">
            <div className="hero-roadmap-stat__icon">
              <stat.icon size={14} strokeWidth={1.75} />
            </div>
            <div>
              <div className="hero-roadmap-stat__value">{stat.value}</div>
              <div className="hero-roadmap-stat__label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HeroFirstStepCard({ compact = false }) {
  return (
    <div
      className={`hero-first-step${compact ? ' hero-first-step--compact' : ''}`}
      data-testid="hero-first-step-card"
    >
      <div className="hero-first-step__badge">
        <span className="hero-first-step__badge-num">01</span>
        <span className="hero-first-step__badge-text">YOUR VERY FIRST STEP</span>
      </div>

      <h2 className="hero-first-step__title">
        Six stages, zero to Mains — see exactly where to begin.
      </h2>
      <p className="hero-first-step__sub">
        No more confusion. Just a proven path thousands of aspirants trust.
      </p>

      <div className="hero-first-step__actions">
        <Link href="#roadmap" className="btn btn-primary justify-center" data-testid="hero-cta-roadmap">
          See the zero-to-hero roadmap <ArrowRight size={16} strokeWidth={2} />
        </Link>
        <Link href="/register" className="btn btn-ghost justify-center" data-testid="hero-cta-signup">
          Get started, it&apos;s free <ArrowUpRight size={15} strokeWidth={1.75} />
        </Link>
      </div>

      <div className="hero-first-step__social">
        <div className="hero-first-step__avatars" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <p className="hero-first-step__social-text">
          Create a free account to unlock mocks, PYQs, and your study desk.
        </p>
      </div>
    </div>
  );
}

export function HeroGlowFeatureRow() {
  return (
    <div className="hero-glow-row" data-testid="hero-glow-features">
      {GLOW_FEATURES.map((item) => (
        <Link key={item.title} href={item.href} className="hero-glow-item">
          <div className={`hero-glow-item__icon hero-glow-item__icon--${item.tone}`}>
            <item.icon size={18} strokeWidth={1.75} />
          </div>
          <div>
            <div className="hero-glow-item__title">{item.title}</div>
            <div className="hero-glow-item__sub">{item.sub}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}
