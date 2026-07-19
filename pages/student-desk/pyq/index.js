'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

import { useAuth } from "../../../contexts/AuthContext";
import { db } from "../../../firebase/config";
import StudentLayout from "../../../components/StudentLayout";
import {
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";

/* ─── Page-specific Styles ───────────────────────────────────────── */
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
    --gold-light: #f0d98a;
    --radius:     16px;
    --shadow:     0 4px 24px rgba(15,25,35,.08);
    --shadow-lg:  0 12px 40px rgba(15,25,35,.14);
  }

  body { font-family: 'DM Sans', sans-serif; background: var(--paper); color: var(--ink); }

  /* ── Page Header ── */
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

  /* ── Filter Card ── */
  .filter-card {
    background:white; border-radius:var(--radius); box-shadow:var(--shadow);
    border:1px solid var(--paper-3); margin-bottom:24px; overflow:hidden;
  }
  .filter-section {
    padding:16px 20px; border-bottom:1px solid var(--paper-2);
  }
  .filter-section:last-child { border-bottom: none; }
  .filter-row {
    display:flex; flex-wrap:wrap; gap:10px; align-items:center;
  }
  .filter-label {
    font-size:.75rem; font-weight:700; color:var(--ink-3);
    text-transform:uppercase; letter-spacing:.05em; min-width:60px;
  }
  .filter-btn {
    padding:6px 14px; border-radius:20px; font-size:.78rem; font-weight:600;
    cursor:pointer; transition:all .15s; border:1px solid var(--paper-3);
    background:transparent; color:var(--ink-3); font-family:'DM Sans',sans-serif;
  }
  .filter-btn:hover { border-color:var(--ink-2); color:var(--ink-2); }
  .filter-btn.active {
    background:var(--gold); color:var(--ink); border-color:var(--gold);
  }

  /* ── Results Bar ── */
  .results-bar {
    display:flex; justify-content:space-between; align-items:center;
    padding:12px 20px; background:var(--paper);
  }
  .results-count { font-size:.85rem; color:var(--ink-3); }
  .clear-btn {
    padding:4px 12px; font-size:.73rem; border:1px solid #ef4444;
    border-radius:12px; background:transparent; color:#ef4444;
    cursor:pointer; transition:all .15s; font-family:'DM Sans',sans-serif;
  }
  .clear-btn:hover { background:#fef2f2; }

  /* ── Cards Grid ── */
  .pyq-grid {
    display:grid; grid-template-columns:repeat(2,1fr); gap:20px;
  }
  .pyq-card {
    background:white; border-radius:var(--radius); box-shadow:var(--shadow);
    border:1px solid var(--paper-3); overflow:hidden; transition:transform .2s,box-shadow .2s;
  }
  .pyq-card:hover { transform:translateY(-3px); box-shadow:var(--shadow-lg); }
  .pyq-body { padding:22px; }
  .pyq-meta {
    display:flex; flex-wrap:wrap; gap:8px; margin-bottom:14px;
  }
  .pyq-badge {
    padding:4px 10px; border-radius:6px; font-size:.7rem; font-weight:700;
  }
  .pyq-badge-type { background:#dbeafe; color:#1e40af; }
  .pyq-badge-year { background:var(--paper); color:var(--ink-3); }
  .pyq-badge-paper { background:#e0e7ff; color:#3730a3; }
  .pyq-badge-subject { background:#dcfce7; color:#166534; }
  .pyq-title {
    font-family:'Playfair Display',serif; font-size:1.08rem; color:var(--ink);
    margin-bottom:8px; line-height:1.4;
  }
  .pyq-desc { font-size:.85rem; color:var(--ink-3); line-height:1.5; margin-bottom:16px; }

  /* ── PDF Items ── */
  .pdf-item {
    display:flex; align-items:center; justify-content:space-between;
    padding:12px 14px; background:var(--paper); border-radius:10px; margin-bottom:8px;
    transition:background .15s;
  }
  .pdf-item:hover { background:var(--paper-2); }
  .pdf-item:last-child { margin-bottom:0; }
  .pdf-info { display:flex; align-items:center; gap:12px; }
  .pdf-icon {
    width:38px; height:38px; border-radius:8px; background:#fee2e2;
    display:flex; align-items:center; justify-content:center; font-size:1.1rem;
  }
  .pdf-name { font-size:.87rem; font-weight:600; color:var(--ink); }
  .pdf-size { font-size:.72rem; color:var(--ink-3); margin-top:2px; }
  .pdf-download {
    width:36px; height:36px; border-radius:8px; background:#10b981; color:white;
    border:none; cursor:pointer; display:flex; align-items:center; justify-content:center;
    font-size:.9rem; transition:background .15s; text-decoration:none;
  }
  .pdf-download:hover { background:#059669; }

  /* ── Empty State ── */
  .empty-state {
    background:white; border-radius:var(--radius); box-shadow:var(--shadow);
    border:1px solid var(--paper-3); text-align:center; padding:60px 20px;
    grid-column:1 / -1;
  }
  .empty-icon { font-size:3rem; margin-bottom:12px; }
  .empty-title { font-family:'Playfair Display',serif; font-size:1.2rem; color:var(--ink); margin-bottom:8px; }
  .empty-msg { font-size:.85rem; color:var(--ink-3); }

  /* ── Animations ── */
  @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  .animate { animation:fadeUp .5s ease both; }
  .delay-1 { animation-delay:.08s; }

  /* ── Responsive ── */
  @media (max-width:1200px){ .pyq-grid{grid-template-columns:repeat(2,1fr);} }
  @media (max-width:768px){
    .content{padding:20px 18px;}
    .page-header{padding:22px 20px;}
    .pyq-grid{grid-template-columns:1fr;}
    .filter-section{padding:12px 16px;}
    .filter-label{min-width:100%; margin-bottom:4px;}
  }
`;

/* ─── Main Component ───────────────────────────────────────────── */

function PYQPage() {
  const router = useRouter();
  const { user, authLoading, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [pyqLoading, setPyqLoading] = useState(true);
  const [pyqSubjects, setPyqSubjects] = useState([]);
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedExamType, setSelectedExamType] = useState('all');
  const [selectedPaper, setSelectedPaper] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');

  // Filter options
  const years = ['2025', '2024', '2023', '2022', '2021', '2020'];
  
  const examTypes = [
    { value: 'all', label: 'All Exams' },
    { value: 'prelims', label: 'UPSC Prelims' },
    { value: 'mains', label: 'UPSC Mains' },
    { value: 'CDS', label: 'CDS' },
    { value: 'AFCAT', label: 'AFCAT' },
    { value: 'NDA', label: 'NDA' },
    { value: 'CAPF', label: 'CAPF' },
  ];
  
  const papers = [
    { value: 'all', label: 'All Papers' },
    { value: 'gs1', label: 'GS Paper I' },
    { value: 'gs2', label: 'GS Paper II' },
    { value: 'gs3', label: 'GS Paper III' },
    { value: 'gs4', label: 'GS Paper IV' },
    { value: 'csat', label: 'CSAT' },
    { value: 'essay', label: 'Essay' },
  ];
  
  const subjects = [
    { value: 'all', label: 'All Subjects' },
    { value: 'history', label: 'History' },
    { value: 'geography', label: 'Geography' },
    { value: 'polity', label: 'Polity' },
    { value: 'economy', label: 'Economy' },
    { value: 'science', label: 'Science' },
    { value: 'environment', label: 'Environment' },
    { value: 'international', label: 'International Relations' },
    { value: 'security', label: 'Security' },
    { value: 'ethics', label: 'Ethics' },
  ];

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const loadPyqSubjects = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, 'pyqs'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPyqSubjects(data);
      } catch (error) {
        console.error("Error loading PYQs:", error);
      } finally {
        setPyqLoading(false);
        setLoading(false);
      }
    };
    loadPyqSubjects();
  }, [user]);

  const filteredPYQs = pyqSubjects.filter(p => {
    const matchYear = selectedYear === 'all' || p.year === selectedYear;
    const matchExamType = selectedExamType === 'all' || p.examType === selectedExamType;
    const matchPaper = selectedPaper === 'all' || p.paper === selectedPaper;
    const matchSubject = selectedSubject === 'all' || p.subject === selectedSubject;
    return matchYear && matchExamType && matchPaper && matchSubject;
  });

  if (authLoading || loading) {
    return (
      <StudentLayout title="PYQ Papers">
        <div style={{ minHeight: "100vh", background: "var(--paper)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: "2rem" }}>⌛</div>
        </div>
      </StudentLayout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <StudentLayout title="PYQ Papers">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      
      {/* Page Header */}
      <div className="page-header animate">
        <div className="page-header-pattern" />
        <div className="page-header-accent" />
        <div className="page-header-content">
          <h1 className="page-title">📊 Previous Year Questions</h1>
          <p className="page-subtitle">Download and practice UPSC PYQ papers</p>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-card animate delay-1">
        {/* Exam Type Filter */}
        <div className="filter-section">
          <div className="filter-row">
            <span className="filter-label">Exam Type</span>
            {examTypes.map(et => (
              <button
                key={et.value}
                className={`filter-btn ${selectedExamType === et.value ? 'active' : ''}`}
                onClick={() => setSelectedExamType(et.value)}
              >
                {et.label}
              </button>
            ))}
          </div>
        </div>

        {/* Paper Filter */}
        <div className="filter-section">
          <div className="filter-row">
            <span className="filter-label">Paper</span>
            {papers.map(p => (
              <button
                key={p.value}
                className={`filter-btn ${selectedPaper === p.value ? 'active' : ''}`}
                onClick={() => setSelectedPaper(p.value)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Subject Filter */}
        <div className="filter-section">
          <div className="filter-row">
            <span className="filter-label">Subject</span>
            {subjects.map(s => (
              <button
                key={s.value}
                className={`filter-btn ${selectedSubject === s.value ? 'active' : ''}`}
                onClick={() => setSelectedSubject(s.value)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Year Filter */}
        <div className="filter-section">
          <div className="filter-row">
            <span className="filter-label">Year</span>
            <button
              className={`filter-btn ${selectedYear === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedYear('all')}
            >
              All Years
            </button>
            {years.map(year => (
              <button
                key={year}
                className={`filter-btn ${selectedYear === year ? 'active' : ''}`}
                onClick={() => setSelectedYear(year)}
              >
                {year}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="results-bar">
          <div className="results-count">
            Showing {filteredPYQs.length} PYQ {filteredPYQs.length === 1 ? 'paper' : 'papers'}
          </div>
          {(selectedExamType !== 'all' || selectedPaper !== 'all' || selectedSubject !== 'all' || selectedYear !== 'all') && (
            <button
              onClick={() => {
                setSelectedExamType('all');
                setSelectedPaper('all');
                setSelectedSubject('all');
                setSelectedYear('all');
              }}
              className="clear-btn"
            >
              Clear Filters ✕
            </button>
          )}
        </div>
      </div>

      {/* PYQ Cards */}
      <div className="pyq-grid">
        {pyqLoading ? (
          <div className="empty-state">
            <div className="empty-icon">⏳</div>
            <div className="empty-title">Loading PYQs...</div>
          </div>
        ) : filteredPYQs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <div className="empty-title">No PYQ Papers Found</div>
            <div className="empty-msg">Try adjusting your filters or check back later for new papers</div>
          </div>
        ) : (
          filteredPYQs.map((subject, idx) => (
            <article key={subject.id} className="pyq-card animate" style={{ animationDelay: `${0.12 + idx * 0.04}s` }}>
              <div className="pyq-body">
                <div className="pyq-meta">
                  <span className="pyq-badge pyq-badge-type">
                    {subject.examType ? subject.examType.toUpperCase() : 'PYQ'}
                  </span>
                  {subject.paper && (
                    <span className="pyq-badge pyq-badge-paper">
                      {subject.paper.toUpperCase()}
                    </span>
                  )}
                  {subject.subject && (
                    <span className="pyq-badge pyq-badge-subject">
                      {subject.subject.charAt(0).toUpperCase() + subject.subject.slice(1)}
                    </span>
                  )}
                  <span className="pyq-badge pyq-badge-year">{subject.year || 'N/A'}</span>
                </div>
                <h2 className="pyq-title">{subject.name || subject.title}</h2>
                <p className="pyq-desc">{subject.description}</p>
                
                {subject.pdfs ? (
                  subject.pdfs.map((pdf, pdfIdx) => (
                    <div key={pdfIdx} className="pdf-item">
                      <div className="pdf-info">
                        <div className="pdf-icon">📄</div>
                        <div>
                          <div className="pdf-name">{pdf.name}</div>
                          <div className="pdf-size">{pdf.size}</div>
                        </div>
                      </div>
                      <a href={pdf.url} className="pdf-download" download>↓</a>
                    </div>
                  ))
                ) : subject.downloadURL ? (
                  <div className="pdf-item">
                    <div className="pdf-info">
                      <div className="pdf-icon">📄</div>
                      <div>
                        <div className="pdf-name">{subject.fileName || 'PYQ Paper'}</div>
                        <div className="pdf-size">{subject.fileSize ? (subject.fileSize / (1024 * 1024)).toFixed(2) + ' MB' : ''}</div>
                      </div>
                    </div>
                    <a href={subject.downloadURL} className="pdf-download" download>↓</a>
                  </div>
                ) : null}
              </div>
            </article>
          ))
        )}
      </div>
    </StudentLayout>
  );
}

export default function PYQ() {
  return <PYQPage />;
}
