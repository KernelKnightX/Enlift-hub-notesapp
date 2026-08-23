import { useRouter } from 'next/router';
import SeoHead from './SeoHead';
import { resolveSeo } from '@/lib/seo';

export default function DefaultSeo() {
  const router = useRouter();
  const seo = resolveSeo(router.asPath || '/');

  return (
    <SeoHead
      title={seo.title}
      description={seo.description}
      path={seo.path}
      noindex={Boolean(seo.noindex)}
      keywords={seo.keywords}
      includeOrg={seo.path === '/'}
    />
  );
}
