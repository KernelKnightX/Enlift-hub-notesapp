import PublicPageLayout from '@/components/public/PublicPageLayout';

const page = {
  eyebrow: 'Government',
  icon: 'government',
  seoTitle: 'Government Schemes for UPSC Preparation | Notes Cafe',
  metaDescription: 'Explore government schemes, policy summaries, and important welfare initiatives that matter for UPSC prelims and mains preparation.',
  heroTitle: 'Government schemes explained clearly for UPSC preparation.',
  heroDescription: 'Study important schemes, policy context, and implementation details in a structured format that helps aspirants connect governance topics to current affairs and exam relevance.',
  breadcrumbs: [{ label: 'Government', href: '/government' }, { label: 'Government Schemes' }],
  stats: [
    { value: '50+', label: 'Scheme summaries' },
    { value: 'Policy', label: 'Focused content' },
    { value: 'Free', label: 'Access' },
  ],
  highlights: [
    { title: 'Policy relevance', body: 'See how schemes connect to governance, economy, and current affairs topics that appear in the exam.' },
    { title: 'Easy to navigate', body: 'Use a searchable and structured format that makes the topic practical rather than overwhelming.' },
  ],
  cards: [
    { kicker: 'Schemes', title: 'Welfare Schemes', body: 'Understand flagship initiatives and their purpose in simple, exam-oriented language.' },
    { kicker: 'Governance', title: 'Implementation Focus', body: 'Learn about implementation, beneficiaries, and policy context in a way that supports revision.' },
    { kicker: 'Current Affairs', title: 'Exam Linkage', body: 'Connect government policies to current affairs and broader governance preparation.' },
  ],
  checklist: [
    'A searchable index of government schemes and related governance topics.',
    'Structured policy summaries for UPSC relevance.',
    'Helpful links to constitutional, reports, and planning resources.',
  ],
  related: [
    { label: 'Constitution articles', href: '/government/constitution-articles' },
    { label: 'Important acts', href: '/government/important-acts' },
    { label: 'Government reports', href: '/study-material/government-reports' },
  ],
  faqs: [
    { q: 'Do I need to study all schemes?', a: 'No. Focus on the most important central schemes and their broader policy relevance rather than memorising everything.' },
    { q: 'How are schemes connected to current affairs?', a: 'Most schemes become useful when you connect them to recent governance updates, budget announcements, and implementation challenges.' },
  ],
};

export default function GovernmentSchemesPage() {
  return <PublicPageLayout page={page} />;
}
