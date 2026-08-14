# Implementation Guide: Using SchemePageLayout for Different Pages

This guide shows how to implement the SchemePageLayout component for different sections of your app (Government Schemes, Maps & Atlas, Planning Tools, etc.).

## Quick Start

### Step 1: Choose Your Data Source

Identify where your data comes from:
- Firebase collection name
- Section/type field name
- Category/filter field name

### Step 2: Copy the Template

Use the patterns from `/pages/government/schemes/index.js` as your template:

```jsx
import Head from 'next/head';
import { useEffect, useMemo, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { SchemePageLayout } from '@/components/public/SchemePageLayout';
import { ResourceLayout } from '@/components/public/SharedComponents';
```

### Step 3: Customize for Your Content

Update these parts:
1. **Collection and Section**: `collection(db, 'government')` and `where('section', '==', 'schemes')`
2. **Page Title & Description**: "Government Schemes" → Your page name
3. **Categories**: Extract from your `sector` field or your equivalent
4. **Statistics**: Create stats relevant to your data
5. **Hero Image**: Point to your own `/images/your-page-hero.png`

## Implementation Examples by Page Type

### 1. Maps & Atlas Page

**File**: `/pages/maps/atlas.js`

```jsx
import Head from 'next/head';
import { useEffect, useMemo, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { SchemePageLayout } from '@/components/public/SchemePageLayout';
import { ResourceLayout } from '@/components/public/SharedComponents';
import { Globe, MapPin, Layers, Users } from 'lucide-react';

export default function MapsAtlasPage() {
  const [maps, setMaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const qref = query(
      collection(db, 'resources'),
      where('type', '==', 'map'),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(qref, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMaps(data);
      setLoading(false);
    }, (err) => {
      console.error('Error loading maps:', err);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const categories = useMemo(() => {
    const s = new Set();
    maps.forEach((map) => {
      if (map.mapType) s.add(map.mapType); // "Political", "Physical", "Climate", etc.
    });
    return Array.from(s).sort();
  }, [maps]);

  const statistics = useMemo(() => {
    const uniqueRegions = new Set();
    maps.forEach((map) => {
      if (map.region) uniqueRegions.add(map.region);
    });

    return [
      {
        icon: Globe,
        number: `${maps.length}+`,
        label: 'Maps',
        description: 'Geographical maps & atlases',
      },
      {
        icon: MapPin,
        number: `${uniqueRegions.size}+`,
        label: 'Regions',
        description: 'Regions covered',
      },
      {
        icon: Layers,
        number: 'Updated',
        label: 'Regularly',
        description: 'Accurate & current',
      },
      {
        icon: Users,
        number: 'Curated',
        label: 'for UPSC',
        description: 'Aspirants',
      },
    ];
  }, [maps]);

  return (
    <>
      <Head>
        <title>Maps & Atlas | Notes Cafe</title>
        <meta name="description" content="Explore geographical maps, atlases, and geographical resources for UPSC preparation." />
      </Head>

      <ResourceLayout
        eyebrow="Geography"
        title="Maps & Atlas"
        description="Explore geographical maps and atlases for UPSC preparation."
        breadcrumbs={[{ label: 'Maps', href: '/maps' }, { label: 'Atlas' }]}
      >
        <SchemePageLayout
          title="Maps & Atlas"
          description="Explore geographical maps, atlases, and geographical resources for UPSC preparation."
          heroImage="/images/maps-hero.png"
          schemes={maps}
          categories={categories}
          loading={loading}
          searchQuery={searchQuery}
          onSearch={setSearchQuery}
          statistics={statistics}
        />
      </ResourceLayout>
    </>
  );
}
```

**Data Structure Expected**:
```javascript
{
  id: "map-1",
  title: "Physical Map of India",
  summary: "Comprehensive physical features map of India",
  mapType: "Physical", // This becomes category
  region: "South Asia",
  year: 2024,
  image: "/images/maps/physical-india.jpg",
  slug: "physical-map-india",
  featured: false
}
```

