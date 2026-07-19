import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { db } from '../../../firebase/config';
import {
  collection, query, onSnapshot, orderBy
} from 'firebase/firestore';
import { useAuth } from '../../../contexts/AuthContext';
import Sidebar from '../../../components/common/sidebar';

/* ─── CSS ───────────────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --ink:        #0f1923;
    --ink-2:      #2c3e50;
    --ink-3:      #64748b;
    --paper:      #f5f2ee;
    --paper-2:    #ede9e3;
    --paper-3:    #e2ddd6;
    --gold:       #c9a84c;
    --emerald:    #1a6b4a;
    --crimson:    #8b1a1a;
    --sapphire:   #1a3f6b;
    --sidebar-w:  260px;
    --radius:     16px;
    --shadow:     0 4px 24px rgba(15,25,35,.08);
    --shadow-lg:  0 12px 40px rgba(15,25,35,.14);
  }

  body { font-family: 'DM Sans', sans-serif; background: var(--paper); color: var(--ink); }

  .ht-layout { display: flex; min-height: 100vh; }
  .ht-sidebar { width: var(--sidebar-w); background: var(--ink); position: fixed; top: 0; left: 0; bottom: 0; display: flex; flex-direction: column; z-index: 100; }
  .ht-main { margin-left: var(--sidebar-w); flex: 1; min-width: 0; }
  .ht-topbar { position: sticky; top: 0; z-index: 50; background: rgba(245,242,238,.92); backdrop-filter: blur(12px); border-bottom: 1px solid var(--paper-3); padding: 0 32px; height: 64px; display: flex; align-items: center; justify-content: space-between; }
  .ht-topbar-title { font-family: 'Playfair Display', serif; font-size: 1.15rem; }
  .ht-topbar-date { font-size: .78rem; color: var(--ink-3); margin-top: 1px; }
  .ht-content { padding: 28px 32px; max-width: 1200px; }
  .ht-avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--ink); color: var(--gold); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: .9rem; }
  .ht-back { display: flex; align-items: center; gap: 8px; color: var(--ink-3); text-decoration: none; font-size: .9rem; }
  .ht-back:hover { color: var(--ink); }

  /* Stats Cards */
  .ht-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
  .ht-stat-card { background: white; border-radius: 12px; padding: 20px; box-shadow: var(--shadow); border: 1px solid var(--paper-3); }
  .ht-stat-val { font-family: 'Playfair Display', serif; font-size: 1.8rem; color: var(--ink); line-height: 1; }
  .ht-stat-label { font-size: .75rem; color: var(--ink-3); margin-top: 6px; font-weight: 500; }

  /* History Table */
  .ht-history { background: white; border-radius: var(--radius); box-shadow: var(--shadow); border: 1px solid var(--paper-3); overflow: hidden; }
  .ht-history-head { padding: 20px 24px; border-bottom: 1px solid var(--paper-2); display: flex; align-items: center; justify-content: space-between; }
  .ht-history-title { font-family: 'Playfair Display', serif; font-size: 1.1rem; color: var(--ink); }
  .ht-table { width: 100%; font-size: .85rem; border-collapse: collapse; }
  .ht-table th { padding: 12px 16px; text-align: left; font-size: .7rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--ink-3); background: var(--paper); border-bottom: 1px solid var(--paper-3); }
  .ht-table td { padding: 14px 16px; border-bottom: 1px solid var(--paper-2); color: var(--ink-2); vertical-align: middle; }
  .ht-table tr:last-child td { border-bottom: none; }
  .ht-table tr:hover td { background: var(--paper); }
  .ht-score-badge { display: inline-block; padding: 4px 12px; border-radius: 6px; font-weight: 700; font-size: .8rem; }
  .ht-test-link { color: var(--sapphire); text-decoration: none; font-weight: 600; }
  .ht-test-link:hover { text-decoration: underline; }

  /* Empty State */
  .ht-empty { text-align: center; padding: 60px 20px; }
  .ht-empty-icon { font-size: 3rem; margin-bottom: 16px; }
  .ht-empty-title { font-family: 'Playfair Display', serif; font-size: 1.2rem; color: var(--ink); margin-bottom: 8px; }
  .ht-empty-sub { font-size: .9rem; color: var(--ink-3); }
  .ht-empty-btn { margin-top: 20px; padding: 12px 24px; background: var(--ink); color: white; border: none; border-radius: 10px; font-size: .9rem; font-weight: 600; cursor: pointer; }

  @media (max-width: 768px) {
    .ht-sidebar { transform: translateX(-100%); }
    .ht-main { margin-left: 0; }
    .ht-content { padding: 20px; }
    .ht-stats { grid-template-columns: repeat(2, 1fr); }
  }
