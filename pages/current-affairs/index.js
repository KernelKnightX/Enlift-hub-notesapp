import { useMemo, useState } from 'react';
import Link from 'next/link';
import ResourceHero from '@/components/public/ResourceHero';
import useFirestoreCollection from '@/hooks/shared/useFirestoreCollection';

const toArticle = (doc) => {
  const content = typeof doc.content === 'string' ? doc.content : '';
  return {
    id: doc.id,
    title: doc.title || 'Untitled',
    category: doc.category || 'General',
    date: doc.date || '',
    summary: doc.summary || doc.snippet || content.slice(0, 220),
    content,
    imageUrl: doc.imageUrl || doc.coverImage || '',
  };
};

export default function PublicCurrentAffairsPage() {
  const [subject, setSubject] = useState('All');
  const { data: articles, loaded, isLoading } = useFirestoreCollection({
    name: 'currentAffairs',
    where: [['isActive', '==', true]],
    orderBy: ['createdAt', 'desc'],
    limit: 60,
    transform: (docs) => docs.map(toArticle),
  });

  const subjects = useMemo(() => {
    const set = new Set(articles.map((item) => item.category).filter(Boolean));
    return ['All', ...Array.from(set).sort()];
  }, [articles]);

  const filtered = useMemo(() => {
    if (subject === 'All') return articles;
    return articles.filter((item) => item.category === subject);
  }, [articles, subject]);

  return (
    <main className="public-ca">
      <ResourceHero
        eyebrow="Current Affairs"
        title="Daily current affairs from the Notes Cafe desk."
        description="Articles published in the admin office appear here. If the list is empty, nothing has been published yet."
        seoTitle="UPSC Current Affairs | Notes Cafe"
        seoDescription="Read UPSC current affairs briefs published by Notes Cafe for prelims and mains preparation."
      />
      <section className="public-ca__section">
        <div className="public-ca__filters">
          {subjects.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setSubject(item)}
              className={`public-ca__pill ${subject === item ? 'is-active' : ''}`}
            >
              {item}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="public-ca__empty">Loading current affairs…</div>
        ) : loaded && filtered.length === 0 ? (
          <div className="public-ca__empty">
            No current affairs have been published yet.
          </div>
        ) : (
          <div className="public-ca__grid">
            {filtered.map((article) => (
              <article key={article.id} className="public-ca__card">
                {article.imageUrl ? (
                  <img src={article.imageUrl} alt="" className="public-ca__card-img" />
                ) : null}
                <div className="public-ca__card-body">
                  <div className="public-ca__kicker">
                    {article.category}{article.date ? ` · ${article.date}` : ''}
                  </div>
                  <h2 className="public-ca__title">{article.title}</h2>
                  <p className="public-ca__summary">{article.summary}</p>
                </div>
              </article>
            ))}
          </div>
        )}

        <p className="public-ca__footnote">
          Looking for monthly PDFs?{' '}
          <Link href="/study-material/standard-books">Download magazines</Link>
        </p>
      </section>
    </main>
  );
}
