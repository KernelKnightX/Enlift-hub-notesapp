import { Compass, Map, Landmark, Leaf } from 'lucide-react';

export const mapsTopics = [
  { title: 'UPSC Maps', subtitle: 'India and World', description: 'A modern atlas overview designed for geography revision and quicker recall.', href: '/maps/upsc-maps', icon: Map, badge: 'Core' },
  { title: 'River Systems', subtitle: 'Drainage and physical geography', description: 'Understand major rivers and their significance in one structured place.', href: '/maps/upsc-maps/river-systems', icon: Compass, badge: 'Visual' },
  { title: 'Mountain Ranges', subtitle: 'Topography', description: 'Browse the most relevant ranges with clear, memory-friendly framing.', href: '/maps/upsc-maps/mountain-ranges', icon: Compass, badge: 'Revision' },
  { title: 'National Parks', subtitle: 'Environment', description: 'See protected areas through a geography and environment lens.', href: '/maps/upsc-maps/national-parks', icon: Landmark, badge: 'Environment' },
  { title: 'Biosphere Reserves', subtitle: 'Environment', description: 'UNESCO biosphere reserves and protected landscapes for UPSC environment.', href: '/maps/upsc-maps/biosphere-reserves', icon: Leaf, badge: 'Environment' },
];

export const mapsQuickFacts = ['5 atlas topics', 'Admin-published maps', 'Free public reference'];
