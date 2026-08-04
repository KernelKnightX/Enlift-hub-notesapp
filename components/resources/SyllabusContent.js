import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronRight, CheckCircle2, Circle, FileText, Search } from 'lucide-react';

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

export default function SyllabusContent() {
  const [exam, setExam] = useState('cse-p');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState({});
  const list = SYLLABUS[exam];

  const totalTopics = list.reduce((sum, paper) => sum + paper.topics.length, 0);
  const doneTopics = list.reduce((sum, paper) => sum + paper.topics.filter((topic) => topic.done).length, 0);
  const pct = Math.round((doneTopics / totalTopics) * 100);

  return (
    <main className="max-w-7xl mx-auto px-4 py-10 md:px-8 lg:px-12">
      <div className="mb-8">
        <div className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-mono uppercase tracking-[0.2em]" style={{ background: 'var(--color-primary-tint)', color: 'var(--color-primary)' }}>
          Resources
        </div>
        <h1 className="mt-4 text-3xl md:text-4xl font-serif" style={{ letterSpacing: '-0.02em' }}>UPSC Syllabus</h1>
        <p className="mt-3 max-w-2xl text-[15px]" style={{ color: 'var(--color-ink-muted)' }}>
          A public reference for exam structure, paper patterns, and core topics across UPSC preparation tracks.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 lg:col-span-8 card p-6 md:p-8" style={{ background: 'var(--color-primary)', color: 'var(--color-bg)', borderColor: 'transparent' }}>
          <div className="eyebrow" style={{ color: '#B7BFB8' }}>Coverage · {EXAMS.find((entry) => entry.id === exam)?.name}</div>
          <div className="mt-4 flex items-end gap-6">
            <div>
              <div className="display-num" style={{ fontSize: 72, lineHeight: 1, color: 'var(--color-bg)' }}>
                {pct}
                <span style={{ fontSize: 28, color: '#B7BFB8' }}>%</span>
              </div>
              <div className="mt-1 text-[13px]" style={{ color: '#B7BFB8' }}>
                {doneTopics} of {totalTopics} topics complete
              </div>
            </div>
            <div className="flex-1 pb-1">
              <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: '#2A3631' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: 'var(--color-accent)' }} />
              </div>
              <div className="mt-3 text-[12px]" style={{ color: '#B7BFB8' }}>
                {list.length} papers · Estimated {list.reduce((sum, paper) => sum + paper.hours, 0)} hours of focused revision
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 card p-6">
          <div className="eyebrow mb-3">Exam</div>
          <div className="flex flex-col gap-2">
            {EXAMS.map((entry) => (
              <button
                key={entry.id}
                onClick={() => setExam(entry.id)}
                className="text-left px-3.5 py-2.5 rounded-xl text-[13.5px] flex items-center justify-between"
                style={{
                  border: `1px solid ${exam === entry.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  background: exam === entry.id ? 'var(--color-primary-tint)' : 'var(--color-surface)',
                  color: exam === entry.id ? 'var(--color-primary)' : 'var(--color-ink)',
                  fontWeight: exam === entry.id ? 600 : 500,
                }}
              >
                {entry.name}
                <ChevronRight size={13} strokeWidth={1.5} />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        <Search size={15} strokeWidth={1.5} style={{ color: 'var(--color-ink-muted)' }} />
        <input
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Search topics…"
          className="bg-transparent outline-none text-[14px] flex-1"
          style={{ color: 'var(--color-ink)' }}
        />
      </div>

      <div className="mt-6 card overflow-hidden">
        {list.map((paper, index) => {
          const paperTopics = paper.topics.filter((topic) => q.trim() === '' || topic.t.toLowerCase().includes(q.toLowerCase()));
          const paperDone = paper.topics.filter((topic) => topic.done).length;
          const paperPct = Math.round((paperDone / paper.topics.length) * 100);
          const isOpen = open[index] ?? true;

          return (
            <div key={index} style={{ borderTop: index > 0 ? '1px solid var(--color-border)' : 'none' }}>
              <button className="w-full p-5 md:p-6 flex items-center gap-5 text-left" onClick={() => setOpen((previous) => ({ ...previous, [index]: !isOpen }))}>
                <ChevronDown size={17} strokeWidth={1.6} style={{ color: 'var(--color-ink-muted)', transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform .2s ease' }} />
                <div className="flex-1 min-w-0">
                  <div className="font-serif text-[19px]" style={{ letterSpacing: '-0.01em' }}>{paper.paper}</div>
                  <div className="text-[12px] mt-0.5" style={{ color: 'var(--color-ink-muted)' }}>
                    {paperDone} of {paper.topics.length} topics · ~{paper.hours} hours
                  </div>
                </div>
                <div className="hidden md:block w-[160px]">
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
                    <div style={{ width: `${paperPct}%`, height: '100%', background: 'var(--color-primary)' }} />
                  </div>
                  <div className="text-[11px] mt-1.5 text-right font-mono" style={{ color: 'var(--color-ink-muted)' }}>{paperPct}%</div>
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                    {paperTopics.map((topic, topicIndex) => (
                      <li key={topicIndex} className="px-6 md:px-14 py-3 flex items-center gap-3" style={{ borderTop: '1px dashed var(--color-border)' }}>
                        {topic.done ? <CheckCircle2 size={17} strokeWidth={1.6} style={{ color: 'var(--color-primary)' }} /> : <Circle size={17} strokeWidth={1.5} style={{ color: 'var(--color-border-strong)' }} />}
                        <span className="flex-1 text-[14px]" style={{ color: topic.done ? 'var(--color-ink-faint)' : 'var(--color-ink-2)' }}>{topic.t}</span>
                        <span className="text-[11px] font-mono" style={{ color: 'var(--color-ink-faint)' }}>
                          <FileText size={12} strokeWidth={1.5} style={{ display: 'inline-block', marginRight: 4 }} />
                          Open note
                        </span>
                      </li>
                    ))}
                    {paperTopics.length === 0 && (
                      <li className="px-6 md:px-14 py-4 text-[13px]" style={{ color: 'var(--color-ink-muted)' }}>No topics match search.</li>
                    )}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </main>
  );
}
