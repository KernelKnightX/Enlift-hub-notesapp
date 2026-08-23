/**
 * Hero backgrounds for Study Material, Maps & Atlas, Government, and Planning Tools.
 *
 * How to change a hero image
 * 1. Put the file in public/heroes/
 * 2. Name it exactly as listed below (keep the same filename + extension)
 * 3. No code change needed
 *
 * Example: replace public/heroes/schemes.png to update Government Schemes.
 */

export const DEFAULT_HERO = '/heroes/default.png';

/** Path (no trailing slash) → file in /public/heroes */
export const HERO_BY_PATH = {
  '/study-material': '/heroes/study-material.png',
  '/study-material/upsc-syllabus': '/heroes/upsc-syllabus.png',
  '/study-material/ncert-books': '/heroes/ncert-books.png',
  '/study-material/standard-books': '/heroes/monthly-magazines.png',
  '/study-material/government-reports': '/heroes/reports-and-indices.svg',
  '/current-affairs': '/heroes/current-affairs.png',

  '/maps': '/heroes/maps.png',
  '/maps/upsc-maps': '/heroes/india-map.png',
  '/maps/upsc-maps/india-states': '/heroes/india-map.png',
  '/maps/upsc-maps/river-systems': '/heroes/river-systems.png',
  '/maps/upsc-maps/mountain-ranges': '/heroes/mountain-ranges.png',
  '/maps/upsc-maps/national-parks': '/heroes/national-parks.png',
  '/maps/upsc-maps/biosphere-reserves': '/heroes/biosphere-reserves.png',
  '/maps/upsc-maps/important-locations': '/heroes/important-locations.png',
  '/maps/upsc-maps/important-places': '/heroes/important-locations.png',

  '/government': '/heroes/government.png',
  '/government/schemes': '/heroes/schemes.png',
  '/government/constitution-articles': '/heroes/constitution-articles.png',
  '/government/important-acts': '/heroes/important-acts.png',
  '/government/committees': '/heroes/committees.svg',
  '/government/ministries': '/heroes/ministries.png',
  '/government/reports-and-indices': '/heroes/reports-and-indices.svg',
  '/government/reports-indices': '/heroes/reports-and-indices.svg',

  '/planning-tools': '/heroes/planning-tools.png',
  '/planning-tools/upsc-calendar': '/heroes/upsc-calendar.png',
  '/planning-tools/study-planner': '/heroes/study-planner.png',
  '/planning-tools/pomodoro-timer': '/heroes/pomodoro-timer.png',
  '/planning-tools/revision-planner': '/heroes/revision-planner.png',
  '/planning-tools/study-timetable': '/heroes/study-timetable.png',
  '/planning-tools/goal-tracker': '/heroes/goal-tracker.png',
  '/planning-tools/preparation-strategy': '/heroes/planning-tools.png',
  '/planning-tools/beginner-roadmap': '/heroes/planning-tools.png',
};

export function getHeroImage(asPath = '/') {
  const path = String(asPath).split('?')[0].split('#')[0].replace(/\/$/, '') || '/';
  if (HERO_BY_PATH[path]) return HERO_BY_PATH[path];

  const match = Object.keys(HERO_BY_PATH)
    .sort((a, b) => b.length - a.length)
    .find((key) => key !== '/' && path.startsWith(`${key}/`));

  return match ? HERO_BY_PATH[match] : DEFAULT_HERO;
}
