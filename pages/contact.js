import PublicPageLayout from '../components/public/PublicPageLayout';

const page = {
  eyebrow: 'Contact',
  icon: 'plan',
  seoTitle: 'Contact Notes Cafe | UPSC Study Support and Questions',
  metaDescription: 'Contact Notes Cafe for UPSC study support, platform questions, and questions about courses, resources, and the public website experience.',
  heroTitle: 'Contact Notes Cafe for support, questions, and guidance.',
  heroDescription: 'Whether you are exploring free resources, asking about courses, or looking for the best next step, this is the right place to start the conversation.',
  breadcrumbs: [{ label: 'Contact' }],
  stats: [
    { value: '24/7', label: 'Support focus' },
    { value: 'Email', label: 'Primary contact' },
    { value: 'WhatsApp', label: 'Fast support' },
  ],
  highlights: [
    { title: 'Simple support', body: 'Reach out for general questions about the platform, public resources, and registration journeys.' },
    { title: 'Built for trust', body: 'Clear communication matters, especially when visitors are evaluating whether to trust a new platform.' },
  ],
  cards: [
    { kicker: 'Email', title: 'hello@notescafe.in', body: 'Ideal for structured questions, partnership requests, and onboarding support.' },
    { kicker: 'WhatsApp', title: '+91 98765 43210', body: 'Use for quick guidance and user support while the public experience remains calm and simple.' },
    { kicker: 'Social', title: 'Instagram · Telegram', body: 'Follow updates, announcements, and resource drops directly from Notes Cafe.' },
  ],
  checklist: [
    'A simple contact page for public users and prospective learners.',
    'Direct access to support channels without exposing the private dashboard.',
    'A professional, premium experience designed for trust and conversion.',
  ],
  related: [
    { label: 'About Notes Cafe', href: '/about' },
    { label: 'UPSC courses', href: '/courses' },
    { label: 'UPSC syllabus PDF', href: '/study-material/upsc-syllabus' },
  ],
  faqs: [
    { q: 'How quickly will I get a reply?', a: 'Support response time depends on the channel, but public inquiries are handled as quickly as possible with a high-trust tone.' },
    { q: 'Can I ask about courses and resources?', a: 'Yes. Visitors can use the contact page to ask about courses, public resources, and the best place to begin.' },
  ],
};

export default function ContactPage() {
  return <PublicPageLayout page={page} />;
}
