import Link from 'next/link';

export default function Blog() {
  return (
    <main className="max-w-[900px] mx-auto p-8">
      <h1 className="h2">Blog (Placeholder)</h1>
      <p className="mt-3 text-muted">Placeholder for blog listings and articles.</p>
      <div className="mt-6"><Link href="/">← Back to home</Link></div>
    </main>
  );
}
