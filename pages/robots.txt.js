import { SITE_URL } from '@/lib/seo';

export default function Robots() {
  return null;
}

export async function getServerSideProps({ res }) {
  const robotsTxt = `# Notes Cafe
User-agent: *
Allow: /
Disallow: /student-desk/
Disallow: /admin/
Disallow: /login
Disallow: /register
Disallow: /profile-setup

User-agent: Googlebot
Allow: /
Disallow: /student-desk/
Disallow: /admin/

Sitemap: ${SITE_URL}/sitemap.xml
`;

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.write(robotsTxt);
  res.end();

  return { props: {} };
}
