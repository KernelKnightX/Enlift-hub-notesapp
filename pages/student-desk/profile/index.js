import StudentLayout from '@/layouts/StudentLayout';
import { useAuth } from '@/contexts/AuthContext';
import useUserMetrics from '@/hooks/student/useUserMetrics';
import {
  BookOpen, ClipboardCheck, Flame,
  GraduationCap, Mail, MapPin, Sparkles, Target,
} from 'lucide-react';

const EXAM_LABELS = {
  UPSC_CSE_PRELIMS: 'UPSC CSE Prelims',
  UPSC_CSE_MAINS: 'UPSC CSE Mains',
  UPSC_CAPF: 'UPSC CAPF',
  UPSC_CDS: 'UPSC CDS',
  UPSC_IFOS: 'UPSC IFoS',
  UPSC_ESE: 'UPSC ESE',
};

const ACHIEVEMENTS = [
  { id: 'note', name: 'First Note', icon: BookOpen, check: (m) => m.notesCreated > 0 },
  { id: 'streak7', name: '7-Day Streak', icon: Flame, check: (m) => m.bestStreak >= 7 },
  { id: 'mock10', name: '10 Mocks', icon: ClipboardCheck, check: (m) => m.mocksAttempted >= 10 },
  { id: 'streak30', name: '30-Day Streak', icon: Flame, check: (m) => m.bestStreak >= 30 },
  { id: 'century', name: '100 Notes', icon: BookOpen, check: (m) => m.notesCreated >= 100 },
];

export default function ProfilePage() {
  const { user } = useAuth();
  const { metrics } = useUserMetrics();

  const u = user || {};
  const name = u.fullName || u.displayName || 'Student';
  const email = u.email || '';
  const examLabel = EXAM_LABELS[u.examType] || 'UPSC CSE Prelims';
  const targetYear = u.targetYear || '2026';
  const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || 'ST';

  const unlockedCount = ACHIEVEMENTS.filter((a) => a.check(metrics)).length;

  return (
    <StudentLayout title="Profile" plainHeader>
      <div className="profile-studio">
        <section className="profile-id" data-testid="profile-hero">
          <div className="profile-id__mesh" aria-hidden="true" />
          <div className="profile-id__inner">
            <div className="profile-id__avatar" data-testid="profile-avatar">{initials}</div>

            <div className="profile-id__info">
              <span className={`profile-id__badge ${u.isPremium ? 'profile-id__badge--plus' : ''}`}>
                {u.isPremium ? <><Sparkles size={11} /> Plus member</> : 'Free tier'}
              </span>
              <h1 className="profile-id__name">{name}</h1>
              <div className="profile-id__meta">
                {email && <span><Mail size={13} /> {email}</span>}
                {u.city && <span><MapPin size={13} /> {u.city}</span>}
                <span><GraduationCap size={13} /> {examLabel}</span>
              </div>
            </div>
          </div>
        </section>

        <div className="profile-bento">
          <div className="profile-tile profile-tile--streak">
            <div className="profile-tile__icon"><Flame size={18} /></div>
            <div>
              <div className="profile-tile__label">Streak</div>
              <div className="profile-tile__value">{metrics.studyStreak}</div>
              <div className="profile-tile__sub">Best {metrics.bestStreak} days</div>
            </div>
          </div>
          <div className="profile-tile profile-tile--notes">
            <div className="profile-tile__icon"><BookOpen size={18} /></div>
            <div>
              <div className="profile-tile__label">Notes</div>
              <div className="profile-tile__value">{metrics.notesCreated}</div>
              <div className="profile-tile__sub">{metrics.notesThisWeek} this week</div>
            </div>
          </div>
          <div className="profile-tile profile-tile--mocks">
            <div className="profile-tile__icon"><ClipboardCheck size={18} /></div>
            <div>
              <div className="profile-tile__label">Mocks</div>
              <div className="profile-tile__value">{metrics.mocksAttempted}</div>
              <div className="profile-tile__sub">
                {metrics.mockAvgScore > 0 ? `${Math.round(metrics.mockAvgScore)}% avg` : 'Start one today'}
              </div>
            </div>
          </div>
          <div className="profile-tile profile-tile--goal">
            <div className="profile-tile__icon"><Target size={18} /></div>
            <div>
              <div className="profile-tile__label">Target</div>
              <div className="profile-tile__value">{targetYear}</div>
              <div className="profile-tile__sub">{examLabel.split('—')[0].trim()}</div>
            </div>
          </div>
        </div>

        <div className="profile-main">
          <section className="profile-card">
            <div className="profile-card__head">
              <h2 className="profile-card__title">Badges</h2>
              <span className="text-[12px] font-semibold" style={{ color: 'var(--color-primary)' }}>
                {unlockedCount}/{ACHIEVEMENTS.length}
              </span>
            </div>
            <div className="profile-badges" data-testid="profile-tabs">
              {ACHIEVEMENTS.map((a, i) => {
                const unlocked = a.check(metrics);
                const Icon = a.icon;
                return (
                  <div
                    key={a.id}
                    className={`profile-badge ${unlocked ? 'is-unlocked' : 'is-locked'}`}
                    data-testid={`ach-${i}`}
                  >
                    <div className="profile-badge__icon">
                      <Icon size={18} strokeWidth={1.75} />
                    </div>
                    <div className="profile-badge__name">{a.name}</div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </StudentLayout>
  );
}
