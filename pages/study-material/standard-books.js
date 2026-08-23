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

function MagazineCard({ magazine }) {
  return (
    <article className="magazine-card">
      <div className="magazine-cover">
        {magazine.coverUrl ? (
          <img src={magazine.coverUrl} alt={`${magazine.title} cover`} loading="lazy" />
        ) : <BookOpen size={48} strokeWidth={1.4} aria-hidden="true" />}
      </div>
      <h2>{magazine.month || magazine.title}</h2>
      {magazine.month && <p>{magazine.title}</p>}
      {magazine.downloadUrl ? (
        <a className="magazine-download" href={magazine.downloadUrl} target="_blank" rel="noreferrer">
          <Download size={14} /> Download Now
        </a>
      ) : <span className="magazine-unavailable">Download unavailable</span>}
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
        <meta name="description" content="Download the latest monthly current affairs magazines for UPSC preparation." />
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
        <div className="magazines-breadcrumb">Home <span>›</span> Current Affairs <span>›</span> Monthly Magazines</div>

        <div className="magazines-grid">
          {magazines.map((magazine) => <MagazineCard key={magazine.id} magazine={magazine} />)}
          {loaded && magazines.length === 0 && <div className="magazines-empty">No monthly magazines have been published yet.</div>}
        </div>

        <div className="magazines-benefits">
          <div><ShieldCheck /><span><strong>Comprehensive Coverage</strong>In-depth coverage of national &amp; international events</span></div>
          <div><Target /><span><strong>Exam Focused</strong>Relevant for Prelims, Mains &amp; Interview</span></div>
          <div><ShieldCheck /><span><strong>Expert Curated</strong>Trusted sources and authentic content</span></div>
          <div><Download /><span><strong>Easy to Access</strong>Download &amp; read anytime anywhere</span></div>
        </div>
      </section>
      <style jsx>{`
        .magazines-page { min-height: 100vh; background: #fff; color: #101a3d; }
        .magazines-shell { max-width: 1160px; margin: 0 auto; padding: 24px 30px 36px; }
        .magazines-breadcrumb { font-size: 11px; color: #46618e; margin-bottom: 18px; }
        .magazines-breadcrumb span { color: #aab6c9; padding: 0 8px; }
        .magazines-kicker { display: none; }
        .magazines-heading h1 { margin: 0; font-size: 30px; line-height: 1.2; letter-spacing: -.02em; }
        .magazines-heading p { margin: 6px 0 22px; color: #506486; font-size: 12px; }
        .magazines-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
        .magazine-card { display: flex; min-width: 0; min-height: 390px; flex-direction: column; overflow: hidden; border: 1px solid #e0e6ef; border-radius: 8px; background: #fff; box-shadow: 0 12px 30px rgba(31, 41, 55, .04); transition: transform .18s ease, border-color .18s ease, box-shadow .18s ease; }
        .magazine-card:hover { transform: translateY(-3px); border-color: rgba(77, 56, 245, .26); box-shadow: 0 18px 34px rgba(31, 41, 55, .08); }
        .magazine-cover { height: 260px; overflow: hidden; background: #083687; display: grid; place-items: center; color: #fff; }
        .magazine-cover img { width: 100%; height: 100%; object-fit: cover; }
        .magazine-card h2 { margin: 16px 16px 0; color: #111827; font-size: 17px; line-height: 1.3; }
        .magazine-card p { margin: 6px 16px 0; color: #64738e; font-size: 13px; line-height: 1.5; }
        .magazine-download { display: inline-flex; align-items: center; justify-content: center; gap: 5px; margin: auto 16px 16px; min-height: 40px; border: 1px solid rgba(77, 56, 245, .34); border-radius: 8px; color: #422cf4; font-size: 13px; font-weight: 750; text-decoration: none; }
        .magazine-unavailable { display: block; margin: auto 16px 16px; color: #8a96a9; font-size: 12px; padding: 12px 0; text-align: center; }
        .magazines-empty { grid-column: 1 / -1; padding: 50px 20px; border: 1px dashed #cbd5e4; text-align: center; color: #61718b; font-size: 13px; }
        .magazines-benefits { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; margin-top: 22px; padding: 15px 28px; border: 1px solid #dce5f2; border-radius: 7px; background: #f8fbff; }
        .magazines-benefits div { display: flex; align-items: center; gap: 12px; color: #1858d5; }
        .magazines-benefits svg { width: 38px; height: 38px; padding: 9px; border-radius: 50%; background: #e5efff; flex: 0 0 auto; }
        .magazines-benefits span { color: #52627e; font-size: 10px; line-height: 1.35; }
        .magazines-benefits strong { display: block; color: #1c2b50; font-size: 11px; margin-bottom: 2px; }
        @media (max-width: 900px) { .magazines-grid { grid-template-columns: repeat(2, 1fr); } .magazines-benefits { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px) { .magazines-shell { padding: 18px 16px 28px; } .magazines-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; } .magazines-benefits { grid-template-columns: 1fr; padding: 14px; gap: 14px; } }
      `}</style>
      </main>
    </>
  );
}
