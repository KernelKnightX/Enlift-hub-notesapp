import { LayoutDashboard, BookOpen, Newspaper, Users, ClipboardCheck, Bell, BarChart3, Map } from 'lucide-react';

export const adminNavigation = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
  { label: 'Books', icon: BookOpen, href: '/admin/books' },
  { label: 'Current Affairs', icon: Newspaper, href: '/admin/current-affairs' },
  { label: 'Maps & Atlas', icon: Map, href: '/admin/maps' },
  { label: 'Users', icon: Users, href: '/admin/users' },
  { label: 'Mock Tests', icon: ClipboardCheck, href: '/admin/mock-tests' },
  { label: 'Notifications', icon: Bell, href: '/admin/notifications' },
  { label: 'Analytics', icon: BarChart3, href: '/admin/analytics' },
];
