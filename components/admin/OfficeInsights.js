import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { ClipboardCheck, Crown, Download, Trophy, Users } from 'lucide-react';

function toDate(value) {
  if (!value) return null;
  if (typeof value.toDate === 'function') return value.toDate();
  if (value instanceof Date) return value;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDate(value) {
  const date = toDate(value);
  if (!date) return '—';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function personName(row) {
  return row.fullName || row.name || row.displayName || row.userName || row.userEmail || 'Student';
}

export default function OfficeInsights() {
  const [users, setUsers] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [pdfs, setPdfs] = useState([]);
  const [tests, setTests] = useState([]);

  useEffect(() => {
    const unsubs = [
      onSnapshot(collection(db, 'users'), (snap) => {
        setUsers(snap.docs.map((item) => ({ id: item.id, ...item.data() })));
      }, () => setUsers([])),
      onSnapshot(collection(db, 'mockAttempts'), (snap) => {
        setAttempts(snap.docs.map((item) => ({ id: item.id, ...item.data() })));
      }, () => setAttempts([])),
      onSnapshot(collection(db, 'pdfs'), (snap) => {
        setPdfs(snap.docs.map((item) => ({ id: item.id, ...item.data() })));
      }, () => setPdfs([])),
      onSnapshot(collection(db, 'mockTests'), (snap) => {
        setTests(snap.docs.map((item) => ({ id: item.id, ...item.data() })));
      }, () => setTests([])),
    ];
    return () => unsubs.forEach((unsub) => unsub());
  }, []);

  const insights = useMemo(() => {
    const uniqueTakers = new Set(attempts.map((item) => item.userId).filter(Boolean));
    const premium = users
      .filter((item) => item.isPremium)
      .sort((a, b) => (toDate(a.premiumAt || a.premiumAt)?.getTime() || 0) - (toDate(b.premiumAt || b.premiumAt)?.getTime() || 0));

    const toppers = [...attempts]
      .sort((a, b) => (Number(b.scorePct) || 0) - (Number(a.scorePct) || 0))
      .slice(0, 6);

    const popularTests = [...tests]
      .map((item) => ({
        ...item,
        count: Number(item.attemptCount || item.attemptCount || 0) || attempts.filter((attempt) => attempt.testId === item.id).length,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const topPdfs = [...pdfs]
      .map((item) => ({
        ...item,
        count: Number(item.downloadCount || item.downloadCount || item.downloads || 0),
        opens: Number(item.openCount || item.openCount || 0),
      }))
      .sort((a, b) => b.count - a.count || b.opens - a.opens)
      .slice(0, 6);

    return {
      uniqueTakers: uniqueTakers.size,
      totalAttempts: attempts.length,
      premiumCount: premium.length,
      firstPremium: premium.slice(0, 6),
      toppers,
      popularTests,
      topPdfs,
    };
  }, [users, attempts, pdfs, tests]);

  const downloadTotal = insights.topPdfs.reduce((sum, item) => sum + item.count, 0);

  return (
    <section className="mt-10">
      <div className="mb-5">
        <div className="eyebrow mb-1">Live classroom</div>
        <h2 className="hero-display text-[22px]" style={{ letterSpacing: '-0.025em' }}>
          Who is practising, who has Plus, what they open
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-[var(--color-ink-muted)]">
          These numbers fill in as students submit mocks and open notes. There is no payment gateway yet —
          grant Plus from Students. Publish the latest Firestore rules so this list can load.
        </p>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Students who sat a mock', value: insights.uniqueTakers, icon: Users },
          { label: 'Mock attempts', value: insights.totalAttempts, icon: ClipboardCheck },
          { label: 'Plus members', value: insights.premiumCount, icon: Crown },
          { label: 'PDF downloads', value: downloadTotal, icon: Download },
        ].map((item) => (
          <div key={item.label} className="card p-4">
            <item.icon size={16} className="text-[var(--color-ink-muted)]" />
            <div className="display-num mt-3 text-[26px] leading-none">{item.value}</div>
            <div className="mt-1.5 text-[12px] text-[var(--color-ink-muted)]">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <InsightCard
          title="First Plus members"
          href="/admin/users"
          empty="Nobody has Plus yet. Open Students and grant Plus on a profile."
          rows={insights.firstPremium.map((item, index) => ({
            kicker: `#${index + 1} · ${formatDate(item.premiumAt || item.premiumAt)}`,
            title: personName(item),
            meta: item.email || 'No email',
          }))}
        />
        <InsightCard
          title="Mock toppers"
          href="/admin/mock-tests"
          empty="No submitted mocks yet. Numbers appear after a student finishes a live test."
          rows={insights.toppers.map((item) => ({
            kicker: `${Math.round(item.scorePct || 0)}% · ${item.testTitle || 'Mock'}`,
            title: personName(item),
            meta: item.userEmail || item.userId,
          }))}
        />
        <InsightCard
          title="Busiest mock tests"
          href="/admin/mock-tests"
          empty="No attempts recorded on published tests yet."
          rows={insights.popularTests.filter((item) => item.count > 0).map((item) => ({
            kicker: `${item.count} attempt${item.count === 1 ? '' : 's'}`,
            title: item.title || item.name || 'Untitled test',
            meta: item.subject || item.examType || '',
          }))}
        />
        <InsightCard
          title="Most opened notes / PDFs"
          href="/admin/notes"
          empty="No PDF opens yet. Counts start when a student opens or downloads a note from the desk."
          rows={insights.topPdfs.filter((item) => item.count > 0 || item.opens > 0).map((item) => ({
            kicker: `${item.count} downloads · ${item.opens} opens`,
            title: item.title || item.name || 'Untitled PDF',
            meta: item.subjectName || item.subjectId || '',
          }))}
        />
      </div>
    </section>
  );
}

function InsightCard({ title, href, empty, rows }) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Trophy size={15} className="text-[var(--color-ink-muted)]" />
          {title}
        </div>
        <Link href={href} className="text-[12px] font-semibold text-[var(--color-primary)]">
          Open
        </Link>
      </div>
      {rows.length === 0 ? (
        <p className="px-5 py-8 text-sm text-[var(--color-ink-muted)]">{empty}</p>
      ) : (
        <ul className="divide-y divide-[var(--color-border)]">
          {rows.map((row) => (
            <li key={`${row.title}-${row.kicker}`} className="px-5 py-3">
              <div className="text-[11px] font-medium uppercase tracking-wide text-[var(--color-ink-faint)]">
                {row.kicker}
              </div>
              <div className="mt-0.5 truncate text-sm font-semibold text-[var(--color-ink)]">{row.title}</div>
              {row.meta ? <div className="truncate text-[12px] text-[var(--color-ink-muted)]">{row.meta}</div> : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
