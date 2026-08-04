import Link from 'next/link';

export default function Practice() {
  return (
    <main className="max-w-[900px] mx-auto p-8">
      <h1 className="h2">Practice (Placeholder)</h1>
      <p className="mt-3 text-muted">Placeholder for practice tests and quizzes.</p>
      <div className="mt-6"><Link href="/">← Back to home</Link></div>
    </main>
  );
}
