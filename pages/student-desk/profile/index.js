import { useState } from 'react';
import StudentLayout from '@/layouts/StudentLayout';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  Mail, Phone, MapPin, GraduationCap, Calendar as CalIcon, Award, Flame,
  BookOpen, ClipboardCheck, Settings, Bell, ChevronRight, Coffee
} from 'lucide-react';

// Deterministic 60-cell activity heatmap (0-3 intensity) — no Math.random to avoid SSR hydration mismatch
const HEATMAP = [
  1,2,0,3,0,3,1,0,1,0,2,2,
  0,1,1,2,2,0,2,2,3,0,2,3,
  1,0,0,1,3,2,1,0,0,3,2,1,
  0,3,3,2,0,3,2,0,1,0,3,0,
  0,3,0,3,3,3,1,0,2,1,0,2,
];

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('overview');

  const u = user || {};
  const name = u.fullName || 'Priya Sharma';
  const email = u.email || 'aspirant@notescafe.in';
  const examLabel = {
    UPSC_CSE_PRELIMS:'UPSC CSE — Prelims',
    UPSC_CSE_MAINS:  'UPSC CSE — Mains',
    UPSC_CAPF:       'UPSC CAPF',
    UPSC_CDS:        'UPSC CDS',
    UPSC_IFOS:       'UPSC IFoS',
    UPSC_ESE:        'UPSC ESE',
  }[u.examType] || 'UPSC CSE — Prelims';
  const initials = name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();

  return (
    <StudentLayout title="Profile" subtitle="Your desk, your preferences.">
      {/* Hero */}
      <div className="card overflow-hidden" data-testid="profile-hero">
        <div className="relative" style={{ background: 'var(--color-ink)', height: 160 }}>
          <div style={{
            position: 'absolute', top: '-20%', right: '-10%', width: 320, height: 320,
            borderRadius: '50%', background: 'radial-gradient(circle, rgba(178,90,61,0.20), transparent 65%)',
            filter: 'blur(10px)', pointerEvents: 'none'
          }} />
        </div>
        <div className="px-6 md:px-8 pb-6 md:pb-8 -mt-14 flex flex-col md:flex-row md:items-end gap-6">
          <div style={{
            width: 108, height: 108, borderRadius: 22,
            background: 'var(--color-primary)', color: 'var(--color-bg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: 44,
            border: '5px solid var(--color-bg)',
            boxShadow: '0 20px 40px -18px rgba(15,22,19,0.2)'
          }} data-testid="profile-avatar">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="chip chip-primary mb-2">Free tier</div>
            <div className="font-serif" style={{ fontSize: 34, letterSpacing: '-0.02em', fontWeight: 500 }}>{name}</div>
            <div className="mt-1 text-[13.5px] flex flex-wrap items-center gap-3" style={{ color: 'var(--color-ink-muted)' }}>
              <span className="flex items-center gap-1.5"><Mail size={13} strokeWidth={1.5} /> {email}</span>
              {u.phoneNumber && <span className="flex items-center gap-1.5"><Phone size={13} strokeWidth={1.5} /> {u.phoneNumber}</span>}
              {u.city && <span className="flex items-center gap-1.5"><MapPin size={13} strokeWidth={1.5} /> {u.city}</span>}
              <span className="flex items-center gap-1.5"><GraduationCap size={13} strokeWidth={1.5} /> {examLabel} · {u.targetYear || '2026'}</span>
            </div>
          </div>
          <div className="flex gap-2 md:ml-auto md:mb-1">
            <button className="btn btn-ghost" style={{ padding: '0.55rem 1rem', fontSize: 12.5 }} data-testid="profile-settings">
              <Settings size={14} strokeWidth={1.6} /> Settings
            </button>
            <button className="btn btn-primary" data-testid="profile-edit">Edit profile</button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex items-center gap-2" data-testid="profile-tabs">
        {['overview', 'achievements', 'subscription', 'preferences'].map(t => (
          <button key={t} onClick={() => setTab(t)}
                  className="px-4 py-2 rounded-full text-[13px]"
                  data-testid={`tab-${t}`}
                  style={{
                    border: `1px solid ${tab === t ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    background: tab === t ? 'var(--color-primary)' : 'var(--color-surface)',
                    color: tab === t ? 'var(--color-bg)' : 'var(--color-ink)',
                    fontWeight: 600, textTransform: 'capitalize',
                    transition: 'background-color .15s, color .15s, border-color .15s'
                  }}>{t}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Notes written"    value="42" icon={BookOpen} tone="primary" />
            <StatCard label="Mocks attempted"  value="18" icon={ClipboardCheck} tone="accent" />
            <StatCard label="Study streak"     value="27" unit="days" icon={Flame} tone="gold" />
            <StatCard label="Rank in cohort"   value="#124" icon={Award} tone="ink" />
          </div>

          <div className="mt-6 grid grid-cols-12 gap-4 md:gap-6">
            <div className="col-span-12 lg:col-span-12 card p-6 md:p-8">
              <div className="eyebrow mb-2">Activity</div>
              <div className="font-serif text-[20px]" style={{ letterSpacing: '-0.01em' }}>Your prep this month</div>
              <div className="mt-6 grid grid-cols-6 md:grid-cols-12 gap-1.5">
                {HEATMAP.map((level, i) => {
                  const bg = ['var(--color-surface-alt)', 'rgba(27,59,43,0.25)', 'rgba(27,59,43,0.6)', 'var(--color-primary)'][level];
                  return <div key={i} style={{ aspectRatio: '1', borderRadius: 5, background: bg }} />;
                })}
              </div>
              <div className="mt-4 flex items-center gap-3 text-[11.5px] font-mono" style={{ color: 'var(--color-ink-muted)' }}>
                <span>Less</span>
                {[0,1,2,3].map(l => <span key={l} style={{ width: 12, height: 12, borderRadius: 3, background: ['var(--color-surface-alt)', 'rgba(27,59,43,0.25)', 'rgba(27,59,43,0.6)', 'var(--color-primary)'][l] }} />)}
                <span>More</span>
              </div>
            </div>
          </div>
        </>
      )}

      {tab === 'achievements' && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { t:'First Note', s:'Wrote your first study note', icon:BookOpen, unlocked:true },
            { t:'Consistent 7', s:'7-day study streak', icon:Flame, unlocked:true },
            { t:'Mock Master', s:'Attempted 10 mocks', unlocked:true, icon:ClipboardCheck },
            { t:'Editor', s:'Read 30 morning briefs', unlocked:true, icon:Coffee },
            { t:'Consistent 30', s:'30-day study streak', unlocked:false, icon:Flame },
            { t:'Ranker', s:'Score in top 10 of a cohort mock', unlocked:false, icon:Award },
            { t:'Full Coverage', s:'Complete an entire syllabus paper', unlocked:false, icon:GraduationCap },
            { t:'Century', s:'Write 100 notes', unlocked:false, icon:BookOpen },
          ].map((a, i) => (
            <div key={i} className="card card-hover p-5" data-testid={`ach-${i}`}
                 style={{ opacity: a.unlocked ? 1 : 0.55 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 12,
                background: a.unlocked ? 'var(--color-primary-tint)' : 'var(--color-surface-alt)',
                color: a.unlocked ? 'var(--color-primary)' : 'var(--color-ink-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12
              }}>
                <a.icon size={18} strokeWidth={1.5} />
              </div>
              <div className="font-serif text-[16px]">{a.t}</div>
              <div className="text-[12.5px] mt-1" style={{ color: 'var(--color-ink-muted)' }}>{a.s}</div>
              <div className="mt-3 text-[10.5px] font-mono" style={{ color: a.unlocked ? 'var(--color-primary)' : 'var(--color-ink-faint)', letterSpacing: '0.14em' }}>
                {a.unlocked ? 'UNLOCKED' : 'LOCKED'}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'subscription' && (
        <div className="mt-6 card p-6 md:p-8">
          <div className="chip">Current plan</div>
          <div className="font-serif text-[26px] mt-4">Free forever</div>
          <p className="mt-2 text-[13.5px]" style={{ color: 'var(--color-ink-muted)' }}>
            You&apos;re on the free tier. Paid plans will be introduced later.
          </p>
          <ul className="mt-5 text-[13.5px] flex flex-col gap-2.5">
            <li>✓ Daily current affairs</li>
            <li>✓ Free notes library</li>
            <li>✓ Basic planner</li>
          </ul>
        </div>
      )}

      {tab === 'preferences' && (
        <div className="mt-6 card p-6 md:p-8" data-testid="prefs">
          <div className="eyebrow mb-3">Notifications</div>
          {[
            { t:'Daily morning brief email', d:'Get the brief in your inbox at 7:15 AM IST', on:true },
            { t:'Mock reminder push',        d:'Weekly reminders to attempt your next mock', on:true },
            { t:'Streak nudges',              d:'A gentle nudge if you miss a day (never spam)', on:false },
            { t:'Editorial newsletter',       d:'A monthly long-read on prep strategy', on:true },
          ].map((p, i) => (
            <div key={i} className="py-4 flex items-start justify-between"
                 style={{ borderTop: i > 0 ? '1px solid var(--color-border)' : 'none' }}>
              <div>
                <div className="text-[14px] font-medium">{p.t}</div>
                <div className="text-[12.5px] mt-0.5" style={{ color: 'var(--color-ink-muted)' }}>{p.d}</div>
              </div>
              <Toggle initial={p.on} />
            </div>
          ))}
        </div>
      )}
    </StudentLayout>
  );
}

function StatCard({ label, value, unit, icon: Icon, tone }) {
  const color = tone === 'accent' ? 'var(--color-accent)' :
                tone === 'gold'   ? 'var(--color-gold)' :
                tone === 'ink'    ? 'var(--color-ink-muted)' :
                'var(--color-primary)';
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="eyebrow">{label}</span>
        <Icon size={16} strokeWidth={1.5} style={{ color }} />
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="display-num text-[38px]" style={{ color: 'var(--color-ink)' }}>{value}</span>
        {unit && <span className="text-[13px]" style={{ color: 'var(--color-ink-muted)' }}>{unit}</span>}
      </div>
    </div>
  );
}

function Toggle({ initial }) {
  const [on, setOn] = useState(initial);
  return (
    <button onClick={() => setOn(o => !o)} aria-pressed={on}
            style={{
              width: 42, height: 24, borderRadius: 999,
              background: on ? 'var(--color-primary)' : 'var(--color-border-strong)',
              border: 'none', cursor: 'pointer', position: 'relative',
              transition: 'background .18s ease',
            }}>
      <span style={{
        position: 'absolute', top: 3, left: on ? 21 : 3,
        width: 18, height: 18, borderRadius: 999, background: '#fff',
        transition: 'left .18s ease',
        boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
      }} />
    </button>
  );
}
