import { SITE_URL, SITEMAP_PATHS, absoluteUrl } from '@/lib/seo';

export default function Sitemap() {
  return null;
}

export async function getServerSideProps({ res }) {
  const today = new Date().toISOString().split('T')[0];

  const urls = SITEMAP_PATHS.map((path) => {
    const loc = absoluteUrl(path);
    const isHome = path === '/';
    return `
  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${isHome ? 'daily' : 'weekly'}</changefreq>
    <priority>${isHome ? '1.0' : path.split('/').length <= 2 ? '0.9' : '0.8'}</priority>
  </url>`;
  }).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;

  res.setHeader('Content-Type', 'text/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.write(xml);
  res.end();

  return { props: {} };
}
