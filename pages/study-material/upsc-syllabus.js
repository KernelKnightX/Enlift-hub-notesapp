import { useState, useRef, useEffect } from "react";

const EXAM_STAGES = [
  {
    code: "STAGE / 01",
    name: "Preliminary Examination",
    short: "Prelims",
    desc: "Objective screening test. Marks are not counted for the final merit list — only used for qualifying into Mains.",
    papers: 2,
    marks: 400,
    nature: "Objective (MCQ)",
  },
  {
    code: "STAGE / 02",
    name: "Main Examination",
    short: "Mains",
    desc: "Written, descriptive examination. These marks count toward the final merit list.",
    papers: 9,
    marks: 1750,
    nature: "Descriptive",
  },
  {
    code: "STAGE / 03",
    name: "Personality Test",
    short: "Interview",
    desc: "Interview before a Board, assessing personality suitability for a career in public service.",
    papers: null,
    marks: 275,
    nature: "Interview",
  },
];

const PRELIMS_PAPERS = [
  {
    code: "GS-I",
    title: "General Studies Paper I",
    meta: "100 questions · 200 marks · 2 hours",
    sections: [
      {
        title: "Current Events",
        topics: ["National events of significance", "International events and their bearing on India"],
      },
      {
        title: "History",
        topics: ["History of India", "Indian National Movement — stages, leaders, ideologies"],
      },
      {
        title: "Geography",
        topics: ["Indian geography", "World geography — physical, social, economic"],
      },
      {
        title: "Polity & Governance",
        topics: ["Constitution", "Political system", "Panchayati Raj", "Public policy", "Rights issues"],
      },
      {
        title: "Economic & Social Development",
        topics: ["Sustainable development", "Poverty and inclusion", "Demographics", "Social sector initiatives"],
      },
      {
        title: "Environment",
        topics: ["Ecology and biodiversity", "Climate change — general awareness, no subject specialisation assumed"],
      },
      {
        title: "General Science",
        topics: ["General science — no specialised background assumed"],
      },
    ],
    whatToStudy: {
      note:
        "GS-I is broad by design — the paper rewards a wide static base and current-affairs recall more than depth in any one subject.",
      resources: ["NCERT Class VI–XII (History, Geography, Polity, Economy)", "Previous Year Question analysis", "A daily current affairs habit"],
    },
  },
  {
    code: "CSAT",
    title: "General Studies Paper II (CSAT)",
    meta: "80 questions · 200 marks · qualifying (33% required) · 2 hours",
    sections: [
      { title: "Comprehension", topics: ["Passage-based reading comprehension"] },
      { title: "Interpersonal & Communication Skills", topics: ["Interpersonal skills including communication"] },
      { title: "Logical Reasoning & Analytical Ability", topics: ["Logical reasoning", "Analytical ability"] },
      { title: "Decision Making & Problem Solving", topics: ["Decision-making", "Problem-solving"] },
      { title: "General Mental Ability", topics: ["General mental ability"] },
      {
        title: "Basic Numeracy",
        topics: ["Numbers and their relations", "Orders of magnitude (Class X level)", "Data interpretation — charts, graphs, tables (Class X level)"],
      },
    ],
    whatToStudy: {
      note: "CSAT is qualifying only, but a real number of aspirants lose out here every year purely on time management, not difficulty.",
      resources: ["Timed sectional practice", "Basic Class X arithmetic revision", "Previous Year Question sets under exam conditions"],
    },
  },
];

