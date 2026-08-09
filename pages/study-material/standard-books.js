import PublicPageLayout from '@/components/public/PublicPageLayout';

const page = {
  eyebrow: 'Study Material',
  icon: 'book',
  seoTitle: 'UPSC Standard Books for Prelims and Mains | Notes Cafe',
  metaDescription: 'Explore trusted UPSC standard books for prelims and mains preparation with a focused, exam-oriented guide for beginners and advanced students.',
  heroTitle: 'UPSC standard books that support both prelims and mains preparation.',
  heroDescription: 'Choose books with clarity and exam relevance instead of collecting too many resources. This page presents a thoughtful shortlist that helps aspirants stay focused.',
  breadcrumbs: [{ label: 'Study Material', href: '/study-material' }, { label: 'Standard Books' }],
  stats: [
    { value: '8+', label: 'Recommended books' },
    { value: 'Exam', label: 'Focused guidance' },
    { value: 'Free', label: 'Planning support' },
  ],
  highlights: [
    { title: 'Less clutter, more focus', body: 'The right standard books help you deepen your understanding without getting lost in too many opinions and sources.' },
    { title: 'Built for real preparation', body: 'These recommendations are designed to support both prelims and mains rather than looking attractive on paper only.' },
  ],
  cards: [
    { kicker: 'Polity', title: 'Indian Polity', body: 'A core reference for constitutional understanding and paper-based questions.' },
    { kicker: 'Economy', title: 'Indian Economy', body: 'Useful for static concepts and recent policy interpretation in mains and prelims.' },
    { kicker: 'History', title: 'Modern Indian History', body: 'A must-have for narrative clarity and event-based analysis across papers.' },
  ],
  checklist: [
    'A curated set of standard books for serious UPSC preparation.',
    'Clear guidance on how to use these books in the right order.',
    'Helpful links to NCERT books, syllabus resources, and planners.',
  ],
  related: [
    { label: 'Best NCERT books for UPSC', href: '/study-material/ncert-books' },
    { label: 'UPSC syllabus PDF', href: '/study-material/upsc-syllabus' },
    { label: 'UPSC calendar', href: '/planning-tools/upsc-calendar' },
  ],
  faqs: [
    { q: 'Do I need all standard books?', a: 'No. A smaller, more intentional set is usually better than a large stack of unread books.' },
    { q: 'Can beginners use standard books?', a: 'Yes, but it is best to combine them with a strong NCERT base and a clear study plan.' },
  ],
};

export default function StandardBooksPage() {
  return <PublicPageLayout page={page} />;
}
