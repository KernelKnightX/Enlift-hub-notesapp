import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { db } from '../../../firebase/config';
import {
  collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, getDoc, doc,
} from 'firebase/firestore';
import { useAuth } from '../../../contexts/AuthContext';
import Sidebar from '../../../components/common/sidebar';

const EXAM_FILTERS = [
  { id: 'all', label: 'All Tests' },
  { id: 'upsc', label: 'UPSC' },
  { id: 'nda', label: 'NDA' },
  { id: 'cds', label: 'CDS' },
  { id: 'afcat', label: 'AFCAT' },
];

const SUBJECT_FILTERS = [
  { id: 'all', label: 'All Subjects' },
  { id: 'general', label: 'General Awareness' },
  { id: 'english', label: 'English' },
  { id: 'mathematics', label: 'Mathematics' },
  { id: 'reasoning', label: 'Reasoning' },
  { id: 'current_affairs', label: 'Current Affairs' },
  { id: 'defence_awareness', label: 'Defence Awareness' },
  { id: 'general_science', label: 'General Science' },
  { id: 'history', label: 'History' },
  { id: 'geography', label: 'Geography' },
  { id: 'economy', label: 'Economy' },
  { id: 'polity', label: 'Polity' },
];

const DIFFICULTY_FILTERS = [
  { id: 'all', label: 'All Levels' },
  { id: 'easy', label: 'Easy' },
  { id: 'medium', label: 'Medium' },
  { id: 'hard', label: 'Hard' },
];

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
    --gold-light: #f0d98a;
    --emerald:    #1a6b4a;
    --crimson:    #8b1a1a;
    --sapphire:   #1a3f6b;
    --sidebar-w:  260px;
    --radius:     16px;
    --shadow:     0 4px 24px rgba(15,25,35,.08);
    --shadow-lg:  0 12px 40px rgba(15,25,35,.14);
  }

  body { font-family: 'DM Sans', sans-serif; background: var(--paper); color: var(--ink); }

  /* ── Layout ── */
  .mt-layout { display: flex; min-height: 100vh; }

  /* ── Sidebar ── */
  .mt-sidebar {
    width: var(--sidebar-w); background: var(--ink);
    position: fixed; top: 0; left: 0; bottom: 0;
    display: flex; flex-direction: column; z-index: 100;
    transition: transform .3s cubic-bezier(.4,0,.2,1);
  }
  .mt-sidebar-logo     { padding: 28px 24px 20px; border-bottom: 1px solid rgba(255,255,255,.08); }
  .mt-sidebar-logo-txt { font-family:'Playfair Display',serif; font-size:1.35rem; color:#fff; line-height:1.2; }
  .mt-sidebar-logo-sub { font-size:.72rem; letter-spacing:.12em; text-transform:uppercase; color:var(--gold); margin-top:3px; }
  .mt-sidebar-nav      { flex:1; padding:16px 12px; overflow-y:auto; }
  .mt-nav-item {
    display:flex; align-items:center; gap:12px; padding:10px 14px; border-radius:10px;
    color:rgba(255,255,255,.55); font-size:.88rem; font-weight:500;
    cursor:pointer; transition:all .18s; text-decoration:none; margin-bottom:2px;
  }
  .mt-nav-item:hover  { background:rgba(255,255,255,.07); color:rgba(255,255,255,.9); }
  .mt-nav-item.active { background:var(--gold); color:var(--ink); }
  .mt-nav-icon        { font-size:1.1rem; width:22px; text-align:center; }
  .mt-sidebar-footer  { padding:16px 12px 20px; border-top:1px solid rgba(255,255,255,.08); }
  .mt-logout-btn {
    width:100%; display:flex; align-items:center; gap:10px; padding:10px 14px; border-radius:10px;
    background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.1);
    color:rgba(255,255,255,.6); font-size:.85rem; font-weight:500;
    cursor:pointer; transition:all .18s; font-family:'DM Sans',sans-serif;
  }
  .mt-logout-btn:hover { background:rgba(220,50,50,.2); color:#fca5a5; border-color:rgba(220,50,50,.3); }
  .mt-overlay {
    display:none; position:fixed; inset:0; background:rgba(0,0,0,.5); z-index:99;
  }
  .mt-overlay.open { display:block; }
  .mt-sidebar.open  { transform:translateX(0) !important; }

  /* ── Main ── */
  .mt-main   { margin-left:var(--sidebar-w); flex:1; min-width:0; }
  .mt-topbar {
    position:sticky; top:0; z-index:50;
    background:rgba(245,242,238,.92); backdrop-filter:blur(12px);
    border-bottom:1px solid var(--paper-3); padding:0 32px; height:64px;
    display:flex; align-items:center; justify-content:space-between;
  }
  .mt-topbar-title { font-family:'Playfair Display',serif; font-size:1.15rem; }
  .mt-topbar-date  { font-size:.78rem; color:var(--ink-3); margin-top:1px; }
  .mt-hamburger {
    display:none; width:36px; height:36px; border-radius:8px;
    border:1px solid var(--paper-3); background:white;
    align-items:center; justify-content:center; cursor:pointer; font-size:1.1rem;
  }
  .mt-avatar {
    width:36px; height:36px; border-radius:50%; background:var(--ink); color:var(--gold);
    display:flex; align-items:center; justify-content:center;
    font-weight:700; font-size:.9rem; font-family:'Playfair Display',serif;
  }
  .mt-content { padding:28px 32px; max-width:1300px; }

  /* ── Page header ── */
  .mt-page-header {
    background:var(--ink); border-radius:var(--radius); padding:24px 32px;
    position:relative; overflow:hidden; margin-bottom:28px;
    display:flex; align-items:center; justify-content:space-between; gap:20px; flex-wrap:wrap;
  }
  .mt-ph-pattern {
    position:absolute; inset:0; opacity:.04;
    background-image:repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%);
    background-size:20px 20px;
  }
  .mt-ph-accent {
    position:absolute; right:-40px; top:-40px; width:220px; height:220px; border-radius:50%;
    background:radial-gradient(circle,var(--gold) 0%,transparent 70%); opacity:.12;
  }
  .mt-ph-left   { position:relative; }
  .mt-ph-title  { font-family:'Playfair Display',serif; font-size:1.4rem; color:#fff; margin-bottom:3px; }
  .mt-ph-sub    { font-size:.82rem; color:rgba(255,255,255,.55); }
  .mt-ph-right  { position:relative; display:flex; gap:10px; align-items:center; flex-wrap:wrap; }

  /* ── Stats strip ── */
  .mt-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:24px; }
  .mt-stat-card {
    background:white; border-radius:12px; padding:16px 18px;
    box-shadow:var(--shadow); border:1px solid var(--paper-3);
  }
  .mt-stat-val   { font-family:'Playfair Display',serif; font-size:1.6rem; color:var(--ink); line-height:1; }
  .mt-stat-label { font-size:.72rem; color:var(--ink-3); margin-top:4px; font-weight:500; }
  .mt-stat-bar   { height:3px; border-radius:99px; margin-top:10px; background:var(--paper-3); overflow:hidden; }
  .mt-stat-fill  { height:100%; border-radius:99px; }

  /* ── Filters ── */
  .mt-filters { display:flex; gap:8px; margin-bottom:20px; flex-wrap:wrap; align-items:center; }
  .mt-filter-btn {
    padding:8px 18px; border-radius:99px; font-size:.8rem; font-weight:600;
    cursor:pointer; border:1.5px solid var(--paper-3); background:white;
    color:var(--ink-3); transition:all .15s; font-family:'DM Sans',sans-serif;
  }
  .mt-filter-btn:hover  { border-color:var(--gold); color:var(--gold); }
  .mt-filter-btn.active { background:var(--ink); color:white; border-color:var(--ink); }
  .mt-filter-select {
    padding:8px 14px; border-radius:99px; font-size:.8rem; font-weight:600;
    cursor:pointer; border:1.5px solid var(--paper-3); background:white;
    color:var(--ink-3); font-family:'DM Sans',sans-serif; min-width:140px;
  }
  .mt-filter-select:focus { outline:none; border-color:var(--gold); }
  .mt-filters-divider { width:1px; height:24px; background:var(--paper-3); margin:0 8px; }

  /* ── Test cards grid ── */
  .mt-cards { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:18px; margin-bottom:32px; }
  .mt-card {
    background:white; border-radius:var(--radius); box-shadow:var(--shadow);
    border:1px solid var(--paper-3); overflow:hidden;
    display:flex; flex-direction:column; transition:transform .2s, box-shadow .2s;
  }
  .mt-card:hover { transform:translateY(-3px); box-shadow:var(--shadow-lg); }
  .mt-card-band  { height:5px; }
  .mt-card-body  { padding:20px; flex:1; display:flex; flex-direction:column; }
  .mt-card-type  { font-size:.68rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; margin-bottom:8px; }
  .mt-card-title { font-family:'Playfair Display',serif; font-size:1rem; color:var(--ink); margin-bottom:6px; line-height:1.4; }
  .mt-card-desc  { font-size:.78rem; color:var(--ink-3); line-height:1.5; margin-bottom:16px; flex:1; }
  .mt-card-meta  { display:flex; gap:10px; margin-bottom:14px; flex-wrap:wrap; }
  .mt-card-badge {
    font-size:.7rem; font-weight:600; padding:4px 10px; border-radius:6px;
    background:var(--paper); color:var(--ink-2); border:1px solid var(--paper-3);
    display:flex; align-items:center; gap:4px;
  }
  .mt-card-score {
    border-radius:10px; padding:12px; text-align:center; margin-bottom:14px;
    border:1px solid transparent;
  }
  .mt-card-score-val   { font-family:'Playfair Display',serif; font-size:1.5rem; font-weight:700; line-height:1; }
  .mt-card-score-label { font-size:.68rem; color:var(--ink-3); margin-top:3px; font-weight:500; }
  .mt-card-score-attempts { font-size:.65rem; color:var(--ink-3); margin-top:2px; }
  .mt-start-btn {
    width:100%; padding:11px; border-radius:10px; border:none; font-weight:700;
    font-size:.85rem; cursor:pointer; font-family:'DM Sans',sans-serif;
    transition:all .18s; letter-spacing:.02em;
  }

  /* ── Empty state ── */
  .mt-empty {
    grid-column:1/-1; text-align:center; padding:56px 20px;
    background:white; border-radius:var(--radius); border:1px solid var(--paper-3);
  }
  .mt-empty-icon  { font-size:3rem; margin-bottom:12px; }
  .mt-empty-title { font-family:'Playfair Display',serif; font-size:1.2rem; color:var(--ink); margin-bottom:6px; }
  .mt-empty-sub   { font-size:.82rem; color:var(--ink-3); }

  /* ── History table ── */
  .mt-history { background:white; border-radius:var(--radius); box-shadow:var(--shadow); border:1px solid var(--paper-3); overflow:hidden; margin-bottom:28px; }
  .mt-history-head { padding:16px 24px; border-bottom:1px solid var(--paper-2); display:flex; align-items:center; justify-content:space-between; }
  .mt-history-title { font-family:'Playfair Display',serif; font-size:1rem; color:var(--ink); }
  .mt-table { width:100%; font-size:.8rem; border-collapse:collapse; }
  .mt-table th { padding:10px 16px; text-align:left; font-size:.68rem; font-weight:700; letter-spacing:.06em; text-transform:uppercase; color:var(--ink-3); background:var(--paper); border-bottom:1px solid var(--paper-3); }
  .mt-table td { padding:12px 16px; border-bottom:1px solid var(--paper-2); color:var(--ink-2); vertical-align:middle; }
  .mt-table tr:last-child td { border-bottom:none; }
  .mt-table tr:hover td { background:var(--paper); }
  .mt-score-badge { display:inline-block; padding:3px 10px; border-radius:6px; font-weight:700; font-size:.78rem; }

  /* ── Animations ── */
  @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  .mt-animate   { animation:fadeUp .45s ease both; }
  .mt-delay-1   { animation-delay:.07s; }
  .mt-delay-2   { animation-delay:.14s; }
  .mt-delay-3   { animation-delay:.21s; }
  @keyframes shimmer { from{background-position:-400px 0} to{background-position:400px 0} }
  .mt-skeleton {
    border-radius:8px; display:block;
    background:linear-gradient(90deg,var(--paper-2) 25%,var(--paper-3) 50%,var(--paper-2) 75%);
    background-size:400px 100%; animation:shimmer 1.4s infinite;
  }

  /* ══════════════════════════════════════════════════════════════
     INSTRUCTIONS MODAL
  ══════════════════════════════════════════════════════════════ */
  .mt-modal-overlay {
    position:fixed; inset:0; background:rgba(15,25,35,.6); backdrop-filter:blur(6px);
    z-index:200; display:flex; align-items:center; justify-content:center; padding:20px;
  }
  .mt-modal {
    background:white; border-radius:var(--radius); width:100%; max-width:520px;
    box-shadow:var(--shadow-lg); animation:fadeUp .2s ease;
  }
  .mt-modal-head {
    background:var(--ink); border-radius:var(--radius) var(--radius) 0 0;
    padding:24px 28px; position:relative; overflow:hidden;
  }
  .mt-modal-head-accent {
    position:absolute; right:-30px; top:-30px; width:160px; height:160px; border-radius:50%;
    background:radial-gradient(circle,var(--gold) 0%,transparent 70%); opacity:.15;
  }
  .mt-modal-head-title { font-family:'Playfair Display',serif; font-size:1.2rem; color:white; position:relative; margin-bottom:3px; }
  .mt-modal-head-sub   { font-size:.78rem; color:rgba(255,255,255,.5); position:relative; }
  .mt-modal-body { padding:24px 28px; }
  .mt-instr-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:20px; }
  .mt-instr-cell { background:var(--paper); border-radius:10px; padding:14px; }
  .mt-instr-cell-label { font-size:.65rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:var(--ink-3); margin-bottom:4px; }
  .mt-instr-cell-val   { font-family:'Playfair Display',serif; font-size:1.2rem; color:var(--ink); }
  .mt-instr-rules { background:#fffbeb; border:1px solid #fde68a; border-radius:10px; padding:16px; margin-bottom:20px; }
  .mt-instr-rules-title { font-size:.72rem; font-weight:700; color:#92400e; letter-spacing:.06em; text-transform:uppercase; margin-bottom:10px; }
  .mt-instr-rule { display:flex; align-items:flex-start; gap:8px; margin-bottom:7px; font-size:.8rem; color:var(--ink-2); line-height:1.4; }
  .mt-instr-rule:last-child { margin-bottom:0; }
  .mt-instr-rule-dot { width:5px; height:5px; border-radius:50%; background:var(--gold); margin-top:6px; flex-shrink:0; }
  .mt-modal-foot { padding:0 28px 24px; display:flex; gap:10px; }
  .mt-btn-cancel {
    padding:11px 20px; border-radius:10px; border:1px solid var(--paper-3);
    background:white; font-size:.85rem; font-weight:600; cursor:pointer;
    font-family:'DM Sans',sans-serif; color:var(--ink-3); transition:all .15s;
  }
  .mt-btn-cancel:hover { background:var(--paper); }
  .mt-btn-start {
    flex:1; padding:11px; border-radius:10px; border:none;
    background:var(--ink); color:white; font-size:.88rem; font-weight:700;
    cursor:pointer; font-family:'DM Sans',sans-serif; transition:all .15s; letter-spacing:.02em;
  }
  .mt-btn-start:hover { background:var(--gold); }

  /* ══════════════════════════════════════════════════════════════
     TEST INTERFACE
  ══════════════════════════════════════════════════════════════ */
  .mt-test-wrap { display:flex; min-height:100vh; background:var(--paper); }

  /* Left panel */
  .mt-test-panel {
    width:260px; background:var(--ink); position:fixed; top:0; left:0; bottom:0;
    display:flex; flex-direction:column; overflow:hidden; z-index:10;
  }
  .mt-test-panel-head { padding:20px 18px 16px; border-bottom:1px solid rgba(255,255,255,.08); }
  .mt-test-panel-name { font-family:'Playfair Display',serif; font-size:.95rem; color:white; line-height:1.3; margin-bottom:12px; }
  .mt-timer {
    font-family:'Playfair Display',serif; font-size:2.2rem; font-weight:700;
    letter-spacing:.05em; line-height:1; margin-bottom:6px;
    transition:color .3s;
  }
  .mt-timer.warning { color:#fbbf24; }
  .mt-timer.danger  { color:#ef4444; animation:pulse .8s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.6} }
  .mt-timer-label { font-size:.68rem; letter-spacing:.1em; text-transform:uppercase; color:rgba(255,255,255,.4); }
  .mt-test-counters { padding:14px 18px; border-bottom:1px solid rgba(255,255,255,.08); display:flex; flex-direction:column; gap:8px; }
  .mt-counter-row { display:flex; justify-content:space-between; align-items:center; font-size:.78rem; }
  .mt-counter-label { color:rgba(255,255,255,.45); }
  .mt-counter-val   { font-weight:700; font-size:.85rem; }
  .mt-qgrid-wrap { flex:1; overflow-y:auto; padding:14px 18px; }
  .mt-qgrid-label { font-size:.65rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:rgba(255,255,255,.3); margin-bottom:10px; }
  .mt-qgrid { display:grid; grid-template-columns:repeat(5,1fr); gap:6px; }
  .mt-qbtn {
    width:38px; height:38px; border-radius:8px; border:none; font-size:.78rem; font-weight:700;
    cursor:pointer; position:relative; transition:all .15s; font-family:'DM Sans',sans-serif;
  }
  .mt-qbtn.current  { background:var(--gold); color:var(--ink); }
  .mt-qbtn.answered { background:#10b981; color:white; }
  .mt-qbtn.marked   { background:#f59e0b; color:white; }
  .mt-qbtn.default  { background:rgba(255,255,255,.1); color:rgba(255,255,255,.6); }
  .mt-qbtn.marked::after { content:''; position:absolute; top:-3px; right:-3px; width:8px; height:8px; border-radius:50%; background:#f97316; border:2px solid var(--ink); }
  .mt-test-exit-btn {
    margin:12px 18px 18px; padding:10px; border-radius:10px;
    border:1px solid rgba(255,255,255,.12); background:rgba(255,255,255,.06);
    color:rgba(255,255,255,.55); font-size:.8rem; font-weight:600;
    cursor:pointer; font-family:'DM Sans',sans-serif; transition:all .15s;
  }
  .mt-test-exit-btn:hover { background:rgba(220,50,50,.2); color:#fca5a5; }

  /* Main question area */
  .mt-test-main { margin-left:260px; flex:1; display:flex; flex-direction:column; min-height:100vh; }
  .mt-test-topbar {
    background:white; border-bottom:1px solid var(--paper-3); padding:0 28px; height:56px;
    display:flex; align-items:center; justify-content:space-between; position:sticky; top:0; z-index:5;
  }
  .mt-test-qcount { font-family:'Playfair Display',serif; font-size:1rem; color:var(--ink); }
  .mt-test-qsub   { font-size:.72rem; color:var(--ink-3); margin-top:1px; }
  .mt-test-progress { flex:1; max-width:300px; margin:0 24px; }
  .mt-test-progress-bar { height:4px; border-radius:99px; background:var(--paper-3); overflow:hidden; }
  .mt-test-progress-fill { height:100%; background:var(--gold); border-radius:99px; transition:width .4s; }
  .mt-test-progress-label { font-size:.65rem; color:var(--ink-3); margin-top:4px; text-align:right; }

  /* Question card */
  .mt-question-area { flex:1; padding:24px 28px; overflow-y:auto; }
  .mt-question-card { background:white; border-radius:var(--radius); padding:28px; box-shadow:var(--shadow); margin-bottom:16px; }
  .mt-question-num  { font-size:.7rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:var(--gold); margin-bottom:10px; }
  .mt-question-text { font-size:1rem; line-height:1.7; color:var(--ink); font-weight:500; margin-bottom:24px; }
  .mt-question-tags { display:flex; gap:8px; margin-bottom:12px; flex-wrap:wrap; }
  .mt-question-tag { font-size:.65rem; font-weight:600; padding:3px 10px; border-radius:6px; text-transform:capitalize; }
  .mt-question-tag-subject { background:var(--paper-2); color:var(--ink-3); }
  .mt-question-tag-difficulty { background:#fef3c7; color:#92400e; }
  .mt-question-tag-source { background:#dbeafe; color:#1e40af; }
  .mt-options { display:flex; flex-direction:column; gap:10px; }
  .mt-option {
    display:flex; align-items:center; gap:14px; padding:14px 16px; border-radius:12px;
    cursor:pointer; border:1.5px solid var(--paper-3); background:white;
    transition:all .18s; text-align:left; width:100%; font-family:'DM Sans',sans-serif;
  }
  .mt-option:hover   { border-color:var(--gold); background:#fffbeb; }
  .mt-option.selected { border-color:var(--ink); background:var(--ink); }
  .mt-option-key {
    width:34px; height:34px; border-radius:8px; flex-shrink:0;
    background:var(--paper); color:var(--ink-3);
    display:flex; align-items:center; justify-content:center;
    font-weight:700; font-size:.8rem; transition:all .18s;
  }
  .mt-option.selected .mt-option-key { background:var(--gold); color:var(--ink); }
  .mt-option-text { font-size:.88rem; color:var(--ink-2); font-weight:500; transition:color .18s; }
  .mt-option.selected .mt-option-text { color:white; }

  /* Descriptive answer textarea */
  .mt-descriptive-answer {
    width:100%; min-height:200px; padding:16px; border-radius:12px;
    border:1.5px solid var(--paper-3); font-family:'DM Sans',sans-serif;
    font-size:.95rem; line-height:1.6; resize:vertical;
    transition:border-color .18s;
  }
  .mt-descriptive-answer:focus { outline:none; border-color:var(--gold); }
  .mt-word-count {
    font-size:.75rem; color:var(--ink-3); margin-top:8px; text-align:right;
  }
  .mt-word-count.warning { color:#f59e0b; }
  .mt-word-count.danger { color:#ef4444; }

  /* Bottom nav */
  .mt-test-nav {
    background:white; border-top:1px solid var(--paper-3); padding:14px 28px;
    display:flex; align-items:center; justify-content:space-between; gap:12px;
    position:sticky; bottom:0;
  }
  .mt-nav-btn {
    padding:10px 20px; border-radius:10px; font-size:.83rem; font-weight:600;
    cursor:pointer; font-family:'DM Sans',sans-serif; transition:all .15s; border:1.5px solid var(--paper-3);
    background:white; color:var(--ink-2);
  }
  .mt-nav-btn:hover:not(:disabled) { border-color:var(--ink); color:var(--ink); }
  .mt-nav-btn:disabled { opacity:.35; cursor:not-allowed; }
  .mt-nav-btn.mark { border-color:#f59e0b; color:#92400e; background:#fffbeb; }
  .mt-nav-btn.mark.active { background:#f59e0b; color:white; border-color:#f59e0b; }
  .mt-nav-btn.primary { background:var(--ink); color:white; border-color:var(--ink); }
  .mt-nav-btn.primary:hover { background:var(--gold); border-color:var(--gold); }
  .mt-nav-btn.submit { background:var(--emerald); color:white; border-color:var(--emerald); }
  .mt-nav-btn.submit:hover { background:#0f4a33; }

  /* ══════════════════════════════════════════════════════════════
     RESULTS PAGE
  ══════════════════════════════════════════════════════════════ */
  .mt-results-wrap { max-width:900px; margin:0 auto; padding:32px 24px; }

  /* Hero */
  .mt-results-hero {
    background:var(--ink); border-radius:var(--radius); padding:36px 40px;
    position:relative; overflow:hidden; margin-bottom:20px; text-align:center;
  }
  .mt-results-hero-pattern {
    position:absolute; inset:0; opacity:.04;
    background-image:repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%);
    background-size:20px 20px;
  }
  .mt-results-hero-glow {
    position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
    width:400px; height:400px; border-radius:50%;
    background:radial-gradient(circle,var(--gold) 0%,transparent 70%); opacity:.08;
  }
  .mt-results-emoji  { font-size:3rem; margin-bottom:12px; position:relative; }
  .mt-results-title  { font-family:'Playfair Display',serif; font-size:1.6rem; color:white; margin-bottom:4px; position:relative; }
  .mt-results-test   { font-size:.82rem; color:rgba(255,255,255,.45); position:relative; }
  .mt-results-score-ring {
    margin:24px auto 0; width:120px; height:120px; position:relative;
  }
  .mt-results-score-val {
    position:absolute; inset:0; display:flex; flex-direction:column;
    align-items:center; justify-content:center;
  }
  .mt-results-score-num  { font-family:'Playfair Display',serif; font-size:2rem; color:white; line-height:1; }
  .mt-results-score-pct  { font-size:.68rem; color:rgba(255,255,255,.45); letter-spacing:.06em; }

  /* Stats row */
  .mt-results-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:20px; }
  .mt-results-stat  { background:white; border-radius:12px; padding:18px; box-shadow:var(--shadow); border:1px solid var(--paper-3); text-align:center; }
  .mt-results-stat-val   { font-family:'Playfair Display',serif; font-size:1.8rem; line-height:1; margin-bottom:4px; }
  .mt-results-stat-label { font-size:.7rem; color:var(--ink-3); font-weight:600; text-transform:uppercase; letter-spacing:.06em; }

  /* Pass / Fail banner */
  .mt-verdict {
    border-radius:10px; padding:14px 20px; margin-bottom:20px;
    display:flex; align-items:center; gap:12px; border:1.5px solid transparent;
  }
  .mt-verdict-pass { background:#f0fdf4; border-color:#bbf7d0; }
  .mt-verdict-fail { background:#fef2f2; border-color:#fecaca; }
  .mt-verdict-icon  { font-size:1.3rem; }
  .mt-verdict-text  { font-weight:700; font-size:.9rem; }
  .mt-verdict-pass .mt-verdict-text { color:#166534; }
  .mt-verdict-fail .mt-verdict-text { color:#991b1b; }
  .mt-verdict-sub   { font-size:.75rem; margin-top:1px; }
  .mt-verdict-pass .mt-verdict-sub { color:#4ade80; }
  .mt-verdict-fail .mt-verdict-sub { color:#f87171; }

  /* Answer review */
  .mt-review { background:white; border-radius:var(--radius); box-shadow:var(--shadow); border:1px solid var(--paper-3); overflow:hidden; margin-bottom:24px; }
  .mt-review-head { padding:16px 24px; border-bottom:1px solid var(--paper-2); background:var(--paper); display:flex; align-items:center; justify-content:space-between; }
  .mt-review-title { font-family:'Playfair Display',serif; font-size:1rem; color:var(--ink); }
  .mt-review-list  { max-height:600px; overflow-y:auto; }
  .mt-review-item  { padding:18px 24px; border-bottom:1px solid var(--paper-2); }
  .mt-review-item:last-child { border-bottom:none; }
  .mt-review-item-head { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; margin-bottom:10px; }
  .mt-review-q     { font-size:.88rem; color:var(--ink); font-weight:500; line-height:1.5; flex:1; }
  .mt-review-topic { font-size:.65rem; background:var(--paper); color:var(--ink-3); padding:2px 8px; border-radius:4px; margin-top:4px; display:inline-block; }
  .mt-review-status {
    flex-shrink:0; padding:4px 12px; border-radius:6px; font-size:.72rem; font-weight:700;
  }
  .mt-review-status.correct   { background:#d1fae5; color:#065f46; }
  .mt-review-status.incorrect { background:#fee2e2; color:#991b1b; }
  .mt-review-status.skipped   { background:var(--paper-2); color:var(--ink-3); }
  .mt-review-answers { display:flex; gap:16px; margin-bottom:8px; font-size:.78rem; flex-wrap:wrap; }
  .mt-review-explanation {
    background:var(--paper); border-left:3px solid var(--gold);
    padding:10px 14px; border-radius:6px; font-size:.78rem; color:var(--ink-2); line-height:1.5;
  }
  .mt-review-explanation-label { font-weight:700; color:var(--gold); margin-bottom:3px; font-size:.7rem; text-transform:uppercase; letter-spacing:.05em; }

  /* Result actions */
  .mt-results-actions { display:flex; gap:12px; flex-wrap:wrap; }
  .mt-results-back {
    padding:12px 24px; border-radius:10px; border:1.5px solid var(--paper-3);
    background:white; color:var(--ink-2); font-size:.85rem; font-weight:600;
    cursor:pointer; font-family:'DM Sans',sans-serif; transition:all .15s;
  }
  .mt-results-back:hover { border-color:var(--ink); color:var(--ink); }
  .mt-results-dash {
    flex:1; padding:12px 24px; border-radius:10px; border:none;
    background:var(--ink); color:white; font-size:.85rem; font-weight:700;
    cursor:pointer; font-family:'DM Sans',sans-serif; transition:all .15s;
  }
  .mt-results-dash:hover { background:var(--gold); }
  .mt-results-download {
    padding:12px 24px; border-radius:10px; border:1.5px solid var(--emerald);
    background:white; color:var(--emerald); font-size:.85rem; font-weight:600;
    cursor:pointer; font-family:'DM Sans',sans-serif; transition:all .15s; display:flex; align-items:center; gap:8px;
  }
  .mt-results-download:hover { background:var(--emerald); color:white; }

  /* ── Scrollbar ── */
  ::-webkit-scrollbar      { width:4px; }
  ::-webkit-scrollbar-thumb{ background:var(--paper-3); border-radius:99px; }

  /* ── Responsive ── */
  @media (max-width:1024px){ .mt-stats{grid-template-columns:repeat(2,1fr);} }
  @media (max-width:768px){
    .mt-sidebar{ transform:translateX(-100%); }
    .mt-main{ margin-left:0; }
    .mt-hamburger{ display:flex; }
    .mt-topbar{ padding:0 18px; }
    .mt-content{ padding:20px 18px; }
    .mt-page-header{ padding:20px 18px; }
    .mt-stats{ grid-template-columns:repeat(2,1fr); }
    .mt-results-stats{ grid-template-columns:1fr 1fr 1fr; }
    .mt-test-panel{ width:220px; }
    .mt-test-main{ margin-left:220px; }
    .mt-test-topbar{ padding:0 16px; }
    .mt-question-area{ padding:16px; }
    .mt-test-nav{ padding:12px 16px; }
  }
  @media (max-width:600px){
    .mt-test-panel{ display:none; }
    .mt-test-main{ margin-left:0; }
    .mt-results-stats{ grid-template-columns:1fr 1fr; }
    .mt-instr-grid{ grid-template-columns:1fr 1fr; }
  }
`;

/* ─── Helpers ───────────────────────────────────────────────────── */
function getScoreColor(score) {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#f59e0b';
  if (score >= 40) return '#3b82f6';
  return '#ef4444';
}
function normalizeExamType(examType) {
  const type = examType?.toLowerCase();
  if (['prelims', 'mains', 'mains-descriptive', 'current-affairs'].includes(type)) return 'upsc';
  return type || 'upsc';
}
function getBandColor(examType) {
  const map = {
    upsc: '#3b82f6',
    nda: '#10b981',
    cds: '#8b5cf6',
    afcat: '#f59e0b',
  };
  return map[normalizeExamType(examType)] || '#c9a84c';
}
function getExamLabel(examType) {
  const match = EXAM_FILTERS.find(f => f.id === normalizeExamType(examType));
  return match?.label || examType || 'Defence';
}
function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function printResultsAsPDF(results, displayName) {
  const r = results;
  const date = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  
  let answersHTML = '';
  r.answers.forEach((ans, i) => {
    const status = ans.isUnanswered ? 'Skipped' : ans.isCorrect ? 'Correct' : 'Wrong';
    const statusColor = ans.isUnanswered ? '#6b7280' : ans.isCorrect ? '#059669' : '#dc2626';
    answersHTML += `
      <div style="page-break-inside: avoid; margin-bottom: 20px; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <div style="font-weight: bold; margin-bottom: 8px;">Q${i + 1}. ${ans.question}</div>
        <div style="color: ${statusColor}; font-weight: 600; margin-bottom: 8px;">Status: ${status}</div>
        ${!ans.isUnanswered ? `<div style="margin-bottom: 4px;">Your Answer: <strong>${String.fromCharCode(65 + ans.userAnswer)}</strong></div>` : ''}
        ${!ans.isCorrect && !ans.isUnanswered ? `<div style="margin-bottom: 8px;">Correct Answer: <strong>${String.fromCharCode(65 + ans.correctAnswer)}</strong></div>` : ''}
        ${ans.explanation ? `<div style="background: #fefce8; padding: 10px; border-radius: 4px; font-size: 12px;"><strong>Explanation:</strong> ${ans.explanation}</div>` : ''}
      </div>
    `;
  });

  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Test Result - ${r.testTitle}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
        h1 { color: #0f1923; border-bottom: 2px solid #c9a84c; padding-bottom: 10px; }
        .score-card { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .score-value { font-size: 48px; font-weight: bold; color: ${r.score >= 40 ? '#059669' : '#dc2626'}; }
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0; }
        .stat { background: white; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #e5e7eb; }
        .stat-val { font-size: 24px; font-weight: bold; }
        .stat-label { font-size: 12px; color: #6b7280; text-transform: uppercase; }
        @media print {
          body { padding: 20px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <h1>📝 Mock Test Result</h1>
      <p><strong>Aspirant:</strong> ${displayName}</p>
      <p><strong>Test:</strong> ${r.testTitle}</p>
      <p><strong>Date:</strong> ${date}</p>
      
      <div class="score-card" style="text-align: center;">
        <div class="score-value">${r.score}%</div>
        <div>Score</div>
      </div>
      
      <div class="stats-grid">
        <div class="stat"><div class="stat-val" style="color: #059669;">${r.correct}</div><div class="stat-label">Correct</div></div>
        <div class="stat"><div class="stat-val" style="color: #dc2626;">${r.incorrect}</div><div class="stat-label">Incorrect</div></div>
        <div class="stat"><div class="stat-val" style="color: #6b7280;">${r.totalUnanswered}</div><div class="stat-label">Skipped</div></div>
      </div>
      
      <div class="stats-grid">
        <div class="stat"><div class="stat-val">${formatTime(r.timeTaken)}</div><div class="stat-label">Time Taken</div></div>
        <div class="stat"><div class="stat-val">${r.rawScore}</div><div class="stat-label">Raw Score</div></div>
        <div class="stat"><div class="stat-val" style="color: #dc2626;">-${r.negativeMarks}</div><div class="stat-label">Negative</div></div>
      </div>
      
      <h2 style="margin-top: 30px;">Answer Review</h2>
      ${answersHTML}
      
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
        Generated by NotesCafe - UPSC & Defence Exam Preparation Platform
      </div>
      
      <button class="no-print" onclick="window.print()" style="position: fixed; top: 20px; right: 20px; padding: 12px 24px; background: #0f1923; color: white; border: none; border-radius: 8px; cursor: pointer;">
        🖨️ Print / Save as PDF
      </button>
    </body>
    </html>
  `);
  printWindow.document.close();
}

/* ─── Main Component ─────────────────────────────────────────────── */
export default function MockTestsModule() {
  const router = useRouter();
  const { user, authLoading, logout } = useAuth();

  // ── All state ──
  const [sidebarOpen,          setSidebarOpen]          = useState(false);
  const [mockTests,            setMockTests]            = useState([]);
  const [userAttempts,         setUserAttempts]         = useState([]);
  const [filteredTests,        setFilteredTests]        = useState([]);
  const [filterExam,           setFilterExam]           = useState('all');
  const [filterSubject,        setFilterSubject]        = useState('all');
  const [filterDifficulty,     setFilterDifficulty]     = useState('all');
  const [testsLoading,         setTestsLoading]         = useState(true);
  const [profile,              setProfile]              = useState(null);

  const [selectedTest,         setSelectedTest]         = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers,              setAnswers]              = useState({});
  const [descriptiveAnswers,   setDescriptiveAnswers]   = useState({}); // For descriptive tests
  const [markedQuestions,      setMarkedQuestions]      = useState(new Set());
  const [timeRemaining,        setTimeRemaining]        = useState(0);
  const [testStarted,          setTestStarted]          = useState(false);
  const [testCompleted,        setTestCompleted]        = useState(false);
  const [showInstructions,     setShowInstructions]     = useState(false);
  const [testResults,          setTestResults]          = useState(null);
  const [showResults,          setShowResults]          = useState(false);
  const [isDescriptiveTest,    setIsDescriptiveTest]    = useState(false);

  // ── Refs for stale-closure-safe callbacks ──
  const timerRef          = useRef(null);
  const answersRef        = useRef({});
  const timeRemainingRef  = useRef(0);
  const selectedTestRef   = useRef(null);
  const userRef           = useRef(null);

  useEffect(() => { answersRef.current       = answers;       }, [answers]);
  useEffect(() => { timeRemainingRef.current = timeRemaining; }, [timeRemaining]);
  useEffect(() => { selectedTestRef.current  = selectedTest;  }, [selectedTest]);
  useEffect(() => { userRef.current          = user;          }, [user]);

  /* ── Auth guard ── */
  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [user, authLoading, router]);

  /* ── Fetch user profile ── */
  useEffect(() => {
    if (!user?.uid) return;
    const fetchProfile = async () => {
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };
    fetchProfile();
  }, [user?.uid]);

  /* Derived values */
  const displayName = profile?.fullName || profile?.name || user?.email?.split('@')[0] || 'Aspirant';

  /* ── Load mock tests ── */
  useEffect(() => {
    if (!user) return;
    setTestsLoading(true);
    const q = query(collection(db, 'mockTests'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      const tests = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setMockTests(tests);
      setFilteredTests(tests);
      setTestsLoading(false);
    });
    return () => unsub();
  }, [user]);

  /* ── Load attempts ── */
  useEffect(() => {
    if (!user) return;
    // Simple query without orderBy to avoid index issues
    const unsub = onSnapshot(
      collection(db, 'users', user.uid, 'mockTestAttempts'), 
      snap => {
        const attempts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        // Sort by completedAt locally
        attempts.sort((a, b) => {
          const aTime = a.completedAt?.toDate?.()?.getTime() || 0;
          const bTime = b.completedAt?.toDate?.()?.getTime() || 0;
          return bTime - aTime;
        });
        setUserAttempts(attempts);
      }
    );
    return () => unsub();
  }, [user]);

  /* ── Filter ── */
  useEffect(() => {
    let filtered = mockTests;
    
    // Filter by exam type
    if (filterExam !== 'all') {
      filtered = filtered.filter(t => normalizeExamType(t.examType) === filterExam);
    }
    
    // Filter by subject (check if any question in the test has the subject)
    if (filterSubject !== 'all') {
      filtered = filtered.filter(t => 
        t.questions?.some(q => q.subject === filterSubject)
      );
    }
    
    // Filter by difficulty (check if any question in the test has the difficulty)
    if (filterDifficulty !== 'all') {
      filtered = filtered.filter(t => 
        t.questions?.some(q => q.difficulty === filterDifficulty)
      );
    }
    
    setFilteredTests(filtered);
  }, [filterExam, filterSubject, filterDifficulty, mockTests]);

 /* ───────────── SUBMIT FUNCTION ───────────── */

const handleTestSubmit = useCallback(async () => {

  const currentTest = selectedTestRef.current;
  const currentUser = userRef.current;
  const currentAnswers = answersRef.current;
  const currentTimeLeft = timeRemainingRef.current;

  if (!currentTest || !currentUser) return;

  setTestCompleted(true);

  if (timerRef.current) {
    clearInterval(timerRef.current);
    timerRef.current = null;
  }

  const questions = currentTest.questions || [];

  let correct = 0;
  let negativeMarks = 0;

  const detailedResults = questions.map((q, i) => {

    const qid = q.id ?? i;
    const userAnswer = currentAnswers[qid];

    const answered = userAnswer !== undefined;
    const isCorrect = answered && userAnswer === q.correctAnswer;

    if (isCorrect) correct++;
    else if (answered && q.negativeMarking) negativeMarks += 0.33;

    return {
      questionId: qid,
      question: q.question || "",
      userAnswer: answered ? userAnswer : null,
      correctAnswer: q.correctAnswer ?? 0,
      isCorrect,
      isUnanswered: !answered,
      explanation: q.explanation || "",
      topic: q.topic || "General"
    };

  });

  const totalQuestions = questions.length;
  const answeredCount = Object.keys(currentAnswers).length;

  const rawScore = correct - negativeMarks;

  const score = Math.max(
    0,
    Math.round((rawScore / totalQuestions) * 100)
  );

  const timeTaken =
    (currentTest.duration || 60) * 60 - currentTimeLeft;

  const results = {
    testId: currentTest.id,
    testTitle: currentTest.title,
    examType: currentTest.examType || "defence",

    score,
    correct,
    incorrect: answeredCount - correct,

    total: totalQuestions,
    totalAnswered: answeredCount,
    totalUnanswered: totalQuestions - answeredCount,

    rawScore: rawScore.toFixed(2),
    negativeMarks: negativeMarks.toFixed(2),

    timeTaken,
    timeLimit: currentTest.duration || 60,

    answers: detailedResults,
    completedAt: serverTimestamp()
  };

  try {

    const cleanResults = JSON.parse(
      JSON.stringify(results, (k,v) => v === undefined ? null : v)
    );

    await addDoc(
      collection(db, "users", currentUser.uid, "mockTestAttempts"),
      cleanResults
    );

    setTestResults(cleanResults);
    setShowResults(true);

  } catch (err) {

    console.error("Error saving test results:", err);
    alert("Error saving results. Please try again.");

  }

}, []);

/* ───────────── TIMER ───────────── */

useEffect(() => {
  if (!testStarted || testCompleted) return;

  timerRef.current = setInterval(() => {

    setTimeRemaining(prev => {

      if (prev <= 1) {
        clearInterval(timerRef.current);
        setTimeout(() => handleTestSubmit(), 0);
        return 0;
      }

      return prev - 1;

    });

  }, 1000);

  return () => clearInterval(timerRef.current);

}, [testStarted, testCompleted, handleTestSubmit]);

  /* ── Actions ── */
  const startTest = t => { 
    setSelectedTest(t); 
    setIsDescriptiveTest(t.testMode === 'descriptive' || t.examType === 'descriptive');
    setShowInstructions(true); 
  };
  const confirmStart = () => {
    setCurrentQuestionIndex(0); setAnswers({}); setDescriptiveAnswers({}); setMarkedQuestions(new Set());
    setTimeRemaining(selectedTest.duration * 60); setTestCompleted(false);
    setShowResults(false); setTestStarted(true); setShowInstructions(false);
  };
  const resetTest = () => {
    setSelectedTest(null); setTestStarted(false); setTestCompleted(false);
    setShowResults(false); setTestResults(null); setAnswers({});
    setDescriptiveAnswers({}); setMarkedQuestions(new Set()); setCurrentQuestionIndex(0);
    setIsDescriptiveTest(false);
  };
  const handleAnswerSelect  = (qid, ans) => setAnswers(p => ({ ...p, [qid]: ans }));
  const handleDescriptiveAnswer = (qid, ans) => setDescriptiveAnswers(p => ({ ...p, [qid]: ans }));
  const handleMarkQuestion  = qid => setMarkedQuestions(p => {
    const s = new Set(p); s.has(qid) ? s.delete(qid) : s.add(qid); return s;
  });
  const handleLogout = async () => { try { await logout(); router.push('/login'); } catch {} };

  if (authLoading || !user) return null;

  /* ── Derived stats ── */
  const totalAttempts = userAttempts.length;
  const avgScore      = totalAttempts > 0
    ? Math.round(userAttempts.reduce((s, a) => s + (a.score || 0), 0) / totalAttempts) : 0;
  const bestScore     = totalAttempts > 0 ? Math.max(...userAttempts.map(a => a.score || 0)) : 0;
  const dateStr       = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  /* ══════════════════════════════════════════════════════════════
     INSTRUCTIONS MODAL
  ══════════════════════════════════════════════════════════════ */
  if (showInstructions && selectedTest) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: css }} />
        <div className="mt-modal-overlay">
          <div className="mt-modal">
            <div className="mt-modal-head">
              <div className="mt-modal-head-accent" />
              <div className="mt-modal-head-title">◷ Test Instructions</div>
              <div className="mt-modal-head-sub">{selectedTest.title}</div>
            </div>
            <div className="mt-modal-body">
              <div className="mt-instr-grid">
                {[
                  { label: 'Questions',  val: selectedTest.questions?.length || 0 },
                  { label: 'Duration',   val: `${selectedTest.duration} min`       },
                  { label: 'Exam',       val: getExamLabel(selectedTest.examType)   },
                  { label: 'Marking',    val: selectedTest.markingScheme || '+1 / -0.33' },
                ].map(c => (
                  <div key={c.label} className="mt-instr-cell">
                    <div className="mt-instr-cell-label">{c.label}</div>
                    <div className="mt-instr-cell-val">{c.val}</div>
                  </div>
                ))}
              </div>
              <div className="mt-instr-rules">
                <div className="mt-instr-rules-title">⚡ Before you begin</div>
                {[
                  'Do not refresh or close the browser tab during the test.',
                  'Negative marking applies if enabled for this test.',
                  'Mark questions for review to revisit them later.',
                  'Test will auto-submit when the timer reaches zero.',
                  'Unanswered questions carry no penalty.',
                ].map((r, i) => (
                  <div key={i} className="mt-instr-rule">
                    <div className="mt-instr-rule-dot" />
                    {r}
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-modal-foot">
              <button className="mt-btn-cancel" onClick={() => { setShowInstructions(false); setSelectedTest(null); }}>Cancel</button>
              <button className="mt-btn-start"  onClick={confirmStart}>Start Test →</button>
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ══════════════════════════════════════════════════════════════
     TEST INTERFACE
  ══════════════════════════════════════════════════════════════ */
  if (testStarted && !showResults) {
    const currentQ  = selectedTest.questions[currentQuestionIndex];
    const qid = currentQ?.id ?? currentQuestionIndex;
    const isMarked  = markedQuestions.has(qid);
    // For descriptive tests, count descriptive answers; for MCQ, count MCQ answers
    const answered  = isDescriptiveTest 
      ? Object.keys(descriptiveAnswers).filter(k => descriptiveAnswers[k]?.trim()).length
      : Object.keys(answers).length;
    const total     = selectedTest.questions.length;
    const pct       = Math.round((answered / total) * 100);
    const timerClass = timeRemaining < 60 ? 'danger' : timeRemaining < 300 ? 'warning' : '';

    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: css }} />
        <div className="mt-test-wrap">

          {/* Left Panel */}
          <div className="mt-test-panel">
            <div className="mt-test-panel-head">
              <div className="mt-test-panel-name">{selectedTest.title}</div>
              <div className={`mt-timer ${timerClass}`}>{formatTime(timeRemaining)}</div>
              <div className="mt-timer-label">Time Remaining</div>
            </div>
            <div className="mt-test-counters">
              {[
                { label: isDescriptiveTest ? 'Attempted' : 'Answered', val: answered, color: '#10b981' },
                { label: isDescriptiveTest ? 'Pending' : 'Unanswered',  val: total - answered, color: '#ef4444' },
                { label: 'Marked',      val: markedQuestions.size,            color: '#f59e0b' },
              ].map(c => (
                <div key={c.label} className="mt-counter-row">
                  <span className="mt-counter-label">{c.label}</span>
                  <span className="mt-counter-val" style={{ color: c.color }}>{c.val}</span>
                </div>
              ))}
            </div>
            <div className="mt-qgrid-wrap">
              <div className="mt-qgrid-label">Questions</div>
              <div className="mt-qgrid">
                {selectedTest.questions.map((q, i) => {
                  const questionId = q.id ?? i;
                  const isAnswered = isDescriptiveTest 
                    ? descriptiveAnswers[questionId]?.trim() 
                    : answers[questionId] !== undefined;
                  const cls = i === currentQuestionIndex ? 'current'
                    : markedQuestions.has(questionId) ? 'marked'
                    : isAnswered ? 'answered'
                    : 'default';
                  return (
                    <button key={i} className={`mt-qbtn ${cls}`}
                      onClick={() => setCurrentQuestionIndex(i)}>{i + 1}</button>
                  );
                })}
              </div>
            </div>
            <button className="mt-test-exit-btn"
              onClick={() => { if (window.confirm('Exit and submit?')) handleTestSubmit(); }}>
              ⎋ Exit & Submit
            </button>
          </div>

          {/* Main */}
          <div className="mt-test-main">
            <div className="mt-test-topbar">
              <div>
                <div className="mt-test-qcount">Question {currentQuestionIndex + 1} <span style={{ color: 'var(--ink-3)', fontFamily: 'DM Sans', fontWeight: 400, fontSize: '.85rem' }}>of {total}</span></div>
                <div className="mt-test-qsub">{selectedTest.title}</div>
              </div>
              <div className="mt-test-progress">
                <div className="mt-test-progress-bar">
                  <div className="mt-test-progress-fill" style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-test-progress-label">
                  {isDescriptiveTest ? 'Attempted' : 'Answered'}: {answered}/{total}
                </div>
              </div>
            </div>

            <div className="mt-question-area">
              {isDescriptiveTest ? (
                // Descriptive Test Interface
                <div className="mt-question-card">
                  <div className="mt-question-num">Question {currentQuestionIndex + 1}</div>
                  <div className="mt-question-tags">
                    {currentQ.subject && (
                      <span className="mt-question-tag mt-question-tag-subject">{currentQ.subject.replace(/_/g, ' ')}</span>
                    )}
                    {currentQ.difficulty && (
                      <span className="mt-question-tag mt-question-tag-difficulty">{currentQ.difficulty}</span>
                    )}
                    {currentQ.source && (
                      <span className="mt-question-tag mt-question-tag-source">{currentQ.source}</span>
                    )}
                  </div>
                  <div className="mt-question-text">{currentQ.question}</div>
                  <div style={{ marginTop: 16 }}>
                    <textarea
                      className="mt-descriptive-answer"
                      placeholder="Write your answer here..."
                      value={descriptiveAnswers[qid] || ''}
                      onChange={(e) => handleDescriptiveAnswer(qid, e.target.value)}
                    />
                    <div className={`mt-word-count ${(descriptiveAnswers[qid] || '').split(/\s+/).filter(Boolean).length < 100 ? 'warning' : ''}`}>
                      Word Count: {(descriptiveAnswers[qid] || '').split(/\s+/).filter(Boolean).length} words
                    </div>
                  </div>
                </div>
              ) : (
                // MCQ Test Interface
                <div className="mt-question-card">
                  <div className="mt-question-num">Question {currentQuestionIndex + 1}</div>
                  <div className="mt-question-tags">
                    {currentQ.subject && (
                      <span className="mt-question-tag mt-question-tag-subject">{currentQ.subject.replace(/_/g, ' ')}</span>
                    )}
                    {currentQ.difficulty && (
                      <span className="mt-question-tag mt-question-tag-difficulty">{currentQ.difficulty}</span>
                    )}
                    {currentQ.source && (
                      <span className="mt-question-tag mt-question-tag-source">{currentQ.source}</span>
                    )}
                  </div>
                  <div className="mt-question-text">{currentQ.question}</div>
                  <div className="mt-options">
                    {currentQ.options.map((opt, i) => (
                      <button key={i}
                        className={`mt-option ${answers[qid] === i ? 'selected' : ''}`}
                        onClick={() => handleAnswerSelect(qid, i)}>
                        <span className="mt-option-key">{String.fromCharCode(65 + i)}</span>
                        <span className="mt-option-text">{opt}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-test-nav">
              <button className="mt-nav-btn"
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex(i => i - 1)}>← Prev</button>

              <button className={`mt-nav-btn mark ${isMarked ? 'active' : ''}`}
                onClick={() => handleMarkQuestion(qid)}>
                {isMarked ? '🔖 Marked' : '☐ Mark'}
              </button>

              {currentQuestionIndex === total - 1 ? (
                <button className="mt-nav-btn submit"
                  onClick={() => { if (window.confirm('Submit test? This cannot be undone.')) handleTestSubmit(); }}>
                  ✓ Submit Test
                </button>
              ) : (
                <button className="mt-nav-btn primary"
                  onClick={() => setCurrentQuestionIndex(i => i + 1)}>Next →</button>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ══════════════════════════════════════════════════════════════
     RESULTS PAGE
  ══════════════════════════════════════════════════════════════ */
  if (showResults && testResults) {
    const isPassed = testResults.score >= 40;
    const emoji    = testResults.score >= 80 ? '🎉' : testResults.score >= 60 ? '👍' : testResults.score >= 40 ? '💪' : '📚';
    const scoreColor = getScoreColor(testResults.score);
    const r = testResults;

    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: css }} />
        <div className="mt-results-wrap mt-animate">

          {/* Hero */}
          <div className="mt-results-hero">
            <div className="mt-results-hero-pattern" />
            <div className="mt-results-hero-glow" />
            <div className="mt-results-emoji">{emoji}</div>
            <div className="mt-results-title">Test Completed!</div>
            <div className="mt-results-test">{r.testTitle}</div>
            {/* Score ring */}
            <div style={{ margin: '24px auto 0', width: 120, height: 120, position: 'relative' }}>
              <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="10" />
                <circle cx="60" cy="60" r="50" fill="none"
                  stroke={scoreColor} strokeWidth="10"
                  strokeDasharray={`${2 * Math.PI * 50}`}
                  strokeDashoffset={`${2 * Math.PI * 50 * (1 - r.score / 100)}`}
                  strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', color: 'white', lineHeight: 1 }}>{r.score}%</span>
                <span style={{ fontSize: '.65rem', color: 'rgba(255,255,255,.4)', letterSpacing: '.06em' }}>SCORE</span>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-results-stats mt-animate mt-delay-1">
            {[
              { label: 'Correct',       val: r.correct,           color: '#10b981' },
              { label: 'Incorrect',     val: r.incorrect,         color: '#ef4444' },
              { label: 'Not Attempted', val: r.totalUnanswered,   color: 'var(--ink-3)' },
              { label: 'Time Taken',    val: formatTime(r.timeTaken), color: '#f59e0b' },
              { label: 'Raw Score',     val: r.rawScore,          color: 'var(--sapphire)' },
              { label: 'Negative Marks',val: `-${r.negativeMarks}`,color: '#ef4444' },
            ].map((s, i) => (
              <div key={i} className="mt-results-stat">
                <div className="mt-results-stat-val" style={{ color: s.color }}>{s.val}</div>
                <div className="mt-results-stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Verdict */}
          <div className={`mt-verdict ${isPassed ? 'mt-verdict-pass' : 'mt-verdict-fail'} mt-animate mt-delay-2`}>
            <span className="mt-verdict-icon">{isPassed ? '✓' : '✕'}</span>
            <div>
              <div className="mt-verdict-text">{isPassed ? 'You Passed! — Cut-off: 40%' : 'Below Cut-off — Keep Practicing!'}</div>
              <div className="mt-verdict-sub">{isPassed ? 'Great work. Review your incorrect answers below.' : 'Study the explanations below to improve your score.'}</div>
            </div>
          </div>

          {/* Answer review */}
          <div className="mt-review mt-animate mt-delay-3">
            <div className="mt-review-head">
              <span className="mt-review-title">Answer Review</span>
              <span style={{ fontSize: '.75rem', color: 'var(--ink-3)' }}>{r.total} questions</span>
            </div>
            <div className="mt-review-list">
              {r.answers.map((ans, i) => (
                <div key={i} className="mt-review-item">
                  <div className="mt-review-item-head">
                    <div>
                      <div className="mt-review-q">Q{i + 1}: {ans.question}</div>
                      <span className="mt-review-topic">{ans.topic}</span>
                    </div>
                    <span className={`mt-review-status ${ans.isUnanswered ? 'skipped' : ans.isCorrect ? 'correct' : 'incorrect'}`}>
                      {ans.isUnanswered ? 'Skipped' : ans.isCorrect ? '✓ Correct' : '✕ Wrong'}
                    </span>
                  </div>
                  {!ans.isUnanswered && (
                    <div className="mt-review-answers">
                      <span>Your answer: <strong style={{ color: ans.isCorrect ? '#10b981' : '#ef4444' }}>{String.fromCharCode(65 + ans.userAnswer)}</strong></span>
                      {!ans.isCorrect && <span>Correct: <strong style={{ color: '#10b981' }}>{String.fromCharCode(65 + ans.correctAnswer)}</strong></span>}
                    </div>
                  )}
                  {ans.explanation && (
                    <div className="mt-review-explanation">
                      <div className="mt-review-explanation-label">💡 Explanation</div>
                      {ans.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-results-actions">
            <button className="mt-results-back" onClick={resetTest}>← Back to Tests</button>
            <button className="mt-results-download" onClick={() => printResultsAsPDF(testResults, displayName)}>📥 Download / Print PDF</button>
            <button className="mt-results-dash" onClick={() => router.push('/student-desk/dashboard')}>Dashboard →</button>
          </div>
        </div>
      </>
    );
  }

  /* ══════════════════════════════════════════════════════════════
     MAIN TEST LISTING
  ══════════════════════════════════════════════════════════════ */
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="mt-layout">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onLogout={handleLogout} />

        <main className="mt-main">
          {/* Topbar */}
          <header className="mt-topbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <button className="mt-hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
              <div>
                <div className="mt-topbar-title">Mock Tests</div>
                <div className="mt-topbar-date">{dateStr}</div>
              </div>
            </div>
            <div className="mt-avatar">{displayName[0]?.toUpperCase() || 'U'}</div>
          </header>

          <div className="mt-content">

            {/* Page header */}
            <div className="mt-page-header mt-animate">
              <div className="mt-ph-pattern" /><div className="mt-ph-accent" />
              <div className="mt-ph-left">
                <h1 className="mt-ph-title">◷ Defence Mock Test Series</h1>
                <p className="mt-ph-sub">Practice UPSC, NDA, CDS, and AFCAT tests under exam-like conditions.</p>
              </div>
              <div className="mt-ph-right">
                <span style={{ fontSize: '.82rem', color: 'rgba(255,255,255,.5)' }}>{mockTests.length} tests available</span>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-stats mt-animate mt-delay-1">
              {[
                { label: 'Tests Available', val: mockTests.length,  fill: '#3b82f6', pct: 100 },
                { label: 'Attempts Made',   val: totalAttempts,     fill: '#c9a84c', pct: 100 },
                { label: 'Average Score',   val: `${avgScore}%`,    fill: getScoreColor(avgScore), pct: avgScore },
                { label: 'Best Score',      val: `${bestScore}%`,   fill: getScoreColor(bestScore), pct: bestScore },
              ].map(s => (
                <div key={s.label} className="mt-stat-card">
                  <div className="mt-stat-val">
                    {testsLoading ? <span className="mt-skeleton" style={{ width: 40, height: 28, display: 'inline-block' }} /> : s.val}
                  </div>
                  <div className="mt-stat-label">{s.label}</div>
                  <div className="mt-stat-bar">
                    <div className="mt-stat-fill" style={{ width: `${s.pct}%`, background: s.fill }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="mt-filters mt-animate mt-delay-2">
              {EXAM_FILTERS.map(f => (
                <button key={f.id} className={`mt-filter-btn ${filterExam === f.id ? 'active' : ''}`}
                  onClick={() => setFilterExam(f.id)}>{f.label}</button>
              ))}
              <div className="mt-filters-divider" />
              <select className="mt-filter-select" value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}>
                {SUBJECT_FILTERS.map(f => (
                  <option key={f.id} value={f.id}>{f.label}</option>
                ))}
              </select>
              <select className="mt-filter-select" value={filterDifficulty} onChange={(e) => setFilterDifficulty(e.target.value)}>
                {DIFFICULTY_FILTERS.map(f => (
                  <option key={f.id} value={f.id}>{f.label}</option>
                ))}
              </select>
            </div>

            {/* Cards */}
            <div className="mt-cards mt-animate mt-delay-3">
              {testsLoading ? (
                [1,2,3].map(i => (
                  <div key={i} className="mt-card">
                    <span className="mt-skeleton" style={{ height: 5 }} />
                    <div className="mt-card-body" style={{ gap: 10 }}>
                      <span className="mt-skeleton" style={{ height: 14, width: '40%' }} />
                      <span className="mt-skeleton" style={{ height: 20, width: '80%' }} />
                      <span className="mt-skeleton" style={{ height: 14, width: '60%' }} />
                      <span className="mt-skeleton" style={{ height: 60, marginTop: 8 }} />
                      <span className="mt-skeleton" style={{ height: 42, marginTop: 8 }} />
                    </div>
                  </div>
                ))
              ) : filteredTests.length === 0 ? (
                <div className="mt-empty">
                  <div className="mt-empty-icon">◷</div>
                  <div className="mt-empty-title">No Tests Available</div>
                  <div className="mt-empty-sub">Check back later for new tests in this category.</div>
                </div>
              ) : filteredTests.map(test => {
                const attempts  = userAttempts.filter(a => a.testId === test.id);
                const best      = attempts.length > 0 ? Math.max(...attempts.map(a => a.score)) : null;
                const bandColor = getBandColor(test.examType);
                const canStart  = !!test.questions?.length;
                
                // Get unique subjects in this test
                const subjects = [...new Set(test.questions?.map(q => q.subject).filter(Boolean) || [])];
                // Check if any question is from PYQ
                const hasPYQ = test.questions?.some(q => q.source?.toLowerCase().includes('pyq'));
                return (
                  <div key={test.id} className="mt-card">
                    <div className="mt-card-band" style={{ background: bandColor }} />
                    <div className="mt-card-body">
                      <div className="mt-card-type" style={{ color: bandColor }}>{getExamLabel(test.examType)}</div>
                      <div className="mt-card-title">{test.title}</div>
                      <div className="mt-card-desc">{test.description || 'Practice test for defence exam preparation'}</div>
                      <div className="mt-card-meta">
                        <span className="mt-card-badge">✎ {test.questions?.length || 0} Qs</span>
                        <span className="mt-card-badge">◷ {test.duration} min</span>
                        {hasPYQ && <span className="mt-card-badge" style={{ background: '#fef3c7', color: '#92400e', borderColor: '#fcd34d' }}>📚 PYQ</span>}
                        {attempts.length > 0 && <span className="mt-card-badge">↺ {attempts.length} attempt{attempts.length > 1 ? 's' : ''}</span>}
                      </div>
                      {/* Subject badges */}
                      {subjects.length > 0 && (
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                          {subjects.slice(0, 3).map(sub => (
                            <span key={sub} style={{ fontSize: '.65rem', padding: '2px 8px', borderRadius: 4, background: 'var(--paper-2)', color: 'var(--ink-3)', textTransform: 'capitalize' }}>
                              {sub.replace(/_/g, ' ')}
                            </span>
                          ))}
                          {subjects.length > 3 && <span style={{ fontSize: '.65rem', color: 'var(--ink-3)' }}>+{subjects.length - 3}</span>}
                        </div>
                      )}
                      {best !== null && (
                        <div className="mt-card-score"
                          style={{ background: getScoreColor(best) + '12', borderColor: getScoreColor(best) + '30' }}>
                          <div className="mt-card-score-val" style={{ color: getScoreColor(best) }}>{best}%</div>
                          <div className="mt-card-score-label">Best Score</div>
                          <div className="mt-card-score-attempts">{attempts.length} attempt{attempts.length > 1 ? 's' : ''}</div>
                        </div>
                      )}
                      <button className="mt-start-btn" disabled={!canStart}
                        style={{
                          background: canStart ? 'var(--ink)' : 'var(--paper-3)',
                          color: canStart ? 'white' : 'var(--ink-3)',
                          cursor: canStart ? 'pointer' : 'not-allowed',
                        }}
                        onClick={() => canStart && startTest(test)}>
                        {attempts.length > 0 ? '↺ Retake Test' : 'Start Test →'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* History CTA */}
            {userAttempts.length > 0 && (
              <div className="mt-history mt-animate" style={{ padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div className="mt-history-title" style={{ marginBottom: 4 }}>Your Progress</div>
                  <div style={{ fontSize: '.85rem', color: 'var(--ink-3)' }}>
                    {userAttempts.length} tests attempted • Best: {Math.max(...userAttempts.map(a => a.score || 0))}%
                  </div>
                </div>
                <Link href="/student-desk/mock-tests/history" style={{ 
                  padding: '10px 20px', background: 'var(--ink)', color: 'white', 
                  borderRadius: 10, textDecoration: 'none', fontWeight: 600, fontSize: '.85rem' 
                }}>
                  View Full History →
                </Link>
              </div>
            )}

          </div>
        </main>
      </div>
    </>
  );
}
