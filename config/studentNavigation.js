import { LayoutDashboard, Newspaper, FileText, ClipboardCheck, BookOpen, Calendar as CalendarIcon, User as UserIcon } from 'lucide-react';

export const studentNavigation = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/student-desk/dashboard' },
  { label: 'Current Affairs', icon: Newspaper, href: '/student-desk/current-affairs' },
  { label: 'PYQ Papers', icon: FileText, href: '/student-desk/pyq' },
  { label: 'Mock Tests', icon: ClipboardCheck, href: '/student-desk/mock-tests' },
  { label: 'Study Notes', icon: BookOpen, href: '/student-desk/notes' },
  { label: 'Planner', icon: CalendarIcon, href: '/student-desk/planner' },
  { label: 'Profile', icon: UserIcon, href: '/student-desk/profile' },
];
