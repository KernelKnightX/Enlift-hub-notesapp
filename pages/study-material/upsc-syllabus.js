// UPSC CSE Syllabus page — Notes Cafe
// Ready to paste. Uses Tailwind utility classes directly (arbitrary hex
// values for your brand colors) so it works even if .card, .chip, .btn
// utilities aren't defined globally yet. Swap the className strings marked
// "-> your utility class" for your existing .card / .chip / .btn classes
// once you wire this into your global stylesheet.
//
// Layout: full-bleed, ~90% width (5% margin each side), no tabs — both
// Preliminary and Main Examination render as stacked sections on one page,
// with a sticky sidebar for navigation. Cards are always expanded (no
// accordion). PDF download button is a disabled placeholder for now.
//
// Colors used:
//   bg      #FAFAF7  (warm off-white)
//   indigo  #4F46E5  (primary accent)
//   coral   #FF6B5B  (secondary accent)

import ResourceHero from "@/components/public/ResourceHero";

const PRELIM_PAPERS = [
  {
    id: "gs1",
    title: "General Studies Paper I",
    marks: "200 Marks",
    duration: "2 Hours",
    topics: [
      "Current events of national and international importance",
      "History of India and Indian National Movement",
      "Indian and World Geography — Physical, Social, Economic Geography of India and the World",
      "Indian Polity and Governance — Constitution, Political System, Panchayati Raj, Public Policy, Rights Issues, etc.",
      "Economic and Social Development — Sustainable Development, Poverty, Inclusion, Demographics, Social Sector Initiatives, etc.",
      "General issues on Environmental Ecology, Biodiversity and Climate Change — that do not require subject specialization",
      "General Science",
    ],
  },
  {
    id: "gs2",
    title: "General Studies Paper II (CSAT)",
    marks: "200 Marks",
    duration: "2 Hours",
    note: "Qualifying — minimum 33% required. Not counted for merit ranking.",
    topics: [
      "Comprehension",
      "Interpersonal skills including communication skills",
      "Logical reasoning and analytical ability",
      "Decision-making and problem-solving",
      "General mental ability",
      "Basic numeracy (numbers, orders of magnitude, etc.) — Class X level",
      "Data interpretation (charts, graphs, tables, data sufficiency) — Class X level",
    ],
  },
];

const MAIN_PAPERS = [
  {
    id: "essay",
    title: "Essay Paper",
    marks: "250 Marks",
    duration: "3 Hours",
    topics: [
      "Two essays to be written, one from each of two sections, on multiple topics",
      "Tests the candidate's ability to present ideas clearly, coherently, and concisely",
    ],
  },
  {
    id: "gs1m",
    title: "General Studies Paper I",
    marks: "250 Marks",
    duration: "3 Hours",
    topics: ["Indian Heritage and Culture", "History and Geography of the World and Society"],
  },
  {
    id: "gs2m",
    title: "General Studies Paper II",
    marks: "250 Marks",
    duration: "3 Hours",
    topics: ["Governance, Constitution, Polity", "Social Justice and International Relations"],
  },
  {
    id: "gs3m",
    title: "General Studies Paper III",
    marks: "250 Marks",
    duration: "3 Hours",
    topics: [
      "Technology, Economic Development, Biodiversity",
      "Environment, Security and Disaster Management",
    ],
  },
  {
    id: "gs4m",
    title: "General Studies Paper IV",
    marks: "250 Marks",
    duration: "3 Hours",
    topics: ["Ethics, Integrity and Aptitude"],
  },
  {
    id: "indianlang",
    title: "Indian Language (Qualifying)",
    marks: "300 Marks",
    duration: "3 Hours",
    note: "Qualifying — does not count toward merit ranking.",
    topics: ["Comprehension, precis writing, translation, and essay in the chosen Indian language"],
  },
  {
    id: "english",
    title: "English Language (Qualifying)",
    marks: "300 Marks",
    duration: "3 Hours",
    note: "Qualifying — does not count toward merit ranking.",
    topics: ["Comprehension, precis writing, translation, and essay in English"],
  },
  {
    id: "optional",
    title: "Optional Subject",
    marks: "500 Marks",
    duration: "3 Hours each",
    topics: ["Paper I — 250 Marks", "Paper II — 250 Marks", "Chosen from the UPSC optional subjects list"],
  },
];

