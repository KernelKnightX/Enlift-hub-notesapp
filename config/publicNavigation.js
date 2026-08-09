export const publicNavigation = [
  { label: 'Home', href: '/' },
  { label: 'Courses', href: '/courses' },
  {
    label: 'Study Material',
    href: '/study-material',
    children: [
      { label: 'UPSC Syllabus', href: '/study-material/upsc-syllabus' },
      { label: 'NCERT Books', href: '/study-material/ncert-books' },
      { label: 'Standard Books', href: '/study-material/standard-books' },
      { label: 'NCERT Notes', href: '/study-material/ncert-notes' },
      { label: 'Magazine Recommendations', href: '/study-material/magazine-recommendations' },
      { label: 'Economic Survey', href: '/study-material/economic-survey' },
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
      { label: 'Important Locations', href: '/maps/upsc-maps/important-locations' },
    ],
  },
  {
    label: 'Government',
    href: '/government',
    children: [
      { label: 'Government Schemes', href: '/government/schemes' },
      { label: 'Constitution Articles', href: '/government/constitution-articles' },
      { label: 'Important Acts', href: '/government/important-acts' },
      { label: 'Committees', href: '/government/committees' },
      { label: 'Ministries', href: '/government/ministries' },
      { label: 'Reports & Indices', href: '/government/reports-and-indices' },
    ],
  },
  {
    label: 'Planning Tools',
    href: '/planning-tools',
    children: [
      { label: 'UPSC Calendar', href: '/planning-tools/upsc-calendar' },
      { label: 'Study Planner', href: '/planning-tools/study-planner' },
      { label: 'Pomodoro Timer', href: '/planning-tools/pomodoro-timer' },
      { label: 'Revision Planner', href: '/planning-tools/revision-planner' },
      { label: 'Study Timetable', href: '/planning-tools/study-timetable' },
      { label: 'Goal Tracker', href: '/planning-tools/goal-tracker' },
    ],
  },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];