---

### 2. Planning Tools Page

**File**: `/pages/planning-tools/index.js`

```jsx
import Head from 'next/head';
import { useEffect, useMemo, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { SchemePageLayout } from '@/components/public/SchemePageLayout';
import { ResourceLayout } from '@/components/public/SharedComponents';
import { Calendar, Clock, Target, Users } from 'lucide-react';

export default function PlanningToolsPage() {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const qref = query(
      collection(db, 'tools'),
      where('category', '==', 'planning'),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(qref, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setTools(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const categories = useMemo(() => {
    const s = new Set();
    tools.forEach((tool) => {
      if (tool.toolType) s.add(tool.toolType); // "Study Plan", "Schedule", "Goal Tracker"
    });
    return Array.from(s).sort();
  }, [tools]);

  const statistics = [
    {
      icon: Calendar,
      number: `${tools.length}+`,
      label: 'Tools',
      description: 'Planning & study tools',
    },
    {
      icon: Clock,
      number: 'Flexible',
      label: 'Duration',
      description: 'Adapt to your pace',
    },
    {
      icon: Target,
      number: 'Goal',
      label: 'Oriented',
      description: 'UPSC focused',
    },
    {
      icon: Users,
      number: '1000+',
      label: 'Users',
      description: 'Successfully used',
    },
  ];

  return (
    <>
      <Head>
        <title>Planning Tools | Notes Cafe</title>
        <meta name="description" content="Curated planning and study tools for effective UPSC preparation." />
      </Head>

      <ResourceLayout
        eyebrow="Study Tools"
        title="Planning Tools"
        description="Curated planning and study tools for your UPSC journey."
        breadcrumbs={[{ label: 'Planning Tools' }]}
      >
        <SchemePageLayout
          title="Planning Tools"
          description="Curated planning and study tools for effective UPSC preparation."
          heroImage="/images/planning-tools-hero.png"
          schemes={tools}
          categories={categories}
          loading={loading}
          searchQuery={searchQuery}
          onSearch={setSearchQuery}
          statistics={statistics}
        />
      </ResourceLayout>
    </>
  );
}
```

**Data Structure Expected**:
```javascript
{
  id: "tool-1",
  title: "90-Day UPSC Preparation Plan",
  summary: "Structured 90-day study plan for comprehensive UPSC coverage",
  toolType: "Study Plan", // This becomes category
  ministry: "Notes Cafe", // or creator
  year: 2024,
  image: "/images/tools/90day-plan.jpg",
  slug: "90-day-upsc-plan",
  featured: true
}
```

---

### 3. Current Affairs Page

**File**: `/pages/current-affairs/index.js` (if not exists)

```jsx
import Head from 'next/head';
import { useEffect, useMemo, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { SchemePageLayout } from '@/components/public/SchemePageLayout';
import { ResourceLayout } from '@/components/public/SharedComponents';
import { Newspaper, Zap, Globe, TrendingUp } from 'lucide-react';

export default function CurrentAffairsPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const qref = query(
      collection(db, 'content'),
      where('type', '==', 'current-affairs'),
      orderBy('publishedAt', 'desc')
    );
    const unsub = onSnapshot(qref, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setArticles(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const categories = useMemo(() => {
    const s = new Set();
    articles.forEach((article) => {
      if (article.topic) s.add(article.topic); // "Economics", "Polity", "International"
    });
    return Array.from(s).sort();
  }, [articles]);

  const statistics = [
    {
      icon: Newspaper,
      number: `${articles.length}+`,
      label: 'Articles',
      description: 'Current affairs covered',
    },
    {
      icon: Zap,
      number: 'Updated',
      label: 'Daily',
      description: 'Fresh content',
    },
    {
      icon: Globe,
      number: 'Global',
      label: 'Perspective',
      description: 'Worldwide coverage',
    },
    {
      icon: TrendingUp,
      number: 'UPSC',
      label: 'Focused',
      description: 'Relevant topics',
    },
  ];

  return (
    <>
      <Head>
        <title>Current Affairs | Notes Cafe</title>
        <meta name="description" content="Daily current affairs articles curated for UPSC preparation." />
      </Head>

      <ResourceLayout
        eyebrow="News & Analysis"
        title="Current Affairs"
        description="Stay updated with daily current affairs articles."
        breadcrumbs={[{ label: 'Current Affairs' }]}
      >
        <SchemePageLayout
          title="Current Affairs"
          description="Daily current affairs articles curated for UPSC preparation."
          heroImage="/images/current-affairs-hero.png"
          schemes={articles}
          categories={categories}
          loading={loading}
          searchQuery={searchQuery}
          onSearch={setSearchQuery}
          statistics={statistics}
        />
      </ResourceLayout>
    </>
  );
}
```

