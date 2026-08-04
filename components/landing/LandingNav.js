import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Menu, X, Coffee, ArrowUpRight } from 'lucide-react';

const LINKS = [
  { label: 'Today', href: '/#today' },
  { label: 'Features', href: '/#features' },
  { label: 'Exams', href: '/#exams' },
  { label: 'Pricing', href: '/#pricing' },
];

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <nav
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 60,
          background: scrolled ? 'rgba(253,252,247,0.82)' : 'transparent',
          backdropFilter: scrolled ? 'saturate(140%) blur(14px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'saturate(140%) blur(14px)' : 'none',
          borderBottom: scrolled ? '1px solid var(--color-border)' : '1px solid transparent',
          transition: 'background .25s ease, border-color .25s ease, backdrop-filter .25s ease',
        }}
        data-testid="landing-nav"
      >
        <div className="max-w-[1240px] mx-auto px-6 md:px-10 h-[68px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5" data-testid="nav-logo">
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'var(--color-primary)', color: 'var(--color-bg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Coffee size={17} strokeWidth={1.6} />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-serif text-[19px]" style={{ letterSpacing: '-0.02em' }}>Notes Cafe</span>
              <span className="text-[9.5px] font-mono mt-0.5" style={{ color: 'var(--color-ink-muted)', letterSpacing: '0.14em' }}>EST · 2026</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {LINKS.map(l => (
              <Link key={l.href} href={l.href}
                    className="text-[13.5px] font-medium"
                    style={{ color: 'var(--color-ink-muted)' }}
                    data-testid={`nav-link-${l.label.toLowerCase()}`}>
                {l.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="text-[13.5px] font-medium" style={{ color: 'var(--color-ink)' }} data-testid="nav-login">
              Sign in
            </Link>
            <Link href="/register" className="btn btn-primary" style={{ padding: '0.55rem 1.1rem', fontSize: 13 }} data-testid="nav-register">
              Get started <ArrowUpRight size={14} strokeWidth={2} />
            </Link>
          </div>

          <button
            className="md:hidden"
            onClick={() => setOpen(o => !o)}
            aria-label="Menu"
            data-testid="nav-mobile-toggle"
            style={{ background: 'transparent', border: 'none', color: 'var(--color-ink)' }}
          >
            {open ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
          </button>
        </div>

        {/* Mobile drawer */}
        {open && (
          <div className="md:hidden hairline-b" style={{ background: 'var(--color-bg)' }}>
            <div className="px-6 py-4 flex flex-col gap-3">
              {LINKS.map(l => (
                <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                      className="py-2 text-[15px]" style={{ color: 'var(--color-ink)' }}>{l.label}</Link>
              ))}
              <div className="hairline-t my-2" />
              <Link href="/login" onClick={() => setOpen(false)} className="btn btn-ghost justify-center">Sign in</Link>
              <Link href="/register" onClick={() => setOpen(false)} className="btn btn-primary justify-center">Get started</Link>
            </div>
          </div>
        )}
      </nav>
      <div style={{ height: 68 }} />
    </>
  );
}
