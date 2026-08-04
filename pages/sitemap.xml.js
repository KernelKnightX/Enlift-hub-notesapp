// pages/sitemap.xml.js
// This file generates XML sitemap for SEO - helps Google index your site

export default function Sitemap() {
  // This function is required but the actual XML is generated in getServerSideProps
}

export async function getServerSideProps({ res }) {
  const siteUrl = 'https://notescafe.in';

  // Static pages
  const staticPages = [
    '',
    '/',
    '/login',
    '/register',
    '/profile-setup',
    '/student-desk/dashboard',
    '/student-desk/notes',
    '/student-desk/current-affairs',
    '/student-desk/mock-tests',
    '/student-desk/pyq',
    '/student-desk/planner',
    '/student-desk/profile',
  ];

  const today = new Date().toISOString().split('T')[0];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages
    .map((page) => {
      const pageUrl = page === '' || page === '/' ? siteUrl : `${siteUrl}${page}`;
      return `
  <url>
    <loc>${pageUrl}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page === '/' ? 'daily' : 'weekly'}</changefreq>
    <priority>${page === '/' ? '1.0' : '0.8'}</priority>
  </url>`;
    })
    .join('')}
</urlset>`;

  res.setHeader('Content-Type', 'text/xml');
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
}
