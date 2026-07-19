// pages/robots.txt.js
// This file tells search engines what to index

export default function Robots() {
  // This function is required but the actual content is generated in getServerSideProps
}

export async function getServerSideProps({ res }) {
  const siteUrl = 'https://notescafe.in';

  const robotsTxt = `# Robots.txt for NotesCafe
# https://notescafe.in

User-agent: *
Allow: /

# Sitemap location
Sitemap: ${siteUrl}/sitemap.xml

# Disallow admin/private pages
Disallow: /student-desk/
Disallow: /admin/
Disallow: /api/
Disallow: /profile-setup/

# Crawl delay (optional - helps reduce server load)
Crawl-delay: 1

# Googlebot specific rules
User-agent: Googlebot
Allow: /
Disallow: /student-desk/
Disallow: /admin/

# Bingbot
User-agent: Bingbot
Allow: /
Disallow: /student-desk/
Disallow: /admin/
`;

  res.setHeader('Content-Type', 'text/plain');
  res.write(robotsTxt);
  res.end();

  return {
    props: {},
  };
}
