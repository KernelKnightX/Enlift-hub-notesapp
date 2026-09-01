import Head from 'next/head';
import { Download, ShieldCheck, Target, BookOpen } from 'lucide-react';
import useFirestoreCollection from '@/hooks/shared/useFirestoreCollection';
import ResourceHero from '@/components/public/ResourceHero';

const toMagazine = (item) => ({
  ...item,
  title: item.title || item.name || 'Untitled magazine',
  month: item.month || item.issue || '',
  coverUrl: item.coverUrl || item.imageUrl || item.coverImage || '',
  downloadUrl: item.downloadUrl || item.pdfUrl || item.url || '',
});

function MagazineBook({ magazine }) {
  const showSubtitle =
    magazine.title &&
    magazine.month &&
    magazine.title.trim().toLowerCase() !== magazine.month.trim().toLowerCase();

  return (
    <article className="magazine-book">
      <div className="magazine-book__visual">
        <div className="magazine-book__cover">
          {magazine.coverUrl ? (
            <img src={magazine.coverUrl} alt={`${magazine.title} cover`} loading="lazy" />
          ) : (
            <div className="magazine-book__placeholder" aria-hidden="true">
              <BookOpen size={36} strokeWidth={1.4} />
            </div>
          )}
        </div>
      </div>

      <p className="magazine-book__label">{magazine.month || magazine.title}</p>
      {showSubtitle ? <p className="magazine-book__subtitle">{magazine.title}</p> : null}

      {magazine.downloadUrl ? (
        <a
          className="magazine-book__download"
          href={magazine.downloadUrl}
          target="_blank"
          rel="noreferrer"
        >
          <Download size={13} strokeWidth={2} />
          Download Now
        </a>
      ) : (
        <span className="magazine-book__unavailable">Download unavailable</span>
      )}
    </article>
  );
}

export default function StandardBooksPage() {
  const { data: magazines, loaded } = useFirestoreCollection({
    name: 'monthlyMagazines',
    where: [['isActive', '==', true]],
    orderBy: ['publishedAt', 'desc'],
    fallback: [],
    transform: (docs) => docs.map(toMagazine),
  });

  return (
    <>
      <Head>
        <title>Monthly Magazines for UPSC | Notes Cafe</title>
        <meta
          name="description"
          content="Download the latest monthly current affairs magazines for UPSC preparation."
        />
      </Head>

      <main className="magazines-page">
        <ResourceHero
          withSeo={false}
          path="/study-material/standard-books"
          eyebrow="Study Material · Magazines"
          title="Monthly Magazines"
          description="Download the latest monthly current affairs magazines for UPSC preparation."
        />

        <section className="magazines-shell" id="issues">
          <div className="magazines-section-head">
            <h3>All issues</h3>
            {loaded && magazines.length > 0 && (
              <span className="magazines-count">{magazines.length} magazines</span>
            )}
          </div>

          <div className="magazines-shelf">
            {magazines.map((magazine) => (
              <MagazineBook key={magazine.id} magazine={magazine} />
            ))}
            {loaded && magazines.length === 0 && (
              <div className="magazines-empty">No monthly magazines have been published yet.</div>
            )}
          </div>

          <div className="magazines-benefits">
            <div>
              <ShieldCheck />
              <span>
                <strong>Comprehensive Coverage</strong>
                In-depth coverage of national &amp; international events
              </span>
            </div>
            <div>
              <Target />
              <span>
                <strong>Exam Focused</strong>
                Relevant for Prelims, Mains &amp; Interview
              </span>
            </div>
            <div>
              <ShieldCheck />
              <span>
                <strong>Expert Curated</strong>
                Trusted sources and authentic content
              </span>
            </div>
            <div>
              <Download />
              <span>
                <strong>Easy to Access</strong>
                Download &amp; read anytime anywhere
              </span>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
