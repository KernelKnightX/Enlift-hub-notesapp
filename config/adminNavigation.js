import {
  LayoutDashboard,
  BookOpen,
  Newspaper,
  Map,
  Landmark,
  FileText,
  ClipboardCheck,
  Bell,
  Users,
  CalendarDays,
} from 'lucide-react';

/** Admin office — grouped the way a CEO would walk the building. */
export const adminNavigationGroups = [
  {
    heading: 'Office',
    items: [
      { label: 'Command center', icon: LayoutDashboard, href: '/admin' },
    ],
  },
  {
    heading: 'Library',
    items: [
      { label: 'NCERT Books', icon: BookOpen, href: '/admin/books/ncert-books' },
      { label: 'Books Library', icon: BookOpen, href: '/admin/books' },
      { label: 'Notes & PDFs', icon: FileText, href: '/admin/notes' },
    ],
  },
  {
    heading: 'Newsroom',
    items: [
      { label: 'Monthly Magazines', icon: Newspaper, href: '/admin/monthly-magazines' },
      { label: 'Current Affairs', icon: Newspaper, href: '/admin/current-affairs' },
      { label: 'Homepage notices', icon: Bell, href: '/admin/notifications' },
    ],
  },
  {
    heading: 'Atlas',
    items: [
      { label: 'Maps & Atlas', icon: Map, href: '/admin/maps' },
      { label: 'Government', icon: Landmark, href: '/admin/government' },
    ],
  },
  {
    heading: 'Practice',
    items: [
      { label: 'Mock Tests', icon: ClipboardCheck, href: '/admin/mock-tests' },
      { label: 'PYQ Papers', icon: FileText, href: '/admin/pyq' },
    ],
  },
  {
    heading: 'Planning',
    items: [
      { label: 'UPSC Calendar', icon: CalendarDays, href: '/admin/planning-tools/upsc-calendar' },
    ],
  },
  {
    heading: 'People',
    items: [
      { label: 'Students', icon: Users, href: '/admin/users' },
    ],
  },
];

export const adminNavigation = adminNavigationGroups.flatMap((group) => group.items);
