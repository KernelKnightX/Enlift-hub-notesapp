import { useRouter } from 'next/router';
import SeoHead from '@/components/seo/SeoHead';
import { getHeroImage } from '@/lib/heroImages';

export default function ResourceHero({
  title,
  heading,
  description,
  eyebrow = 'Study Material',
  seoTitle,
  seoDescription,
  metaTitle,
  metaDescription,
  artImage,
  image,
  path,
  withSeo = true,
  includeSeo,
}) {
  const router = useRouter();
  const headingText = title || heading;
  const showSeo = includeSeo ?? withSeo;
  // pathname is stable on server and during hydration; asPath can lag on the client.
  const routePath = path || router.pathname || '/';
  const seoPath = path || router.pathname || '/';
  const background = artImage || image || getHeroImage(routePath);

  return (
    <>
      {showSeo ? (
        <SeoHead
          title={seoTitle || metaTitle || `${headingText} | Notes Cafe`}
          description={seoDescription || metaDescription || description}
          path={seoPath}
        />
      ) : null}
      <section className="resource-hero">
        <div className="resource-hero__inner">
          <div className="resource-hero__content">
            <span className="resource-hero__eyebrow">{eyebrow}</span>
            <h1>{headingText}</h1>
            <p>{description}</p>
          </div>
          <div
            className="resource-hero__art"
            aria-hidden="true"
            style={{
              backgroundImage: `linear-gradient(90deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.92) 12%, rgba(255,255,255,0.78) 26%, rgba(255,255,255,0.45) 44%, rgba(255,255,255,0) 62%), url("${background}")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'left center, right center',
              backgroundSize: '100% 100%, cover',
            }}
          />
        </div>
      </section>
    </>
  );
}
