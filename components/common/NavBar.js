import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Menu, X, ChevronDown, FileText } from 'lucide-react';

const MAIN_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Courses', href: '/courses' },
  { label: 'Resources', href: '/resources', hasDropdown: true },
  { label: 'Current Affairs', href: '/current-affairs' },
  { label: 'Practice', href: '/practice' },
  { label: 'Contact', href: '/contact' },
];

const RESOURCES = [
  { label: 'Syllabus', href: '/resources/syllabus' },
  { label: 'Books', href: '/resources/books' },
  { label: 'PYQs', href: '/resources/pyqs' },
  { label: 'Maps', href: '/maps' },
  { label: 'UPSC Age Calculator', href: '/resources/age-calculator' },
  { label: 'UPSC Marks Calculator', href: '/resources/marks-calculator' },
  { label: 'UPSC Photo & Signature Image Resizer', href: '/resources/photo-resizer' },
  { label: '8th Pay Commission Calculator', href: '/resources/8th-pay-commission-calculator' },
  { label: 'UPSC Study Planner', href: '/resources/study-planner' },
  { label: 'Pomodoro Timer', href: '/resources/pomodoro-timer' },
  { label: 'Mains Answer Writing Booklet', href: '/resources/mains-answer-writing-booklet' },
];

export default function NavBar({ showOnLanding = false }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [mobileResourcesOpen, setMobileResourcesOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdown on outside click, and on Escape
  useEffect(() => {
    if (!resourcesOpen) return;
    const onClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setResourcesOpen(false);
      }
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setResourcesOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [resourcesOpen]);

  // Close dropdown on route change
  useEffect(() => {
    const handleRouteChange = () => setResourcesOpen(false);
    router.events.on('routeChangeStart', handleRouteChange);
    return () => router.events.off('routeChangeStart', handleRouteChange);
  }, [router.events]);

  // Don't render on landing unless explicitly requested
  if (router.pathname === '/' && !showOnLanding) return null;

  return (
    <>
      <nav
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 60,
          background: scrolled ? 'rgba(253,252,247,0.92)' : 'transparent',
          backdropFilter: scrolled ? 'saturate(140%) blur(10px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'saturate(140%) blur(10px)' : 'none',
          borderBottom: scrolled ? '1px solid var(--color-border)' : '1px solid transparent',
          transition: 'background .2s ease, border-color .2s ease, backdrop-filter .2s ease',
        }}
      >
        <div className="max-w-[1240px] mx-auto px-6 md:px-10 h-[64px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--color-primary)', color: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              P
            </div>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="font-serif text-[16px]">Notes Cafe</span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-7">
            {MAIN_LINKS.map(link => {
              const isActive = link.href === '/' ? router.pathname === '/' : router.pathname.startsWith(link.href);

              if (link.hasDropdown) {
                return (
                  <div key={link.href} className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setResourcesOpen(o => !o)}
                      className="text-[14px] font-medium flex items-center gap-1"
                      style={{ color: isActive || resourcesOpen ? 'var(--color-primary)' : 'var(--color-ink-muted)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                      aria-expanded={resourcesOpen}
                      aria-haspopup="true"
                    >
                      {link.label}
                      <ChevronDown
                        size={14}
                        strokeWidth={1.6}
                        style={{ transition: 'transform .15s ease', transform: resourcesOpen ? 'rotate(180deg)' : 'none' }}
                      />
                    </button>

                    {resourcesOpen && (
                      <div
                        className="absolute left-0 mt-3 w-72 card p-2"
                        style={{ maxHeight: '70vh', overflowY: 'auto', zIndex: 70 }}
                        data-testid="resources-dropdown"
                      >
                        {RESOURCES.map(r => (
                          <Link
                            key={r.href}
                            href={r.href}
                            onClick={() => setResourcesOpen(false)}
                            className="flex items-center gap-2.5 px-2 py-2 text-sm rounded-md"
                            style={{ color: 'var(--color-ink)' }}
                          >
                            <FileText size={16} strokeWidth={1.5} style={{ color: 'var(--color-ink-muted)', flexShrink: 0 }} />
                            <span>{r.label}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[14px] font-medium"
                  style={{ color: isActive ? 'var(--color-primary)' : 'var(--color-ink-muted)' }}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="text-[14px] font-medium" style={{ color: 'var(--color-ink)' }}>Login</Link>
            <Link href="/register" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: 13 }}>Sign Up</Link>
          </div>

          <button className="lg:hidden" onClick={() => setOpen(o => !o)} aria-label="Menu" style={{ background: 'transparent', border: 'none', color: 'var(--color-ink)' }}>
            {open ? <X size={20} strokeWidth={1.4} /> : <Menu size={20} strokeWidth={1.4} />}
          </button>
        </div>

        {/* Mobile drawer */}
        {open && (
          <div className="lg:hidden hairline-b" style={{ background: 'var(--color-bg)', maxHeight: 'calc(100vh - 64px)', overflowY: 'auto' }}>
            <div className="px-6 py-4 flex flex-col gap-1">
              {MAIN_LINKS.map(l => (
                <div key={l.href} className="flex flex-col">
                  {l.hasDropdown ? (
                    <button
                      onClick={() => setMobileResourcesOpen(o => !o)}
                      className="py-2 text-[15px] flex items-center justify-between w-full text-left"
                      style={{ color: 'var(--color-ink)', background: 'transparent', border: 'none' }}
                    >
                      {l.label}
                      <ChevronDown
                        size={16}
                        strokeWidth={1.6}
                        style={{ transition: 'transform .15s ease', transform: mobileResourcesOpen ? 'rotate(180deg)' : 'none' }}
                      />
                    </button>
                  ) : (
                    <Link href={l.href} onClick={() => setOpen(false)} className="py-2 text-[15px]" style={{ color: 'var(--color-ink)' }}>
                      {l.label}
                    </Link>
                  )}

                  {l.hasDropdown && l.label === 'Resources' && mobileResourcesOpen && (
                    <div className="pl-2 pb-2 flex flex-col">
                      {RESOURCES.map(r => (
                        <Link
                          key={r.href}
                          href={r.href}
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-2.5 py-1.5 text-sm"
                          style={{ color: 'var(--color-ink-muted)' }}
                        >
                          <FileText size={15} strokeWidth={1.5} style={{ flexShrink: 0 }} />
                          <span>{r.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div className="hairline-t my-2" />
              <Link href="/login" onClick={() => setOpen(false)} className="btn btn-ghost justify-center">Login</Link>
              <Link href="/register" onClick={() => setOpen(false)} className="btn btn-primary justify-center">Sign Up</Link>
            </div>
          </div>
        )}
      </nav>
      <div style={{ height: 64 }} />
    </>
  );
}