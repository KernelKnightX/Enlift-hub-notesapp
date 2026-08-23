import Head from 'next/head';
import {
  SITE_NAME,
  SITE_OG_IMAGE,
  DEFAULT_KEYWORDS,
  absoluteUrl,
  organizationJsonLd,
  websiteJsonLd,
  breadcrumbJsonLd,
} from '@/lib/seo';

export default function SeoHead({
  title,
  description,
  path = '/',
  image,
  noindex = false,
  keywords,
  type = 'website',
  jsonLd = [],
  includeOrg = false,
}) {
  const url = absoluteUrl(path);
  const ogImage = image
    ? image.startsWith('http')
      ? image
      : `${absoluteUrl('/').replace(/\/$/, '')}${image.startsWith('/') ? image : `/${image}`}`
    : SITE_OG_IMAGE;
  const robots = noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
  const kw = keywords || DEFAULT_KEYWORDS;

  const graphs = [
    ...(includeOrg ? [organizationJsonLd(), websiteJsonLd()] : []),
    ...(!noindex ? [breadcrumbJsonLd(path)] : []),
    ...jsonLd,
  ];

  return (
    <Head>
      <title>{title}</title>
      <meta key="desc" name="description" content={description} />
      <meta key="keywords" name="keywords" content={kw} />
      <meta key="robots" name="robots" content={robots} />
      <meta key="googlebot" name="googlebot" content={robots} />
      <meta key="author" name="author" content={SITE_NAME} />
      <meta key="application-name" name="application-name" content={SITE_NAME} />
      <link key="canonical" rel="canonical" href={url} />

      <meta key="og:type" property="og:type" content={type} />
      <meta key="og:site_name" property="og:site_name" content={SITE_NAME} />
      <meta key="og:locale" property="og:locale" content="en_IN" />
      <meta key="og:title" property="og:title" content={title} />
      <meta key="og:description" property="og:description" content={description} />
      <meta key="og:url" property="og:url" content={url} />
      <meta key="og:image" property="og:image" content={ogImage} />
      <meta key="og:image:alt" property="og:image:alt" content={title} />

      <meta key="twitter:card" name="twitter:card" content="summary_large_image" />
      <meta key="twitter:title" name="twitter:title" content={title} />
      <meta key="twitter:description" name="twitter:description" content={description} />
      <meta key="twitter:image" name="twitter:image" content={ogImage} />

      {graphs.map((graph, index) => (
        <script
          // eslint-disable-next-line react/no-danger
          key={`ld-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
        />
      ))}
    </Head>
  );
}
