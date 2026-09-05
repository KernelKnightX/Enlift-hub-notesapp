import { Compass, Newspaper } from 'lucide-react';

export const studyMaterialResources = [
  {
    title: 'UPSC Syllabus',
    description: 'The official exam map for Prelims and Mains — know what to cover before anything else.',
    href: '/study-material/upsc-syllabus',
    meta: 'Official map',
    tags: ['Exam map', 'Strategy'],
    icon: Compass,
    accent: 'primary',
  },
  {
    title: 'Monthly Magazines',
    description: 'Download Notes Cafe monthly current affairs magazines for prelims and mains revision.',
    href: '/study-material/standard-books',
    meta: 'Updated monthly',
    tags: ['Current Affairs', 'PDF'],
    icon: Newspaper,
    accent: 'gold',
  },
];

export const studyMaterialFaqs = [
  { q: 'What should I start with?', a: 'Begin with the official UPSC syllabus. Once your map is clear, use monthly magazines for current affairs revision.' },
  { q: 'Where are NCERT books?', a: 'For this beta we are keeping the public library focused on syllabus and magazines. NCERT and deeper booklists can return once content is ready.' },
  { q: 'Is this the same as the student desk?', a: 'No. This is the public reference library. Sign in for study notes, mocks, performance tracking, and your planner.' },
];
