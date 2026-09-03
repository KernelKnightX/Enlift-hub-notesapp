import GenericPublicPage, { contentBySlug } from '@/components/public/GenericPublicPage';
import { getMergedPublicPageContent } from '@/lib/firestore/publicPages';

const PAGE_ID = 'planning-preparation-strategy';
const SLUG = 'preparation-strategy';
const defaults = { slug: SLUG, status: 'published', ...contentBySlug[SLUG] };

export default function PreparationStrategyPage({ pageData }) {
  return <GenericPublicPage slug={SLUG} pageData={pageData} />;
}

export async function getStaticProps() {
  try {
    const pageData = await getMergedPublicPageContent(PAGE_ID, defaults);
    return { props: { pageData }, revalidate: 60 };
  } catch (error) {
    console.error('Failed to load preparation strategy page:', error);
    return { props: { pageData: defaults }, revalidate: 60 };
  }
}
