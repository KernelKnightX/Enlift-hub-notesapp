'use client';

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import Link from "next/link";

import { useAuth } from "../../../contexts/AuthContext";
import { db } from "../../../firebase/config";
import {
  collection, query, where, orderBy, onSnapshot, limit,
  doc, getDoc, setDoc, deleteDoc, serverTimestamp,
} from "firebase/firestore";

import SimplePdfViewer from "../../../components/notes/SimplePdfViewer";

/* ─── Menu Items (dynamic based on current path) ─────────────────────────────────── */
const getMenuItems = (currentPath) => [
  { label: 'Dashboard', icon: '🏠', href: '/student-desk/dashboard', active: currentPath === '/student-desk/dashboard' },
  { label: 'Notes', icon: '📝', href: '/student-desk/notes', active: currentPath === '/student-desk/notes' },
  { label: 'Current Affairs', icon: '📰', href: '/student-desk/current-affairs', active: currentPath === '/student-desk/current-affairs' },
  { label: 'Mock Tests', icon: '📋', href: '/student-desk/mock-tests', active: currentPath === '/student-desk/mock-tests' },
  { label: 'PYQ', icon: '📊', href: '/student-desk/pyq', active: currentPath === '/student-desk/pyq' },
  { label: 'Calendar', icon: '📅', href: '/student-desk/planner', active: currentPath === '/student-desk/planner' },
  { label: 'Syllabus', icon: '📖', href: '/student-desk/syllabus', active: currentPath === '/student-desk/syllabus' },
  { label: 'Profile', icon: '👤', href: '/student-desk/profile', active: currentPath === '/student-desk/profile' },
];

