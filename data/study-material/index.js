import { BookOpen, Compass, FileText, Newspaper } from 'lucide-react';

export const studyMaterialResources = [
  { title: 'UPSC Syllabus', description: 'Understand the full exam landscape and build a more intentional prep path.', href: '/study-material/upsc-syllabus', meta: '8 min read', tags: ['Exam map', 'Strategy'], icon: Compass, accent: 'primary' },
  { title: 'NCERT Books', description: 'Foundational reading that keeps your preparation grounded and clear.', href: '/study-material/ncert-books', meta: '12 min read', tags: ['Foundation', 'Classic'], icon: BookOpen, accent: 'primary' },
  { title: 'Standard Books', description: 'Higher-value references for deeper conceptual clarity and better retention.', href: '/study-material/standard-books', meta: '10 min read', tags: ['Advanced', 'Depth'], icon: BookOpen, accent: 'gold' },
  { title: 'NCERT Notes', description: 'Concise notes for quick revision without losing the core structure.', href: '/study-material/ncert-notes', meta: '6 min read', tags: ['Revision', 'Quick'], icon: FileText, accent: 'primary' },
  { title: 'Magazine Recommendations', description: 'Use curated reading habits to improve current affairs consistency.', href: '/study-material/magazine-recommendations', meta: '5 min read', tags: ['Current Affairs', 'Habits'], icon: Newspaper, accent: 'accent' },
  { title: 'Government Reports', description: 'Useful reports and references that support policy and mains preparation.', href: '/study-material/government-reports', meta: '7 min read', tags: ['Reports', 'Policy'], icon: FileText, accent: 'gold' },
];

export const studyMaterialFaqs = [
  { q: 'What makes this study material useful?', a: 'It is organised around the actual need of an aspirant — clarity, structure, relevance, and practical next steps.' },
  { q: 'Is this the same as the dashboard?', a: 'No. This is the public-facing content layer that helps visitors discover the platform before signing up.' },
];
