export const publicNavigation = [
  { label: 'Home', href: '/' },
  { label: 'Current Affairs', href: '/current-affairs' },
  {
    label: 'Study Material',
    href: '/study-material',
    children: [
      { label: 'UPSC Syllabus', href: '/study-material/upsc-syllabus' },
      { label: 'Monthly Magazines', href: '/study-material/standard-books' },
    ],
  },
  {
    label: 'Maps & Atlas',
    href: '/maps',
    children: [
      { label: 'India Map', href: '/maps/upsc-maps' },
      { label: 'River Systems', href: '/maps/upsc-maps/river-systems' },
      { label: 'Mountain Ranges', href: '/maps/upsc-maps/mountain-ranges' },
      { label: 'National Parks', href: '/maps/upsc-maps/national-parks' },
      { label: 'Biosphere Reserves', href: '/maps/upsc-maps/biosphere-reserves' },
    ],
  },
  {
    label: 'Government',
    href: '/government',
    children: [
      { label: 'Government Schemes', href: '/government/schemes' },
      { label: 'Constitution Articles', href: '/government/constitution-articles' },
      { label: 'Important Acts', href: '/government/important-acts' },
      { label: 'Ministries', href: '/government/ministries' },
    ],
  },
  {
    label: 'Planning Tools',
    href: '/planning-tools',
    children: [
      { label: 'UPSC Calendar', href: '/planning-tools/upsc-calendar' },
      { label: 'Study Planner', href: '/planning-tools/study-planner' },
      { label: 'Pomodoro Timer', href: '/planning-tools/pomodoro-timer' },
      { label: 'Study Timetable', href: '/planning-tools/study-timetable' },
    ],
  },
  { label: 'About', href: '/about' },
];
