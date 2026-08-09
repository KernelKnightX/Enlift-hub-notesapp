import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, BookOpen, Compass, Map, Landmark, CalendarDays, Sparkles, ChevronRight } from 'lucide-react';

export function SectionHeader({ eyebrow, title, description, action, align = 'left' }) {
  return (
    <div className={`max-w-3xl ${align === 'center' ? 'mx-auto text-center' : ''}`}>
      {eyebrow && (
        <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ borderColor: 'var(--color-border)', background: 'var(--color-primary-tint)', color: 'var(--color-primary)' }}>
          <Sparkles size={13} strokeWidth={1.8} />
          {eyebrow}
        </div>
      )}
      {title && <h2 className="mt-4 font-serif text-[28px] md:text-[34px] leading-[1.06]" style={{ letterSpacing: '-0.02em' }}>{title}</h2>}
      {description && <p className="mt-3 text-[15px] leading-[1.75]" style={{ color: 'var(--color-ink-muted)' }}>{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ResourceCard({ icon: Icon, title, description, href, meta, tags = [], ctaLabel = 'Open', accent = 'primary' }) {
  const accentClass = accent === 'accent' ? 'chip-accent' : accent === 'gold' ? 'chip-gold' : 'chip-primary';

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.35 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="card card-hover p-6 md:p-7 h-full flex flex-col"
    >
      <div className="flex items-center justify-between">
        <div className="rounded-2xl p-3" style={{ background: accent === 'accent' ? 'var(--color-accent-tint)' : 'var(--color-primary-tint)', color: accent === 'accent' ? 'var(--color-accent)' : 'var(--color-primary)' }}>
          {Icon ? <Icon size={18} strokeWidth={1.8} /> : <BookOpen size={18} strokeWidth={1.8} />}
        </div>
        {meta && <span className={`chip ${accentClass}`}>{meta}</span>}
      </div>

      <h3 className="mt-5 font-serif text-[22px] leading-[1.16]">{title}</h3>
      <p className="mt-3 text-[14px] leading-[1.7] flex-1" style={{ color: 'var(--color-ink-muted)' }}>{description}</p>

      {tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag} className="chip chip-ink" style={{ fontSize: 10, padding: '4px 8px' }}>{tag}</span>
          ))}
        </div>
      )}

      <Link href={href} className="mt-6 inline-flex items-center gap-2 font-medium text-[14px]" style={{ color: 'var(--color-primary)' }}>
        {ctaLabel} <ArrowRight size={14} strokeWidth={1.9} />
      </Link>
    </motion.article>
  );
}

export function FeatureCard({ icon: Icon, title, body, badge }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.3 }}
      className="card p-6 h-full"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="rounded-2xl p-3" style={{ background: 'var(--color-surface-alt)', color: 'var(--color-primary)' }}>
          {Icon ? <Icon size={18} strokeWidth={1.8} /> : <Sparkles size={18} strokeWidth={1.8} />}
        </div>
        {badge && <span className="chip chip-primary">{badge}</span>}
      </div>
      <h3 className="mt-5 font-serif text-[20px] leading-[1.16]">{title}</h3>
      <p className="mt-2 text-[14px] leading-[1.7]" style={{ color: 'var(--color-ink-muted)' }}>{body}</p>
    </motion.div>
  );
}

