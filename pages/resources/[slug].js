import { useRouter } from 'next/router';
import Link from 'next/link';
import SyllabusContent from '@/components/resources/SyllabusContent';

export default function ResourceDetail() {
  const router = useRouter();
  const { slug } = router.query;

  if (slug === 'syllabus') {
    return (
      <>
        <SyllabusContent />
        <div className="max-w-7xl mx-auto px-4 pb-10 md:px-8 lg:px-12">
          <Link href="/resources">← Back to resources</Link>
        </div>
      </>
    );
  }

  return (
    <main className="max-w-[900px] mx-auto p-8">
      <h1 className="h2">Resource: {slug || 'Loading...'}</h1>
      <p className="mt-3 text-muted">This is a placeholder detail page for the resource &ldquo;{slug}&rdquo;.</p>
      <div className="mt-6">
        <Link href="/resources">← Back to resources</Link>
      </div>
    </main>
  );
}
