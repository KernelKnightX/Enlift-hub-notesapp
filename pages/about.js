import Head from "next/head";

const resources = [
  {
    code: "N—01",
    title: "Study Notes",
    text: "Topic-wise notes for GS and optionals, written to be revised in minutes on a second pass, not re-read from scratch.",
  },
  {
    code: "N—02",
    title: "Maps & Atlas",
    text: "India's geography laid out the way UPSC actually asks about it — states, rivers, passes, and the events that put them in the news.",
  },
  {
    code: "N—03",
    title: "Polity & Schemes",
    text: "Ministries, schemes and constitutional provisions, kept current and cross-linked to the news that references them.",
  },
  {
    code: "N—04",
    title: "Practice & Mock Tests",
    text: "Prelims-style MCQs and mains answer practice, scored so you can see where marks are actually slipping.",
  },
  {
    code: "N—05",
    title: "Study Planner",
    text: "A weekly plan that fits revision, current affairs and new topics into the hours you actually have free.",
  },
  {
    code: "N—06",
    title: "Exam Calendar",
    text: "Notification dates, admit card releases and result timelines, tracked so you don't have to check five tabs.",
  },
];

const journey = [
  { step: "01", title: "Learn", text: "Work through a topic once, properly, using notes built for first contact." },
  { step: "02", title: "Revise", text: "Come back on a schedule, before the topic has a chance to go cold." },
  { step: "03", title: "Practise", text: "Put it in front of an MCQ or an answer sheet and see what actually stuck." },
  { step: "04", title: "Improve", text: "Read the gaps the test just showed you, then go fix them on purpose." },
];

const principles = [
  {
    title: "Keep it simple",
    text: "Preparation is already demanding. Every screen should make the next step obvious, not add one more decision to make.",
  },
  {
    title: "Stay organised",
    text: "Good preparation isn't only studying more — it's knowing what to study next, what to revise, and what's overdue.",
  },
  {
    title: "Build for real use",
    text: "Every resource and tool has to solve a problem an aspirant actually hits. If it doesn't earn its place, it doesn't ship.",
  },
  {
    title: "Reward consistency",
    text: "A short, repeatable routine beats an occasional twelve-hour push. We design for the former.",
  },
];

const audience = [
  { tag: "Beginners", code: "TAG/01" },
  { tag: "Prelims Aspirants", code: "TAG/02" },
  { tag: "Mains Aspirants", code: "TAG/03" },
  { tag: "Repeaters", code: "TAG/04" },
  { tag: "Working Professionals", code: "TAG/05" },
];