const MAINS_PAPERS = [
  {
    code: "PAPER-A",
    title: "Indian Language",
    meta: "300 marks · qualifying",
    sections: [{ title: "Any language from the Eighth Schedule", topics: ["Comprehension", "Precis writing", "Usage & vocabulary", "Short essays", "Translation — English to the language and vice versa"] }],
    whatToStudy: { note: "Qualifying paper — a matriculation-level command of the chosen language is generally sufficient.", resources: [] },
  },
  {
    code: "PAPER-B",
    title: "English",
    meta: "300 marks · qualifying",
    sections: [{ title: "English language", topics: ["Comprehension", "Precis writing", "Usage & vocabulary", "Short essays"] }],
    whatToStudy: { note: "Qualifying paper — tests basic proficiency, not literary command.", resources: [] },
  },
  {
    code: "ESSAY",
    title: "Essay",
    meta: "250 marks",
    sections: [{ title: "Essay", topics: ["Two essays, one from each of two sections of topics", "Ability to articulate ideas concisely within a clear structure"] }],
    whatToStudy: {
      note: "Structure and coherence tend to matter more than sheer information density.",
      resources: ["Practice writing under time limits", "Reading a range of thinkers across ethics, economy, society, and governance"],
    },
  },
  {
    code: "GS-I",
    title: "General Studies I",
    meta: "250 marks",
    sections: [
      { title: "Indian Heritage & Culture", topics: ["Art forms", "Literature", "Architecture from ancient to modern times"] },
      { title: "Modern Indian History", topics: ["From about the mid-eighteenth century to the present", "Significant events, personalities, issues"] },
      { title: "Freedom Struggle", topics: ["Its various stages", "Important contributors and contributions from different parts of the country"] },
      { title: "Post-Independence Consolidation", topics: ["Consolidation and reorganisation within the country"] },
      { title: "World History", topics: ["Events from the 18th century — industrial revolution, world wars, redrawing of national boundaries, colonisation, decolonisation"] },
      { title: "Indian Society", topics: ["Salient features", "Diversity of India", "Role of women, population, poverty and developmental issues", "Urbanisation", "Globalisation and Indian society"] },
      { title: "Geography", topics: ["Salient features of world physical geography", "Distribution of key natural resources", "Factors for location of industries", "Important geophysical phenomena"] },
    ],
    whatToStudy: {
      note: "GS-I is the most static, syllabus-anchored of the four GS papers — depth from standard references pays off directly.",
      resources: ["NCERT + a standard modern history text", "A standard geography reference", "Society topics tracked through current affairs"],
    },
  },
  {
    code: "GS-II",
    title: "General Studies II",
    meta: "250 marks",
    sections: [
      { title: "Constitution & Polity", topics: ["Indian Constitution — historical underpinnings, evolution, features, amendments", "Functions and responsibilities of the Union and States"] },
      { title: "Governance", topics: ["Government policies and interventions", "Development processes and the role of NGOs, SHGs", "Welfare schemes for vulnerable sections"] },
      { title: "Social Justice", topics: ["Issues relating to development and management of health, education, human resources"] },
      { title: "International Relations", topics: ["India and its neighbourhood", "Bilateral, regional and global groupings", "Effect of policies of developed and developing countries on India's interests", "Indian diaspora"] },
    ],
    whatToStudy: {
      note: "The paper most tied to current affairs of any GS paper — polity fundamentals stay static, governance and IR content shifts yearly.",
      resources: ["A standard Indian Polity text", "PRS Legislative Research for bill/policy tracking", "Monthly current affairs consolidation"],
    },
  },
  {
    code: "GS-III",
    title: "General Studies III",
    meta: "250 marks",
    sections: [
      { title: "Economy", topics: ["Indian economy — planning, resource mobilisation, growth, development, employment", "Government budgeting", "Land reforms in India"] },
      { title: "Agriculture", topics: ["Major crops and cropping patterns", "Irrigation systems", "Food processing", "Storage, transport and marketing of agricultural produce"] },
      { title: "Science & Technology", topics: ["Developments and their applications", "Indigenisation of technology", "Awareness in IT, space, computers, robotics, nano-technology, biotechnology"] },
      { title: "Environment", topics: ["Conservation", "Environmental pollution and degradation", "Environmental impact assessment"] },
      { title: "Disaster Management", topics: ["Disaster and disaster management"] },
      { title: "Internal Security", topics: ["Linkages of organised crime with terrorism", "Role of external state and non-state actors", "Security challenges and their management in border areas", "Cyber security"] },
    ],
    whatToStudy: {
      note: "The widest paper in scope — the economy and S&T sections reward a working, applied understanding over rote definitions.",
      resources: ["Economic Survey (annual)", "A standard economy reference", "Current affairs for S&T and internal security"],
    },
  },
  {
    code: "GS-IV",
    title: "General Studies IV — Ethics",
    meta: "250 marks",
    sections: [
      { title: "Ethics & Human Interface", topics: ["Essence, determinants and consequences of ethics in human actions"] },
      { title: "Attitude", topics: ["Content, structure, function", "Influence and relation with thought and behaviour", "Moral and political attitudes", "Social influence and persuasion"] },
      { title: "Aptitude & Foundational Values", topics: ["Integrity", "Impartiality and non-partisanship", "Objectivity", "Dedication to public service", "Empathy, tolerance and compassion toward the weaker sections"] },
      { title: "Emotional Intelligence", topics: ["Concepts and their utility in administration and governance"] },
      { title: "Case Studies", topics: ["Applied ethics — case studies drawn from administrative and everyday situations"] },
    ],
    whatToStudy: {
      note: "Case studies typically carry the bulk of the marks in this paper — the theory sections exist to give you a vocabulary, not to be memorised verbatim.",
      resources: ["A standard ethics reference for the theory portion", "Deliberate case-study practice with model answers"],
    },
  },
];

const OPTIONAL_SUBJECT = {
  code: "OPT-I / OPT-II",
  title: "Optional Subject",
  meta: "2 papers · 250 marks each · 500 marks total",
  desc:
    "Chosen from a list of around 48 subjects — literature of one of the listed languages, or a subject such as Public Administration, Sociology, Geography, History, Anthropology, and others. Because the choice materially changes preparation strategy, it is covered on its own page rather than folded into this syllabus.",
};