`;

function getScoreColor(score) {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#f59e0b';
  if (score >= 40) return '#3b82f6';
  return '#ef4444';
}

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

export default function TestHistory() {
  const router = useRouter();
  const { user, authLoading, logout } = useAuth();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(
      collection(db, 'users', user.uid, 'mockTestAttempts'),
      snap => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        // Sort by completedAt descending
        data.sort((a, b) => {
          const aTime = a.completedAt?.toDate?.()?.getTime() || 0;
          const bTime = b.completedAt?.toDate?.()?.getTime() || 0;
          return bTime - aTime;
        });
        setAttempts(data);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user?.uid) return;
    import('firebase/firestore').then(({ doc, getDoc }) => {
      getDoc(doc(db, 'users', user.uid)).then(snap => {
        if (snap.exists()) setProfile(snap.data());
      });
    });
  }, [user?.uid]);

  const displayName = profile?.fullName || profile?.name || user?.email?.split('@')[0] || 'Aspirant';
  const dateStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  // Calculate stats
  const totalTests = attempts.length;
  const avgScore = totalTests > 0 ? Math.round(attempts.reduce((s, a) => s + (a.score || 0), 0) / totalTests) : 0;
  const bestScore = totalTests > 0 ? Math.max(...attempts.map(a => a.score || 0)) : 0;
  const totalQuestions = attempts.reduce((s, a) => s + (a.total || 0), 0);

  if (authLoading || !user) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="ht-layout">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onLogout={() => { logout(); router.push('/login'); }} />
        
        <main className="ht-main">
          <header className="ht-topbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <Link href="/student-desk/mock-tests" className="ht-back">← Back to Tests</Link>
            </div>
            <div className="ht-avatar">{displayName[0]?.toUpperCase() || 'U'}</div>
          </header>

          <div className="ht-content">
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', marginBottom: 4 }}>Test History</h1>
              <p style={{ color: 'var(--ink-3)', fontSize: '.9rem' }}>Your complete test attempt records</p>
            </div>

            {/* Stats */}
            <div className="ht-stats">
              <div className="ht-stat-card">
                <div className="ht-stat-val">{totalTests}</div>
                <div className="ht-stat-label">Tests Attempted</div>
              </div>
              <div className="ht-stat-card">
                <div className="ht-stat-val">{totalQuestions}</div>
                <div className="ht-stat-label">Questions Solved</div>
              </div>
              <div className="ht-stat-card">
                <div className="ht-stat-val" style={{ color: getScoreColor(avgScore) }}>{avgScore}%</div>
                <div className="ht-stat-label">Average Score</div>
              </div>
              <div className="ht-stat-card">
                <div className="ht-stat-val" style={{ color: getScoreColor(bestScore) }}>{bestScore}%</div>
                <div className="ht-stat-label">Best Score</div>
              </div>
            </div>

            {/* History Table */}
            {loading ? (
              <div className="ht-empty">
                <div className="ht-empty-icon">⏳</div>
                <div className="ht-empty-title">Loading...</div>
              </div>
            ) : attempts.length === 0 ? (
              <div className="ht-empty">
                <div className="ht-empty-icon">📝</div>
                <div className="ht-empty-title">No Tests Attempted Yet</div>
                <div className="ht-empty-sub">Start your first mock test to see your history here</div>
                <Link href="/student-desk/mock-tests">
                  <button className="ht-empty-btn">Take a Test →</button>
                </Link>
              </div>
            ) : (
              <div className="ht-history">
                <div className="ht-history-head">
                  <span className="ht-history-title">All Attempts ({attempts.length})</span>
                </div>
                <table className="ht-table">
                  <thead>
                    <tr>
                      <th>Test</th>
                      <th>Score</th>
                      <th>Correct</th>
                      <th>Incorrect</th>
                      <th>Skipped</th>
                      <th>Time</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attempts.map(attempt => (
                      <tr key={attempt.id}>
                        <td>
                          <span className="ht-test-link">{attempt.testTitle}</span>
                        </td>
                        <td>
                          <span className="ht-score-badge" style={{ background: getScoreColor(attempt.score) + '15', color: getScoreColor(attempt.score) }}>
                            {attempt.score}%
                          </span>
                        </td>
                        <td style={{ color: '#10b981', fontWeight: 600 }}>{attempt.correct || 0}</td>
                        <td style={{ color: '#ef4444', fontWeight: 600 }}>{attempt.incorrect || 0}</td>
                        <td style={{ color: 'var(--ink-3)' }}>{attempt.totalUnanswered || 0}</td>
                        <td style={{ color: 'var(--ink-3)' }}>{formatTime(attempt.timeTaken || 0)}</td>
                        <td style={{ color: 'var(--ink-3)', fontSize: '.8rem' }}>
                          {attempt.completedAt?.toDate?.()?.toLocaleDateString('en-IN') || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
