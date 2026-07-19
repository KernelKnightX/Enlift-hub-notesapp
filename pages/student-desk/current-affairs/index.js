import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

import { useAuth } from "../../../contexts/AuthContext";
import { db } from "../../../firebase/config";
import Sidebar from "../../../components/common/sidebar";
import {
  collection, query, where, orderBy, limit,
  onSnapshot, getDoc, doc,
} from "firebase/firestore";

/* ─── Category config ─────────────────────────────────────────── */
const CATEGORIES = [
  { id: "all",           name: "All",           icon: "📌", color: "#6b7280" },
  { id: "polity",        name: "Polity",         icon: "🏛️", color: "#3b82f6" },
  { id: "economy",       name: "Economy",        icon: "💰", color: "#10b981" },
  { id: "geography",     name: "Geography",      icon: "🌍", color: "#f59e0b" },
  { id: "history",       name: "History",        icon: "📜", color: "#8b5cf6" },
  { id: "science",       name: "Science & Tech", icon: "🔬", color: "#ef4444" },
  { id: "environment",   name: "Environment",    icon: "🌿", color: "#22c55e" },
  { id: "international", name: "International",  icon: "🌐", color: "#0ea5e9" },
  { id: "schemes",       name: "Schemes",        icon: "📋", color: "#f97316" },
];

const CAT_COLORS = {
  polity:        { bg: "#eff6ff", border: "#3b82f6" },
  economy:       { bg: "#f0fdf4", border: "#10b981" },
  geography:     { bg: "#fef9c3", border: "#f59e0b" },
  history:       { bg: "#f5f3ff", border: "#8b5cf6" },
  science:       { bg: "#fff1f2", border: "#ef4444" },
  environment:   { bg: "#f0fdf4", border: "#22c55e" },
  international: { bg: "#e0f2fe", border: "#0ea5e9" },
  schemes:       { bg: "#fff7ed", border: "#f97316" },
};