const SUBJECT_COLORS = {
  polity:      { bg: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8", dot: "#3b82f6" },
  economy:     { bg: "#f0fdf4", border: "#bbf7d0", text: "#166534", dot: "#10b981" },
  geography:   { bg: "#fffbeb", border: "#fde68a", text: "#92400e", dot: "#f59e0b" },
  history:     { bg: "#fdf4ff", border: "#e9d5ff", text: "#6b21a8", dot: "#8b5cf6" },
  science:     { bg: "#fff1f2", border: "#fecdd3", text: "#9f1239", dot: "#ef4444" },
  environment: { bg: "#f0fdf4", border: "#bbf7d0", text: "#065f46", dot: "#22c55e" },
  ethics:      { bg: "#fff7ed", border: "#fed7aa", text: "#9a3412", dot: "#f97316" },
  general:     { bg: "#f8f5f0", border: "#e2ddd6", text: "#64748b", dot: "#94a3b8" },
};

function subjectColor(s = "general") {
  return SUBJECT_COLORS[s.toLowerCase()] || SUBJECT_COLORS.general;
}

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
    --radius:     16px;
    --shadow:     0 4px 24px rgba(15,25,35,.08);
    --shadow-lg:  0 12px 40px rgba(15,25,35,.14);
    --sidebar-w:  260px;
  }

  body { font-family: 'DM Sans', sans-serif; background: var(--paper); color: var(--ink); }

  /* ── Layout ── */
  .ns-layout { display: flex; min-height: 100vh; flex-direction: column; }
  .ns-main   { flex: 1; min-width: 0; display: flex; flex-direction: column; height: 100vh; overflow: hidden; }

  /* ── Nav CTA Bar ── */
  .ns-nav-cta {
    background: var(--ink); padding: 8px 20px; display: flex; align-items: center; gap: 4px;
    overflow-x: auto; flex-shrink: 0; height: 52px; justify-content: center; flex-wrap: wrap;
    scrollbar-width: none; border-bottom: 1px solid rgba(255,255,255,0.1);
  }
  .ns-nav-cta::-webkit-scrollbar { display: none; }
  .ns-nav-item {
    display: flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 10px;
    font-size: .8rem; font-weight: 500; cursor: pointer; white-space: nowrap;
    border: 1.5px solid transparent; transition: all .15s; font-family: 'DM Sans', sans-serif;
    background: rgba(255,255,255,.08); color: rgba(255,255,255,.7);
    flex-shrink: 0; text-decoration: none;
  }
  .ns-nav-item:hover  { background: rgba(255,255,255,.15); color: white; }
  .ns-nav-item.active { background: var(--gold); color: var(--ink); border-color: var(--gold); font-weight: 600; }
  .ns-nav-brand {
    font-family: 'Playfair Display', serif; font-size: 1rem; color: white; font-weight: 600;
    margin-right: auto; display: flex; align-items: center; gap: 8px;
  }
  .ns-nav-brand span { color: var(--gold); }
  .ns-user-menu {
    display: flex; align-items: center; gap: 10px; margin-left: auto;
  }
  .ns-user-avatar {
    width: 32px; height: 32px; border-radius: 50%; background: var(--gold); color: var(--ink);
    display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: .8rem;
  }
  .ns-logout-btn {
    padding: 6px 12px; border-radius: 8px; font-size: .7rem; font-weight: 600;
    background: rgba(255,255,255,.08); color: rgba(255,255,255,.6); border: none;
    cursor: pointer; transition: all .15s; font-family: 'DM Sans', sans-serif;
  }
  .ns-logout-btn:hover { background: rgba(220,50,50,.2); color: #fca5a5; }

  /* ── Topbar ── */
  .ns-topbar {
    background: rgba(245,242,238,.96); backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--paper-3); padding: 0 28px; height: 56px;
    display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; z-index: 10;
  }
  .ns-topbar-left  { display: flex; align-items: center; gap: 12px; }
  .ns-hamburger {
    display: none; width: 36px; height: 36px; border-radius: 8px;
    border: 1px solid var(--paper-3); background: white;
    align-items: center; justify-content: center; cursor: pointer; font-size: 1.1rem;
  }
  .ns-topbar-title { font-family: 'Playfair Display', serif; font-size: 1.1rem; color: var(--ink); font-weight: 600; }
  .ns-topbar-date  { font-size: .72rem; color: var(--ink-3); margin-top: 1px; }
  .ns-avatar {
    width: 36px; height: 36px; border-radius: 50%; background: var(--ink); color: var(--gold);
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: .9rem; font-family: 'Playfair Display', serif;
  }

  /* ── Content Area ── */
  .content {
    flex: 1; overflow: hidden; display: flex; flex-direction: column;
    min-height: 0;
  }

  /* ── Subject Tab Bar ── */
  .ns-tabs-bar {
    background: white; border-bottom: 1px solid var(--paper-3);
    padding: 0 24px; display: flex; align-items: center; gap: 4px;
    overflow-x: auto; flex-shrink: 0; height: 52px;
    scrollbar-width: none;
  }
  .ns-tabs-bar::-webkit-scrollbar { display: none; }
  .ns-tab {
    display: flex; align-items: center; gap: 7px; padding: 6px 16px; border-radius: 8px;
    font-size: .8rem; font-weight: 600; cursor: pointer; white-space: nowrap;
    border: 1.5px solid transparent; transition: all .15s; font-family: 'DM Sans', sans-serif;
    background: transparent; color: var(--ink-3);
    flex-shrink: 0;
  }
  .ns-tab:hover  { background: var(--paper); color: var(--ink); }
  .ns-tab.active { background: var(--ink); color: white; border-color: var(--ink); }
  .ns-tab-dot    { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
  .ns-tab-count  {
    font-size: .65rem; font-weight: 700; padding: 1px 6px; border-radius: 4px;
    background: rgba(255,255,255,.15); min-width: 18px; text-align: center;
  }
  .ns-tab:not(.active) .ns-tab-count { background: var(--paper-2); color: var(--ink-3); }

  /* Mode Toggle */
  .ns-mode-toggle {
    display: flex; align-items: center; gap: 8px; padding: 0 24px; background: white;
    border-bottom: 1px solid var(--paper-3); height: 52px; flex-shrink: 0;
  }
  .ns-mode-label { font-size: .7rem; font-weight: 600; color: var(--ink-3); text-transform: uppercase; letter-spacing: 0.05em; }
  .ns-mode-switch {
    display: flex; background: var(--paper-2); border-radius: 10px; padding: 3px;
  }
  .ns-mode-btn {
    padding: 6px 14px; border-radius: 8px; font-size: .75rem; font-weight: 600;
    border: none; background: transparent; color: var(--ink-3); cursor: pointer;
    transition: all .15s; font-family: 'DM Sans', sans-serif;
  }
  .ns-mode-btn.active { background: white; color: var(--ink); box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
  .ns-create-btn {
    margin-left: auto; padding: 7px 14px; border-radius: 8px; font-size: .75rem; font-weight: 600;
    background: var(--gold); color: var(--ink); border: none; cursor: pointer;
    transition: all .15s; font-family: 'DM Sans', sans-serif; display: flex; align-items: center; gap: 6px;
  }
  .ns-create-btn:hover { background: var(--gold-light); }

  /* Standalone Notes List */
  .ns-notes-list { padding: 12px; display: flex; flex-direction: column; gap: 8px; flex: 1; overflow-y: auto; }
  .ns-note-item {
    padding: 14px; border-radius: 10px; cursor: pointer;
    border: 1.5px solid transparent; transition: all .18s; background: var(--paper);
  }
  .ns-note-item:hover   { border-color: var(--paper-3); background: white; box-shadow: var(--shadow); }
  .ns-note-item.active  { border-color: var(--gold); background: white; box-shadow: 0 0 0 3px rgba(201,168,76,.12); }
  .ns-note-item-title   { font-size: .85rem; font-weight: 600; color: var(--ink); line-height: 1.3; margin-bottom: 6px; }
  .ns-note-item-preview { font-size: .72rem; color: var(--ink-3); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .ns-note-item-meta    { display: flex; align-items: center; gap: 8px; margin-top: 8px; }
  .ns-note-item-date    { font-size: .62rem; color: var(--ink-3); }
  .ns-note-delete-btn {
    margin-left: auto; padding: 4px 8px; border-radius: 6px; font-size: .65rem;
    background: transparent; color: var(--ink-3); border: none; cursor: pointer; opacity: 0;
    transition: all .15s;
  }
  .ns-note-item:hover .ns-note-delete-btn { opacity: 1; }
  .ns-note-delete-btn:hover { background: #fee2e2; color: #ef4444; }

  /* Standalone Note Editor */
  .ns-standalone-editor { flex: 1; display: flex; flex-direction: column; background: white; overflow: hidden; }
  .ns-standalone-head { padding: 16px 20px; border-bottom: 1px solid var(--paper-2); flex-shrink: 0; }
  .ns-standalone-title-input {
    width: 100%; font-family: 'Playfair Display', serif; font-size: 1.2rem; font-weight: 600;
    color: var(--ink); border: none; outline: none; background: transparent;
  }
  .ns-standalone-title-input::placeholder { color: var(--paper-3); }

  /* No note selected */
  .ns-no-note-selected {
    flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 32px 20px; text-align: center; color: var(--ink-3); gap: 12px;
  }
  .ns-no-note-icon { font-size: 3rem; opacity: .2; }
  .ns-no-note-title { font-family: 'Playfair Display', serif; font-size: 1rem; color: var(--ink-3); }
  .ns-no-note-sub { font-size: .8rem; }

  /* Current Affairs Panel */
  .ns-ca-panel {
    display: flex; flex-direction: column; background: #f8f9fa; overflow: hidden; border-left: 1px solid var(--paper-3);
  }
  .ns-ca-head {
    padding: 14px 16px; border-bottom: 1px solid var(--paper-2); background: white; flex-shrink: 0;
  }
  .ns-ca-title { font-family: 'Playfair Display', serif; font-size: .9rem; color: var(--ink); font-weight: 600; }
  .ns-ca-subtitle { font-size: .65rem; color: var(--ink-3); margin-top: 2px; }
  .ns-ca-list { flex: 1; overflow-y: auto; padding: 10px; display: flex; flex-direction: column; gap: 8px; }
  .ns-ca-item {
    padding: 12px; border-radius: 10px; background: white; border: 1px solid var(--paper-3); cursor: pointer; transition: all .15s;
  }
  .ns-ca-item:hover { border-color: var(--gold); box-shadow: var(--shadow); }
  .ns-ca-item-date { font-size: .6rem; color: var(--gold); font-weight: 600; margin-bottom: 4px; }
  .ns-ca-item-title { font-size: .75rem; font-weight: 600; color: var(--ink); line-height: 1.3; margin-bottom: 4px; }
  .ns-ca-item-desc { font-size: .65rem; color: var(--ink-3); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .ns-ca-item-cat {
    display: inline-block; font-size: .55rem; font-weight: 700; padding: 2px 6px; border-radius: 4px; margin-top: 6px; text-transform: uppercase;
  }
  .ns-ca-empty { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; text-align: center; color: var(--ink-3); }
  .ns-ca-empty-icon { font-size: 2rem; opacity: .2; }
  .ns-ca-empty-text { font-size: .7rem; }

  /* ── Workspace ── */
  .ns-workspace {
    flex: 1; display: grid; grid-template-columns: 280px 1fr 360px;
    overflow: hidden; min-height: 0;
  }
  .ns-workspace.with-ca { grid-template-columns: 280px 1fr 300px 280px; }

  /* ── PDF List Panel ── */
  .ns-pdf-list {
    border-right: 1px solid var(--paper-3); overflow-y: auto;
    background: white; display: flex; flex-direction: column;
  }
  .ns-pdf-list-head {
    padding: 16px 18px 12px; border-bottom: 1px solid var(--paper-2);
    position: sticky; top: 0; background: white; z-index: 2;
  }
  .ns-pdf-list-title { font-family: 'Playfair Display', serif; font-size: .95rem; color: var(--ink); margin-bottom: 8px; }
  .ns-pdf-search {
    width: 100%; padding: 8px 12px; border: 1px solid var(--paper-3); border-radius: 8px;
    font-size: .8rem; font-family: 'DM Sans', sans-serif; color: var(--ink);
    outline: none; background: var(--paper); transition: border-color .15s;
  }
  .ns-pdf-search:focus { border-color: var(--gold); background: white; }
  .ns-pdf-items { padding: 10px; display: flex; flex-direction: column; gap: 6px; flex: 1; }
  .ns-pdf-item {
    padding: 12px 14px; border-radius: 10px; cursor: pointer;
    border: 1.5px solid transparent; transition: all .18s; background: var(--paper);
  }
  .ns-pdf-item:hover   { border-color: var(--paper-3); background: white; box-shadow: var(--shadow); }
  .ns-pdf-item.active  { border-color: var(--gold); background: white; box-shadow: 0 0 0 3px rgba(201,168,76,.12); }
  .ns-pdf-item-title   { font-size: .82rem; font-weight: 600; color: var(--ink); line-height: 1.3; margin-bottom: 4px; }
  .ns-pdf-item-meta    { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
  .ns-pdf-item-tag     { font-size: .62rem; font-weight: 700; padding: 2px 7px; border-radius: 4px; }
  .ns-pdf-item-pages   { font-size: .65rem; color: var(--ink-3); }
  .ns-pdf-item-note-indicator {
    width: 6px; height: 6px; border-radius: 50%; background: var(--gold); flex-shrink: 0;
  }
  .ns-pdf-empty {
    flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 32px 16px; text-align: center; color: var(--ink-3);
  }
  .ns-pdf-empty-icon  { font-size: 2rem; margin-bottom: 8px; opacity: .4; }
  .ns-pdf-empty-text  { font-size: .8rem; }

  /* ── PDF Viewer ── */
  .ns-viewer {
    border-right: 1px solid var(--paper-3); display: flex; flex-direction: column;
    background: #2d2d2d; overflow: hidden;
  }
  .ns-viewer-head {
    background: var(--ink); padding: 10px 18px; display: flex; align-items: center;
    justify-content: space-between; gap: 12px; flex-shrink: 0;
  }
  .ns-viewer-head-title { font-size: .8rem; color: rgba(255,255,255,.7); font-weight: 500; flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .ns-viewer-placeholder {
    flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
    color: rgba(255,255,255,.25); gap: 12px; padding: 32px;
  }
  .ns-viewer-placeholder-icon  { font-size: 3rem; opacity: .3; }
  .ns-viewer-placeholder-title { font-family: 'Playfair Display', serif; font-size: 1rem; color: rgba(255,255,255,.4); }
  .ns-viewer-placeholder-sub   { font-size: .78rem; color: rgba(255,255,255,.2); text-align: center; }
  .ns-viewer-iframe-wrap { flex: 1; overflow: hidden; }

  /* ── Notes Editor ── */
  .ns-notes {
    display: flex; flex-direction: column; background: white; overflow: hidden;
  }
  .ns-notes-head {
    padding: 14px 18px 12px; border-bottom: 1px solid var(--paper-2); flex-shrink: 0;
  }
  .ns-notes-head-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
  .ns-notes-head-title { font-family: 'Playfair Display', serif; font-size: .95rem; color: var(--ink); }
  .ns-save-status {
    font-size: .68rem; font-weight: 600; display: flex; align-items: center; gap: 5px;
    transition: color .3s;
  }
  .ns-save-status.saved   { color: #10b981; }
  .ns-save-status.saving  { color: var(--gold); }
  .ns-save-status.unsaved { color: var(--ink-3); }
  .ns-save-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
  .ns-save-status.saved   .ns-save-dot { background: #10b981; }
  .ns-save-status.saving  .ns-save-dot { background: var(--gold); animation: blink .7s infinite; }
  .ns-save-status.unsaved .ns-save-dot { background: var(--ink-3); }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }

  /* Tags */
  .ns-tags-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
  .ns-tag {
    display: flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 99px;
    font-size: .65rem; font-weight: 700; border: 1px solid var(--paper-3);
    background: var(--paper); color: var(--ink-3); cursor: pointer; transition: all .15s;
    font-family: 'DM Sans', sans-serif;
  }
  .ns-tag.active { background: var(--ink); color: white; border-color: var(--ink); }
  .ns-tag-remove { font-size: .75rem; line-height: 1; opacity: .6; }
  .ns-tag-add {
    padding: 3px 10px; border-radius: 99px; font-size: .65rem; font-weight: 600;
    border: 1px dashed var(--paper-3); background: transparent; color: var(--ink-3);
    cursor: pointer; transition: all .15s; font-family: 'DM Sans', sans-serif;
  }
  .ns-tag-add:hover { border-color: var(--gold); color: var(--gold); }
  .ns-tag-input {
    font-size: .72rem; border: 1px solid var(--gold); border-radius: 99px;
    padding: 3px 10px; outline: none; font-family: 'DM Sans', sans-serif;
    width: 100px; background: #fffbeb;
  }

  /* Toolbar */
  .ns-toolbar {
    padding: 8px 14px; border-bottom: 1px solid var(--paper-2); display: flex;
    align-items: center; gap: 2px; flex-shrink: 0; flex-wrap: wrap;
  }
  .ns-toolbar-btn {
    width: 28px; height: 28px; border-radius: 6px; border: none; background: transparent;
    cursor: pointer; font-size: .85rem; display: flex; align-items: center; justify-content: center;
    color: var(--ink-3); transition: all .12s; font-family: 'DM Sans', sans-serif;
  }
  .ns-toolbar-btn:hover  { background: var(--paper); color: var(--ink); }
  .ns-toolbar-btn.active { background: var(--ink); color: white; }
  .ns-toolbar-sep { width: 1px; height: 18px; background: var(--paper-3); margin: 0 4px; }
  .ns-toolbar-label { font-size: .65rem; color: var(--ink-3); font-weight: 600; padding: 0 4px; }

  /* Editor */
  .ns-editor-wrap { flex: 1; overflow: hidden; display: flex; flex-direction: column; min-height: 0; }
  .ns-editor {
    flex: 1; padding: 16px 18px; overflow-y: auto; outline: none;
    font-size: .85rem; line-height: 1.7; color: var(--ink-2);
    font-family: 'DM Sans', sans-serif;
  }
  .ns-editor:empty::before {
    content: attr(data-placeholder); color: var(--paper-3); pointer-events: none;
    font-style: italic;
  }
  .ns-editor h1 { font-family: 'Playfair Display', serif; font-size: 1.3rem; color: var(--ink); margin: 12px 0 6px; }
  .ns-editor h2 { font-family: 'Playfair Display', serif; font-size: 1.1rem; color: var(--ink); margin: 10px 0 5px; }
  .ns-editor h3 { font-size: .95rem; font-weight: 700; color: var(--ink); margin: 8px 0 4px; }
  .ns-editor p  { margin-bottom: 8px; }
  .ns-editor ul, .ns-editor ol { padding-left: 20px; margin-bottom: 8px; }
  .ns-editor li { margin-bottom: 3px; }
  .ns-editor blockquote {
    border-left: 3px solid var(--gold); padding: 8px 14px; margin: 10px 0;
    background: #fffbeb; border-radius: 0 8px 8px 0; font-style: italic; color: var(--ink-3);
  }
  .ns-editor strong { font-weight: 700; color: var(--ink); }
  .ns-editor em     { font-style: italic; color: var(--ink-2); }
  .ns-editor mark   { background: #fef08a; border-radius: 3px; padding: 0 2px; }
  .ns-editor a      { color: var(--gold); text-decoration: underline; }
  .ns-editor code   { background: var(--paper-2); padding: 1px 5px; border-radius: 4px; font-size: .8rem; }
  .ns-editor hr     { border: none; border-top: 1px solid var(--paper-3); margin: 12px 0; }

  /* Notes footer */
  .ns-notes-foot {
    padding: 10px 18px; border-top: 1px solid var(--paper-2);
    display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;
  }
  .ns-word-count { font-size: .65rem; color: var(--ink-3); font-weight: 500; }
  .ns-clear-btn {
    font-size: .68rem; color: var(--ink-3); background: none; border: none;
    cursor: pointer; padding: 4px 8px; border-radius: 6px; transition: all .15s;
    font-family: 'DM Sans', sans-serif;
  }
  .ns-clear-btn:hover { background: #fee2e2; color: #ef4444; }

  /* No PDF selected state */
  .ns-notes-empty {
    flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 32px 20px; text-align: center; color: var(--ink-3); gap: 8px;
  }
  .ns-notes-empty-icon  { font-size: 2.5rem; opacity: .25; }
  .ns-notes-empty-title { font-family: 'Playfair Display', serif; font-size: .95rem; color: var(--ink-3); }
  .ns-notes-empty-sub   { font-size: .75rem; }

  /* Skeleton */
  @keyframes shimmer { from{background-position:-400px 0} to{background-position:400px 0} }
  .ns-skeleton {
    display: block; border-radius: 6px;
    background: linear-gradient(90deg,var(--paper-2) 25%,var(--paper-3) 50%,var(--paper-2) 75%);
    background-size: 400px 100%; animation: shimmer 1.4s infinite;
  }

  /* Fade in */
  @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  .ns-animate { animation: fadeUp .35s ease both; }

  /* Scrollbar */
  ::-webkit-scrollbar      { width: 4px; }
  ::-webkit-scrollbar-thumb{ background: var(--paper-3); border-radius: 99px; }

  @media (max-width: 1200px) {
    .ns-workspace { grid-template-columns: 240px 1fr 320px; }
  }
  @media (max-width: 1024px) {
    .ns-workspace { grid-template-columns: 1fr 300px; }
    .ns-pdf-list  { display: none; }
  }
  @media (max-width: 768px) {
    .ns-workspace { grid-template-columns: 1fr; }
    .ns-notes     { display: none; }
    .ns-viewer    { border-right: none; }
    .ns-hamburger { display: none; }
    .ns-main      { margin-left: 0; }
    .ns-nav-cta { justify-content: flex-start; padding: 8px 12px; }
    .ns-nav-brand { display: none; }
  }
`;

/* ─── Toolbar Button ─────────────────────────────────────────────── */
function ToolbarBtn({ title, icon, cmd, arg, active, onClick }) {
  const exec = () => {
    if (onClick) { onClick(); return; }
    document.execCommand(cmd, false, arg || null);
  };
  return (
    <button
      className={`ns-toolbar-btn ${active ? "active" : ""}`}
      title={title}
      onMouseDown={e => { e.preventDefault(); exec(); }}
    >
      {icon}
    </button>
  );
}

/* ─── Notes Editor ───────────────────────────────────────────────── */
function NotesEditor({ pdfId, pdfTitle, userId }) {
  const editorRef    = useRef(null);
  const saveTimerRef = useRef(null);
  const [saveStatus, setSaveStatus] = useState("saved"); // saved | saving | unsaved
  const [tags,       setTags]       = useState([]);
  const [tagInput,   setTagInput]   = useState("");
  const [showTagInput, setShowTagInput] = useState(false);
  const [wordCount,  setWordCount]  = useState(0);
  const [loaded,     setLoaded]     = useState(false);

  /* Load note from Firestore */
  useEffect(() => {
    if (!pdfId || !userId) return;
    setLoaded(false);
    const noteRef = doc(db, "users", userId, "pdfNotes", pdfId);
    getDoc(noteRef).then(snap => {
      if (snap.exists()) {
        const data = snap.data();
        if (editorRef.current) editorRef.current.innerHTML = data.content || "";
        setTags(data.tags || []);
        updateWordCount(data.content || "");
      } else {
        if (editorRef.current) editorRef.current.innerHTML = "";
        setTags([]);
        setWordCount(0);
      }
      setLoaded(true);
      setSaveStatus("saved");
    }).catch(console.error);
  }, [pdfId, userId]);

  const updateWordCount = (html) => {
    const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    setWordCount(text ? text.split(" ").filter(Boolean).length : 0);
  };

  /* Auto-save */
  const scheduleSave = useCallback((html, currentTags) => {
    setSaveStatus("unsaved");
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      setSaveStatus("saving");
      try {
        const noteRef = doc(db, "users", userId, "pdfNotes", pdfId);
        await setDoc(noteRef, {
          content:   html,
          tags:      currentTags,
          pdfId,
          pdfTitle,
          updatedAt: serverTimestamp(),
        }, { merge: true });
        setSaveStatus("saved");
      } catch (e) {
        console.error("Save error:", e);
        setSaveStatus("unsaved");
      }
    }, 1200);
  }, [pdfId, pdfTitle, userId]);

  const handleInput = () => {
    const html = editorRef.current?.innerHTML || "";
    updateWordCount(html);
    scheduleSave(html, tags);
  };

  const handleTagAdd = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) {
      const next = [...tags, t];
      setTags(next);
      scheduleSave(editorRef.current?.innerHTML || "", next);
    }
    setTagInput(""); setShowTagInput(false);
  };

  const handleTagRemove = (t) => {
    const next = tags.filter(x => x !== t);
    setTags(next);
    scheduleSave(editorRef.current?.innerHTML || "", next);
  };

  const handleClear = () => {
    if (!window.confirm("Clear all notes for this PDF?")) return;
    if (editorRef.current) editorRef.current.innerHTML = "";
    setWordCount(0);
    scheduleSave("", tags);
  };

  const insertBlock = (tag) => {
    editorRef.current?.focus();
    document.execCommand("formatBlock", false, tag);
  };

  const saveStatusLabel = saveStatus === "saved" ? "Saved" : saveStatus === "saving" ? "Saving…" : "Unsaved";

  if (!pdfId) return (
    <div className="ns-notes-empty">
      <div className="ns-notes-empty-icon">✎</div>
      <div className="ns-notes-empty-title">No PDF Selected</div>
      <div className="ns-notes-empty-sub">Select a PDF to start taking notes</div>
    </div>
  );

  return (
    <>
      {/* Head */}
      <div className="ns-notes-head">
        <div className="ns-notes-head-top">
          <span className="ns-notes-head-title">✎ Notes</span>
          <span className={`ns-save-status ${saveStatus}`}>
            <span className="ns-save-dot" />
            {saveStatusLabel}
          </span>
        </div>
        {/* Tags */}
        <div className="ns-tags-row">
          {tags.map(t => (
            <span key={t} className="ns-tag active">
              {t}
              <span className="ns-tag-remove" onClick={() => handleTagRemove(t)}>✕</span>
            </span>
          ))}
          {showTagInput ? (
            <input
              autoFocus
              className="ns-tag-input"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleTagAdd(); if (e.key === "Escape") { setShowTagInput(false); setTagInput(""); } }}
              onBlur={handleTagAdd}
              placeholder="tag name…"
            />
          ) : (
            <button className="ns-tag-add" onClick={() => setShowTagInput(true)}>+ tag</button>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="ns-toolbar">
        <span className="ns-toolbar-label">Format</span>
        <ToolbarBtn title="Bold"        icon={<b>B</b>}  cmd="bold" />
        <ToolbarBtn title="Italic"      icon={<i>I</i>}  cmd="italic" />
        <ToolbarBtn title="Underline"   icon={<u>U</u>}  cmd="underline" />
        <ToolbarBtn title="Highlight"   icon="▐"          cmd="hiliteColor" arg="#fef08a" />
        <div className="ns-toolbar-sep" />
        <span className="ns-toolbar-label">Block</span>
        <ToolbarBtn title="Heading 1"   icon="H1"  onClick={() => insertBlock("h1")} />
        <ToolbarBtn title="Heading 2"   icon="H2"  onClick={() => insertBlock("h2")} />
        <ToolbarBtn title="Heading 3"   icon="H3"  onClick={() => insertBlock("h3")} />
        <ToolbarBtn title="Paragraph"   icon="¶"   onClick={() => insertBlock("p")} />
        <ToolbarBtn title="Blockquote"  icon="❝"   onClick={() => insertBlock("blockquote")} />
        <div className="ns-toolbar-sep" />
        <span className="ns-toolbar-label">List</span>
        <ToolbarBtn title="Bullet list"   icon="•≡"  cmd="insertUnorderedList" />
        <ToolbarBtn title="Numbered list" icon="1≡"  cmd="insertOrderedList" />
        <div className="ns-toolbar-sep" />
        <ToolbarBtn title="Undo" icon="↩" cmd="undo" />
        <ToolbarBtn title="Redo" icon="↪" cmd="redo" />
      </div>

      {/* Editor */}
      <div className="ns-editor-wrap">
        <div
          ref={editorRef}
          className="ns-editor"
          contentEditable
          suppressContentEditableWarning
          data-placeholder={loaded ? `Start your notes for "${pdfTitle}"…` : "Loading notes…"}
          onInput={handleInput}
          spellCheck
        />
      </div>

      {/* Footer */}
      <div className="ns-notes-foot">
        <span className="ns-word-count">{wordCount} word{wordCount !== 1 ? "s" : ""}</span>
        <button className="ns-clear-btn" onClick={handleClear}>Clear notes</button>
      </div>
    </>
  );
}

/* ─── Standalone Note Editor ───────────────────────────────────────── */
function StandaloneNoteEditor({ note, userId, onUpdate }) {
  const editorRef = useRef(null);
  const saveTimerRef = useRef(null);
  const [saveStatus, setSaveStatus] = useState("saved");
  const [wordCount, setWordCount] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!note || !userId) return;
    setLoaded(false);
    const noteRef = doc(db, "notes", note.id);
    getDoc(noteRef).then(snap => {
      if (snap.exists()) {
        const data = snap.data();
        if (editorRef.current) editorRef.current.innerHTML = data.content || "";
        updateWordCount(data.content || "");
      } else {
        if (editorRef.current) editorRef.current.innerHTML = "";
        setWordCount(0);
      }
      setLoaded(true);
      setSaveStatus("saved");
    }).catch(console.error);
  }, [note?.id, userId]);

  const updateWordCount = (html) => {
    const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    setWordCount(text ? text.split(" ").filter(Boolean).length : 0);
  };

  const scheduleSave = useCallback((html) => {
    setSaveStatus("unsaved");
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      setSaveStatus("saving");
      try {
        const noteRef = doc(db, "notes", note.id);
        await setDoc(noteRef, { content: html, userId: userId, updatedAt: serverTimestamp() }, { merge: true });
        setSaveStatus("saved");
        if (onUpdate) onUpdate({ ...note, content: html });
      } catch (e) {
        console.error("Save error:", e);
        setSaveStatus("unsaved");
      }
    }, 1200);
  }, [note?.id, userId, onUpdate]);

  const handleInput = () => {
    const html = editorRef.current?.innerHTML || "";
    updateWordCount(html);
    scheduleSave(html);
  };

  const handleTitleChange = async (e) => {
    const newTitle = e.target.value;
    try {
      const noteRef = doc(db, "notes", note.id);
      await setDoc(noteRef, { title: newTitle, userId: userId, updatedAt: serverTimestamp() }, { merge: true });
      if (onUpdate) onUpdate({ ...note, title: newTitle });
    } catch (e) { console.error("Title save error:", e); }
  };

  const handleClear = () => {
    if (!window.confirm("Clear all content?")) return;
    if (editorRef.current) editorRef.current.innerHTML = "";
    setWordCount(0);
    scheduleSave("");
  };

  const insertBlock = (tag) => { editorRef.current?.focus(); document.execCommand("formatBlock", false, tag); };

  if (!note) return null;

  return (
    <div className="ns-standalone-editor">
      <div className="ns-standalone-head">
        <input className="ns-standalone-title-input" value={note.title || ""} onChange={handleTitleChange} placeholder="Note title..." />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
          <span className={`ns-save-status ${saveStatus}`}><span className="ns-save-dot" />{saveStatus === "saved" ? "Saved" : saveStatus === "saving" ? "Saving…" : "Unsaved"}</span>
          <span className="ns-word-count">{wordCount} word{wordCount !== 1 ? "s" : ""}</span>
        </div>
      </div>
      <div className="ns-toolbar">
        <ToolbarBtn title="Bold" icon={<b>B</b>} cmd="bold" />
        <ToolbarBtn title="Italic" icon={<i>I</i>} cmd="italic" />
        <ToolbarBtn title="Underline" icon={<u>U</u>} cmd="underline" />
        <ToolbarBtn title="Highlight" icon="▐" cmd="hiliteColor" arg="#fef08a" />
        <div className="ns-toolbar-sep" />
        <ToolbarBtn title="H1" icon="H1" onClick={() => insertBlock("h1")} />
        <ToolbarBtn title="H2" icon="H2" onClick={() => insertBlock("h2")} />
        <ToolbarBtn title="Quote" icon="❝" onClick={() => insertBlock("blockquote")} />
        <div className="ns-toolbar-sep" />
        <ToolbarBtn title="Undo" icon="↩" cmd="undo" />
        <ToolbarBtn title="Redo" icon="↪" cmd="redo" />
        <div style={{ flex: 1 }} />
        <button className="ns-clear-btn" onClick={handleClear}>Clear</button>
      </div>
      <div className="ns-editor-wrap">
        <div ref={editorRef} className="ns-editor" contentEditable suppressContentEditableWarning data-placeholder={loaded ? "Start writing..." : "Loading..."} onInput={handleInput} spellCheck />
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────── */
export default function Notes() {
  const router = useRouter();
  const { user, authLoading, logout } = useAuth();

  const [subjects,       setSubjects]       = useState([]);
  const [activeSubject,  setActiveSubject]  = useState(null);
  const [pdfs,           setPdfs]           = useState([]);
  const [pdfsLoading,    setPdfsLoading]    = useState(false);
  const [selectedPdf,    setSelectedPdf]    = useState(null); // { id, title, url }
  const [searchQuery,    setSearchQuery]    = useState("");
  const [notesPdfIds,    setNotesPdfIds]    = useState(new Set()); // which PDFs have notes
  const [noteMode,       setNoteMode]       = useState("pdf"); // "pdf" or "standalone"
  const [standaloneNotes, setStandaloneNotes] = useState([]);
  const [selectedNote,   setSelectedNote]   = useState(null); // { id, title, content, subject }
  const [noteTitle,      setNoteTitle]      = useState("");
  const [currentAffairs, setCurrentAffairs] = useState([]);

  /* Auth guard */
  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [user, authLoading, router]);

  /* Load subjects from Firestore */
  useEffect(() => {
    if (!user) return;
    // Query without orderBy to avoid index requirements
    const unsub = onSnapshot(
      collection(db, "pdfSubjects"),
      snap => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        // Sort by order client-side
        list.sort((a, b) => (a.order || 0) - (b.order || 0));
        setSubjects(list);
        if (list.length > 0 && !activeSubject) setActiveSubject(list[0].id);
      },
      (error) => {
        console.error('Error loading pdfSubjects:', error);
        setSubjects([]);
      }
    );
    return () => unsub();
  }, [user]);

  /* Load PDFs for active subject */
  useEffect(() => {
    if (!user || !activeSubject) return;
    setPdfsLoading(true);
    setSelectedPdf(null);
    // Query without orderBy to avoid index requirements
    const q = query(
      collection(db, "pdfs"),
      where("subjectId", "==", activeSubject)
    );
    const unsub = onSnapshot(q, snap => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sort by createdAt client-side (newest first)
      list.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.()?.getTime() || 0;
        const bTime = b.createdAt?.toDate?.()?.getTime() || 0;
        return bTime - aTime;
      });
      setPdfs(list);
      setPdfsLoading(false);
    }, (error) => {
      console.error('Error loading PDFs:', error);
      setPdfs([]);
      setPdfsLoading(false);
    });
    return () => unsub();
  }, [user, activeSubject]);

  /* Track which PDFs have notes */
  useEffect(() => {
    if (!user || pdfs.length === 0) return;
    const checks = pdfs.map(pdf =>
      getDoc(doc(db, "users", user.uid, "pdfNotes", pdf.id)).then(snap => snap.exists() && snap.data()?.content ? pdf.id : null)
    );
    Promise.all(checks).then(results => {
      setNotesPdfIds(new Set(results.filter(Boolean)));
    });
  }, [user, pdfs]);

  /* Load standalone notes from Firestore */
  useEffect(() => {
    if (!user || noteMode !== "standalone") return;
    // Query without orderBy to avoid index requirements
    const unsub = onSnapshot(
      query(collection(db, "notes"), where("userId", "==", user.uid)),
      snap => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        // Sort by updatedAt client-side (newest first)
        list.sort((a, b) => {
          const aTime = a.updatedAt?.toDate?.()?.getTime() || 0;
          const bTime = b.updatedAt?.toDate?.()?.getTime() || 0;
          return bTime - aTime;
        });
        setStandaloneNotes(list);
      },
      (error) => {
        console.error('Error loading notes:', error);
        setStandaloneNotes([]);
      }
    );
    return () => unsub();
  }, [user, noteMode]);

  /* Load current affairs for CA panel */
  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "currentAffairs"), orderBy("date", "desc"), limit(30)),
      snap => {
        setCurrentAffairs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      },
      () => setCurrentAffairs([])
    );
    return () => unsub();
  }, []);

  /* Create new standalone note */
  const handleCreateNote = async () => {
    if (!user) return;
    try {
      const noteRef = doc(collection(db, "notes"));
      await setDoc(noteRef, {
        title: "Untitled Note",
        content: "",
        subject: activeSubject || "general",
        tags: [],
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setSelectedNote({ id: noteRef.id, title: "Untitled Note", content: "", subject: activeSubject || "general" });
      setNoteTitle("Untitled Note");
      toast.success("New note created!");
    } catch (e) {
      console.error("Error creating note:", e);
      toast.error("Failed to create note");
    }
  };

  /* Delete standalone note */
  const handleDeleteNote = async (noteId) => {
    if (!user || !window.confirm("Delete this note?")) return;
    try {
      await deleteDoc(doc(db, "notes", noteId));
      if (selectedNote?.id === noteId) {
        setSelectedNote(null);
        setNoteTitle("");
      }
      toast.success("Note deleted");
    } catch (e) {
      console.error("Error deleting note:", e);
      toast.error("Failed to delete note");
    }
  };

  /* Select a standalone note */
  const handleSelectNote = (note) => {
    setSelectedNote(note);
    setNoteTitle(note.title || "");
  };

  const handleLogout = async () => {
    try { await logout(); toast.success("Logged out!"); router.push("/login"); }
    catch { toast.error("Error logging out."); }
  };

  const filteredPdfs = pdfs.filter(p =>
    !searchQuery || p.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const dateStr = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  if (authLoading || !user) return null;

  /* Subject pill counts */
  const subjectPdfCount = subjects.reduce((acc, s) => {
    acc[s.id] = pdfs.length; // only accurate for active subject; for others show stored count
    return acc;
  }, {});

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="ns-layout">
        {/* Top Navigation CTA Bar */}
        <nav className="ns-nav-cta">
          <Link href="/student-desk/notes" className="ns-nav-brand">
            Notes<span>Cafe</span>
          </Link>
          {getMenuItems(router.pathname).map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`ns-nav-item ${item.active ? 'active' : ''}`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
          <div className="ns-user-menu">
            <div className="ns-user-avatar">{user.email?.[0]?.toUpperCase() || 'U'}</div>
            <button className="ns-logout-btn" onClick={handleLogout}>Sign Out</button>
          </div>
        </nav>

        <div className="ns-main">

          {/* Topbar */}
          <header className="ns-topbar">
            <div className="ns-topbar-left">
              <div>
                <div className="ns-topbar-title">Study Notes</div>
                <div className="ns-topbar-date">{dateStr}</div>
              </div>
            </div>
            <div className="ns-avatar">{user.email?.[0]?.toUpperCase() || "U"}</div>
          </header>

          <div className="content">
            {/* Mode Toggle */}
            <div className="ns-mode-toggle">
              <span className="ns-mode-label">Mode</span>
              <div className="ns-mode-switch">
                <button
                  className={`ns-mode-btn ${noteMode === 'pdf' ? 'active' : ''}`}
                  onClick={() => { setNoteMode('pdf'); setSelectedPdf(null); }}
                >
                  📄 PDF Notes
                </button>
                <button
                  className={`ns-mode-btn ${noteMode === 'standalone' ? 'active' : ''}`}
                  onClick={() => { setNoteMode('standalone'); setSelectedNote(null); }}
                >
                  ✎ My Notes
                </button>
              </div>
              {noteMode === 'standalone' && (
                <button className="ns-create-btn" onClick={handleCreateNote}>
                  + New Note
                </button>
              )}
            </div>

            {/* Subject Tab Bar - Only show for PDF mode */}
            {noteMode === 'pdf' && (
              <div className="ns-tabs-bar">
            {subjects.length === 0 ? (
              [1,2,3,4,5].map(i => (
                <span key={i} className="ns-skeleton" style={{ width: 90, height: 32, borderRadius: 8, flexShrink: 0 }} />
              ))
            ) : subjects.map(sub => {
              const col = subjectColor(sub.name || sub.id);
              const isActive = activeSubject === sub.id;
              return (
                <button
                  key={sub.id}
                  className={`ns-tab ${isActive ? "active" : ""}`}
                  onClick={() => { setActiveSubject(sub.id); setSearchQuery(""); }}
                  style={!isActive ? {} : {}}
                >
                  <span className="ns-tab-dot" style={{ background: isActive ? "rgba(255,255,255,.6)" : col.dot }} />
                  {sub.name || sub.id}
                  <span className="ns-tab-count">{sub.pdfCount || "—"}</span>
                </button>
              );
            })}
              </div>
            )}

            {/* Workspace */}
          <div className={`ns-workspace ${noteMode === 'standalone' && selectedNote ? 'with-ca' : ''}`}>

            {/* List Panel - PDF or Standalone */}
            {noteMode === 'pdf' ? (
              <>
            {/* PDF List */}
            <div className="ns-pdf-list">
              <div className="ns-pdf-list-head">
                <div className="ns-pdf-list-title">
                  {subjects.find(s => s.id === activeSubject)?.name || "Documents"}
                </div>
                <input
                  className="ns-pdf-search"
                  placeholder="Search PDFs…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="ns-pdf-items">
                {pdfsLoading ? (
                  [1,2,3,4].map(i => (
                    <div key={i} style={{ padding: "12px 14px", borderRadius: 10, background: "var(--paper)" }}>
                      <span className="ns-skeleton" style={{ height: 14, width: "75%", display: "block", marginBottom: 8 }} />
                      <span className="ns-skeleton" style={{ height: 10, width: "45%", display: "block" }} />
                    </div>
                  ))
                ) : filteredPdfs.length === 0 ? (
                  <div className="ns-pdf-empty">
                    <div className="ns-pdf-empty-icon">◎</div>
                    <div className="ns-pdf-empty-text">{searchQuery ? "No PDFs match your search" : "No PDFs in this subject"}</div>
                  </div>
                ) : filteredPdfs.map(pdf => {
                  const col = subjectColor(subjects.find(s => s.id === activeSubject)?.name || "general");
                  const hasNote = notesPdfIds.has(pdf.id);
                  return (
                    <div
                      key={pdf.id}
                      className={`ns-pdf-item ${selectedPdf?.id === pdf.id ? "active" : ""}`}
                      onClick={() => setSelectedPdf({ id: pdf.id, title: pdf.title, url: pdf.url })}
                    >
                      <div className="ns-pdf-item-title">{pdf.title}</div>
                      <div className="ns-pdf-item-meta">
                        <span className="ns-pdf-item-tag" style={{ background: col.bg, color: col.text, border: `1px solid ${col.border}` }}>
                          {subjects.find(s => s.id === activeSubject)?.name || "PDF"}
                        </span>
                        {pdf.pages && <span className="ns-pdf-item-pages">{pdf.pages} pages</span>}
                        {hasNote && <span className="ns-pdf-item-note-indicator" title="Has notes" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PDF Viewer */}
            <div className="ns-viewer">
              <div className="ns-viewer-head">
                <span className="ns-viewer-head-title">
                  {selectedPdf ? `◎ ${selectedPdf.title}` : "◎ Select a PDF to view"}
                </span>
              </div>
              {selectedPdf ? (
                <div className="ns-viewer-iframe-wrap">
                  <SimplePdfViewer pdfUrl={selectedPdf.url} />
                </div>
              ) : (
                <div className="ns-viewer-placeholder">
                  <div className="ns-viewer-placeholder-icon">◎</div>
                  <div className="ns-viewer-placeholder-title">No document open</div>
                  <div className="ns-viewer-placeholder-sub">Select a PDF from the list on the left to start reading</div>
                </div>
              )}
            </div>
              </>
            ) : (
              <>
            {/* Standalone Notes List */}
            <div className="ns-pdf-list">
              <div className="ns-pdf-list-head">
                <div className="ns-pdf-list-title">My Notes</div>
                <input
                  className="ns-pdf-search"
                  placeholder="Search notes…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="ns-notes-list">
                {standaloneNotes.length === 0 ? (
                  <div className="ns-pdf-empty">
                    <div className="ns-pdf-empty-icon">✎</div>
                    <div className="ns-pdf-empty-text">{searchQuery ? "No notes match your search" : "No notes yet. Click '+ New Note' to create one!"}</div>
                  </div>
                ) : (
                  standaloneNotes.filter(n => !searchQuery || n.title?.toLowerCase().includes(searchQuery.toLowerCase()) || n.content?.toLowerCase().includes(searchQuery.toLowerCase())).map(note => (
                    <div
                      key={note.id}
                      className={`ns-note-item ${selectedNote?.id === note.id ? "active" : ""}`}
                      onClick={() => handleSelectNote(note)}
                    >
                      <div className="ns-note-item-title">{note.title || "Untitled Note"}</div>
                      <div className="ns-note-item-preview">
                        {note.content?.replace(/<[^>]*>/g, " ").substring(0, 100) || "No content yet..."}
                      </div>
                      <div className="ns-note-item-meta">
                        <span className="ns-note-item-date">
                          {note.updatedAt ? new Date(note.updatedAt.seconds * 1000).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "Just now"}
                        </span>
                        <button
                          className="ns-note-delete-btn"
                          onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id); }}
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Standalone Note Editor */}
            <div className="ns-viewer">
              <div className="ns-viewer-head">
                <span className="ns-viewer-head-title">
                  {selectedNote ? `✎ ${selectedNote.title || "Untitled"}` : "✎ Select a note to edit"}
                </span>
              </div>
              {selectedNote ? (
                <StandaloneNoteEditor
                  note={selectedNote}
                  userId={user.uid}
                  onUpdate={(updated) => {
                    setSelectedNote(updated);
                    setStandaloneNotes(prev => prev.map(n => n.id === updated.id ? updated : n));
                  }}
                />
              ) : (
                <div className="ns-no-note-selected">
                  <div className="ns-no-note-icon">✎</div>
                  <div className="ns-no-note-title">No note selected</div>
                  <div className="ns-no-note-sub">Select a note from the list or create a new one</div>
                </div>
              )}
            </div>
              </>
            )}

            {/* Current Affairs Panel - Only in standalone mode */}
            {noteMode === 'standalone' && selectedNote && (
              <div className="ns-ca-panel">
                <div className="ns-ca-head">
                  <div className="ns-ca-title">📰 Related Current Affairs</div>
                  <div className="ns-ca-subtitle">Based on: {selectedNote.subject || 'All Topics'}</div>
                </div>
                <div className="ns-ca-list">
                  {currentAffairs.length === 0 ? (
                    <div className="ns-ca-empty">
                      <div className="ns-ca-empty-icon">📰</div>
                      <div className="ns-ca-empty-text">No current affairs available</div>
                    </div>
                  ) : (
                    currentAffairs.slice(0, 15).map(ca => (
                      <div key={ca.id} className="ns-ca-item">
                        <div className="ns-ca-item-date">
                          {ca.date ? new Date(ca.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}
                        </div>
                        <div className="ns-ca-item-title">{ca.title || ca.heading || 'Untitled'}</div>
                        <div className="ns-ca-item-desc">{ca.summary?.substring(0, 100) || ca.content?.substring(0, 100) || ''}</div>
                        {ca.category && (
                          <span className="ns-ca-item-cat" style={{ background: '#e0f2fe', color: '#0369a1' }}>
                            {ca.category}
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Notes Editor Panel - Only show for PDF mode */}
            {noteMode === 'pdf' && (
              <div className="ns-notes ns-animate">
                <NotesEditor
                  pdfId={selectedPdf?.id || null}
                  pdfTitle={selectedPdf?.title || ""}
                  userId={user.uid}
                />
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}