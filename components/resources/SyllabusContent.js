import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, CheckCircle2, Circle, FileText, Search, Landmark, Download, Plus, Minus } from 'lucide-react';

const EXAMS = [
  { id: 'cse-p', name: 'UPSC CSE — Prelims' },
  { id: 'cse-m', name: 'UPSC CSE — Mains' },
  { id: 'capf', name: 'UPSC CAPF' },
  { id: 'cds', name: 'UPSC CDS' },
];

const SYLLABUS = {
  'cse-p': [
    {
      paper: 'General Studies Paper I',
      hours: 120,
      topics: [
        { t: 'Current events of national and international importance', done: true },
        { t: 'History of India and Indian National Movement', done: true },
        { t: 'Indian and World Geography — Physical, Social, Economic', done: false },
        { t: 'Indian Polity and Governance — Constitution, Political System, Panchayati Raj', done: false },
        { t: 'Economic and Social Development', done: false },
        { t: 'General issues on Environmental Ecology, Biodiversity and Climate Change', done: false },
        { t: 'General Science', done: false },
      ],
    },
    {
      paper: 'CSAT (Paper II)',
      hours: 60,
      topics: [
        { t: 'Comprehension', done: true },
        { t: 'Interpersonal skills including communication skills', done: false },
        { t: 'Logical reasoning and analytical ability', done: false },
        { t: 'Decision-making and problem-solving', done: false },
        { t: 'General mental ability', done: false },
        { t: 'Basic numeracy (numbers and their relations)', done: false },
        { t: 'Data interpretation', done: false },
      ],
    },
  ],
  'cse-m': [
    { paper: 'Paper A — Compulsory Indian Language', hours: 20, topics: [{ t: 'Qualifying — no marks counted for merit', done: false }] },
    { paper: 'Paper B — English', hours: 20, topics: [{ t: 'Qualifying — no marks counted for merit', done: false }] },
    { paper: 'Essay (Paper I)', hours: 40, topics: [{ t: 'Two essays across various themes', done: false }] },
    { paper: 'General Studies I', hours: 80, topics: [{ t: 'Indian Heritage and Culture', done: true }, { t: 'History and Geography of the World and Society', done: false }] },
    { paper: 'General Studies II', hours: 80, topics: [{ t: 'Governance, Constitution, Polity, Social Justice, IR', done: false }] },
    { paper: 'General Studies III', hours: 80, topics: [{ t: 'Technology, Economic Development, Environment, Security, Disaster Management', done: false }] },
    { paper: 'General Studies IV', hours: 60, topics: [{ t: 'Ethics, Integrity and Aptitude', done: false }] },
  ],
  capf: [
    { paper: 'Paper I: General Ability & Intelligence', hours: 60, topics: [{ t: 'General Mental Ability', done: false }, { t: 'General Science', done: false }, { t: 'Current Events of national & international importance', done: false }] },
    { paper: 'Paper II: General Studies, Essay & Comprehension', hours: 60, topics: [{ t: 'Essay questions on modern history & geography', done: false }] },
  ],
  cds: [
    { paper: 'English', hours: 30, topics: [{ t: 'Reading comprehension, vocabulary, grammar', done: false }] },
    { paper: 'General Knowledge', hours: 40, topics: [{ t: 'Current events, everyday observation', done: false }] },
    { paper: 'Elementary Mathematics (only for IMA/INA/AFA)', hours: 50, topics: [{ t: 'Arithmetic, Algebra, Trigonometry, Geometry, Statistics', done: false }] },
  ],
};

const GOV = {
  navy: '#0B2A4A',
  navyDeep: '#081E38',
  navyMid: '#0D3258',
  maroon: '#7A1F2B',
  saffron: '#FF9933',
  green: '#138808',
  bg: '#F5F3EC',
  surface: '#FFFFFF',
  border: '#C7BFA8',
  ink: '#1A1A1A',
  inkMuted: '#5A5648',
  link: '#0B4C8C',
  serif: "Georgia, 'Times New Roman', Times, serif",
  sans: "Arial, Helvetica, sans-serif",
  mono: "'Courier New', Courier, monospace",
};

