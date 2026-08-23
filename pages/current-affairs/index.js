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
  const { data: articles, loaded } = useFirestoreCollection({
    name: 'currentAffairs',
    where: [['isActive', '==', true]],
    orderBy: ['createdAt', 'desc'],
    limit: 60,
    fallback: [],
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
    <main className="bg-white text-[#101a3d]">
      <ResourceHero
        eyebrow="Current Affairs"
        title="Daily current affairs from the Notes Cafe desk."
        description="Articles published in the admin office appear here. Nothing is mocked — if the list is empty, nothing has been published yet."
        seoTitle="UPSC Current Affairs | Notes Cafe"
        seoDescription="Read UPSC current affairs briefs published by Notes Cafe for prelims and mains preparation."
      />
      <section className="mx-auto max-w-[1160px] px-5 pb-16 pt-8 sm:px-8">
        <div className="mb-6 flex flex-wrap gap-2">
          {subjects.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setSubject(item)}
              className="rounded-full border px-3 py-1.5 text-sm"
              style={{
                borderColor: subject === item ? '#2563eb' : '#d7deea',
                background: subject === item ? '#2563eb' : '#fff',
                color: subject === item ? '#fff' : '#334155',
              }}
            >
              {item}
            </button>
          ))}
        </div>

        {loaded && filtered.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200 px-6 py-16 text-center text-sm text-slate-500">
            No current affairs have been published yet.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((article) => (
              <article key={article.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {article.imageUrl ? (
                  <img src={article.imageUrl} alt="" className="h-44 w-full object-cover" />
                ) : null}
                <div className="space-y-2 p-5">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {article.category}{article.date ? ` · ${article.date}` : ''}
                  </div>
                  <h2 className="text-lg font-semibold">{article.title}</h2>
                  <p className="text-sm leading-6 text-slate-600">{article.summary}</p>
                </div>
              </article>
            ))}
          </div>
        )}

        <p className="mt-10 text-center text-sm text-slate-500">
          Looking for monthly PDFs?{' '}
          <Link href="/study-material/standard-books" className="font-semibold text-blue-700">
            Download magazines
          </Link>
        </p>
      </section>
    </main>
  );
}
