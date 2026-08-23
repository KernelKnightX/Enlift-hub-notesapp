import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  Search,
  Users,
  Shield,
  Crown,
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  Calendar,
  X,
  Copy,
  Check,
  Flame,
  UserRound,
} from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';
import useAdminGate from '@/hooks/admin/useAdminGate';
import { db } from '@/firebase/config';

const EXAM_LABELS = {
  UPSC_CSE_PRELIMS: 'CSE Prelims',
  UPSC_CSE_MAINS: 'CSE Mains',
  UPSC_CAPF: 'CAPF',
  UPSC_CDS: 'CDS',
  UPSC_IFOS: 'IFoS',
  UPSC_ESE: 'ESE',
  OTHER: 'Other',
};

const AVATAR_TONES = [
  { bg: 'var(--cat-violet-t)', fg: 'var(--cat-violet)' },
  { bg: 'var(--cat-blue-t)', fg: 'var(--cat-blue)' },
  { bg: 'var(--cat-green-t)', fg: 'var(--cat-green)' },
  { bg: 'var(--cat-cyan-t)', fg: 'var(--cat-cyan)' },
  { bg: 'var(--cat-pink-t)', fg: 'var(--cat-pink)' },
  { bg: 'var(--cat-amber-t)', fg: '#B45309' },
  { bg: 'var(--cat-lime-t)', fg: 'var(--cat-lime)' },
  { bg: 'var(--color-accent-tint)', fg: 'var(--color-accent)' },
];

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

function displayName(user) {
  return user.fullName || user.name || user.displayName || 'Unnamed student';
}

function initials(user) {
  return displayName(user)
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function examLabel(user) {
  return EXAM_LABELS[user.examType] || user.examType || 'Not set';
}

function avatarTone(user) {
  const seed = String(user.id || displayName(user));
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash + seed.charCodeAt(i)) % AVATAR_TONES.length;
  return AVATAR_TONES[hash];
}

function LoadingScreen() {
  return (
    <div className="grid min-h-screen place-items-center bg-[var(--color-bg)]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-border-strong)] border-t-[var(--color-primary)]" />
    </div>
  );
}

function Avatar({ user, size = 44 }) {
  const tone = avatarTone(user);
  return (
    <div
      className="grid shrink-0 place-items-center rounded-2xl text-sm font-semibold"
      style={{
        width: size,
        height: size,
        background: tone.bg,
        color: tone.fg,
        fontSize: size > 56 ? 22 : 13,
      }}
    >
      {initials(user)}
    </div>
  );
}

function CopyField({ label, value }) {
  const [copied, setCopied] = useState(false);
  if (!value) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      toast.error('Could not copy.');
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="flex w-full items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-3 py-2 text-left transition hover:border-[var(--color-border-strong)]"
    >
      <div className="min-w-0">
        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-faint)]">{label}</div>
        <div className="truncate font-mono text-[12px] text-[var(--color-ink)]">{value}</div>
      </div>
      {copied ? <Check size={14} className="text-[var(--cat-green)]" /> : <Copy size={14} className="text-[var(--color-ink-muted)]" />}
    </button>
  );
}

function Fact({ icon: Icon, label, value, href }) {
  const content = (
    <div className="flex items-start gap-3 rounded-xl px-1 py-2">
      <div
        className="mt-0.5 grid h-8 w-8 place-items-center rounded-lg"
        style={{ background: 'var(--color-surface-alt)', color: 'var(--color-ink-muted)' }}
      >
        <Icon size={14} />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] font-medium text-[var(--color-ink-faint)]">{label}</div>
        <div className="truncate text-sm font-semibold text-[var(--color-ink)]">{value || '—'}</div>
      </div>
    </div>
  );
  if (!href || !value || value === '—') return content;
  return (
    <a href={href} className="block rounded-xl hover:bg-[var(--color-surface-alt)]">
      {content}
    </a>
  );
}