function getCatColors(cat) {
  return CAT_COLORS[cat] || { bg: "#f3f4f6", border: "#6b7280" };
}

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
    --sidebar-w: 260px;
    --radius:     16px;
    --shadow:     0 4px 24px rgba(15,25,35,.08);
    --shadow-lg:  0 12px 40px rgba(15,25,35,.14);
  }

  body { font-family: 'DM Sans', sans-serif; background: var(--paper); color: var(--ink); }
  .layout { display: flex; min-height: 100vh; }

  /* ── Main ── */
  .main   { margin-left:var(--sidebar-w); flex:1; min-width:0; }
  .topbar {
    position:sticky; top:0; z-index:50;
    background:rgba(245,242,238,.92); backdrop-filter:blur(12px);
    border-bottom:1px solid var(--paper-3); padding:0 32px; height:64px;
    display:flex; align-items:center; justify-content:space-between;
  }
  .topbar-left  { display:flex; align-items:center; gap:14px; }
  .hamburger {
    display:block; width:36px; height:36px; border-radius:8px;
    border:1px solid var(--paper-3); background:white;
    align-items:center; justify-content:center; cursor:pointer; font-size:1.1rem;
  }
  @media (min-width: 769px) {
    .hamburger { display: none; }
  }
  .topbar-title { font-family:'Playfair Display',serif; font-size:1.15rem; color:var(--ink); }
  .topbar-date  { font-size:.78rem; color:var(--ink-3); margin-top:1px; }
  .topbar-right { display:flex; align-items:center; gap:10px; }
  .avatar {
    width:36px; height:36px; border-radius:50%; background:var(--ink); color:var(--gold);
    display:flex; align-items:center; justify-content:center;
    font-weight:700; font-size:.9rem; font-family:'Playfair Display',serif;
  }

  /* ── Content ── */
  .content { padding:28px 32px; max-width:1400px; }

  /* ── Page header ── */
  .page-header {
    background:var(--ink); border-radius:var(--radius); padding:28px 32px;
    position:relative; overflow:hidden; margin-bottom:28px;
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
  .page-title    { font-family:'Playfair Display',serif; font-size:1.5rem; color:#fff; margin-bottom:4px; }
  .page-subtitle { font-size:.85rem; color:rgba(255,255,255,.6); }

  /* ── Search / filter ── */
  .search-card {
    background:white; border-radius:var(--radius); box-shadow:var(--shadow);
    border:1px solid var(--paper-3); margin-bottom:24px;
  }
  .search-input {
    width:100%; padding:14px 20px; border:none; outline:none;
    font-size:.95rem; font-family:'DM Sans',sans-serif; color:var(--ink);
    border-bottom:1px solid var(--paper-2); background:transparent;
  }
  .search-input::placeholder { color:var(--ink-3); }
  .categories-wrap { padding:16px 20px; display:flex; flex-wrap:wrap; gap:8px; }
  .cat-btn {
    padding:8px 16px; border-radius:20px; font-size:.78rem; font-weight:600;
    cursor:pointer; transition:all .18s; border:1px solid var(--paper-3);
    background:transparent; font-family:'DM Sans',sans-serif;
  }
  .cat-btn:hover { opacity:.85; }

  /* ── Articles grid ── */
  .articles-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:20px; }
  .article-card {
    background:white; border-radius:var(--radius); box-shadow:var(--shadow);
    border:1px solid var(--paper-3); overflow:hidden;
    transition:transform .2s,box-shadow .2s; position:relative;
  }
  .article-card:hover { transform:translateY(-3px); box-shadow:var(--shadow-lg); }
  .article-body  { padding:20px 22px; }
  .article-meta  { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
  .article-badge { padding:5px 10px; border-radius:6px; font-size:.7rem; font-weight:700; text-transform:uppercase; letter-spacing:.03em; }
  .article-date  { font-size:.72rem; color:var(--ink-3); }
  .article-title { font-family:'Playfair Display',serif; font-size:1.05rem; color:var(--ink); margin-bottom:10px; line-height:1.4; }
  .article-summary { font-size:.85rem; color:var(--ink-3); line-height:1.6; margin-bottom:12px; }
  .read-more-btn {
    background:none; border:none; font-size:.78rem; font-weight:600;
    cursor:pointer; padding:0; margin-bottom:12px; transition:opacity .15s;
    font-family:'DM Sans',sans-serif;
  }
  .read-more-btn:hover { opacity:.7; }
  .article-tags { display:flex; flex-wrap:wrap; gap:6px; }
  .article-tag  { padding:3px 8px; background:var(--paper); border-radius:4px; font-size:.65rem; color:var(--ink-3); font-weight:500; }

  /* ── Skeleton ── */
  @keyframes shimmer { from{background-position:-400px 0} to{background-position:400px 0} }
  .skeleton {
    border-radius:6px; display:block;
    background:linear-gradient(90deg,var(--paper-2) 25%,var(--paper-3) 50%,var(--paper-2) 75%);
    background-size:400px 100%; animation:shimmer 1.4s infinite;
  }
  .skeleton-card { background:white; border-radius:var(--radius); border:1px solid var(--paper-3); padding:20px 22px; }

  /* ── Empty state ── */
  .empty-state  { background:white; border-radius:var(--radius); box-shadow:var(--shadow); border:1px solid var(--paper-3); text-align:center; padding:60px 20px; }
  .empty-icon   { font-size:3rem; margin-bottom:12px; }
  .empty-title  { font-family:'Playfair Display',serif; font-size:1.2rem; color:var(--ink); margin-bottom:8px; }
  .empty-msg    { font-size:.85rem; color:var(--ink-3); }

  /* ── Animations ── */
  @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  .animate  { animation:fadeUp .5s ease both; }
  .delay-1  { animation-delay:.08s; }
  .delay-2  { animation-delay:.16s; }

  /* ── Scrollbar ── */
  ::-webkit-scrollbar      { width:4px; }
  ::-webkit-scrollbar-thumb{ background:var(--paper-3); border-radius:99px; }

  /* ── Responsive ── */
  @media (max-width:1024px){ .articles-grid{grid-template-columns:1fr;} }
  @media (max-width:768px){
    .main{margin-left:0;}
    .content{padding:20px 18px;}
    .topbar{padding:0 18px;}
    .page-header{padding:22px 20px;}
    .categories-wrap{gap:6px;}
    .cat-btn{padding:6px 12px; font-size:.72rem;}
  }
`;

/* ─── Skeleton loader ─────────────────────────────────────────────── */

function SkeletonGrid() {
  return (
    <div className="articles-grid">
      {[1, 2, 3, 4].map((i) => (
        <div className="skeleton-card" key={i}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
            <span className="skeleton" style={{ height: 24, width: 90 }} />
            <span className="skeleton" style={{ height: 14, width: 60 }} />
          </div>
          <span className="skeleton" style={{ height: 20, width: "80%", marginBottom: 8, display: "block" }} />
          <span className="skeleton" style={{ height: 14, width: "100%", marginBottom: 6, display: "block" }} />
          <span className="skeleton" style={{ height: 14, width: "70%", display: "block" }} />
        </div>
      ))}
    </div>
  );
}

/* ─── Main page ────────────────────────────────────────────────────── */

export default function CurrentAffairs() {
  const router = useRouter();
  const { user, authLoading, logout } = useAuth();

  // ── All state declared at the top, before any useEffect ──
  const [sidebarOpen,       setSidebarOpen]       = useState(false);
  const [loading,           setLoading]           = useState(true);
  const [affairs,           setAffairs]           = useState([]);
  const [selectedCategory,  setSelectedCategory]  = useState("all");
  const [searchQuery,       setSearchQuery]       = useState("");
  const [expandedId,        setExpandedId]        = useState(null);
  const [profile,           setProfile]           = useState(null);

  /* Auth guard */
  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [user, authLoading, router]);

  /* Fetch user profile */
  useEffect(() => {
    if (!user?.uid) return;
    const fetchProfile = async () => {
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    fetchProfile();
  }, [user?.uid]);

  /* Derived values */
  const displayName = profile?.fullName || profile?.name || user?.email?.split("@")[0] || "Aspirant";

  /* Live fetch from Firestore — reruns when category changes */
  useEffect(() => {
    if (!user) return;

    const q = selectedCategory === "all"
      ? query(
          collection(db, "currentAffairs"),
          where("isActive", "==", true),
          orderBy("createdAt", "desc"),
          limit(40)
        )
      : query(
          collection(db, "currentAffairs"),
          where("isActive", "==", true),
          where("category", "==", selectedCategory),
          orderBy("createdAt", "desc"),
          limit(40)
        );

    setLoading(true);

    const unsub = onSnapshot(
      q,
      (snap) => {
        setAffairs(
          snap.docs.map((d) => ({
            id:   d.id,
            ...d.data(),
            date: d.data().date
              || d.data().createdAt?.toDate?.()?.toLocaleDateString("en-IN", {
                   day: "numeric", month: "short", year: "numeric",
                 })
              || "—",
            tags: d.data().tags || [],
          }))
        );
        setLoading(false);
      },
      (err) => {
        console.error("Current affairs error:", err);
        setLoading(false);
      }
    );

    return () => unsub();         // clean up listener when category changes or component unmounts
  }, [user, selectedCategory]);

  const handleLogout = async () => {
    try { await logout(); toast.success("Logged out!"); router.push("/login"); }
    catch { toast.error("Error logging out."); }
  };

  /* Client-side search filter (no extra Firestore reads) */
  const filtered = affairs.filter((a) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.title?.toLowerCase().includes(q)   ||
      a.summary?.toLowerCase().includes(q) ||
      a.content?.toLowerCase().includes(q) ||
      a.tags?.some((t) => t.toLowerCase().includes(q))
    );
  });

  /* Loading guard — only auth loading, not data loading */
  if (authLoading) return null;
  if (!user)       return null;

  const dateStr = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="layout">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onLogout={handleLogout} />

        <main className="main">
          {/* Topbar */}
          <header className="topbar">
            <div className="topbar-left">
              <button className="hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
              <div>
                <div className="topbar-title">Current Affairs</div>
                <div className="topbar-date">{dateStr}</div>
              </div>
            </div>
            <div className="topbar-right">
              <div className="avatar">{displayName[0]?.toUpperCase() || "U"}</div>
            </div>
          </header>

          <div className="content">

            {/* Page header */}
            <div className="page-header animate">
              <div className="page-header-pattern" />
              <div className="page-header-accent" />
              <div className="page-header-content">
                <h1 className="page-title">📰 Current Affairs</h1>
                <p className="page-subtitle">Stay updated for UPSC preparation · {affairs.length} articles loaded</p>
              </div>
            </div>

            {/* Search + category filter */}
            <div className="search-card animate delay-1">
              <input
                type="text"
                className="search-input"
                placeholder="🔍 Search by title, content, or tags…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="categories-wrap">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    className="cat-btn"
                    style={{
                      background:  selectedCategory === cat.id ? cat.color    : "transparent",
                      color:       selectedCategory === cat.id ? "white"      : cat.color,
                      borderColor: selectedCategory === cat.id ? cat.color    : "var(--paper-3)",
                    }}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setExpandedId(null);  // collapse any open article when switching category
                    }}
                  >
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Articles / states */}
            {loading ? (
              <SkeletonGrid />
            ) : filtered.length === 0 ? (
              <div className="empty-state animate">
                <div className="empty-icon">📰</div>
                <div className="empty-title">
                  {affairs.length === 0 ? "No current affairs yet" : "No results found"}
                </div>
                <div className="empty-msg">
                  {affairs.length === 0
                    ? "Check back soon for updates!"
                    : "Try a different search term or category."}
                </div>
              </div>
            ) : (
              <div className="articles-grid animate delay-2">
                {filtered.map((affair, index) => {
                  const colors  = getCatColors(affair.category);
                  const catMeta = CATEGORIES.find((c) => c.id === affair.category);
                  const isOpen  = expandedId === affair.id;
                  const hasMore = affair.content && affair.content !== affair.summary;

                  return (
                    <article
                      key={affair.id}
                      className="article-card"
                      style={{
                        borderLeft:       `4px solid ${colors.border}`,
                        animationDelay:   `${(index % 8) * 0.04}s`,
                      }}
                    >
                      <div className="article-body">
                        <div className="article-meta">
                          <span
                            className="article-badge"
                            style={{ background: colors.bg, color: colors.border }}
                          >
                            {catMeta?.icon} {catMeta?.name || affair.category}
                          </span>
                          <span className="article-date">{affair.date}</span>
                        </div>

                        <h2 className="article-title">{affair.title}</h2>

                        <p className="article-summary">
                          {isOpen ? (affair.content || affair.summary) : affair.summary}
                        </p>

                        {hasMore && (
                          <button
                            className="read-more-btn"
                            style={{ color: colors.border }}
                            onClick={() => setExpandedId(isOpen ? null : affair.id)}
                          >
                            {isOpen ? "▲ Show less" : "▼ Read more"}
                          </button>
                        )}

                        {affair.tags?.length > 0 && (
                          <div className="article-tags">
                            {affair.tags.map((tag, i) => (
                              <span key={i} className="article-tag">{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

          </div>
        </main>
      </div>
    </>
  );
}