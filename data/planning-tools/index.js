import { CalendarDays, BarChart3, TimerReset, Target } from 'lucide-react';

export const planningTools = [
  { title: 'UPSC Calendar', description: 'A calm way to keep the prep journey visible and realistic.', href: '/planning-tools/upsc-calendar', icon: CalendarDays, difficulty: 'Beginner', usage: 'Weekly' },
  { title: 'Study Planner', description: 'Turn your week into a practical rhythm instead of a scattered to-do list.', href: '/planning-tools/study-planner', icon: BarChart3, difficulty: 'Beginner', usage: 'Daily' },
  { title: 'Pomodoro Timer', description: 'Support focused sessions for reading, note-making, and revision.', href: '/planning-tools/pomodoro-timer', icon: TimerReset, difficulty: 'Easy', usage: 'Session-based' },
  { title: 'Revision Planner', description: 'Make review a structured habit rather than a last-minute scramble.', href: '/planning-tools/revision-planner', icon: Target, difficulty: 'Intermediate', usage: 'Weekly' },
];