const PREP_STEPS = [
  { title: "Read the syllabus as written", desc: "Go through the official wording line by line before opening any book — every year's questions are traceable back to a syllabus phrase." },
  { title: "Break it into subjects", desc: "Split GS papers into their component subjects and treat each as its own preparation track with its own sources." },
  { title: "Map each topic to a source", desc: "Assign a primary reference — NCERT, a standard text, or current affairs — to every topic so nothing is left source-less." },
  { title: "Practise previous-year questions", desc: "Use PYQs to calibrate depth: they show exactly how much detail a topic actually needs." },
  { title: "Revise on a cycle", desc: "Static portions decay without revision — build a repeat cycle rather than a one-time read." },
];

const RELATED_RESOURCES = [
  { label: "NCERT Books", href: "/study-material/ncert-books" },
  { label: "Standard Books", href: "/study-material/standard-books" },
  { label: "Previous Year Questions", href: "/study-material/pyqs" },
  { label: "Study Planner", href: "/planner" },
  { label: "Mock Tests", href: "/tests" },
];

const FAQS = [
  {
    q: "Is the Prelims syllabus the same for GS Paper I and CSAT every year?",
    a: "The structure has stayed stable for years, but always cross-check against the current year's official notification before finalising a study plan — small wording changes do happen.",
  },
  {
    q: "Do Prelims marks count toward the final rank?",
    a: "No. Prelims is only a qualifying screening test. Only Mains and Interview marks count toward the final merit list.",
  },
  {
    q: "How is the optional subject chosen?",
    a: "You choose one subject from the list of allowed optionals at the time of filling the Mains application. It contributes 500 marks across two papers, so the choice deserves its own research — see the dedicated Optional Subjects page.",
  },
  {
    q: "Is GS-IV (Ethics) only theory?",
    a: "No — a significant share of GS-IV marks comes from applied case studies, not the theoretical sections.",
  },
];

/* ---------------------------------------------------------------------
   Small building blocks
   --------------------------------------------------------------------- */