export default function UsersAdmin() {
  const { user, loading, isAdmin } = useAdminGate();
  const [mounted, setMounted] = useState(false);
  const [students, setStudents] = useState([]);
  const [listError, setListError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('students');
  const [selectedId, setSelectedId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isAdmin) return undefined;
    const unsubscribe = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const rows = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
        rows.sort((a, b) => (toDate(b.createdAt)?.getTime() || 0) - (toDate(a.createdAt)?.getTime() || 0));
        setStudents(rows);
        setListError('');
      },
      (error) => {
        console.error(error);
        setListError('Could not load students. Deploy the latest Firestore rules so admins can read the users collection.');
      },
    );
    return () => unsubscribe();
  }, [isAdmin]);

  const stats = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const studentRows = students.filter((item) => !item.isAdmin);
    return {
      total: students.length,
      students: studentRows.length,
      admins: students.filter((item) => item.isAdmin).length,
      premium: students.filter((item) => item.isPremium).length,
      newThisWeek: students.filter((item) => (toDate(item.createdAt)?.getTime() || 0) >= weekAgo).length,
    };
  }, [students]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return students.filter((item) => {
      if (roleFilter === 'students' && item.isAdmin) return false;
      if (roleFilter === 'admins' && !item.isAdmin) return false;
      if (roleFilter === 'premium' && !item.isPremium) return false;
      if (!query) return true;
      const haystack = [
        displayName(item),
        item.email,
        item.phoneNumber,
        item.city,
        item.examType,
        item.targetYear,
        item.id,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [students, search, roleFilter]);

  const selected = students.find((item) => item.id === selectedId) || null;

  const toggleAdmin = async (target) => {
    if (target.id === user?.uid) {
      toast.error('You cannot change your own admin role.');
      return;
    }
    const next = !target.isAdmin;
    const ok = window.confirm(
      next
        ? `Make ${displayName(target)} an admin? They will get the full office.`
        : `Remove admin access for ${displayName(target)}?`,
    );
    if (!ok) return;
    setUpdatingId(target.id);
    try {
      await updateDoc(doc(db, 'users', target.id), {
        isAdmin: next,
        updatedAt: serverTimestamp(),
        updatedBy: user.uid,
      });
      toast.success(next ? 'Admin access granted.' : 'Admin access removed.');
    } catch (error) {
      console.error(error);
      toast.error('Could not update this account. Check Firestore rules.');
    } finally {
      setUpdatingId(null);
    }
  };

  const togglePremium = async (target) => {
    const next = !target.isPremium;
    const ok = window.confirm(
      next
        ? `Grant Plus to ${displayName(target)}? They will unlock Plus mock tests.`
        : `Remove Plus from ${displayName(target)}?`,
    );
    if (!ok) return;
    setUpdatingId(target.id);
    try {
      await updateDoc(doc(db, 'users', target.id), {
        isPremium: next,
        premiumAt: next ? serverTimestamp() : null,
        updatedAt: serverTimestamp(),
        updatedBy: user.uid,
      });
      toast.success(next ? 'Plus granted.' : 'Plus removed.');
    } catch (error) {
      console.error(error);
      toast.error('Could not update Plus on this account.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (!mounted || loading) return <LoadingScreen />;
  if (!isAdmin) return <LoadingScreen />;

  const statCards = [
    { label: 'Registered', value: stats.total, icon: Users, bg: 'var(--cat-blue-t)', fg: 'var(--cat-blue)' },
    { label: 'Students', value: stats.students, icon: GraduationCap, bg: 'var(--cat-green-t)', fg: 'var(--cat-green)' },
    { label: 'Admins', value: stats.admins, icon: Shield, bg: 'var(--cat-violet-t)', fg: 'var(--cat-violet)' },
    { label: 'Plus members', value: stats.premium, icon: Crown, bg: 'var(--cat-amber-t)', fg: '#B45309' },
  ];

  return (
    <AdminLayout
      title="Students"
      subtitle="Live roster of every Firebase account. Open a profile to grant office access."
    >
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4 mb-6">
        {statCards.map((item) => (
          <div key={item.label} className="card p-4 md:p-5">
            <div
              className="mb-3 grid h-9 w-9 place-items-center rounded-[10px]"
              style={{ background: item.bg, color: item.fg }}
            >
              <item.icon size={16} strokeWidth={1.7} />
            </div>
            <div className="display-num text-[28px] leading-none text-[var(--color-ink)]">{item.value}</div>
            <div className="mt-1.5 text-[12px] text-[var(--color-ink-muted)]">{item.label}</div>
          </div>
        ))}
      </div>

      {listError ? (
        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {listError}
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="card overflow-hidden">
          <div className="border-b border-[var(--color-border)] bg-white p-4 md:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
              <label className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-faint)]" />
                <input
                  className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
                  placeholder="Search name, email, phone, city, UID…"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>
              <div className="flex rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-1">
                {[
                  { id: 'students', label: 'Students' },
                  { id: 'premium', label: 'Plus' },
                  { id: 'admins', label: 'Admins' },
                  { id: 'all', label: 'Everyone' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="rounded-xl px-3.5 py-1.5 text-[12.5px] font-semibold transition"
                    style={{
                      background: roleFilter === item.id ? '#0f172a' : 'transparent',
                      color: roleFilter === item.id ? '#fff' : 'var(--color-ink-muted)',
                    }}
                    onClick={() => setRoleFilter(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-3 text-[12px] text-[var(--color-ink-muted)]">
              Showing <span className="font-semibold text-[var(--color-ink)]">{filtered.length}</span> of {students.length} accounts
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="grid place-items-center px-6 py-16 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[var(--color-surface-alt)] text-[var(--color-ink-muted)]">
                <UserRound size={22} />
              </div>
              <p className="mt-4 max-w-sm text-sm text-[var(--color-ink-muted)]">
                {students.length === 0
                  ? 'No accounts in Firestore yet. New sign-ups on /register appear here automatically.'
                  : 'No accounts match this search. Try another name or switch the filter.'}
              </p>
            </div>
          ) : (
            <ul className="max-h-[70vh] divide-y divide-[var(--color-border)] overflow-y-auto">
              {filtered.map((item) => {
                const active = item.id === selectedId;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(item.id)}
                      className="flex w-full items-center gap-4 px-4 py-3.5 text-left transition md:px-5"
                      style={{
                        background: active ? 'linear-gradient(90deg, #EEF0FF 0%, #fff 55%)' : 'transparent',
                        boxShadow: active ? 'inset 3px 0 0 #4F46E5' : 'none',
                      }}
                    >
                      <Avatar user={item} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-[15px] font-semibold text-[var(--color-ink)]">
                            {displayName(item)}
                          </span>
                          <span className={`chip ${item.isAdmin ? 'chip-violet' : 'chip-green'}`}>
                            {item.isAdmin ? 'Admin' : 'Student'}
                          </span>
                          {item.isPremium ? <span className="chip chip-gold">Plus</span> : null}
                        </div>
                        <div className="mt-0.5 truncate text-[12.5px] text-[var(--color-ink-muted)]">
                          {item.email || 'No email'}
                          {item.city ? ` · ${item.city}` : ''}
                        </div>
                      </div>
                      <div className="hidden shrink-0 text-right sm:block">
                        <div className="text-[12.5px] font-medium text-[var(--color-ink)]">
                          {examLabel(item)}
                          {item.targetYear ? ` · ${item.targetYear}` : ''}
                        </div>
                        <div className="mt-0.5 text-[11.5px] text-[var(--color-ink-faint)]">
                          Joined {formatDate(item.createdAt)}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <aside className="card overflow-hidden xl:sticky xl:top-6 h-fit">
          {!selected ? (
            <div className="grid place-items-center px-6 py-16 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[var(--color-surface-alt)] text-[var(--color-ink-muted)]">
                <Users size={22} />
              </div>
              <p className="mt-4 text-sm text-[var(--color-ink-muted)]">Select a student to open their profile.</p>
            </div>
          ) : (
            <div>
              <div
                className="relative px-5 pb-6 pt-6"
                style={{ background: 'linear-gradient(160deg, #0f172a 0%, #2563eb 100%)' }}
              >
                <button
                  type="button"
                  className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white xl:hidden"
                  onClick={() => setSelectedId(null)}
                  aria-label="Close profile"
                >
                  <X size={15} />
                </button>
                <Avatar user={selected} size={64} />
                <h2 className="mt-4 text-xl font-semibold tracking-tight text-white">{displayName(selected)}</h2>
                <p className="mt-1 text-sm text-slate-200">{selected.email || 'No email on file'}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className={`chip ${selected.isAdmin ? 'chip-violet' : 'chip-green'}`}>
                    {selected.isAdmin ? 'Office admin' : 'Student'}
                  </span>
                  {selected.isPremium ? <span className="chip chip-gold">Plus</span> : null}
                  {selected.targetYear ? <span className="chip chip-cyan">Target {selected.targetYear}</span> : null}
                </div>
              </div>

              <div className="space-y-1 p-5">
                <Fact icon={GraduationCap} label="Exam" value={`${examLabel(selected)}${selected.targetYear ? ` · ${selected.targetYear}` : ''}`} />
                <Fact icon={Phone} label="Phone" value={selected.phoneNumber} href={selected.phoneNumber ? `tel:${selected.phoneNumber}` : undefined} />
                <Fact icon={MapPin} label="City" value={selected.city} />
                <Fact icon={Mail} label="Email" value={selected.email} href={selected.email ? `mailto:${selected.email}` : undefined} />
                <Fact icon={Calendar} label="Date of birth" value={formatDate(selected.dateOfBirth)} />
                <Fact icon={Calendar} label="Joined" value={formatDate(selected.createdAt)} />
                {selected.studyStreak || selected.bestStreak ? (
                  <Fact
                    icon={Flame}
                    label="Study streak"
                    value={`${selected.studyStreak || 0} current · ${selected.bestStreak || 0} best`}
                  />
                ) : null}

                <div className="space-y-2 pt-3">
                  <CopyField label="Firebase UID" value={selected.id} />
                </div>

                <button
                  type="button"
                  className="mt-5 w-full rounded-2xl px-4 py-3 text-sm font-semibold text-white transition disabled:opacity-50"
                  style={{ background: selected.isAdmin ? '#E11D48' : '#0f172a' }}
                  disabled={updatingId === selected.id || selected.id === user?.uid}
                  onClick={() => toggleAdmin(selected)}
                >
                  {updatingId === selected.id
                    ? 'Saving…'
                    : selected.id === user?.uid
                      ? 'This is you'
                      : selected.isAdmin
                        ? 'Remove admin access'
                        : 'Make office admin'}
                </button>
                <button
                  type="button"
                  className="mt-2 w-full rounded-2xl border border-[var(--color-border)] px-4 py-3 text-sm font-semibold transition disabled:opacity-50"
                  style={{ background: selected.isPremium ? '#fff' : '#F59E0B', color: selected.isPremium ? 'var(--color-ink)' : '#fff' }}
                  disabled={updatingId === selected.id}
                  onClick={() => togglePremium(selected)}
                >
                  {updatingId === selected.id
                    ? 'Saving…'
                    : selected.isPremium
                      ? 'Remove Plus'
                      : 'Grant Plus'}
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </AdminLayout>
  );
}
