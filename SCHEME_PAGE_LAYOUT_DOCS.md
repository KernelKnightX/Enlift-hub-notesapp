# SchemePageLayout Component Documentation

## Overview

The `SchemePageLayout` component is a reusable, flexible layout for displaying curated collections of content (schemes, maps, atlases, etc.) with search, filtering, and pagination capabilities.

## Features

- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- **Search Functionality**: Real-time search across multiple fields
- **Category Filtering**: Dynamic filter buttons based on content data
- **Featured Content**: Highlight one key item with a prominent card
- **Statistics Cards**: Display key metrics about the collection
- **Lazy Loading**: Load more functionality with smooth animations
- **Accessibility**: Built with semantic HTML and ARIA labels
- **Consistent Styling**: Uses CSS custom properties for theming

## Component Structure

### Main Component: `SchemePageLayout`

```jsx
<SchemePageLayout
  title="Government Schemes"
  description="Explore major Government of India schemes..."
  heroImage="/images/government-hero.png"
  schemes={schemes}
  categories={categories}
  loading={loading}
  searchQuery={searchQuery}
  onSearch={setSearchQuery}
  statistics={statistics}
/>
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `title` | string | Yes | Page title |
| `description` | string | Yes | Page subtitle/description |
| `heroImage` | string | No | Path to hero image (displayed on desktop) |
| `schemes` | array | Yes | Array of content items (see data structure below) |
| `categories` | array | Yes | Array of category filter options |
| `loading` | boolean | No | Show loading state (default: false) |
| `searchQuery` | string | No | Current search query value |
| `onSearch` | function | Yes | Callback when search changes |
| `statistics` | array | No | Array of stat cards (4 items recommended) |

### Data Structure

Each item in the `schemes` array should follow this structure:

```javascript
{
  id: "unique-id",
  title: "Scheme Name",
  summary: "Brief description of the scheme",
  sector: "Category/Sector Name",
  ministry: "Ministry Name",
  year: 2023,
  image: "/path/to/image.jpg",
  slug: "scheme-url-slug",
  featured: false // Set to true to highlight as featured
}
```

### Sub-Components

#### 1. `StatCard` - Statistics Display

Used in the statistics section. Shows a metric with icon, number, label, and description.

```javascript
{
  icon: TrendingUp,
  number: "120+",
  label: "Schemes",
  description: "Government schemes listed"
}
```

#### 2. `SchemeCard` - Content Item Card

Displays individual items in a grid. Features:
- Optional image
- Category badge
- Save/bookmark functionality
- Quick access to details

#### 3. `FeaturedSchemeCard` - Hero Card

Prominent display for featured item. Shows:
- Large title
- Summary
- Key metadata (ministry, year)
- Side-by-side image
- Call-to-action button

#### 4. `CategoryButton` - Filter Button

Dynamic filter buttons that:
- Highlight when selected
- Show active state
- Optional icon support
- Responsive spacing

## Usage Examples

### Example 1: Government Schemes Page (Current Implementation)

```jsx
import { SchemePageLayout } from '@/components/public/SchemePageLayout';
import { TrendingUp, Building2, Calendar, Users } from 'lucide-react';

