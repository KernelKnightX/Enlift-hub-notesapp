import PublicPageLayout from '@/components/public/PublicPageLayout';

const page = {
  eyebrow: 'Planning Tools',
  icon: 'calendar',
  seoTitle: 'UPSC Calendar and Preparation Timeline | Notes Cafe',
  metaDescription: 'Use a clear UPSC calendar and preparation timeline to plan your study schedule, revisions, and exam milestones with less stress.',
  heroTitle: 'An UPSC calendar designed to make the journey feel manageable.',
  heroDescription: 'Turn your preparation into a simple routine with a clear yearly plan, milestone tracker, and weekly structure that helps you stay consistent without overwhelm.',
  breadcrumbs: [{ label: 'Planning Tools', href: '/planning-tools' }, { label: 'UPSC Calendar' }],
  stats: [
    { value: '12', label: 'Month view' },
    { value: 'Free', label: 'Planning tool' },
    { value: 'Daily', label: 'Structure' },
  ],
  highlights: [
    { title: 'Less chaos, more rhythm', body: 'Organise your study into a repeatable cycle with milestones that help you stay on track.' },
    { title: 'Beginner-friendly', body: 'A planning tool that supports a calm and realistic approach rather than unrealistic productivity pressure.' },
  ],
  cards: [
    { kicker: 'Timeline', title: 'Study Calendar', body: 'Follow a simple timeline that helps you organise subjects, revisions, and mock practice.' },
    { kicker: 'Revision', title: 'Revision Rhythm', body: 'Build a repeatable cycle so your preparation stays active and not just reactive.' },
    { kicker: 'Milestones', title: 'Exam Targets', body: 'Track both short-term and long-term milestones to stay motivated and clear-headed.' },
  ],
  checklist: [
    'A practical UPSC calendar for planning and consistency.',
    'A free planning experience that supports the public website without exposing private dashboard tools.',
    'Useful links to syllabus, books, and roadmap content.',
  ],
  related: [
    { label: 'Study planner', href: '/planning-tools/study-planner' },
    { label: 'Revision planner', href: '/planning-tools/revision-planner' },
    { label: 'UPSC syllabus PDF', href: '/study-material/upsc-syllabus' },
  ],
  faqs: [
    { q: 'Do I need a calendar for UPSC?', a: 'A calendar helps you convert an overwhelming preparation journey into a manageable sequence of weekly work.' },
    { q: 'Can beginners use it?', a: 'Yes. The best calendar is simple and encouraging, especially in the first few months.' },
  ],
};

export default function UpscCalendarPage() {
  return <PublicPageLayout page={page} />;
}