function PaperCard({ paper }) {
  return (
    <div
      id={paper.id}
      className="rounded-2xl border border-black/5 bg-white shadow-sm overflow-hidden scroll-mt-24"
    >
      <div className="px-6 py-5 border-b border-black/5">
        <h3 className="font-serif text-lg text-[#1E1B4B]">{paper.title}</h3>
        <p className="mt-1 text-sm text-neutral-500">
          {paper.marks} <span className="mx-1.5">•</span> Duration: {paper.duration}
        </p>
      </div>

      <div className="px-6 py-5">
        {paper.note && (
          <p className="mb-4 text-xs font-mono uppercase tracking-wide text-[#FF6B5B] bg-[#FF6B5B]/10 inline-block px-2.5 py-1 rounded-full">
            {paper.note}
          </p>
        )}
        <ol className="space-y-3">
          {paper.topics.map((topic, i) => (
            <li key={i} className="flex gap-3">
              <span className="shrink-0 grid place-items-center h-6 w-6 rounded-full bg-[#4F46E5] text-white text-xs font-mono mt-0.5">
                {i + 1}
              </span>
              <span className="text-sm leading-relaxed text-neutral-700">{topic}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export default function SyllabusPage() {
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] font-sans">
      {/* Header */}
      <ResourceHero
        title="UPSC Civil Services Examination"
        description="Complete syllabus for Preliminary and Main Examination."
        eyebrow="Notes Cafe · Reference"
        seoTitle="UPSC Syllabus | Notes Cafe"
        seoDescription="Explore the complete UPSC Civil Services Examination syllabus for Preliminary and Main Examination."
      />

      <div className="w-[90%] mx-auto py-8 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-10">
        {/* Sidebar */}
        <aside className="hidden md:block">
          <div className="sticky top-6 space-y-6">
            <div>
              <p className="text-xs font-mono uppercase tracking-wide text-neutral-400 mb-3">
                On this page
              </p>
              <p className="text-sm font-semibold text-[#1E1B4B] mb-2">
                Preliminary Examination
              </p>
              <ul className="space-y-1.5 text-sm text-neutral-500 mb-5">
                {PRELIM_PAPERS.map((p) => (
                  <li key={p.id}>
                    <button onClick={() => scrollTo(p.id)} className="hover:text-[#4F46E5] text-left">
                      {p.title}
                    </button>
                  </li>
                ))}
              </ul>

              <p className="text-sm font-semibold text-[#1E1B4B] mb-2">Main Examination</p>
              <ul className="space-y-1.5 text-sm text-neutral-500">
                {MAIN_PAPERS.map((p) => (
                  <li key={p.id}>
                    <button onClick={() => scrollTo(p.id)} className="hover:text-[#4F46E5] text-left">
                      {p.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* PDF download — placeholder, wire up the file later */}
            <button
              disabled
              title="PDF coming soon"
              className="w-full flex items-center gap-3 rounded-xl border border-black/5 bg-white px-4 py-3 text-left opacity-60 cursor-not-allowed"
            >
              {/* -> your .btn class, disabled variant */}
              <span className="text-lg">⬇</span>
              <span>
                <span className="block text-sm font-semibold text-[#1E1B4B]">
                  Download Complete Syllabus (PDF)
                </span>
                <span className="block text-xs text-neutral-400">Coming soon</span>
              </span>
            </button>
          </div>
        </aside>

        {/* Main content — both sections stacked, no tabs */}
        <main className="space-y-16">
          <section>
            <h2 className="font-serif text-2xl text-[#1E1B4B] mb-1">Preliminary Examination</h2>
            <p className="text-sm text-neutral-500 mb-6">
              The Preliminary Examination consists of two compulsory objective-type papers.
            </p>
            <div className="space-y-5">
              {PRELIM_PAPERS.map((p) => (
                <PaperCard key={p.id} paper={p} />
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-[#1E1B4B] mb-1">Main Examination</h2>
            <p className="text-sm text-neutral-500 mb-6">
              The Main Examination consists of nine written papers, of which two (language
              papers) are qualifying, followed by a Personality Test (Interview) worth 275
              marks.
            </p>
            <div className="space-y-5">
              {MAIN_PAPERS.map((p) => (
                <PaperCard key={p.id} paper={p} />
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}