export default function About() {
  return (
    <>
      <Head>
        <title>About Notes Cafe | UPSC Preparation Platform</title>
        <meta
          name="description"
          content="Notes Cafe is a UPSC preparation platform that organises study material, maps, government resources, planning tools and exam updates in one place."
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,500;0,600;0,700;1,500&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </Head>

      <main className="about-page">
        {/* Hero */}
        <section className="hero">
          <div className="hero-inner">
            <div className="hero-copy">
              <div className="eyebrow">— ABOUT NOTES CAFE —</div>
              <h1>
                Study like the syllabus
                <br />
                is a map, <span>not a maze.</span>
              </h1>
              <p className="hero-text">
                Notes Cafe pulls study material, current affairs, maps and
                practice tests into one organised place — built around how
                UPSC preparation actually unfolds, not how a filing cabinet
                is arranged.
              </p>
            </div>

            <div className="seal-wrap" aria-hidden="true">
              <svg viewBox="0 0 160 160" className="seal">
                <path
                  id="sealCircle"
                  d="M 80,80 m -62,0 a 62,62 0 1,1 124,0 a 62,62 0 1,1 -124,0"
                  fill="none"
                />
                <circle cx="80" cy="80" r="70" className="seal-ring-outer" />
                <circle cx="80" cy="80" r="46" className="seal-ring-inner" />
                <text className="seal-text">
                  <textPath href="#sealCircle" startOffset="0%">
                    NOTES CAFE • STRUCTURED PREP • NOTES CAFE •
                  </textPath>
                </text>
                <text x="80" y="76" textAnchor="middle" className="seal-center-top">
                  EST.
                </text>
                <text x="80" y="94" textAnchor="middle" className="seal-center-main">
                  NC
                </text>
              </svg>
            </div>
          </div>
        </section>

        {/* What is Notes Cafe */}
        <section className="section intro-section">
          <div className="section-label">WHAT IS NOTES CAFE?</div>

          <div className="intro-grid">
            <div>
              <h2>
                A focused space for
                <br />
                serious preparation.
              </h2>
            </div>

            <div className="intro-content">
              <div className="margin-note">
                <span className="margin-tag">NOTE</span>
                <p>
                  UPSC preparation involves an enormous amount of material —
                  books, notes, current affairs, maps, previous year
                  questions, government resources, revision and tests. Left
                  unmanaged, it sprawls fast.
                </p>
              </div>
              <div className="margin-note">
                <span className="margin-tag">NOTE</span>
                <p>
                  Notes Cafe brings these pieces into one clean, organised
                  space, so you're not rebuilding your system every few
                  weeks.
                </p>
              </div>
              <div className="margin-note">
                <span className="margin-tag">NOTE</span>
                <p>
                  The idea is simple: instead of hunting for resources
                  across a dozen tabs and group chats, aspirants get one
                  reliable place to study, practise and plan.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What you can find */}
        <section className="section resources-section">
          <div className="section-label">WHAT YOU CAN FIND</div>
          <h2>
            Resources built around
            <br />
            the way you prepare.
          </h2>
          <p className="section-description">
            Each card below covers one part of the preparation cycle, so you
            can move from learning to revision to practice without losing
            track of where you left off.
          </p>

          <div className="resource-grid">
            {resources.map((item) => (
              <div className="resource-card" key={item.code}>
                <span className="resource-code">{item.code}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Preparation Journey */}
        <section className="section journey-section">
          <div className="journey-box">
            <div className="section-label">THE PREPARATION JOURNEY</div>
            <h2>
              Learn.<span> Revise.</span>
              <span> Practise.</span>
              <span> Improve.</span>
            </h2>
            <p>
              UPSC preparation isn't a single activity — it's a loop.
              Learning new concepts, revising what you've studied, testing
              yourself, and adjusting based on the result.
            </p>

            <div className="journey-steps">
              {journey.map((item, i) => (
                <div key={item.step}>
                  <strong>{item.step}</strong>
                  <span>{item.title}</span>
                  <p>{item.text}</p>
                  {i < journey.length - 1 && <em className="journey-arrow">→</em>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Philosophy */}
        <section className="section philosophy-section">
          <div className="philosophy-header">
            <div className="section-label">OUR APPROACH</div>
            <h2>
              Preparation doesn't
              <br />
              need to be complicated.
            </h2>
            <p>
              A good preparation platform should remove friction, not add a
              new layer of it on top of an already long syllabus.
            </p>
          </div>

          <div className="principles">
            {principles.map((item) => (
              <div className="principle" key={item.title}>
                <span className="check-box" aria-hidden="true" />
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Why Notes Cafe */}
        <section className="section why-section">
          <div className="why-grid">
            <div>
              <div className="section-label">WHY NOTES CAFE?</div>
              <h2>
                Less searching.
                <br />
                More studying.
              </h2>
            </div>

            <div>
              <p>
                A large share of preparation time can disappear into
                searching for the right notes, hunting down a resource, or
                trying to remember what's due for revision next.
              </p>
              <blockquote className="pull-quote">
                Notes Cafe is built around cutting that time, not adding
                another app to check.
              </blockquote>
              <p>
                Whether you're learning a new topic, revisiting an old one,
                checking a notification date, or testing yourself, the
                platform is built to stay out of the way and support that
                one task.
              </p>
            </div>
          </div>
        </section>

        {/* For Aspirants */}
        <section className="section audience-section">
          <div className="audience-card">
            <div className="section-label">BUILT FOR ASPIRANTS</div>
            <h2>
              Start where you are.
              <br />
              Build from there.
            </h2>
            <p>
              Whether you're beginning your UPSC preparation, returning
              after a break, or deep in your final revision, Notes Cafe
              meets you at that stage with resources that are actually
              useful there.
            </p>

            <div className="audience-tags">
              {audience.map((item) => (
                <span key={item.code}>
                  <em>{item.code}</em>
                  {item.tag}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Vision */}
        <section className="section vision-section">
          <div className="vision-inner">
            <div className="section-label">OUR VISION</div>
            <h2>
              Make serious preparation
              <br />
              easier to organise.
            </h2>
            <p>
              Notes Cafe is being built with one long-term goal: a useful,
              organised, accessible preparation ecosystem for UPSC
              aspirants.
            </p>
            <p>
              As the platform grows, we'll keep improving the quality of
              resources, adding tools that earn their place, and making
              preparation more structured — without making it heavier.
            </p>
          </div>
        </section>

        {/* Closing CTA — ticket / admit-card stub */}
        <section className="cta-section">
          <div className="cta-ticket">
            <div className="cta-main">
              <div className="section-label">NOTES CAFE</div>
              <h2>
                Study with a plan.
                <br />
                Prepare with purpose.
              </h2>
              <p>
                Explore Notes Cafe and build your preparation one topic, one
                revision and one practice session at a time.
              </p>
            </div>

            <div className="cta-stub">
              <a href="/upsc-preparation" className="cta-button">
                <span className="cta-button-label">ENTER</span>
                <span className="cta-button-arrow">→</span>
              </a>
              <span className="cta-stub-code">NC / UPSC / 01</span>
            </div>
          </div>
        </section>
      </main>

      <style jsx>{`
        .about-page {
          --ink: #12182b;
          --ink-soft: #212a45;
          --paper: #f5f2ea;
          --paper-line: #e3ddc9;
          --card: #ffffff;
          --border: #e4e1d4;
          --brass: #a1752f;
          --brass-light: #c99a4b;
          --slate: #5b5f6b;
          --slate-soft: #858993;

          min-height: 100vh;
          background: var(--paper);
          color: var(--ink);
          font-family: "IBM Plex Sans", -apple-system, sans-serif;
        }

        .about-page :global(h1),
        .about-page :global(h2),
        .about-page :global(h3) {
          font-family: "Lora", Georgia, serif;
        }

        .eyebrow,
        .section-label {
          margin-bottom: 18px;
          font-family: "IBM Plex Mono", monospace;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.14em;
          color: var(--brass-light);
        }

        /* HERO */

        .hero {
          background: var(--ink);
          color: #f2efe4;
          overflow: hidden;
          position: relative;
        }

        .hero-inner {
          max-width: 1320px;
          margin: 0 auto;
          padding: 100px 48px 110px;
          display: grid;
          grid-template-columns: 1fr 220px;
          gap: 40px;
          align-items: start;
          position: relative;
        }

        .hero h1 {
          max-width: 760px;
          margin: 22px 0 0;
          font-size: clamp(42px, 5.6vw, 68px);
          line-height: 1.1;
          letter-spacing: -1.5px;
          font-weight: 600;
          color: #f7f4ea;
        }

        .hero h1 span {
          color: var(--brass-light);
          font-style: italic;
          font-weight: 500;
        }

        .hero-text {
          max-width: 560px;
          margin: 28px 0 0;
          font-size: 17px;
          line-height: 1.8;
          color: #b7bccb;
        }

        .seal-wrap {
          display: flex;
          justify-content: flex-end;
          padding-top: 6px;
        }

        .seal {
          width: 150px;
          height: 150px;
          animation: spin 34s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .seal-ring-outer,
        .seal-ring-inner {
          fill: none;
          stroke: #4a5170;
          stroke-width: 1;
        }

        .seal-text {
          font-family: "IBM Plex Mono", monospace;
          font-size: 8.4px;
          letter-spacing: 2px;
          fill: var(--brass-light);
        }

        .seal-center-top {
          font-family: "IBM Plex Mono", monospace;
          font-size: 8px;
          fill: #7c8298;
          letter-spacing: 1px;
          animation: unspin 34s linear infinite;
          transform-origin: 80px 80px;
        }

        .seal-center-main {
          font-family: "Lora", serif;
          font-size: 20px;
          font-weight: 600;
          fill: #f2efe4;
          animation: unspin 34s linear infinite;
          transform-origin: 80px 80px;
        }

        @keyframes unspin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(-360deg);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .seal,
          .seal-center-top,
          .seal-center-main {
            animation: none;
          }
        }

        /* COMMON SECTION */

        .section {
          max-width: 1160px;
          margin: 0 auto;
          padding: 88px 40px;
        }

        .section h2 {
          margin: 0;
          font-size: 36px;
          font-weight: 600;
          line-height: 1.22;
          letter-spacing: -0.5px;
          color: var(--ink);
        }

        /* INTRO */

        .intro-section {
          border-bottom: 1px solid var(--border);
          background-image: repeating-linear-gradient(
            var(--paper) 0px,
            var(--paper) 33px,
            var(--paper-line) 34px
          );
          background-position: 0 120px;
        }

        .intro-grid {
          display: grid;
          grid-template-columns: 1fr 1.3fr;
          gap: 90px;
        }

        .margin-note {
          display: grid;
          grid-template-columns: 56px 1fr;
          gap: 4px;
          margin-bottom: 22px;
        }

        .margin-tag {
          padding-top: 3px;
          font-family: "IBM Plex Mono", monospace;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.1em;
          color: var(--slate-soft);
        }

        .intro-content p {
          margin: 0;
          font-size: 16px;
          line-height: 1.85;
          color: var(--slate);
        }

        /* RESOURCES */

        .resources-section > h2 {
          margin-bottom: 16px;
        }

        .section-description {
          max-width: 720px;
          margin: 0 0 42px;
          font-size: 16px;
          line-height: 1.8;
          color: var(--slate);
        }

        .resource-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }

        .resource-card {
          position: relative;
          min-height: 200px;
          padding: 30px 24px 24px;
          background: var(--card);
          border: 1px solid var(--border);
          border-top: none;
          border-radius: 0 0 8px 8px;
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }

        .resource-card::before {
          content: "";
          position: absolute;
          top: -1px;
          left: 0;
          right: 0;
          height: 8px;
          background: repeating-linear-gradient(
            90deg,
            var(--brass-light) 0px,
            var(--brass-light) 8px,
            transparent 8px,
            transparent 16px
          );
          border-radius: 8px 8px 0 0;
          opacity: 0.55;
        }

        .resource-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 14px 28px rgba(18, 24, 43, 0.08);
        }

        .resource-code {
          display: inline-block;
          margin-bottom: 22px;
          padding: 3px 8px;
          font-family: "IBM Plex Mono", monospace;
          font-size: 10.5px;
          font-weight: 500;
          letter-spacing: 0.05em;
          color: var(--brass);
          background: rgba(161, 117, 47, 0.09);
          border-radius: 3px;
        }

        .resource-card h3 {
          margin: 0 0 10px;
          font-size: 18px;
          font-weight: 600;
          color: var(--ink);
        }

        .resource-card p {
          margin: 0;
          font-size: 14px;
          line-height: 1.7;
          color: var(--slate);
        }

        /* JOURNEY */

        .journey-section {
          max-width: none;
          padding-left: 0;
          padding-right: 0;
        }

        .journey-box {
          max-width: 1160px;
          margin: 0 auto;
          padding: 68px 44px;
          background: var(--ink);
          color: #eceadf;
          border-radius: 12px;
        }

        .journey-box .section-label {
          color: var(--brass-light);
        }

        .journey-box h2 {
          margin-bottom: 20px;
          color: #f5f2ea;
        }

        .journey-box h2 span {
          color: #8f95ab;
        }

        .journey-box > p {
          max-width: 680px;
          margin: 0;
          font-size: 16px;
          line-height: 1.8;
          color: #a7acbd;
        }

        .journey-steps {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
          margin-top: 55px;
          border-top: 1px solid #333c5c;
        }

        .journey-steps > div {
          position: relative;
          padding: 25px 22px 0 0;
        }

        .journey-steps > div:not(:first-child) {
          padding-left: 22px;
        }

        .journey-arrow {
          display: none;
        }

        @media (min-width: 901px) {
          .journey-arrow {
            display: block;
            position: absolute;
            top: 20px;
            right: -14px;
            font-style: normal;
            font-family: "IBM Plex Mono", monospace;
            color: #4b5372;
            font-size: 14px;
          }
        }

        .journey-steps strong {
          display: block;
          margin-bottom: 20px;
          font-family: "IBM Plex Mono", monospace;
          font-size: 11px;
          color: var(--brass-light);
        }

        .journey-steps span {
          display: block;
          margin-bottom: 8px;
          font-family: "Lora", serif;
          font-size: 19px;
          font-weight: 600;
          color: #f5f2ea;
        }

        .journey-steps p {
          margin: 0;
          font-size: 13px;
          line-height: 1.65;
          color: #9aa0b3;
        }

        /* PHILOSOPHY */

        .philosophy-section {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 100px;
        }

        .philosophy-header > p {
          max-width: 480px;
          margin: 24px 0 0;
          font-size: 15px;
          line-height: 1.8;
          color: var(--slate);
        }

        .principles {
          border-top: 1px solid var(--border);
        }

        .principle {
          display: grid;
          grid-template-columns: 22px 1fr;
          gap: 20px;
          padding: 22px 0;
          border-bottom: 1px solid var(--border);
        }

        .check-box {
          margin-top: 4px;
          width: 15px;
          height: 15px;
          border: 1.5px solid var(--brass);
          border-radius: 3px;
        }

        .principle h3 {
          margin: 0 0 7px;
          font-size: 17px;
          font-weight: 600;
          color: var(--ink);
        }

        .principle p {
          margin: 0;
          font-size: 14px;
          line-height: 1.7;
          color: var(--slate);
        }

        /* WHY */

        .why-section {
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
        }

        .why-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 100px;
        }

        .why-grid p {
          margin: 0 0 22px;
          font-size: 16px;
          line-height: 1.85;
          color: var(--slate);
        }

        .pull-quote {
          margin: 0 0 26px;
          padding: 4px 0 4px 22px;
          border-left: 2px solid var(--brass);
          font-family: "Lora", serif;
          font-style: italic;
          font-size: 18px;
          line-height: 1.6;
          color: var(--ink);
        }

        /* AUDIENCE */

        .audience-section {
          max-width: none;
          padding-left: 0;
          padding-right: 0;
        }

        .audience-card {
          max-width: 1160px;
          margin: 0 auto;
          padding: 72px 56px;
          border-radius: 12px;
          background: var(--ink);
          color: #ffffff;
        }

        .audience-card .section-label {
          color: var(--brass-light);
        }

        .audience-card h2 {
          color: #ffffff;
          margin-bottom: 20px;
        }

        .audience-card p {
          max-width: 680px;
          margin: 0;
          font-size: 16px;
          line-height: 1.8;
          color: #b3b8c8;
        }

        .audience-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 36px;
        }

        .audience-tags span {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 9px 14px;
          border: 1px dashed #3d4560;
          border-radius: 5px;
          font-size: 12.5px;
          color: #d7dce5;
        }

        .audience-tags em {
          font-family: "IBM Plex Mono", monospace;
          font-style: normal;
          font-size: 10px;
          color: var(--brass-light);
        }

        /* VISION */

        .vision-section {
          text-align: center;
        }

        .vision-inner {
          max-width: 760px;
          margin: 0 auto;
        }

        .vision-inner h2 {
          margin-bottom: 25px;
        }

        .vision-inner p {
          max-width: 680px;
          margin: 0 auto 18px;
          font-size: 16px;
          line-height: 1.85;
          color: var(--slate);
        }

        /* CTA — ticket stub */

        .cta-section {
          border-top: 1px solid var(--border);
          padding: 90px 40px 110px;
        }

        .cta-ticket {
          max-width: 1080px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 200px;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
        }

        .cta-main {
          padding: 56px;
        }

        .cta-main h2 {
          margin: 0 0 20px;
          font-size: 40px;
          line-height: 1.15;
          letter-spacing: -1px;
        }

        .cta-main p {
          max-width: 480px;
          margin: 0;
          font-size: 15.5px;
          line-height: 1.8;
          color: var(--slate);
        }

        .cta-stub {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 22px;
          padding: 40px 20px;
          background: var(--ink);
          border-left: 1px dashed #4a5170;
        }

        .cta-stub::before,
        .cta-stub::after {
          content: "";
          position: absolute;
          left: -9px;
          width: 18px;
          height: 18px;
          background: var(--paper);
          border-radius: 50%;
        }

        .cta-stub::before {
          top: -9px;
        }

        .cta-stub::after {
          bottom: -9px;
        }

        .cta-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          text-decoration: none;
          color: #f5f2ea;
        }

        .cta-button-label {
          font-family: "IBM Plex Mono", monospace;
          font-size: 12px;
          letter-spacing: 0.16em;
          font-weight: 500;
        }

        .cta-button-arrow {
          font-size: 22px;
          color: var(--brass-light);
          transition: transform 0.18s ease;
        }

        .cta-button:hover .cta-button-arrow {
          transform: translateX(4px);
        }

        .cta-button:focus-visible,
        .cta-stub a:focus-visible {
          outline: 2px solid var(--brass-light);
          outline-offset: 4px;
          border-radius: 4px;
        }

        .cta-stub-code {
          font-family: "IBM Plex Mono", monospace;
          font-size: 9.5px;
          letter-spacing: 0.1em;
          color: #6b7290;
          writing-mode: vertical-rl;
        }

        /* RESPONSIVE */

        @media (max-width: 900px) {
          .hero-inner {
            grid-template-columns: 1fr;
            padding: 60px 28px 70px;
          }

          .seal-wrap {
            justify-content: flex-start;
            padding-top: 30px;
          }

          .section {
            padding: 64px 28px;
          }

          .intro-grid,
          .philosophy-section,
          .why-grid {
            grid-template-columns: 1fr;
            gap: 44px;
          }

          .resource-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .journey-box,
          .audience-card {
            margin-left: 18px;
            margin-right: 18px;
            padding: 52px 30px;
          }

          .journey-steps {
            grid-template-columns: repeat(2, 1fr);
            row-gap: 30px;
          }

          .journey-steps > div {
            padding: 20px 0 0 !important;
          }

          .cta-ticket {
            grid-template-columns: 1fr;
          }

          .cta-stub {
            border-left: none;
            border-top: 1px dashed #4a5170;
            flex-direction: row;
            padding: 26px;
          }

          .cta-stub::before,
          .cta-stub::after {
            top: -9px;
            bottom: auto;
            left: 30px;
          }

          .cta-stub::after {
            left: auto;
            right: 30px;
          }

          .cta-stub-code {
            writing-mode: horizontal-tb;
          }
        }

        @media (max-width: 600px) {
          .hero h1 {
            font-size: 38px;
            letter-spacing: -1px;
          }

          .hero-text {
            font-size: 15.5px;
          }

          .section h2 {
            font-size: 28px;
          }

          .resource-grid {
            grid-template-columns: 1fr;
          }

          .journey-steps {
            grid-template-columns: 1fr;
          }

          .audience-card {
            margin: 0;
            border-radius: 0;
          }

          .cta-main {
            padding: 40px 28px;
          }

          .cta-main h2 {
            font-size: 30px;
          }
        }
      `}</style>
    </>
  );
}