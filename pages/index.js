import { useState, useEffect } from "react";
import Link from "next/link";

const COLORS = {
  ink: "#1C1208",
  saffron: "#E8871A",
  saffronLight: "#F5A84E",
  cream: "#FDFAF5",
  border: "#EDE8DF",
  muted: "#A88A5A",
  white: "#fff",
};

const slides = [
  {
    tag: "UPSC CSE · IAS · IPS · IRS",
    title: ["Your ", "smarter", " path to civil services."],
    sub: "Notes, PYQs, Mock Tests & Daily Current Affairs — built for serious aspirants.",
  },
  {
    tag: "Indian Administrative Service",
    title: ["Your IAS journey ", "starts", " here."],
    sub: "Access 10 years of PYQs, customizable mock tests & daily updates.",
  },
  {
    tag: "Current Affairs & Notifications",
    title: ["Stay updated.", " Stay", " ahead."],
    sub: "Daily current affairs, job notifications & exam reminders — all in one place.",
  },
];

const features = [
  { icon: "📝", name: "Smart Notes", desc: "Write, organize & download notes as PDF", bg: "#FEF3E2" },
  { icon: "📰", name: "Current Affairs", desc: "Daily updates curated for Prelims & Mains", bg: "#E8F5E9" },
  { icon: "🧪", name: "Mock Tests", desc: "Subject-wise & year-wise customizable tests", bg: "#EDE7F6" },
  { icon: "📚", name: "PYQ Papers", desc: "Last 10 years of previous year questions", bg: "#E3F2FD" },
  { icon: "💼", name: "Job Updates", desc: "Latest UPSC & government recruitment news", bg: "#FCE4EC" },
  { icon: "📅", name: "Exam Calendar", desc: "Smart reminders for all important dates", bg: "#FFF8E1" },
  { icon: "📥", name: "PDF Library", desc: "Download study material & resources offline", bg: "#E8F5E9" },
  { icon: "📈", name: "Analytics", desc: "Track your progress & improve scores", bg: "#EDE7F6" },
];

const quickLinks = [
  { icon: "📚", name: "Previous Year Papers", sub: "Last 10 years · Filter by topic", bg: "#FEF3E2" },
  { icon: "📰", name: "Today's Current Affairs", sub: "Updated for Prelims & Mains", bg: "#E8F5E9" },
  { icon: "📅", name: "Exam Calendar", sub: "Upcoming deadlines & alerts", bg: "#EDE7F6" },
  { icon: "💼", name: "Job Notifications", sub: "Latest UPSC recruitment news", bg: "#FCE4EC" },
];

const tabs = [
  { icon: "🏠", label: "Home" },
  { icon: "📰", label: "Affairs" },
  { icon: "🧪", label: "Tests" },
  { icon: "📚", label: "PYQs" },
  { icon: "👤", label: "Profile" },
];

