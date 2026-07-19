'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { useAuth } from "../../../contexts/AuthContext";
import { db } from "../../../firebase/config";
import Sidebar from "../../../components/common/sidebar";
import { doc, getDoc } from "firebase/firestore";

/* ─── Styles ────────────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --ink:        #0f1923;
    --ink-2:      #2c3e50;
    --ink-3:      #64748b;
    --paper:      #f5f2ee;
    --paper-2:    #ede9e3;
    --paper-3:    #e2ddd6;
    --gold:       #c9a84c;
    --gold-light: #f0d98a;
    --sidebar-w:  260px;
    --radius:     16px;
    --shadow:     0 4px 24px rgba(15,25,35,.08);
    --shadow-lg:  0 12px 40px rgba(15,25,35,.14);
  }

  body { font-family: 'DM Sans', sans-serif; background: var(--paper); color: var(--ink); }
  .layout { display: flex; min-height: 100vh; }

  /* ── Main ── */
  .main    { margin-left:var(--sidebar-w); flex:1; min-width:0; }
  .topbar  {
    position:sticky; top:0; z-index:50;
    background:rgba(245,242,238,.92); backdrop-filter:blur(12px);
    border-bottom:1px solid var(--paper-3); padding:0 32px; height:64px;
    display:flex; align-items:center; justify-content:space-between;
  }
  .topbar-left     { display:flex; align-items:center; gap:14px; }
  .hamburger {
    display:none; width:36px; height:36px; border-radius:8px;
    border:1px solid var(--paper-3); background:white;
    align-items:center; justify-content:center; cursor:pointer; font-size:1.1rem;
  }
  @media (min-width: 769px) {
    .hamburger { display: none; }
  }
  .topbar-title    { font-family:'Playfair Display',serif; font-size:1.15rem; color:var(--ink); }
  .topbar-date     { font-size:.78rem; color:var(--ink-3); margin-top:1px; }
  .topbar-right    { display:flex; align-items:center; gap:10px; }
  .avatar {
    width:36px; height:36px; border-radius:50%; background:var(--ink); color:var(--gold);
    display:flex; align-items:center; justify-content:center;
    font-weight:700; font-size:.9rem; font-family:'Playfair Display',serif;
  }

  /* ── Content ── */
  .content { padding:28px 32px; max-width:1200px; }
  .page-header {
    background:var(--ink); border-radius:var(--radius); padding:28px 32px;
    position:relative; overflow:hidden; margin-bottom:24px;
  }
  .page-header-pattern {
    position:absolute; inset:0; opacity:.04;
    background-image:repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%);
    background-size:20px 20px;
  }
  .page-header-accent {
    position:absolute; right:-40px; top:-40px; width:220px; height:220px; border-radius:50%;
    background:radial-gradient(circle,var(--gold) 0%,transparent 70%); opacity:.12;
  }
  .page-header-content { position:relative; }
  .page-title {
    font-family:'Playfair Display',serif; font-size:1.5rem; color:#fff; margin-bottom:4px;
  }
  .page-subtitle { font-size:.85rem; color:rgba(255,255,255,.6); }

  /* ── Tabs ── */
  .tabs-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:24px; }
  .tab-btn {
    padding:16px 12px; border-radius:14px; border:none; cursor:pointer;
    font-weight:600; font-size:.9rem; font-family:'DM Sans',sans-serif;
    transition:all .2s; display:flex; flex-direction:column; align-items:center; gap:6px;
  }
  .tab-btn:hover { transform:translateY(-2px); box-shadow:var(--shadow); }
  .tab-icon { font-size:1.5rem; }

  /* ── Cards ── */
  .card {
    background:white; border-radius:var(--radius); box-shadow:var(--shadow);
    border:1px solid var(--paper-3); margin-bottom:16px;
  }
  .card-header {
    padding:20px 24px; border-bottom:1px solid var(--paper-2);
    display:flex; align-items:center; gap:12px;
  }
  .card-title {
    font-family:'Playfair Display',serif; font-size:1.1rem; color:var(--ink);
  }
  .card-body { padding:20px 24px; }
  .card-subtitle { font-size:.85rem; color:var(--ink-3); }

  /* ── Accordion ── */
  .accordion-item12px; border-radius:14 { margin-bottom:px; overflow:hidden; box-shadow:var(--shadow); }
  .accordion-btn {
    width:100%; padding:16px 20px; border:none; background:white; cursor:pointer;
    display:flex; justify-content:space-between; align-items:center;
    font-family:'DM Sans',sans-serif;
  }
  .accordion-btn:hover { background:var(--paper); }
  .accordion-content { padding:0 20px 20px; border-top:1px solid var(--paper-2); }

  /* ── Tags ── */
  .tag {
    display:inline-flex; align-items:center; gap:4px; padding:4px 10px; border-radius:6px;
    font-size:.72rem; font-weight:600;
  }
  .tag-marks { background:#fef3c7; color:#92400e; }
  .tag-duration { background:#e0e7ff; color:#4338ca; }

  /* ── Summary ── */
  .summary-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
  .summary-item {
    background:var(--paper); padding:12px 16px; border-radius:10px;
  }
  .summary-label { font-size:.72rem; color:var(--ink-3); text-transform:capitalize; }
  .summary-value { font-size:.95rem; font-weight:700; color:var(--ink); margin-top:2px; }

  /* ── Tips ── */
  .tips-list { display:flex; flex-direction:column; gap:12px; }
  .tip-item { display:flex; gap:12px; align-items:flex-start; }
  .tip-number {
    width:24px; height:24px; border-radius:50%; background:#fef9c3; color:#ca8a04;
    display:flex; align-items:center; justify-content:center; font-size:.7rem; font-weight:700;
    flex-shrink:0;
  }
  .tip-text { font-size:.85rem; color:var(--ink-3); line-height:1.5; }

  /* ── Optional Grid ── */
  .optional-grid {
    display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:10px;
  }
  .optional-item {
    background:var(--paper); border:1px solid var(--paper-3); border-radius:10px;
    padding:12px 16px; font-size:.85rem; color:var(--ink-2); font-weight:500;
  }

  /* ── Empty State ── */
  .empty-state {
    background:white; border-radius:var(--radius); box-shadow:var(--shadow);
    border:1px solid var(--paper-3); text-align:center; padding:60px 20px;
  }

  /* ── Animations ── */
  @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  .animate { animation:fadeUp .5s ease both; }
  .delay-1 { animation-delay:.08s; }

  /* ── Scrollbar ── */
  ::-webkit-scrollbar      { width:4px; }
  ::-webkit-scrollbar-thumb{ background:var(--paper-3); border-radius:99px; }

  /* ── Responsive ── */
  @media (max-width:1024px){ .tabs-grid{grid-template-columns:repeat(2,1fr);} }
  @media (max-width:768px){
    .main{margin-left:0;}
    .hamburger{display:flex;}
    .content{padding:20px 18px;}
    .topbar{padding:0 18px;}
    .page-header{padding:22px 20px;}
    .tabs-grid{grid-template-columns:1fr;}
  }
`;

/* ─── Main Component ───────────────────────────────────────────── */

export default function Syllabus() {
  const router = useRouter();
  const { user, authLoading, logout } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('prelims');
  const [expandedPaper, setExpandedPaper] = useState(null);

  /* Derived values */
  const displayName = profile?.fullName || profile?.name || user?.email?.split('@')[0] || 'Aspirant';

  const syllabusData = {
    prelims: {
      title: "UPSC Prelims",
      icon: "📋",
      color: "#3b82f6",
      lightColor: "#eff6ff",
      borderColor: "#bfdbfe",
      description: "Preliminary Examination — Objective screening test",
      summary: { marks: "400", duration: "4 hrs", papers: "2", questions: "200", negative: "1/3 per wrong" },
      papers: [
        { name: "Paper I — General Studies", marks: 200, duration: "2 hours", topics: ["Current events of national & international importance","History of India & Indian National Movement","Indian & World Geography","Indian Polity & Governance","Economic & Social Development","General Science","Environmental Ecology"] },
        { name: "Paper II — CSAT (Qualifying)", marks: 200, duration: "2 hours", topics: ["Comprehension","Interpersonal skills","Logical reasoning","Decision making","General mental ability","Basic numeracy","Data interpretation"] }
      ]
    },
    mains: {
      title: "UPSC Mains",
      icon: "📝",
      color: "#8b5cf6",
      lightColor: "#f5f3ff",
      borderColor: "#ddd6fe",
      description: "Main Examination — Descriptive written test",
      summary: { marks: "1750", duration: "21 hrs", papers: "9", language: "English/Hindi", negative: "None" },
      papers: [
        { name: "Essay", marks: 250, duration: "3 hours", topics: ["Contemporary social issues","Indian national movement","Abstract topics"] },
        { name: "GS I — History, Geography & Society", marks: 250, duration: "3 hours", topics: ["Indian Heritage","Modern Indian History","World History","Geography","Indian Society"] },
        { name: "GS II — Polity & Governance", marks: 250, duration: "3 hours", topics: ["Constitution","Governance","Social Justice","International Relations"] },
        { name: "GS III — Economy, Environment & Security", marks: 250, duration: "3 hours", topics: ["Economic Development","Environment","Science & Technology","Internal Security"] },
        { name: "GS IV — Ethics & Integrity", marks: 250, duration: "3 hours", topics: ["Ethics","Case studies","Moral values"] },
        { name: "Optional Subject Paper I", marks: 250, duration: "3 hours", topics: ["Optional subject topics"] },
        { name: "Optional Subject Paper II", marks: 250, duration: "3 hours", topics: ["Optional subject advanced topics"] }
      ]
    },
    interview: {
      title: "Personality Test",
      icon: "🎤",
      color: "#f59e0b",
      lightColor: "#fffbeb",
      borderColor: "#fde68a",
      description: "Final stage — Personality assessment",
      summary: { marks: "275", duration: "30-45 min", stage: "Final", format: "In-person", negative: "None" },
      papers: [
        { name: "Personality Interview", marks: 275, duration: "30–45 minutes", topics: ["Current affairs","General awareness","Analytical ability","Communication","DAF-based questions"] }
      ]
    }
  };

  const optionalSubjects = [
    "Agriculture","Animal Husbandry","Anthropology","Botany","Chemistry",
    "Civil Engineering","Commerce","Economics","Electrical Engineering","Geography",
    "Geology","History","Law","Management","Mathematics","Mechanical Engineering","Medical Science",
    "Philosophy","Physics","Political Science","Psychology",
    "Public Administration","Sociology","Statistics","Zoology"
  ];

  const tips = {
    prelims: ["Paper II (CSAT) is qualifying — score 33%+","Negative marking: 1/3 mark deducted per wrong","Focus maximum on GS Paper I","Previous year papers are best resource"],
    mains: ["Write structured answers with headings","Practice answer writing daily","GS IV ethics needs real-life examples","Optional can make or break your rank"],
    interview: ["DAF is your interview blueprint","Read about your state, college, hobbies","Follow current affairs closely","Be honest — never bluff"]
  };

  const tabs = [
    { id: 'prelims', label: 'Prelims', icon: '📋', color: '#3b82f6' },
    { id: 'mains', label: 'Mains', icon: '📝', color: '#8b5cf6' },
    { id: 'interview', label: 'Interview', icon: '🎤', color: '#f59e0b' },
    { id: 'optional', label: 'Optional', icon: '📚', color: '#10b981' },
  ];

  useEffect(() => { if (!authLoading && !user) router.replace('/login'); }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (!snap.exists()) { if (!cancelled) router.push("/profile-setup"); return; }
        if (!cancelled) setProfile(snap.data());
      } catch { if (!cancelled) setProfile({ name: "Student" }); }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [user, router]);

  const handleLogout = async () => {
    try { await logout(); toast.success("Logged out!"); router.push("/login"); }
    catch { toast.error("Error logging out."); }
  };

  if (authLoading || loading) return (
    <div style={{ minHeight: "100vh", background: "var(--paper)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontSize: "2rem" }}>⌛</div>
    </div>
  );

  if (!user) return null;

  const active = syllabusData[activeTab];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="layout">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onLogout={handleLogout} />
        
        <main className="main">
          <header className="topbar">
            <div className="topbar-left">
              <button className="hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
              <div>
                <div className="topbar-title">Syllabus</div>
                <div className="topbar-date">{new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</div>
              </div>
            </div>
            <div className="topbar-right">
              <div className="avatar">{displayName[0]?.toUpperCase() || "U"}</div>
            </div>
          </header>

          <div className="content">
            {/* Page Header */}
            <div className="page-header animate">
              <div className="page-header-pattern" />
              <div className="page-header-accent" />
              <div className="page-header-content">
                <h1 className="page-title">📚 UPSC Syllabus</h1>
                <p className="page-subtitle">Complete Civil Services Examination guide</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="tabs-grid animate delay-1">
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => { setActiveTab(tab.id); setExpandedPaper(null); }}
                  className="tab-btn"
                  style={{
                    background: activeTab === tab.id ? tab.color : "white",
                    color: activeTab === tab.id ? "white" : "var(--ink-3)",
                    boxShadow: activeTab === tab.id ? `0 4px 14px ${tab.color}40` : "var(--shadow)"
                  }}>
                  <span className="tab-icon">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Optional Subjects Tab */}
            {activeTab === 'optional' ? (
              <div className="card animate delay-1">
                <div className="card-body">
                  <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.2rem", marginBottom: "8px" }}>📚 Optional Subjects</h2>
                  <p style={{ fontSize: ".85rem", color: "var(--ink-3)", marginBottom: "20px" }}>Choose one optional subject for Mains — 2 papers × 250 marks each</p>
                  <div className="optional-grid">
                    {optionalSubjects.map((sub, i) => (
                      <div key={i} className="optional-item">
                        <span style={{ color: "#10b981", marginRight: "8px" }}>✓</span>{sub}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px" }}>
                {/* Left Column */}
                <div>
                  {/* Exam Header Card */}
                  <div className="card animate delay-1" style={{ background: active.lightColor, borderColor: active.borderColor }}>
                    <div className="card-body" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <span style={{ fontSize: "2.5rem" }}>{active.icon}</span>
                      <div>
                        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.3rem", margin: 0, color: "var(--ink)" }}>{active.title}</h2>
                        <p style={{ margin: "4px 0 0", fontSize: ".85rem", color: "var(--ink-3)" }}>{active.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Papers */}
                  {active.papers?.map((paper, i) => (
                    <div key={i} className="accordion-item animate" style={{ animationDelay: `${0.12 + i * 0.04}s` }}>
                      <button className="accordion-btn" onClick={() => setExpandedPaper(expandedPaper === i ? null : i)}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: ".95rem", color: "var(--ink)" }}>{paper.name}</div>
                          <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                            <span className="tag tag-marks">📝 {paper.marks} marks</span>
                            <span className="tag tag-duration">⏱ {paper.duration}</span>
                          </div>
                        </div>
                        <span style={{ color: "var(--ink-3)", fontSize: "1.2rem" }}>{expandedPaper === i ? "▲" : "▼"}</span>
                      </button>
                      {expandedPaper === i && (
                        <div className="accordion-content">
                          <div style={{ fontSize: ".72rem", fontWeight: 700, color: "var(--ink-3)", marginBottom: "12px", marginTop: "16px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Topics Covered</div>
                          {paper.topics.map((topic, j) => (
                            <div key={j} style={{ display: "flex", gap: "10px", marginBottom: "8px", alignItems: "flex-start" }}>
                              <span style={{ color: active.color, fontWeight: 700 }}>→</span>
                              <span style={{ fontSize: ".85rem", color: "var(--ink-2)", lineHeight: 1.5 }}>{topic}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Right Column */}
                <div>
                  {/* Summary Card */}
                  <div className="card animate delay-2" style={{ background: active.lightColor, borderColor: active.borderColor }}>
                    <div className="card-body">
                      <h3 style={{ fontSize: ".9rem", fontWeight: 700, color: active.color, marginBottom: "16px" }}>📊 Exam Summary</h3>
                      <div className="summary-grid">
                        {Object.entries(active.summary).map(([key, val]) => (
                          <div key={key} className="summary-item">
                            <div className="summary-label">{key}</div>
                            <div className="summary-value">{val}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Tips Card */}
                  <div className="card animate delay-2">
                    <div className="card-body">
                      <h3 style={{ fontSize: ".9rem", fontWeight: 700, color: "var(--ink)", marginBottom: "16px" }}>💡 Strategy Tips</h3>
                      <div className="tips-list">
                        {tips[activeTab]?.map((tip, i) => (
                          <div key={i} className="tip-item">
                            <span className="tip-number">{i + 1}</span>
                            <span className="tip-text">{tip}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