export default function GovernmentSchemesPage() {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Load schemes from Firebase
    const qref = query(
      collection(db, 'government'),
      where('section', '==', 'schemes'),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(qref, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setSchemes(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const categories = useMemo(() => {
    const s = new Set();
    schemes.forEach((it) => {
      if (it.sector) s.add(it.sector);
    });
    return Array.from(s).sort();
  }, [schemes]);

  const statistics = [
    {
      icon: TrendingUp,
      number: `${schemes.length}+`,
      label: 'Schemes',
      description: 'Government schemes listed',
    },
    // ... more statistics
  ];

  return (
    <ResourceLayout {...props}>
      <SchemePageLayout
        title="Government Schemes"
        description="Explore major Government of India schemes..."
        heroImage="/images/government-hero.png"
        schemes={schemes}
        categories={categories}
        loading={loading}
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
        statistics={statistics}
      />
    </ResourceLayout>
  );
}
```

### Example 2: Maps & Atlas Page

```jsx
// /pages/maps/atlas.js

export default function MapsAtlasPage() {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Load maps from database
    const qref = query(
      collection(db, 'resources'),
      where('type', '==', 'map'),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(qref, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setItems(data);
    });
    return () => unsub();
  }, []);

  const categories = useMemo(() => {
    const s = new Set();
    items.forEach((it) => {
      if (it.mapType) s.add(it.mapType); // e.g., "Political", "Physical"
    });
    return Array.from(s).sort();
  }, [items]);

  return (
    <ResourceLayout {...props}>
      <SchemePageLayout
        title="Maps & Atlas"
        description="Explore geographical maps and atlases..."
        heroImage="/images/maps-hero.png"
        schemes={items}
        categories={categories}
        loading={loading}
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
        statistics={[
          { icon: Globe, number: `${items.length}+`, label: 'Maps' },
          // ... more stats
        ]}
      />
    </ResourceLayout>
  );
}
```

### Example 3: Planning Tools Page

```jsx
// /pages/planning-tools/index.js

export default function PlanningToolsPage() {
  const [tools, setTools] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Load planning tools from database
  useEffect(() => {
    // Your data fetching logic
  }, []);

  const categories = useMemo(() => {
    // Extract categories from tool data
    return ['Study Plans', 'Schedules', 'Goal Trackers'];
  }, [tools]);

  return (
    <ResourceLayout {...props}>
      <SchemePageLayout
        title="Planning Tools"
        description="Curated planning and study tools for UPSC preparation..."
        heroImage="/images/planning-hero.png"
        schemes={tools}
        categories={categories}
        loading={loading}
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
        statistics={[
          { icon: Calendar, number: '50+', label: 'Tools' },
          // ... more stats
        ]}
      />
    </ResourceLayout>
  );
}
```

## Styling & Customization

### Color Variables

The component uses CSS custom properties for theming:

```css
--color-primary           /* Main brand color (blue) */
--color-primary-tint      /* Light version of primary */
--color-accent            /* Accent color */
--color-accent-tint       /* Light accent */
--color-surface           /* Card background */
--color-surface-alt       /* Alternative surface */
--color-border            /* Border color */
--color-ink               /* Text color */
--color-ink-muted         /* Muted text color */
```

To customize colors globally, edit `/styles/globals.css` or `/styles/common.css`

### Font Styling

Titles use serif font (`font-serif`) with varying sizes:
- H1: `text-[32px] md:text-[42px]`
- H2: `text-[24px] md:text-[28px]`
- H3: `text-[16px] md:text-[18px]`

Body text: `text-[14px] md:text-[15px]`

### Responsive Breakpoints

- Mobile: < 768px (md breakpoint)
- Tablet: 768px - 1024px
- Desktop: > 1024px

## Advanced Features

### 1. Featured Item Selection

Items marked with `featured: true` will be displayed prominently:

```javascript
{
  id: "pmjdy",
  title: "Pradhan Mantri Jan Dhan Yojana",
  featured: true,
  // ... other properties
}
```

If no featured item exists, the first item in the array is used.

### 2. Search Functionality

Searches across:
- Title
- Summary/Description
- Ministry/Organization
- Other relevant fields (configurable by modifying SchemePageLayout)

### 3. Load More Pagination

- Shows 9 items initially
- Load More button adds 9 more items
- Smooth animations for new items
- Button only shows if more items exist

### 4. Save/Bookmark (Future Enhancement)

The bookmark button in SchemeCard is ready for save functionality:

```javascript
const handleSave = (e) => {
  e.preventDefault();
  setIsSaved(!isSaved);
  onSave?.(scheme.id);
};
```

To implement:
```jsx
<SchemeCard 
  scheme={scheme} 
  onSave={(id) => {
    // Save to database or localStorage
    saveToUser(id);
  }}
/>
```

## Performance Considerations

1. **Image Optimization**: Ensure images are optimized
   ```jsx
   // Future: Use Next.js Image component for better performance
   import Image from 'next/image';
   <Image src={image} alt={title} width={300} height={180} />
   ```

2. **Memoization**: useMemo prevents unnecessary recalculations

3. **Lazy Loading**: Load More pattern reduces initial load

4. **Animations**: Framer Motion animations are GPU-accelerated

## Accessibility Features

- Semantic HTML structure
- Proper heading hierarchy (h1 > h2 > h3)
- Alt text for images
- Keyboard navigation support
- Color contrast compliance

## Common Customizations

### Changing Items Per Page

Edit `SchemePageLayout.js` - change `setItemsToShow(9)` to your preferred number:

```javascript
const [itemsToShow, setItemsToShow] = useState(12); // Show 12 items
```

### Adding More Statistics

Simply add more objects to the statistics array:

```javascript
statistics={[
  { icon: Icon1, number: '120+', label: 'Schemes' },
  { icon: Icon2, number: '35+', label: 'Ministries' },
  { icon: Icon3, number: 'Updated', label: 'Regularly' },
  { icon: Icon4, number: 'Curated', label: 'for UPSC' },
  { icon: Icon5, number: '1000+', label: 'New Items' }, // Additional stat
]}
```

### Hiding Sections

To hide certain sections, pass empty arrays or null:

```jsx
<SchemePageLayout
  title="..."
  description="..."
  categories={[]} // Hide category filters
  statistics={[]} // Hide statistics
  // ...
/>
```

### Custom Empty State

Edit the empty state in SchemePageLayout.js (around line 280):

```jsx
{/* Empty State */}
{!loading && filtered.length === 0 && (
  <section className="max-w-[1240px] mx-auto px-6 md:px-10 py-12 md:py-16 text-center">
    <div className="inline-flex flex-col items-center gap-3">
      <div className="text-[48px]">🔍</div>
      <h3 className="font-serif text-[20px] font-bold">No items found</h3>
      <p style={{ color: 'var(--color-ink-muted)' }}>
        Try adjusting your search or filter criteria.
      </p>
    </div>
  </section>
)}
```

## Browser Support

- Chrome: All versions
- Firefox: All versions
- Safari: 12+
- Edge: All versions
- Mobile browsers: iOS Safari 12+, Chrome Mobile

## Files Modified

1. Created: `/components/public/SchemePageLayout.js` - Main layout component
2. Updated: `/pages/government/schemes/index.js` - Implements SchemePageLayout
3. Fixed: `/pages/government/constitutional-bodies.js` - Syntax error

## Future Enhancements

- [ ] Save/bookmark functionality integrated with user accounts
- [ ] Advanced filtering (multiple selections)
- [ ] Sorting options (alphabetical, date, relevance)
- [ ] Export/share functionality
- [ ] Favorites/history tracking
- [ ] Related items suggestions
- [ ] Analytics integration

## Support

For issues or questions about the SchemePageLayout component:
1. Check the examples above
2. Review the component code comments
3. Check existing implementations in `/pages/government/schemes/index.js`

## License

This component is part of the Notes Cafe project and follows the same license terms.