export default function Home() {
  const [slide, setSlide] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % slides.length), 4500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const s = slides[slide];

  /* ─────────────────────────────────────────
     MOBILE PWA LAYOUT
  ───────────────────────────────────────── */
  if (isMobile) {
    return (
      <div style={{
        minHeight: "100vh",
        background: COLORS.cream,
        fontFamily: "-apple-system, 'Inter', sans-serif",
        display: "flex",
        flexDirection: "column",
        maxWidth: 430,
        margin: "0 auto",
      }}>
        {/* Hero (dark ink) */}
        <div style={{ background: COLORS.ink, paddingBottom: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px 0", color: "rgba(255,255,255,0.45)", fontSize: 12 }}>
            <span style={{ color: "#fff", fontSize: 15, fontWeight: 700 }}>9:41</span>
            <span>●●● WiFi 🔋</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <div style={{ width: 34, height: 34, background: COLORS.saffron, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>📚</div>
              <span style={{ color: "#fff", fontSize: 19, fontWeight: 800, letterSpacing: "-0.4px" }}>NotesCafe</span>
            </div>
            <Link href="/login" style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", padding: "7px 18px", borderRadius: 50, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>Login</Link>
          </div>

          <div style={{ padding: "24px 20px 0" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(232,135,26,0.2)", border: "1px solid rgba(232,135,26,0.35)", color: COLORS.saffronLight, padding: "5px 13px", borderRadius: 50, fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 16 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.saffron }} />
              {s.tag}
            </div>
            <h1 style={{ color: "#fff", fontSize: 25, fontWeight: 800, lineHeight: 1.22, marginBottom: 10, letterSpacing: "-0.5px" }}>
              {s.title[0]}<span style={{ color: COLORS.saffronLight }}>{s.title[1]}</span>{s.title[2]}
            </h1>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13.5, lineHeight: 1.65, marginBottom: 22 }}>{s.sub}</p>
            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
              <Link href="/login" style={{ flex: 1, background: COLORS.saffron, color: COLORS.ink, padding: 14, borderRadius: 14, fontSize: 14, fontWeight: 800, textDecoration: "none", textAlign: "center" }}>Start Free Prep →</Link>
              <button style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", padding: "14px 18px", borderRadius: 14, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Browse</button>
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
              {slides.map((_, i) => (
                <button key={i} onClick={() => setSlide(i)} style={{ height: 6, width: i === slide ? 24 : 6, borderRadius: 50, background: i === slide ? COLORS.saffron : "rgba(255,255,255,0.2)", border: "none", cursor: "pointer", padding: 0, transition: "all 0.3s ease" }} />
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", background: "rgba(255,255,255,0.04)", borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)" }}>
              {[{ n: "10+", l: "Yrs PYQs" }, { n: "500+", l: "Tests" }, { n: "Daily", l: "Updates" }, { n: "Free", l: "To Start" }].map((st, i) => (
                <div key={i} style={{ padding: "13px 6px", textAlign: "center", borderRight: i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                  <div style={{ color: COLORS.saffronLight, fontSize: 16, fontWeight: 800 }}>{st.n}</div>
                  <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 500, marginTop: 2 }}>{st.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ background: COLORS.cream, padding: "22px 20px 0", flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>Explore features</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 22 }}>
            {features.slice(0, 4).map((f, i) => (
              <div key={i} style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 14, cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: f.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{f.icon}</div>
                  <span style={{ color: COLORS.border, fontSize: 18 }}>›</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.ink, marginBottom: 3 }}>{f.name}</div>
                <div style={{ fontSize: 11, color: COLORS.muted, lineHeight: 1.45 }}>{f.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ height: 1, background: COLORS.border, marginBottom: 20 }} />
          <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.ink, marginBottom: 12 }}>Quick access</div>
          {quickLinks.map((q, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 13, background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "13px 14px", marginBottom: 9, cursor: "pointer" }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: q.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, flexShrink: 0 }}>{q.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: COLORS.ink }}>{q.name}</div>
                <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>{q.sub}</div>
              </div>
              <span style={{ color: COLORS.border, fontSize: 20 }}>›</span>
            </div>
          ))}
        </div>

        {/* Bottom tab bar */}
        <div style={{ background: COLORS.white, borderTop: `1px solid ${COLORS.border}`, display: "flex", padding: "12px 0 28px", position: "sticky", bottom: 0 }}>
          {tabs.map((t, i) => (
            <button key={i} onClick={() => setActiveTab(i)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, border: "none", background: "none", cursor: "pointer", color: i === activeTab ? COLORS.saffron : "#C8B99A" }}>
              <span style={{ fontSize: 21 }}>{t.icon}</span>
              <span style={{ fontSize: 10, fontWeight: 600 }}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────
     DESKTOP WEB LAYOUT
  ───────────────────────────────────────── */
  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", color: COLORS.ink, overflowX: "hidden", background: COLORS.cream }}>

      {/* NAVBAR */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        padding: "0 40px", height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: scrolled ? "rgba(253,250,245,0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        boxShadow: scrolled ? `0 1px 0 ${COLORS.border}` : "none",
        transition: "all 0.3s ease",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, background: COLORS.saffron, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📚</div>
          <span style={{ fontWeight: 800, fontSize: 20, color: scrolled ? COLORS.ink : "#fff", letterSpacing: "-0.4px" }}>NotesCafe</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
          {["Features", "About", "Resources"].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} style={{ color: scrolled ? COLORS.muted : "rgba(255,255,255,0.75)", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>{item}</a>
          ))}
          <Link href="/login" style={{ background: COLORS.saffron, color: COLORS.ink, padding: "8px 22px", borderRadius: 50, textDecoration: "none", fontSize: 14, fontWeight: 700 }}>
            Login / Register
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        minHeight: "100vh", background: COLORS.ink,
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", textAlign: "center",
        padding: "120px 40px 80px", position: "relative", overflow: "hidden",
      }}>
        {/* Subtle bg texture circles */}
        <div style={{ position: "absolute", top: "8%", left: "4%", width: 500, height: 500, borderRadius: "50%", background: "rgba(232,135,26,0.06)", filter: "blur(80px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "8%", right: "4%", width: 600, height: 600, borderRadius: "50%", background: "rgba(232,135,26,0.04)", filter: "blur(100px)", pointerEvents: "none" }} />

        {/* Pill tag */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(232,135,26,0.15)", border: "1px solid rgba(232,135,26,0.3)", color: COLORS.saffronLight, padding: "6px 18px", borderRadius: 50, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 28 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.saffron }} />
          {s.tag}
        </div>

        <h1 style={{ fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 800, color: "#fff", lineHeight: 1.12, maxWidth: 860, marginBottom: 22, letterSpacing: "-1px", transition: "all 0.5s ease" }}>
          {s.title[0]}<span style={{ color: COLORS.saffronLight }}>{s.title[1]}</span>{s.title[2]}
        </h1>

        <p style={{ fontSize: "clamp(15px, 1.6vw, 20px)", color: "rgba(255,255,255,0.55)", maxWidth: 560, lineHeight: 1.75, marginBottom: 40 }}>
          {s.sub}
        </p>

        <div style={{ display: "flex", gap: 14, marginBottom: 48, alignItems: "center" }}>
          <Link href="/login" style={{ background: COLORS.saffron, color: COLORS.ink, padding: "16px 40px", borderRadius: 50, textDecoration: "none", fontSize: 16, fontWeight: 800, letterSpacing: "-0.3px" }}>
            🚀 Start UPSC Prep — Free
          </Link>
          <a href="#features" style={{ border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.75)", padding: "16px 32px", borderRadius: 50, textDecoration: "none", fontSize: 15, fontWeight: 600 }}>
            Explore features ↓
          </a>
        </div>

        {/* Slide dots */}
        <div style={{ display: "flex", gap: 8, marginBottom: 52 }}>
          {slides.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)} style={{ height: 7, width: i === slide ? 32 : 7, borderRadius: 50, background: i === slide ? COLORS.saffron : "rgba(255,255,255,0.2)", border: "none", cursor: "pointer", padding: 0, transition: "all 0.3s ease" }} />
          ))}
        </div>

        {/* Stats strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "rgba(255,255,255,0.08)", borderRadius: 20, overflow: "hidden", maxWidth: 720, width: "100%" }}>
          {[{ n: "10+", l: "Years of PYQs" }, { n: "500+", l: "Mock Tests" }, { n: "Daily", l: "Current Affairs" }, { n: "Free", l: "To Get Started" }].map((st, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.04)", padding: "22px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: COLORS.saffronLight }}>{st.n}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 500, marginTop: 4 }}>{st.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding: "100px 40px", background: COLORS.cream }}>
        <div style={{ maxWidth: 1140, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div style={{ display: "inline-block", background: "#FEF3E2", color: COLORS.saffron, padding: "4px 14px", borderRadius: 50, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>Features</div>
            <h2 style={{ fontSize: 38, fontWeight: 800, marginBottom: 14, color: COLORS.ink, letterSpacing: "-0.5px" }}>Everything you need to crack UPSC</h2>
            <p style={{ color: COLORS.muted, fontSize: 17, maxWidth: 480, margin: "0 auto", lineHeight: 1.7 }}>One platform. All tools. Built specifically for UPSC Civil Services aspirants.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {features.map((f, i) => (
              <div key={i} style={{ background: COLORS.white, borderRadius: 20, padding: 24, border: `1px solid ${COLORS.border}`, cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: f.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 14 }}>{f.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 7, color: COLORS.ink }}>{f.name}</div>
                <div style={{ color: COLORS.muted, fontSize: 13, lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" style={{ padding: "100px 40px", background: COLORS.white }}>
        <div style={{ maxWidth: 1140, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <div>
            <div style={{ display: "inline-block", background: "#FEF3E2", color: COLORS.saffron, padding: "4px 14px", borderRadius: 50, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 18 }}>About NotesCafe</div>
            <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 18, color: COLORS.ink, letterSpacing: "-0.5px", lineHeight: 1.2 }}>Not a coaching.<br />A smarter way to prepare.</h2>
            <p style={{ color: COLORS.muted, lineHeight: 1.85, marginBottom: 28, fontSize: 15 }}>
              NotesCafe is India&apos;s premier UPSC preparation platform. We give you the tools — smart notes, current affairs, mock tests, PYQs — so you stay in control of your own preparation.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 13, marginBottom: 36 }}>
              {[
                "Create & sync notes across all devices, download as PDF",
                "Daily current affairs curated for Prelims & Mains",
                "10 years of PYQs filtered by year, subject & topic",
                "Mock tests customized to your target exam & year",
                "Calendar reminders for all important UPSC dates",
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", fontSize: 14, color: COLORS.ink }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#E8F5E9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, flexShrink: 0, marginTop: 1 }}>✓</div>
                  {item}
                </div>
              ))}
            </div>
            <Link href="/login" style={{ background: COLORS.saffron, color: COLORS.ink, padding: "13px 32px", borderRadius: 50, textDecoration: "none", fontSize: 15, fontWeight: 800, display: "inline-block" }}>
              Start Preparation →
            </Link>
          </div>

          {/* UPSC info card */}
          <div style={{ background: COLORS.ink, borderRadius: 28, padding: 36, color: "#fff" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", marginBottom: 24, textTransform: "uppercase", letterSpacing: "0.1em" }}>UPSC Civil Services — At a Glance</div>
            {[
              { stage: "Stage 1", name: "Prelims", detail: "GS Paper I + CSAT · Objective MCQ · 400 marks" },
              { stage: "Stage 2", name: "Mains", detail: "9 Papers · Descriptive · 1750 marks" },
              { stage: "Stage 3", name: "Interview", detail: "Personality Test · 275 marks" },
            ].map((st, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 14, padding: "16px 18px", marginBottom: 10, borderLeft: `3px solid ${COLORS.saffron}`, borderRadius: "0 14px 14px 0" }}>
                <div style={{ fontSize: 11, color: COLORS.saffronLight, fontWeight: 600, marginBottom: 4 }}>{st.stage}</div>
                <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 15 }}>{st.name}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{st.detail}</div>
              </div>
            ))}
            <div style={{ marginTop: 16, padding: "13px", background: "rgba(232,135,26,0.12)", border: "1px solid rgba(232,135,26,0.2)", borderRadius: 12, fontSize: 13, color: COLORS.saffronLight, textAlign: "center", fontWeight: 600 }}>
              Services: IAS · IPS · IRS · IFS · IFoS
            </div>
          </div>
        </div>
      </section>

      {/* RESOURCES */}
      <section id="resources" style={{ padding: "100px 40px", background: COLORS.ink }}>
        <div style={{ maxWidth: 1140, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div style={{ display: "inline-block", background: "rgba(232,135,26,0.15)", color: COLORS.saffronLight, padding: "4px 14px", borderRadius: 50, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>Resources</div>
            <h2 style={{ fontSize: 38, fontWeight: 800, color: "#fff", marginBottom: 14, letterSpacing: "-0.5px" }}>All your resources. One platform.</h2>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 16 }}>Built for UPSC aspirants who want to stay ahead.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {[
              { icon: "📰", title: "Daily Current Affairs", desc: "Day-by-day news coverage curated for Prelims & Mains with PYQ relevance mapping.", bg: "#FEF3E2" },
              { icon: "📚", title: "Previous Year Papers", desc: "10 years of UPSC PYQs with solutions. Filter by year, subject & topic.", bg: "#E8F5E9" },
              { icon: "🧪", title: "Mock Tests", desc: "Customizable tests by exam type (Prelims/Mains/State PCS) and year of attempt.", bg: "#EDE7F6" },
              { icon: "📥", title: "PDF Library", desc: "Download notes, cheat sheets & summary docs for all subjects. Study offline.", bg: "#FFF8E1" },
              { icon: "💼", title: "Job Notifications", desc: "Latest UPSC & government recruitment announcements — never miss a deadline.", bg: "#FCE4EC" },
              { icon: "📅", title: "Exam Calendar", desc: "Smart reminders for application deadlines, exam dates and result announcements.", bg: "#E3F2FD" },
            ].map((r, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: 26, cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.07)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}>
                <div style={{ width: 46, height: 46, borderRadius: 13, background: r.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 14 }}>{r.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#fff", marginBottom: 8 }}>{r.title}</div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, lineHeight: 1.65 }}>{r.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section style={{ padding: "90px 40px", background: COLORS.saffron, textAlign: "center" }}>
        <h2 style={{ fontSize: 42, fontWeight: 800, color: COLORS.ink, marginBottom: 14, letterSpacing: "-0.5px" }}>Ready to start your UPSC journey?</h2>
        <p style={{ color: "rgba(28,18,8,0.65)", fontSize: 17, marginBottom: 36 }}>Join thousands of aspirants preparing smarter with NotesCafe.</p>
        <Link href="/login" style={{ background: COLORS.ink, color: COLORS.saffronLight, padding: "16px 44px", borderRadius: 50, textDecoration: "none", fontSize: 16, fontWeight: 800, display: "inline-block" }}>
          Get Started — It&apos;s Free
        </Link>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#0A0804", padding: "56px 40px 28px", color: "rgba(255,255,255,0.4)" }}>
        <div style={{ maxWidth: 1140, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 48, marginBottom: 48 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
                <div style={{ width: 32, height: 32, background: COLORS.saffron, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📚</div>
                <span style={{ fontWeight: 800, fontSize: 17, color: "#fff" }}>NotesCafe</span>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.75, maxWidth: 240 }}>India&apos;s premier UPSC preparation platform. Smart notes, current affairs, mock tests & PYQs.</p>
            </div>
            {[
              { title: "Product", links: ["Features", "Resources", "UPSC Info", "Pricing"] },
              { title: "Company", links: ["About", "Careers", "Terms", "Privacy"] },
              { title: "Support", links: ["Contact Us", "Help Center", "Feedback"] },
            ].map((col, i) => (
              <div key={i}>
                <div style={{ fontWeight: 700, fontSize: 12, color: "#fff", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.08em" }}>{col.title}</div>
                {col.links.map(link => (
                  <a key={link} href="#" style={{ display: "block", fontSize: 13, color: "rgba(255,255,255,0.35)", textDecoration: "none", marginBottom: 10 }}>{link}</a>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 24, textAlign: "center", fontSize: 12 }}>
            © 2025 NotesCafe — Your UPSC Preparation Companion. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