export function CategoryGrid({ items }) {
  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
      {items.map((item) => {
        const Icon = item.icon || Compass;
        return (
          <motion.div key={item.title} whileHover={{ y: -4, scale: 1.01 }} className="card p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl p-2.5" style={{ background: 'var(--color-primary-tint)', color: 'var(--color-primary)' }}>
                <Icon size={17} strokeWidth={1.8} />
              </div>
              <div>
                <div className="font-semibold text-[15px]">{item.title}</div>
                <div className="text-[12px] mt-1" style={{ color: 'var(--color-ink-muted)' }}>{item.subtitle}</div>
              </div>
            </div>
            <p className="mt-4 text-[14px] leading-[1.7]" style={{ color: 'var(--color-ink-muted)' }}>{item.description}</p>
            <Link href={item.href} className="mt-5 inline-flex items-center gap-2 text-[13px] font-semibold" style={{ color: 'var(--color-primary)' }}>
              Explore <ArrowRight size={13} strokeWidth={1.9} />
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}

export function PublicHero({ eyebrow, title, description, primaryCta, secondaryCta, stats = [] }) {
  return (
    <section className="relative overflow-hidden rounded-[32px] border" style={{ background: 'linear-gradient(135deg, #fff 0%, var(--color-surface-alt) 100%)', borderColor: 'var(--color-border)' }}>
      <div className="absolute inset-0 opacity-60" style={{ background: 'radial-gradient(circle at top left, rgba(79,70,229,0.16), transparent 38%), radial-gradient(circle at bottom right, rgba(249,112,102,0.16), transparent 32%)' }} />
      <div className="relative grid lg:grid-cols-[1.1fr_0.9fr] gap-8 p-8 md:p-10 lg:p-12">
        <div>
          {eyebrow && <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-primary)' }}><Sparkles size={13} strokeWidth={1.8} />{eyebrow}</div>}
          <h1 className="mt-5 font-serif text-[34px] md:text-[46px] leading-[1.04]" style={{ letterSpacing: '-0.03em' }}>{title}</h1>
          <p className="mt-4 text-[16px] leading-[1.75] max-w-[680px]" style={{ color: 'var(--color-ink-muted)' }}>{description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            {primaryCta && <Link href={primaryCta.href} className="btn btn-primary">{primaryCta.label}</Link>}
            {secondaryCta && <Link href={secondaryCta.href} className="btn btn-ghost">{secondaryCta.label}</Link>}
          </div>
          {stats.length > 0 && <div className="mt-8 grid sm:grid-cols-3 gap-3">{stats.map((stat) => <div key={stat.label} className="rounded-2xl border p-4" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}><div className="font-semibold text-[20px]" style={{ color: 'var(--color-primary)' }}>{stat.value}</div><div className="mt-1 text-[12px]" style={{ color: 'var(--color-ink-muted)' }}>{stat.label}</div></div>)}</div>}
        </div>
        <div className="rounded-[24px] border p-6" style={{ background: 'rgba(255,255,255,0.8)', borderColor: 'var(--color-border)' }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="eyebrow">Premium experience</div>
              <div className="mt-2 font-serif text-[24px] leading-[1.08]">Designed to feel calm, high-signal, and useful.</div>
            </div>
            <div className="rounded-2xl p-3" style={{ background: 'var(--color-primary-tint)', color: 'var(--color-primary)' }}><Compass size={18} strokeWidth={1.8} /></div>
          </div>
          <div className="mt-6 grid gap-3">
            {['Structured sections', 'Thoughtful navigation', 'Clean CTAs'].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl border px-4 py-3" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
                <div className="rounded-full p-1.5" style={{ background: 'var(--color-primary-tint)', color: 'var(--color-primary)' }}><Sparkles size={12} strokeWidth={1.8} /></div>
                <span className="text-[14px]">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function MegaMenu({ title, description, items, related }) {
  return (
    <div className="absolute left-0 mt-3 w-[720px] rounded-[24px] border p-4 shadow-[0_20px_60px_-24px_rgba(15,15,20,0.22)]" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', zIndex: 70 }}>
      <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-4">
        <div className="rounded-[20px] border p-5" style={{ background: 'var(--color-surface-alt)', borderColor: 'var(--color-border)' }}>
          <div className="eyebrow">{title}</div>
          <h3 className="mt-3 font-serif text-[24px] leading-[1.1]">{description}</h3>
          <div className="mt-4 space-y-2">
            {related?.map((item) => (
              <Link key={item.label} href={item.href} className="flex items-center justify-between rounded-2xl border px-3 py-2 text-[13px]" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
                <span>{item.label}</span>
                <ArrowUpRight size={13} strokeWidth={1.8} style={{ color: 'var(--color-primary)' }} />
              </Link>
            ))}
          </div>
        </div>
        <div className="grid gap-2">
          {items?.map((item) => {
            const Icon = item.icon || BookOpen;
            return (
              <Link key={item.href} href={item.href} className="group rounded-[16px] border p-3 text-left transition-all hover:-translate-y-0.5" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl p-2" style={{ background: 'var(--color-primary-tint)', color: 'var(--color-primary)' }}><Icon size={15} strokeWidth={1.8} /></div>
                  <div className="min-w-0">
                    <div className="font-semibold text-[14px]">{item.label}</div>
                    <div className="mt-1 text-[12px] leading-[1.5]" style={{ color: 'var(--color-ink-muted)' }}>{item.description}</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function PageBanner({ eyebrow, title, description, breadcrumbs = [] }) {
  return (
    <section className="rounded-[28px] border p-7 md:p-8" style={{ background: 'linear-gradient(135deg, var(--color-surface) 0%, var(--color-surface-alt) 100%)', borderColor: 'var(--color-border)' }}>
      <div className="flex flex-wrap items-center gap-2 text-[13px]" style={{ color: 'var(--color-ink-muted)' }}>
        <Link href="/" className="hover:text-[var(--color-primary)]">Home</Link>
        {breadcrumbs.map((crumb, index) => (
          <span key={crumb.label} className="flex items-center gap-2">
            <ChevronRight size={13} strokeWidth={1.6} />
            {crumb.href ? <Link href={crumb.href} className="hover:text-[var(--color-primary)]">{crumb.label}</Link> : <span style={{ color: 'var(--color-ink)' }}>{crumb.label}</span>}
          </span>
        ))}
      </div>
      <div className="mt-5 max-w-3xl">
        {eyebrow && <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-primary)' }}><Sparkles size={13} strokeWidth={1.8} />{eyebrow}</div>}
        <h1 className="mt-4 font-serif text-[30px] md:text-[38px] leading-[1.06]" style={{ letterSpacing: '-0.02em' }}>{title}</h1>
        {description && <p className="mt-3 text-[15px] leading-[1.75]" style={{ color: 'var(--color-ink-muted)' }}>{description}</p>}
      </div>
    </section>
  );
}

export function ResourceLayout({ children, title, description, eyebrow, breadcrumbs = [] }) {
  return (
    <main style={{ background: 'var(--color-bg)' }}>
      <section className="max-w-[1240px] mx-auto px-6 md:px-10 pt-12 md:pt-16 pb-8 md:pb-10">
        <PageBanner eyebrow={eyebrow} title={title} description={description} breadcrumbs={breadcrumbs} />
      </section>
      {children}
    </main>
  );
}
