import PublicPageLayout from '../components/public/PublicPageLayout';

const page = {
  eyebrow: 'About',
  icon: 'plan',
  seoTitle: 'About Notes Cafe | Premium UPSC Preparation Platform',
  metaDescription: 'Learn about Notes Cafe, our mission, and the premium public experience designed to help UPSC aspirants find free resources and begin with confidence.',
  heroTitle: 'About Notes Cafe — built for clarity, trust, and serious preparation.',
  heroDescription: 'Notes Cafe exists to make UPSC preparation feel calmer, clearer, and more trustworthy for people who are just beginning or returning to the journey.',
  breadcrumbs: [{ label: 'About' }],
  stats: [
    { value: '01', label: 'Clear first step' },
    { value: '100%', label: 'Public-first experience' },
    { value: 'Free', label: 'Learning entry point' },
  ],
  highlights: [
    { title: 'Mission-led design', body: 'The public website exists to bring users in with useful, searchable, high-trust content.' },
    { title: 'Premium positioning', body: 'The brand experience stays premium and focused, while the dashboard remains separate and private.' },
  ],
  cards: [
    { kicker: 'Story', title: 'Our Story', body: 'We built Notes Cafe to make the first step in UPSC preparation feel less chaotic and more intentional.' },
    { kicker: 'Vision', title: 'Our Vision', body: 'Create a premium public platform that combines trust, clarity, and SEO-driven free resources for aspirants.' },
    { kicker: 'Mentors', title: 'Mentors', body: 'Curated guidance and expert-led thinking for serious learners who want an organised path.' },
  ],
  checklist: [
    'A premium public brand experience for trust and conversion.',
    'Clear separation between public content and private dashboard experiences.',
    'A strong foundation for organic SEO traffic and content discovery.',
  ],
  related: [
    { label: 'Courses', href: '/courses' },
    { label: 'Contact', href: '/contact' },
    { label: 'UPSC syllabus PDF', href: '/study-material/upsc-syllabus' },
  ],
  faqs: [
    { q: 'Is Notes Cafe only for beginners?', a: 'No. It is designed to help beginners start well and to support serious aspirants with clear structure and high-trust content.' },
    { q: 'Why is the public website separate from the dashboard?', a: 'The public experience focuses on attracting and converting new users, while the dashboard supports deeper learning once they are logged in.' },
  ],
};

export default function AboutPage() {
  return <PublicPageLayout page={page} />;
}