---

## Key Differences Per Page Type

| Page | Collection | Section | Category Field | Icon | Hero Image |
|------|-----------|---------|----------------|------|------------|
| Government Schemes | `government` | `schemes` | `sector` | Building2 | government-hero.png |
| Maps & Atlas | `resources` | `map` | `mapType` | Globe | maps-hero.png |
| Planning Tools | `tools` | `planning` | `toolType` | Calendar | planning-tools-hero.png |
| Current Affairs | `content` | `current-affairs` | `topic` | Newspaper | current-affairs-hero.png |

## Data Field Mapping

When implementing for a new page, map your data fields:

```javascript
// Your actual data structure
{
  id: "unique-id",
  title: "Your Item Title",
  description: "Your description",    // Maps to: summary
  category_type: "Your Category",      // Maps to: sector
  organization: "Organization Name",   // Maps to: ministry
  created_year: 2024,                  // Maps to: year
  thumbnail: "/path/to/image.jpg",     // Maps to: image
  url_slug: "your-url-slug",           // Maps to: slug
  is_featured: false                   // Maps to: featured
}

// Transform to standard structure:
const items = data.map(item => ({
  id: item.id,
  title: item.title,
  summary: item.description,           // ← Rename here
  sector: item.category_type,          // ← Rename here
  ministry: item.organization,         // ← Rename here
  year: item.created_year,             // ← Rename here
  image: item.thumbnail,               // ← Rename here
  slug: item.url_slug,                 // ← Rename here
  featured: item.is_featured           // ← Rename here
}));
```

## Testing Your Implementation

1. **Check for Compilation Errors**:
   ```bash
   npm run build
   ```

2. **Test in Development**:
   ```bash
   npm run dev
   ```
   Then navigate to your new page

3. **Test Search**: Type in the search box
4. **Test Categories**: Click category filters
5. **Test Load More**: Scroll and click "Load More" button
6. **Test Responsiveness**: Check on mobile, tablet, desktop

## Common Issues & Solutions

### Issue: No items showing
- **Solution**: Check that `schemes` array has correct data structure
- Verify Firebase query is correct
- Check browser console for errors

### Issue: Categories not appearing
- **Solution**: Verify all items have the category field (e.g., `sector`)
- Category extraction uses `new Set()` so values must match exactly

### Issue: Search not working
- **Solution**: Check that search query is passed through `onSearch` callback
- Verify items have `title`, `summary`, and `ministry` fields

### Issue: Hero image not showing
- **Solution**: Verify image path is correct in `/public/images/`
- Use full paths like `/images/maps-hero.png` not relative paths

## Next Steps

1. Create your page file using the template above
2. Adjust collection name, section, and category fields
3. Update title, description, and hero image
4. Create statistics relevant to your data
5. Test thoroughly in development
6. Commit and deploy

For more details, see `SCHEME_PAGE_LAYOUT_DOCS.md`
