import Link from 'next/link';

export default function Courses() {
  return (
    <main className="max-w-[900px] mx-auto p-8">
      <h1 className="h2">Courses (Placeholder)</h1>
      <p className="mt-4 text-muted">This is a placeholder page for Courses. Replace with real content later.</p>
      <div className="mt-6">
        <Link href="/">← Back to home</Link>
      </div>
    </main>
  );
}