const ROMAN = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi', 'xii', 'xiii', 'xiv', 'xv'];

const TRICOLOR = `linear-gradient(to right, ${GOV.saffron} 0%, ${GOV.saffron} 33.33%, #ffffff 33.33%, #ffffff 66.66%, ${GOV.green} 66.66%, ${GOV.green} 100%)`;

export default function SyllabusContent() {
  const [exam, setExam] = useState('cse-p');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState({});
  const [fontScale, setFontScale] = useState(1);
  const [contrast, setContrast] = useState(false);

  const list = SYLLABUS[exam];
  const totalTopics = list.reduce((sum, paper) => sum + paper.topics.length, 0);
  const doneTopics = list.reduce((sum, paper) => sum + paper.topics.filter((topic) => topic.done).length, 0);
  const totalHours = list.reduce((sum, paper) => sum + paper.hours, 0);
  const pct = Math.round((doneTopics / totalTopics) * 100);

  const c = contrast
    ? { bg: '#050505', surface: '#111111', border: '#4A4A4A', ink: '#F2F2F2', inkMuted: '#C9C9C9' }
    : { bg: GOV.bg, surface: GOV.surface, border: GOV.border, ink: GOV.ink, inkMuted: GOV.inkMuted };

  return (
    <div style={{ background: c.bg, minHeight: '100vh', fontFamily: GOV.sans, fontSize: `${fontScale * 100}%` }}>
      {/* tricolor strip */}
      <div style={{ height: 4, background: TRICOLOR }} />

      {/* accessibility bar */}
      <div style={{ background: GOV.navyDeep }}>
        <div className="max-w-7xl mx-auto px-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 30, fontSize: 11, color: '#B9C4D4' }}>
          <span>Screen Reader Access&nbsp; | &nbsp;Skip to Main Content</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <button aria-label="Decrease font size" onClick={() => setFontScale((s) => Math.max(0.85, +(s - 0.1).toFixed(2)))} style={{ color: '#B9C4D4', display: 'flex', alignItems: 'center' }}>
                <Minus size={10} strokeWidth={2} />
              </button>
              <button onClick={() => setFontScale(1)} style={{ color: '#B9C4D4', fontWeight: 700 }}>A</button>
              <button aria-label="Increase font size" onClick={() => setFontScale((s) => Math.min(1.3, +(s + 0.1).toFixed(2)))} style={{ color: '#B9C4D4', display: 'flex', alignItems: 'center' }}>
                <Plus size={10} strokeWidth={2} />
              </button>
            </span>
            <span style={{ opacity: 0.5 }}>|</span>
            <button onClick={() => setContrast((v) => !v)} style={{ color: '#B9C4D4' }}>
              {contrast ? 'Normal Contrast' : 'High Contrast'}
            </button>
          </div>
        </div>
      </div>

      {/* main header */}
      <header style={{ background: GOV.navy, borderBottom: `3px solid ${GOV.maroon}` }}>
        <div className="max-w-7xl mx-auto px-4" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 0' }}>
          <div style={{ width: 54, height: 54, borderRadius: '50%', border: `2px solid ${GOV.saffron}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Landmark size={24} strokeWidth={1.5} color="#EDEFF2" />
          </div>
          <div>
            <div style={{ color: '#fff', fontFamily: GOV.serif, fontSize: 21, fontWeight: 700, letterSpacing: 0.4 }}>
              UNION PUBLIC SERVICE COMMISSION
            </div>
            <div style={{ color: '#AEBBCB', fontSize: 12, letterSpacing: 0.6, marginTop: 2 }}>
              GOVERNMENT OF INDIA &nbsp;·&nbsp; संघ लोक सेवा आयोग
            </div>
          </div>
        </div>
        <div style={{ background: GOV.navyMid }}>
          <div className="max-w-7xl mx-auto px-4" style={{ fontSize: 12, color: '#9FAFC4', padding: '6px 0' }}>
            Home &nbsp;›&nbsp; Examinations &nbsp;›&nbsp; <span style={{ color: '#fff' }}>Syllabus</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4" style={{ padding: '32px 16px 48px' }}>
        {/* notification plate */}
        <div style={{ border: `1px solid ${c.border}`, background: c.surface, padding: '20px 24px', marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, fontSize: 12, fontFamily: GOV.mono, color: c.inkMuted, borderBottom: `1px dashed ${c.border}`, paddingBottom: 12, marginBottom: 16 }}>
            <span>No. UPSC/SYL-{exam.toUpperCase()}/2026</span>
            <span>Dated: 04 August, 2026</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: GOV.serif, fontSize: 23, fontWeight: 700, letterSpacing: 0.4, color: c.ink, textTransform: 'uppercase' }}>
              Examination Syllabus &amp; Scheme
            </div>
            <div style={{ fontFamily: GOV.serif, fontStyle: 'italic', fontSize: 13, color: c.inkMuted, marginTop: 6 }}>
              (For the information of candidates)
            </div>
          </div>
        </div>

        {/* overview table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', border: `1px solid ${c.border}`, marginBottom: 28 }}>
          <thead>
            <tr style={{ background: GOV.maroon }}>
              {['Papers', 'Total Topics', 'Completed', 'Progress', 'Est. Hours'].map((h) => (
                <th key={h} style={{ color: '#fff', fontFamily: GOV.serif, fontSize: 12.5, fontWeight: 700, textAlign: 'left', padding: '10px 14px', letterSpacing: 0.3 }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr style={{ background: c.surface }}>
              <td style={{ padding: '10px 14px', borderTop: `1px solid ${c.border}`, color: c.ink, fontSize: 14 }}>{list.length}</td>
              <td style={{ padding: '10px 14px', borderTop: `1px solid ${c.border}`, color: c.ink, fontSize: 14 }}>{totalTopics}</td>
              <td style={{ padding: '10px 14px', borderTop: `1px solid ${c.border}`, color: c.ink, fontSize: 14 }}>{doneTopics}</td>
              <td style={{ padding: '10px 14px', borderTop: `1px solid ${c.border}`, color: c.ink, fontSize: 14, fontWeight: 700 }}>{pct}%</td>
              <td style={{ padding: '10px 14px', borderTop: `1px solid ${c.border}`, color: c.ink, fontSize: 14 }}>{totalHours}</td>
            </tr>
          </tbody>
        </table>

        {/* exam tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', borderBottom: `2px solid ${GOV.navy}`, marginBottom: 24 }}>
          {EXAMS.map((entry) => (
            <button
              key={entry.id}
              onClick={() => setExam(entry.id)}
              style={{
                padding: '10px 18px',
                fontFamily: GOV.serif,
                fontSize: 13.5,
                fontWeight: exam === entry.id ? 700 : 500,
                color: exam === entry.id ? '#fff' : c.ink,
                background: exam === entry.id ? GOV.navy : 'transparent',
                border: `1px solid ${GOV.navy}`,
                borderBottom: exam === entry.id ? 'none' : `1px solid ${GOV.navy}`,
                marginRight: 4,
                marginBottom: -1,
                cursor: 'pointer',
              }}
            >
              {entry.name}
            </button>
          ))}
        </div>

        {/* search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
          <label style={{ fontFamily: GOV.serif, fontSize: 13, fontWeight: 700, color: c.ink, whiteSpace: 'nowrap' }}>
            Search Topics:
          </label>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, border: `1px solid ${c.border}`, padding: '8px 12px', background: c.surface }}>
            <Search size={14} strokeWidth={1.6} style={{ color: c.inkMuted }} />
            <input
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="Type a keyword…"
              style={{ background: 'transparent', outline: 'none', fontSize: 13.5, flex: 1, color: c.ink }}
            />
          </div>
        </div>

        {/* papers */}
        {list.map((paper, index) => {
          const paperTopics = paper.topics.filter((topic) => q.trim() === '' || topic.t.toLowerCase().includes(q.toLowerCase()));
          const paperDone = paper.topics.filter((topic) => topic.done).length;
          const paperPct = Math.round((paperDone / paper.topics.length) * 100);
          const isOpen = open[index] ?? true;

          return (
            <div key={index} style={{ border: `1px solid ${c.border}`, marginBottom: 16 }}>
              <button
                onClick={() => setOpen((previous) => ({ ...previous, [index]: !isOpen }))}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '13px 16px', background: GOV.maroon, textAlign: 'left', cursor: 'pointer' }}
              >
                <span style={{ fontFamily: GOV.mono, fontSize: 12, color: '#E9C9CB', width: 22 }}>{String(index + 1).padStart(2, '0')}</span>
                <span style={{ flex: 1, minWidth: 0, fontFamily: GOV.serif, fontSize: 15.5, fontWeight: 700, color: '#fff' }}>{paper.paper}</span>
                <span style={{ fontFamily: GOV.mono, fontSize: 11, color: '#E9C9CB', whiteSpace: 'nowrap' }}>
                  {paperDone}/{paper.topics.length} &nbsp;·&nbsp; {paper.hours} hrs
                </span>
                <ChevronDown size={16} strokeWidth={1.8} style={{ color: '#fff', transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform .2s ease', flexShrink: 0 }} />
              </button>

              <div style={{ background: '#EDE9DB', height: 4 }}>
                <div style={{ width: `${paperPct}%`, height: '100%', background: GOV.green }} />
              </div>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: 'hidden', background: c.surface }}>
                    {paperTopics.map((topic, topicIndex) => (
                      <div
                        key={topicIndex}
                        style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '11px 18px', borderTop: `1px dashed ${c.border}` }}
                      >
                        <span style={{ fontFamily: GOV.serif, fontSize: 12.5, color: c.inkMuted, width: 24, flexShrink: 0 }}>
                          ({ROMAN[topicIndex] ?? topicIndex + 1})
                        </span>
                        {topic.done ? (
                          <CheckCircle2 size={16} strokeWidth={1.8} style={{ color: GOV.green, marginTop: 2, flexShrink: 0 }} />
                        ) : (
                          <Circle size={16} strokeWidth={1.6} style={{ color: c.border, marginTop: 2, flexShrink: 0 }} />
                        )}
                        <span style={{ flex: 1, fontSize: 13.5, color: topic.done ? c.inkMuted : c.ink, lineHeight: 1.5 }}>{topic.t}</span>
                        <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: GOV.link, textDecoration: 'underline', whiteSpace: 'nowrap', flexShrink: 0 }}>
                          <FileText size={12} strokeWidth={1.6} />
                          Notes
                        </a>
                      </div>
                    ))}
                    {paperTopics.length === 0 && (
                      <div style={{ padding: '16px 18px', fontSize: 13, color: c.inkMuted }}>No topics match your search.</div>
                    )}
                    <div style={{ padding: '10px 18px', borderTop: `1px dashed ${c.border}` }}>
                      <a href="#" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: GOV.link, textDecoration: 'underline' }}>
                        <Download size={13} strokeWidth={1.6} />
                        Download detailed syllabus (PDF)
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </main>

      {/* footer */}
      <footer style={{ background: GOV.navy, marginTop: 24 }}>
        <div style={{ height: 4, background: TRICOLOR }} />
        <div className="max-w-7xl mx-auto px-4" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8, padding: '14px 16px', fontSize: 11, color: '#9FAFC4' }}>
          <span>Website Content Owned by Union Public Service Commission</span>
          <span>Last Reviewed: 04-08-2026 &nbsp;|&nbsp; Best Viewed in 1280 x 800 Resolution</span>
        </div>
      </footer>
    </div>
  );
}