function Chevron({ open }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .2s ease" }}
      aria-hidden="true"
    >
      <path d="M3 5.5L7 9.5L11 5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PaperBlock({ paper }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="paper-block">
      <div className="paper-block__head">
        <span className="paper-code">{paper.code}</span>
        <div className="paper-block__heading">
          <h4>{paper.title}</h4>
          <span className="paper-meta">{paper.meta}</span>
        </div>
      </div>

      <div className="paper-block__sections">
        {paper.sections.map((s, i) => (
          <div className="syllabus-section" key={s.title}>
            <span className="syllabus-index">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <div className="syllabus-section__title">{s.title}</div>
              <ul>
                {s.topics.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {paper.whatToStudy && (paper.whatToStudy.note || paper.whatToStudy.resources.length > 0) && (
        <div className="what-to-study">
          <button className="what-to-study__toggle" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
            <span>What to study</span>
            <Chevron open={open} />
          </button>
          {open && (
            <div className="what-to-study__body">
              <p>{paper.whatToStudy.note}</p>
              {paper.whatToStudy.resources.length > 0 && (
                <>
                  <span className="what-to-study__label">Recommended</span>
                  <ul>
                    {paper.whatToStudy.resources.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const NAV_ITEMS = [
  { id: "overview", label: "Overview" },
  { id: "structure", label: "Structure" },
  { id: "prelims", label: "Prelims" },
  { id: "mains", label: "Mains" },
  { id: "how-to-use", label: "How to use" },
  { id: "continue", label: "Continue" },
  { id: "faq", label: "FAQ" },
];

/* ---------------------------------------------------------------------
   Page
   --------------------------------------------------------------------- */

export default function UpscSyllabusPage() {
  const [tab, setTab] = useState("prelims");
  const [activeSection, setActiveSection] = useState("overview");
  const [openFaq, setOpenFaq] = useState(null);
  const sectionRefs = useRef({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -50% 0px" }
    );
    NAV_ITEMS.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const jump = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="syllabus-page">
      {/* ---------------- HERO / MASTHEAD ---------------- */}
      <header className="hero" id="overview">
        <div className="hero__inner">
          <div className="hero__text">
            <span className="eyebrow">Study Material · Reference Copy</span>
            <h1>
              UPSC Civil Services
              <br />
              Examination Syllabus
            </h1>
            <p className="hero__desc">
              The complete Prelims and Mains syllabus, organised paper by paper —
              structured for planning, not just reading.
            </p>
            <div className="hero__actions">
              <a className="btn btn--primary" href="#prelims">
                Start with Prelims
              </a>
              <a className="btn btn--ghost" href="/downloads/upsc-syllabus.pdf">
                Download as PDF
              </a>
            </div>
            <span className="hero__updated">Structure verified · 2026 cycle</span>
          </div>
          <div className="hero__seal">
        
          </div>
        </div>
      </header>

      {/* ---------------- STICKY SUB-NAV ---------------- */}
      <nav className="subnav">
        <div className="subnav__inner">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`subnav__item ${activeSection === item.id ? "is-active" : ""}`}
              onClick={() => jump(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      <main>
        {/* ---------------- EXAM STRUCTURE ---------------- */}
        <section className="section" id="structure">
          <div className="section__head">
            <span className="section__kicker">Exam at a glance</span>
            <h2>Three stages, one merit list</h2>
          </div>

          <div className="stages">
            {EXAM_STAGES.map((stage, i) => (
              <div className="stage-stub" key={stage.short}>
                <div className="stage-stub__top">
                  <span className="stage-stub__code">{stage.code}</span>
                  <span className="stage-stub__nature">{stage.nature}</span>
                </div>
                <h3>{stage.name}</h3>
                <p>{stage.desc}</p>
                <div className="stage-stub__ledger">
                  {stage.papers && (
                    <div>
                      <span className="ledger-num">{stage.papers}</span>
                      <span className="ledger-label">Papers</span>
                    </div>
                  )}
                  <div>
                    <span className="ledger-num">{stage.marks}</span>
                    <span className="ledger-label">Marks</span>
                  </div>
                </div>
                {i < EXAM_STAGES.length - 1 && <div className="stage-stub__perf" aria-hidden="true" />}
              </div>
            ))}
          </div>

          <div className="ledger-table">
            <div className="ledger-table__row ledger-table__row--head">
              <span>Stage</span>
              <span>Papers</span>
              <span>Marks</span>
              <span>Counts to rank</span>
            </div>
            <div className="ledger-table__row">
              <span>Prelims</span>
              <span>2</span>
              <span>400</span>
              <span>No — qualifying only</span>
            </div>
            <div className="ledger-table__row">
              <span>Mains</span>
              <span>9</span>
              <span>1750</span>
              <span>Yes</span>
            </div>
            <div className="ledger-table__row">
              <span>Interview</span>
              <span>—</span>
              <span>275</span>
              <span>Yes</span>
            </div>
            <div className="ledger-table__row ledger-table__row--total">
              <span>Total (final merit)</span>
              <span>—</span>
              <span>2025</span>
              <span>Mains + Interview</span>
            </div>
          </div>
        </section>

        {/* ---------------- SYLLABUS BROWSER ---------------- */}
        <section className="section section--tight" id="syllabus">
          <div className="section__head">
            <span className="section__kicker">Full syllabus</span>
            <h2>Paper-wise breakdown</h2>
          </div>

          <div className="tabbar">
            <button className={`tabbar__btn ${tab === "prelims" ? "is-active" : ""}`} onClick={() => setTab("prelims")} id="prelims">
              Prelims
            </button>
            <button className={`tabbar__btn ${tab === "mains" ? "is-active" : ""}`} onClick={() => setTab("mains")} id="mains">
              Mains
            </button>
          </div>

          {tab === "prelims" && (
            <div className="paper-list">
              {PRELIMS_PAPERS.map((p) => (
                <PaperBlock paper={p} key={p.code} />
              ))}
            </div>
          )}

          {tab === "mains" && (
            <div className="paper-list">
              {MAINS_PAPERS.map((p) => (
                <PaperBlock paper={p} key={p.code} />
              ))}
              <div className="optional-card">
                <span className="paper-code">{OPTIONAL_SUBJECT.code}</span>
                <div>
                  <h4>{OPTIONAL_SUBJECT.title}</h4>
                  <span className="paper-meta">{OPTIONAL_SUBJECT.meta}</span>
                  <p>{OPTIONAL_SUBJECT.desc}</p>
                  <a href="/study-material/optional-subjects" className="text-link">
                    Browse optional subjects →
                  </a>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ---------------- HOW TO USE ---------------- */}
        <section className="section" id="how-to-use">
          <div className="section__head">
            <span className="section__kicker">Using this page</span>
            <h2>How to work through the syllabus</h2>
          </div>
          <ol className="steps">
            {PREP_STEPS.map((step, i) => (
              <li key={step.title}>
                <span className="steps__num">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h4>{step.title}</h4>
                  <p>{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ---------------- CONTINUE PREPARATION ---------------- */}
        <section className="section section--muted" id="continue">
          <div className="section__head">
            <span className="section__kicker">Next</span>
            <h2>Continue your preparation</h2>
          </div>
          <div className="chain">
            {RELATED_RESOURCES.map((r, i) => (
              <div className="chain__item" key={r.label}>
                <a href={r.href}>{r.label}</a>
                {i < RELATED_RESOURCES.length - 1 && <span className="chain__arrow">→</span>}
              </div>
            ))}
          </div>
        </section>

        {/* ---------------- FAQ ---------------- */}
        <section className="section" id="faq">
          <div className="section__head">
            <span className="section__kicker">FAQ</span>
            <h2>Common questions</h2>
          </div>
          <div className="faq-list">
            {FAQS.map((item, i) => (
              <div className="faq-item" key={item.q}>
                <button className="faq-item__q" onClick={() => setOpenFaq(openFaq === i ? null : i)} aria-expanded={openFaq === i}>
                  <span>{item.q}</span>
                  <Chevron open={openFaq === i} />
                </button>
                {openFaq === i && <p className="faq-item__a">{item.a}</p>}
              </div>
            ))}
          </div>
        </section>

        <p className="disclaimer">
          This page reflects the standard structure of the UPSC Civil Services Examination syllabus.
          Paper codes, marks distribution and section wording should be cross-checked against the
          current year's official UPSC notification before relying on them for exam-day decisions.
        </p>
      </main>

 <style jsx>{`
  /* ============================================================
     UPSC SYLLABUS PAGE
     Uses the existing Notes Cafe global design system.
     No global styles are modified.
     ============================================================ */

  .syllabus-page {
    width: 100%;
    background: var(--color-bg);
    color: var(--color-ink);
    font-family: var(--font-sans);
    line-height: 1.55;
  }

  .syllabus-page h1,
  .syllabus-page h2,
  .syllabus-page h3,
  .syllabus-page h4 {
    margin: 0;
    font-family: var(--font-serif);
    font-weight: 700;
    color: var(--color-ink);
    letter-spacing: -0.025em;
  }

  .syllabus-page p {
    margin-top: 0;
  }

  /* ============================================================
     HERO
     ============================================================ */

  .hero {
    padding: 72px 24px 64px;
    background: var(--color-bg);
    border-bottom: 1px solid var(--color-border);
  }

  .hero__inner {
    width: min(1120px, 100%);
    margin: 0 auto;
    display: grid;
    grid-template-columns: minmax(0, 1fr) 180px;
    align-items: center;
    gap: 64px;
  }

  .eyebrow {
    display: inline-flex;
    align-items: center;
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color-primary);
  }

  .hero h1 {
    max-width: 820px;
    margin-top: 14px;
    font-size: clamp(42px, 6vw, 72px);
    line-height: 0.98;
    letter-spacing: -0.055em;
  }

  .hero__desc {
    max-width: 650px;
    margin: 24px 0 0;
    color: var(--color-ink-muted);
    font-size: 17px;
    line-height: 1.7;
  }

  .hero__actions {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 30px;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 44px;
    padding: 10px 17px;
    border-radius: 12px;
    font-family: var(--font-sans);
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
    border: 1px solid transparent;
    cursor: pointer;
    transition:
      background-color 0.18s ease,
      border-color 0.18s ease,
      color 0.18s ease,
      transform 0.15s ease,
      box-shadow 0.18s ease;
  }

  .btn:hover {
    transform: translateY(-1px);
  }

  .btn--primary {
    color: #fff;
    background: var(--color-primary);
    border-color: var(--color-primary);
    box-shadow: 0 7px 20px -8px rgba(79, 70, 229, 0.5);
  }

  .btn--primary:hover {
    background: var(--color-primary-hover);
    border-color: var(--color-primary-hover);
    box-shadow: 0 10px 24px -9px rgba(79, 70, 229, 0.55);
  }

  .btn--ghost {
    color: var(--color-ink);
    background: var(--color-surface);
    border-color: var(--color-border);
  }

  .btn--ghost:hover {
    background: var(--color-surface-alt);
    border-color: var(--color-border-strong);
  }

  .hero__updated {
    display: block;
    margin-top: 18px;
    color: var(--color-ink-faint);
    font-family: var(--font-mono);
    font-size: 10.5px;
    letter-spacing: 0.04em;
  }

  /* Replace the old stamp treatment with a simple branded visual. */

  .hero__seal {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 168px;
    height: 168px;
    border-radius: 50%;
    background: var(--color-primary-tint);
    border: 1px solid rgba(79, 70, 229, 0.18);
  }

  .hero__seal :global(svg) {
    opacity: 0.85;
  }

  @media (max-width: 760px) {
    .hero {
      padding: 52px 20px 48px;
    }

    .hero__inner {
      grid-template-columns: 1fr;
      gap: 32px;
    }

    .hero__seal {
      width: 112px;
      height: 112px;
      order: -1;
    }

    .hero__seal :global(svg) {
      width: 72px;
      height: 72px;
    }

    .hero h1 {
      font-size: clamp(38px, 12vw, 58px);
    }

    .hero__desc {
      font-size: 15px;
    }
  }

  /* ============================================================
     STICKY NAVIGATION
     ============================================================ */

  .subnav {
    position: sticky;
    top: 0;
    z-index: 30;
    width: 100%;
    background: rgba(250, 250, 247, 0.94);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--color-border);
  }

  .subnav__inner {
    width: min(1120px, 100%);
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 0 24px;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .subnav__inner::-webkit-scrollbar {
    display: none;
  }

  .subnav__item {
    position: relative;
    flex: 0 0 auto;
    padding: 15px 12px 13px;
    background: transparent;
    border: 0;
    color: var(--color-ink-muted);
    font-family: var(--font-sans);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: color 0.16s ease;
  }

  .subnav__item:hover {
    color: var(--color-ink);
  }

  .subnav__item.is-active {
    color: var(--color-primary);
    font-weight: 600;
  }

  .subnav__item.is-active::after {
    content: "";
    position: absolute;
    left: 12px;
    right: 12px;
    bottom: -1px;
    height: 2px;
    border-radius: 999px;
    background: var(--color-primary);
  }

  /* ============================================================
     MAIN CONTENT
     ============================================================ */

  main {
    width: min(1120px, 100%);
    margin: 0 auto;
    padding: 0 24px;
  }

  .section {
    padding: 72px 0;
    border-bottom: 1px solid var(--color-border);
    scroll-margin-top: 70px;
  }

  .section--tight {
    padding-top: 60px;
  }

  .section--muted {
    margin-left: -24px;
    margin-right: -24px;
    padding-left: 24px;
    padding-right: 24px;
    background: var(--color-surface-alt);
  }

  .section__head {
    max-width: 720px;
    margin-bottom: 32px;
  }

  .section__kicker {
    display: block;
    margin-bottom: 8px;
    color: var(--color-primary);
    font-family: var(--font-mono);
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: 0.11em;
    text-transform: uppercase;
  }

  .section h2 {
    font-size: clamp(30px, 4vw, 44px);
    line-height: 1.08;
  }

  /* ============================================================
     EXAM STAGES
     ============================================================ */

  .stages {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
  }

  .stage-stub {
    position: relative;
    padding: 24px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 18px;
    transition:
      transform 0.18s ease,
      border-color 0.18s ease,
      box-shadow 0.18s ease;
  }

  .stage-stub:hover {
    transform: translateY(-2px);
    border-color: var(--color-border-strong);
    box-shadow: 0 20px 35px -24px rgba(15, 15, 20, 0.18);
  }

  .stage-stub__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 20px;
  }

  .stage-stub__code,
  .stage-stub__nature {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .stage-stub__code {
    color: var(--color-primary);
    font-weight: 600;
  }

  .stage-stub__nature {
    color: var(--color-ink-faint);
  }

  .stage-stub h3 {
    font-size: 22px;
    line-height: 1.15;
    margin-bottom: 10px;
  }

  .stage-stub p {
    min-height: 76px;
    margin: 0;
    color: var(--color-ink-muted);
    font-size: 14px;
    line-height: 1.65;
  }

  .stage-stub__ledger {
    display: flex;
    gap: 28px;
    margin-top: 22px;
    padding-top: 18px;
    border-top: 1px solid var(--color-border);
  }

  .ledger-num {
    display: block;
    color: var(--color-ink);
    font-family: var(--font-serif);
    font-size: 24px;
    font-weight: 700;
    line-height: 1;
  }

  .ledger-label {
    display: block;
    margin-top: 5px;
    color: var(--color-ink-faint);
    font-family: var(--font-mono);
    font-size: 9px;
    letter-spacing: 0.07em;
    text-transform: uppercase;
  }

  .stage-stub__perf {
    display: none;
  }

  @media (max-width: 820px) {
    .stages {
      grid-template-columns: 1fr;
    }

    .stage-stub p {
      min-height: auto;
    }
  }

  /* ============================================================
     MARKS / EXAM TABLE
     ============================================================ */

  .ledger-table {
    margin-top: 18px;
    overflow: hidden;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 16px;
  }

  .ledger-table__row {
    display: grid;
    grid-template-columns: 1.4fr 0.7fr 0.7fr 1.4fr;
    gap: 16px;
    align-items: center;
    padding: 14px 18px;
    border-top: 1px solid var(--color-border);
    font-size: 14px;
  }

  .ledger-table__row:first-child {
    border-top: 0;
  }

  .ledger-table__row--head {
    background: var(--color-surface-alt);
    color: var(--color-ink-muted);
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.07em;
    text-transform: uppercase;
  }

  .ledger-table__row--total {
    background: var(--color-primary-tint);
    color: var(--color-primary);
    font-weight: 600;
  }

  @media (max-width: 620px) {
    .ledger-table {
      overflow-x: auto;
    }

    .ledger-table__row {
      min-width: 560px;
    }
  }

  /* ============================================================
     PRELIMS / MAINS TABS
     ============================================================ */

  .tabbar {
    display: inline-flex;
    padding: 4px;
    margin-bottom: 24px;
    background: var(--color-surface-alt);
    border: 1px solid var(--color-border);
    border-radius: 12px;
  }

  .tabbar__btn {
    min-width: 100px;
    padding: 9px 18px;
    border: 0;
    border-radius: 9px;
    background: transparent;
    color: var(--color-ink-muted);
    font-family: var(--font-sans);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition:
      background-color 0.18s ease,
      color 0.18s ease,
      box-shadow 0.18s ease;
  }

  .tabbar__btn:hover {
    color: var(--color-ink);
  }

  .tabbar__btn.is-active {
    background: var(--color-surface);
    color: var(--color-primary);
    box-shadow: 0 3px 12px -8px rgba(15, 15, 20, 0.25);
  }

  /* ============================================================
     PAPER BLOCKS
     ============================================================ */

  .paper-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .paper-block,
  .optional-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 18px;
    overflow: hidden;
  }

  .paper-block {
    padding: 26px;
  }

  .paper-block:hover,
  .optional-card:hover {
    border-color: var(--color-border-strong);
  }

  .paper-block__head {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 24px;
  }

  .paper-code {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 28px;
    padding: 4px 8px;
    background: var(--color-primary-tint);
    border: 1px solid rgba(79, 70, 229, 0.18);
    border-radius: 7px;
    color: var(--color-primary);
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.04em;
  }

  .paper-block__heading h4 {
    font-size: 22px;
    line-height: 1.2;
  }

  .paper-meta {
    display: block;
    margin-top: 5px;
    color: var(--color-ink-faint);
    font-family: var(--font-mono);
    font-size: 10.5px;
    line-height: 1.5;
  }

  .paper-block__sections {
    display: flex;
    flex-direction: column;
  }

  .syllabus-section {
    display: grid;
    grid-template-columns: 36px minmax(0, 1fr);
    gap: 10px;
    padding: 18px 0;
    border-top: 1px solid var(--color-border);
  }

  .paper-block__sections .syllabus-section:first-child {
    border-top: 0;
    padding-top: 0;
  }

  .syllabus-index {
    color: var(--color-primary);
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: 600;
    padding-top: 2px;
  }

  .syllabus-section__title {
    margin-bottom: 6px;
    color: var(--color-ink);
    font-size: 15px;
    font-weight: 650;
  }

  .syllabus-section ul {
    margin: 0;
    padding-left: 18px;
    color: var(--color-ink-muted);
    font-size: 14px;
    line-height: 1.65;
  }

  .syllabus-section li {
    margin-bottom: 3px;
  }

  .syllabus-section li:last-child {
    margin-bottom: 0;
  }

  /* ============================================================
     WHAT TO STUDY
     ============================================================ */

  .what-to-study {
    margin-top: 22px;
    padding: 14px 16px;
    background: var(--color-surface-alt);
    border: 1px solid var(--color-border);
    border-radius: 12px;
  }

  .what-to-study__toggle {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 0;
    background: transparent;
    border: 0;
    color: var(--color-primary);
    font-family: var(--font-sans);
    font-size: 13px;
    font-weight: 600;
    text-align: left;
    cursor: pointer;
  }

  .what-to-study__body {
    margin-top: 14px;
    padding-top: 14px;
    border-top: 1px solid var(--color-border);
    color: var(--color-ink-muted);
    font-size: 13.5px;
    line-height: 1.65;
  }

  .what-to-study__body p {
    margin-bottom: 12px;
  }

  .what-to-study__label {
    display: block;
    margin-bottom: 6px;
    color: var(--color-ink-faint);
    font-family: var(--font-mono);
    font-size: 9.5px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .what-to-study__body ul {
    margin: 0;
    padding-left: 18px;
  }

  /* ============================================================
     OPTIONAL SUBJECT
     ============================================================ */

  .optional-card {
    display: flex;
    align-items: flex-start;
    gap: 18px;
    padding: 26px;
  }

  .optional-card h4 {
    font-size: 22px;
    line-height: 1.2;
  }

  .optional-card p {
    margin: 12px 0;
    color: var(--color-ink-muted);
    font-size: 14px;
    line-height: 1.65;
  }

  .text-link {
    display: inline-flex;
    align-items: center;
    color: var(--color-primary);
    font-size: 13px;
    font-weight: 600;
    text-decoration: none;
  }

  .text-link:hover {
    color: var(--color-primary-hover);
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  @media (max-width: 560px) {
    .paper-block {
      padding: 20px;
    }

    .paper-block__head {
      gap: 12px;
    }

    .paper-block__heading h4 {
      font-size: 19px;
    }

    .optional-card {
      flex-direction: column;
    }
  }

  /* ============================================================
     PREPARATION STEPS
     ============================================================ */

  .steps {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 0;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .steps li {
    min-width: 0;
    padding: 20px;
    border-top: 1px solid var(--color-border);
    border-bottom: 1px solid var(--color-border);
    border-left: 1px solid var(--color-border);
    background: var(--color-surface);
  }

  .steps li:first-child {
    border-radius: 16px 0 0 16px;
  }

  .steps li:last-child {
    border-right: 1px solid var(--color-border);
    border-radius: 0 16px 16px 0;
  }

  .steps__num {
    display: block;
    margin-bottom: 18px;
    color: var(--color-primary);
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 600;
  }

  .steps h4 {
    font-size: 17px;
    line-height: 1.2;
    margin-bottom: 8px;
  }

  .steps p {
    margin: 0;
    color: var(--color-ink-muted);
    font-size: 13px;
    line-height: 1.6;
  }

  @media (max-width: 900px) {
    .steps {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .steps li {
      border-radius: 0 !important;
      border-right: 0;
    }

    .steps li:nth-child(2n) {
      border-right: 1px solid var(--color-border);
    }

    .steps li:first-child {
      border-radius: 16px 0 0 0 !important;
    }

    .steps li:nth-child(2) {
      border-radius: 0 16px 0 0 !important;
    }

    .steps li:nth-last-child(2) {
      border-radius: 0 0 0 16px !important;
    }

    .steps li:last-child {
      border-radius: 0 0 16px 0 !important;
    }
  }

  @media (max-width: 580px) {
    .steps {
      grid-template-columns: 1fr;
    }

    .steps li,
    .steps li:nth-child(2n) {
      border-right: 1px solid var(--color-border);
      border-radius: 0 !important;
    }

    .steps li:first-child {
      border-radius: 16px 16px 0 0 !important;
    }

    .steps li:last-child {
      border-radius: 0 0 16px 16px !important;
    }
  }

  /* ============================================================
     RELATED RESOURCES
     ============================================================ */

  .chain {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 10px;
  }

  .chain__item {
    min-width: 0;
  }

  .chain__item a {
    display: flex;
    min-height: 76px;
    align-items: flex-end;
    justify-content: space-between;
    gap: 12px;
    padding: 15px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 14px;
    color: var(--color-ink);
    font-size: 13px;
    font-weight: 600;
    line-height: 1.35;
    transition:
      border-color 0.18s ease,
      transform 0.18s ease,
      box-shadow 0.18s ease;
  }

  .chain__item a::after {
    content: "→";
    flex-shrink: 0;
    color: var(--color-primary);
    font-size: 16px;
  }

  .chain__item a:hover {
    transform: translateY(-2px);
    border-color: rgba(79, 70, 229, 0.3);
    box-shadow: 0 14px 25px -20px rgba(15, 15, 20, 0.25);
  }

  .chain__arrow {
    display: none;
  }

  @media (max-width: 850px) {
    .chain {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 520px) {
    .chain {
      grid-template-columns: 1fr;
    }
  }

  /* ============================================================
     FAQ
     ============================================================ */

  .faq-list {
    display: flex;
    flex-direction: column;
    border-top: 1px solid var(--color-border);
  }

  .faq-item {
    border-bottom: 1px solid var(--color-border);
  }

  .faq-item__q {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    padding: 20px 0;
    background: transparent;
    border: 0;
    color: var(--color-ink);
    font-family: var(--font-sans);
    font-size: 15px;
    font-weight: 600;
    line-height: 1.4;
    text-align: left;
    cursor: pointer;
  }

  .faq-item__q:hover {
    color: var(--color-primary);
  }

  .faq-item__a {
    max-width: 760px;
    margin: -4px 0 20px;
    color: var(--color-ink-muted);
    font-size: 14px;
    line-height: 1.7;
  }

  /* ============================================================
     DISCLAIMER
     ============================================================ */

  .disclaimer {
    max-width: 720px;
    margin: 0;
    padding: 28px 0 64px;
    color: var(--color-ink-faint);
    font-family: var(--font-mono);
    font-size: 10px;
    line-height: 1.7;
  }

  /* ============================================================
     ACCESSIBILITY / MOTION
     ============================================================ */

  .syllabus-page button:focus-visible,
  .syllabus-page a:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 3px;
  }

  @media (prefers-reduced-motion: reduce) {
    .syllabus-page *,
    .syllabus-page *::before,
    .syllabus-page *::after {
      scroll-behavior: auto !important;
      transition-duration: 0.01ms !important;
      animation-duration: 0.01ms !important;
    }
  }
`}</style>
   </div>
  );
}