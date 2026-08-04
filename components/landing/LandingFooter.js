import Link from 'next/link';
import { Coffee, Twitter, Instagram, Youtube, Linkedin } from 'lucide-react';

const COLUMNS = [
  { title: 'Platform', links: ['Current Affairs', 'PYQ Papers', 'Mock Tests', 'Study Notes', 'Planner'] },
  { title: 'Exams',    links: ['Civil Services', 'CAPF (AC)', 'CDS', 'IFoS', 'ESE'] },
  { title: 'Company',  links: ['About', 'Editorial team', 'Careers', 'Press', 'Contact'] },
  { title: 'Legal',    links: ['Terms of use', 'Privacy', 'Refunds', 'Cookies'] },
];

export default function LandingFooter() {
  return (
    <footer style={{ background: 'var(--color-ink)', color: 'var(--color-bg)' }} data-testid="landing-footer">
      <div className="max-w-[1240px] mx-auto px-6 md:px-10 pt-20 pb-10">
        <div className="grid grid-cols-12 gap-10">
          <div className="col-span-12 md:col-span-5">
            <div className="flex items-center gap-2.5">
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'var(--color-accent)', color: 'var(--color-bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Coffee size={18} strokeWidth={1.6} />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-serif text-[22px]">Notes Cafe</span>
                <span className="text-[10px] font-mono mt-0.5" style={{ color: '#8A9993', letterSpacing: '0.14em' }}>THE EDITORIAL UPSC PLATFORM</span>
              </div>
            </div>
            <p className="mt-6 text-[14px] leading-[1.7] max-w-[380px]" style={{ color: '#B7BFB8' }}>
              A quieter room to read, write, and remember. Notes Cafe is an independent editorial platform built for civil services aspirants across India.
            </p>
            <div className="mt-8 flex items-center gap-3">
              {[Twitter, Instagram, Youtube, Linkedin].map((Icon, i) => (
                <a key={i} href="#" aria-label="social"
                   className="w-10 h-10 rounded-full flex items-center justify-center"
                   style={{ border: '1px solid #2A3631', color: '#B7BFB8' }}>
                  <Icon size={15} strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>

          <div className="col-span-12 md:col-span-7 grid grid-cols-2 md:grid-cols-4 gap-8">
            {COLUMNS.map(col => (
              <div key={col.title}>
                <div className="text-[11px] font-mono mb-4" style={{ color: '#8A9993', letterSpacing: '0.16em' }}>
                  {col.title.toUpperCase()}
                </div>
                <ul className="flex flex-col gap-2.5">
                  {col.links.map(l => (
                    <li key={l}>
                      <a href="#" className="text-[13.5px]" style={{ color: '#D8DDD9' }}>{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
             style={{ borderTop: '1px solid #2A3631' }}>
          <div className="text-[12px]" style={{ color: '#8A9993' }}>
            © {new Date().getFullYear()} Notes Cafe Editorial Private Limited. Independently made in India.
          </div>
          <div className="text-[12px] font-mono" style={{ color: '#8A9993', letterSpacing: '0.14em' }}>
            ISSUE · 07 · WINTER 2026
          </div>
        </div>
      </div>
    </footer>
  );
}
