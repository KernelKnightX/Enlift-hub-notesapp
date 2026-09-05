export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://notescafe.in').replace(/\/$/, '');
export const SITE_NAME = 'Notes Cafe';
export const SITE_OG_IMAGE = `${SITE_URL}/enlift-hub-logo.jpeg`;
export const DEFAULT_KEYWORDS =
  'UPSC, IAS, IPS, UPSC CSE, UPSC preparation, UPSC notes, UPSC study material, NCERT for UPSC, current affairs, Notes Cafe';

export const PRIVATE_PATH_PREFIXES = [
  '/student-desk',
  '/admin',
  '/login',
  '/register',
  '/profile-setup',
];

export function normalizePath(asPath = '/') {
  const path = String(asPath).split('?')[0].split('#')[0] || '/';
  if (path.length > 1 && path.endsWith('/')) return path.slice(0, -1);
  return path;
}

export function absoluteUrl(path = '/') {
  const clean = normalizePath(path);
  return clean === '/' ? `${SITE_URL}/` : `${SITE_URL}${clean}`;
}

export function isPrivatePath(path) {
  const clean = normalizePath(path);
  return PRIVATE_PATH_PREFIXES.some((prefix) => clean === prefix || clean.startsWith(`${prefix}/`));
}

function humanize(slug = '') {
  return decodeURIComponent(slug)
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

const PUBLIC_SEO = {
  '/': {
    title: 'Notes Cafe | Free UPSC Study Material, Notes, Maps & Current Affairs',
    description:
      'Notes Cafe is a free UPSC preparation platform for IAS and civil services. Get syllabus, NCERT books, monthly magazines, maps, government schemes and planning tools.',
    keywords:
      'Notes Cafe, UPSC preparation, free UPSC notes, IAS study material, UPSC current affairs, NCERT books for UPSC, UPSC maps',
  },
  '/study-material': {
    title: 'UPSC Study Material | Syllabus & Monthly Magazines | Notes Cafe',
    description:
      'Focused UPSC study material for beta: official syllabus and monthly current affairs magazines. Admin-published, no filler content.',
    keywords: 'UPSC study material, UPSC syllabus, monthly magazine UPSC, IAS current affairs PDF',
  },
  '/study-material/upsc-syllabus': {
    title: 'UPSC Syllabus 2026 PDF | Prelims & Mains GS Papers | Notes Cafe',
    description:
      'Complete UPSC Civil Services syllabus for Prelims GS Paper I, CSAT Paper II, and Mains GS I–IV, essay and optional. Use this as your official exam map.',
    keywords: 'UPSC syllabus 2026, UPSC CSE syllabus PDF, UPSC prelims syllabus, UPSC mains syllabus, GS paper syllabus',
  },
  '/study-material/ncert-books': {
    title: 'NCERT Books for UPSC PDF | Class 6 to 12 Booklist | Notes Cafe',
    description:
      'Class-wise NCERT books for UPSC preparation. History, geography, polity, economy and science NCERTs recommended for IAS prelims and mains foundation.',
    keywords: 'NCERT books for UPSC, NCERT PDF UPSC, NCERT class 6 to 12 UPSC, best NCERT for IAS',
  },
  '/study-material/standard-books': {
    title: 'UPSC Monthly Current Affairs Magazine PDF | Notes Cafe',
    description:
      'Download Notes Cafe monthly current affairs magazines for UPSC prelims and mains. Exam-focused compilations of national, international and government news.',
    keywords: 'UPSC monthly magazine PDF, UPSC current affairs magazine, Notes Cafe magazine, IAS current affairs PDF',
  },
  '/maps': {
    title: 'UPSC Maps & Atlas | India Geography Maps for CSE',
    description:
      'UPSC maps and atlas for Indian geography: rivers, mountains, national parks, and biosphere reserves for prelims and mains.',
    keywords: 'UPSC maps, atlas for UPSC, Indian geography maps UPSC, map based questions UPSC',
  },
  '/maps/upsc-maps': {
    title: 'India Map for UPSC | State & Geography Atlas | Notes Cafe',
    description:
      'India maps for UPSC geography: states, physical features and exam-relevant locations with atlas-style resources.',
    keywords: 'India map UPSC, UPSC geography maps, Indian states map IAS',
  },
  '/maps/government': {
    title: 'Government Maps for UPSC | Schemes, Acts & Polity Atlas',
    description:
      'Government-linked maps and visual resources for UPSC polity, schemes and administration.',
    keywords: 'government maps UPSC, polity maps IAS',
  },
  '/government': {
    title: 'Government Schemes, Acts & Constitution for UPSC',
    description:
      'UPSC government resources: schemes, constitution articles, important acts, and ministries.',
    keywords: 'government schemes UPSC, Indian constitution UPSC, important acts IAS',
  },
  '/planning-tools': {
    title: 'UPSC Planning Tools | Calendar, Planner, Pomodoro, Timetable',
    description:
      'Free UPSC planning tools: exam calendar, study planner, pomodoro timer, and study timetable.',
    keywords: 'UPSC study planner, UPSC calendar 2026, pomodoro UPSC, study timetable IAS',
  },
  '/planning-tools/upsc-calendar': {
    title: 'UPSC Calendar 2026 | Exam Dates, Notification & Results',
    description:
      'UPSC Civil Services calendar with exam dates, notification, prelims, mains and result timelines for CSE preparation.',
    keywords: 'UPSC calendar 2026, UPSC exam date, UPSC CSE timetable',
  },
  '/planning-tools/study-planner': {
    title: 'UPSC Study Planner | Daily & Weekly IAS Study Plan',
    description:
      'Build a realistic UPSC study plan with weekly targets for NCERT, current affairs, revision and mock tests.',
    keywords: 'UPSC study plan, IAS study planner, daily timetable UPSC',
  },
  '/planning-tools/pomodoro-timer': {
    title: 'UPSC Pomodoro Timer | Focus Study Clock for IAS Prep',
    description:
      'Free pomodoro timer for UPSC study sessions. Time-box reading, notes and revision without burning out.',
    keywords: 'pomodoro timer study, UPSC focus timer, study clock IAS',
  },
  '/planning-tools/revision-planner': {
    title: 'UPSC Revision Planner | Spaced Revision for Prelims & Mains',
    description:
      'Plan UPSC revision cycles so NCERT, GS notes and current affairs come back before they fade.',
    keywords: 'UPSC revision plan, spaced repetition IAS, prelims revision timetable',
  },
  '/planning-tools/study-timetable': {
    title: 'UPSC Study Timetable | Daily Routine for Working Aspirants',
    description:
      'Sample UPSC study timetables for beginners and working professionals covering GS, optional and current affairs.',
    keywords: 'UPSC timetable, IAS daily routine, study schedule UPSC',
  },
  '/planning-tools/goal-tracker': {
    title: 'UPSC Goal Tracker | Track Syllabus, Tests & Habits',
    description:
      'Track UPSC goals: syllabus coverage, mock tests, revision and weekly study hours in one place.',
    keywords: 'UPSC goal tracker, syllabus tracker IAS, study progress UPSC',
  },
  '/planning-tools/beginner-roadmap': {
    title: 'UPSC Beginner Roadmap | How to Start IAS Preparation',
    description:
      'Step-by-step UPSC beginner roadmap: syllabus, NCERTs, newspaper, mocks and when to start optional.',
    keywords: 'how to start UPSC, UPSC beginner strategy, IAS roadmap',
  },
  '/planning-tools/preparation-strategy': {
    title: 'UPSC Preparation Strategy | Prelims, Mains & CSAT',
    description:
      'A practical UPSC preparation strategy for prelims, mains and CSAT without following ten overlapping sources.',
    keywords: 'UPSC strategy, IAS preparation strategy, prelims mains plan',
  },
  '/about': {
    title: 'About Notes Cafe | UPSC Study Platform for Aspirants',
    description:
      'Notes Cafe is built for UPSC aspirants who want organised study material, maps, government resources and planning tools in one calm place.',
    keywords: 'Notes Cafe, about Notes Cafe, UPSC platform India',
  },
  '/contact': {
    title: 'Contact Notes Cafe | UPSC Study Support',
    description:
      'Contact Notes Cafe for questions about UPSC study material, magazines, maps and student desk access.',
    keywords: 'contact Notes Cafe, UPSC help, Notes Cafe support',
  },
  '/current-affairs': {
    title: 'UPSC Current Affairs | Daily & Monthly IAS News',
    description:
      'UPSC current affairs for prelims and mains. Use Notes Cafe daily briefs and monthly magazines instead of reading five newspapers.',
    keywords: 'UPSC current affairs, daily current affairs IAS, The Hindu UPSC',
  },
};

const PRIVATE_SEO = {
  title: `${SITE_NAME} | Student Desk`,
  description: 'Secure Notes Cafe student and admin area. Sign in to continue your UPSC preparation.',
  noindex: true,
};

export function breadcrumbsFor(path) {
  const clean = normalizePath(path);
  const crumbs = [{ name: 'Home', path: '/' }];
  if (clean === '/') return crumbs;
  const parts = clean.split('/').filter(Boolean);
  let acc = '';
  parts.forEach((part) => {
    acc += `/${part}`;
    crumbs.push({ name: humanize(part), path: acc });
  });
  return crumbs;
}

export function resolveSeo(asPath) {
  const path = normalizePath(asPath);

  if (path === '/404') {
    return {
      title: `Page not found | ${SITE_NAME}`,
      description: 'This Notes Cafe page does not exist. Browse UPSC study material, maps, government resources and planning tools.',
      path,
      noindex: true,
    };
  }

  if (isPrivatePath(path)) {
    return {
      ...PRIVATE_SEO,
      path,
      title:
        path.startsWith('/admin')
          ? `Admin | ${SITE_NAME}`
          : path.startsWith('/student-desk')
            ? `Student Desk | ${SITE_NAME}`
            : `${humanize(path.slice(1) || 'Account')} | ${SITE_NAME}`,
    };
  }

  if (PUBLIC_SEO[path]) {
    return { ...PUBLIC_SEO[path], path, noindex: false };
  }

  const govMatch = path.match(/^\/government\/([^/]+)(?:\/([^/]+))?$/);
  if (govMatch) {
    const category = humanize(govMatch[1]);
    const slug = govMatch[2] ? humanize(govMatch[2]) : null;
    return {
      path,
      noindex: false,
      title: slug
        ? `${slug} | ${category} for UPSC | ${SITE_NAME}`
        : `${category} for UPSC | Government Resources | ${SITE_NAME}`,
      description: slug
        ? `${slug} explained for UPSC CSE. ${category} notes, maps and exam-relevant points on Notes Cafe.`
        : `UPSC ${category.toLowerCase()} — schemes, acts, articles and policy material mapped to the civil services syllabus.`,
      keywords: `${category} UPSC, ${slug || category} IAS, government ${category.toLowerCase()} UPSC`,
    };
  }

  const mapMatch = path.match(/^\/maps\/upsc-maps\/([^/]+)(?:\/([^/]+))?$/);
  if (mapMatch) {
    const category = humanize(mapMatch[1]);
    const slug = mapMatch[2] ? humanize(mapMatch[2]) : null;
    return {
      path,
      noindex: false,
      title: slug
        ? `${slug} Map for UPSC | ${category} | ${SITE_NAME}`
        : `${category} Maps for UPSC Geography | ${SITE_NAME}`,
      description: slug
        ? `${slug} map and geography notes for UPSC prelims and mains. Part of the Notes Cafe atlas.`
        : `UPSC maps for ${category.toLowerCase()} — Indian geography, locations and atlas notes for CSE.`,
      keywords: `${category} UPSC map, ${slug || category} geography IAS, atlas UPSC`,
    };
  }

  const resourceMatch = path.match(/^\/resources\/([^/]+)$/);
  if (resourceMatch) {
    const topic = humanize(resourceMatch[1]);
    return {
      path,
      noindex: false,
      title: `${topic} Notes for UPSC | ${SITE_NAME}`,
      description: `${topic} study resource for UPSC CSE. Use Notes Cafe for syllabus-linked notes and revision.`,
      keywords: `${topic} UPSC, ${topic} IAS notes`,
    };
  }

  const label = humanize(path.split('/').filter(Boolean).pop() || 'UPSC');
  return {
    path,
    noindex: false,
    title: `${label} for UPSC Preparation | ${SITE_NAME}`,
    description: `${label} on Notes Cafe — free UPSC study material for IAS, IPS and civil services prelims and mains.`,
    keywords: `${label} UPSC, ${label} IAS, ${DEFAULT_KEYWORDS}`,
  };
}

export const SITEMAP_PATHS = [
  '/',
  '/study-material',
  '/study-material/upsc-syllabus',
  '/study-material/standard-books',
  '/maps',
  '/maps/upsc-maps',
  '/maps/upsc-maps/river-systems',
  '/maps/upsc-maps/mountain-ranges',
  '/maps/upsc-maps/national-parks',
  '/maps/upsc-maps/biosphere-reserves',
  '/government',
  '/government/schemes',
  '/government/constitution-articles',
  '/government/important-acts',
  '/government/ministries',
  '/planning-tools',
  '/planning-tools/upsc-calendar',
  '/planning-tools/study-planner',
  '/planning-tools/pomodoro-timer',
  '/planning-tools/study-timetable',
  '/about',
  '/current-affairs',
];

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: SITE_OG_IMAGE,
    description:
      'Free UPSC Civil Services preparation platform with study material, maps, government resources and planning tools.',
    sameAs: [],
  };
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
  };
}

export function breadcrumbJsonLd(path) {
  const crumbs = breadcrumbsFor(path);
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
