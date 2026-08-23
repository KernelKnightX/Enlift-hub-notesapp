import { BookOpen, Compass, FileText, Newspaper } from 'lucide-react';

export const studyMaterialResources = [
  { title: 'UPSC Syllabus', description: 'Understand the full exam landscape and build a more intentional prep path.', href: '/study-material/upsc-syllabus', meta: '8 min read', tags: ['Exam map', 'Strategy'], icon: Compass, accent: 'primary' },
  { title: 'NCERT Books', description: 'Foundational reading that keeps your preparation grounded and clear.', href: '/study-material/ncert-books', meta: '12 min read', tags: ['Foundation', 'Classic'], icon: BookOpen, accent: 'primary' },
  { title: 'Monthly Magazines', description: 'Download the latest monthly current affairs magazines for UPSC preparation.', href: '/study-material/standard-books', meta: 'Updated monthly', tags: ['Current Affairs', 'PDF'], icon: Newspaper, accent: 'gold' },
  { title: 'Government Reports', description: 'Useful reports and references that support policy and mains preparation.', href: '/study-material/government-reports', meta: '7 min read', tags: ['Reports', 'Policy'], icon: FileText, accent: 'gold' },
];

export const studyMaterialFaqs = [
  { q: 'What makes this study material useful?', a: 'It is organised around the actual need of an aspirant — clarity, structure, relevance, and practical next steps.' },
  { q: 'Is this the same as the dashboard?', a: 'No. This is the public-facing content layer that helps visitors discover the platform before signing up.' },
];
