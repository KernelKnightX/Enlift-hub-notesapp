import Link from 'next/link';

export default function CurrentAffairs() {
  return (
    <main className="max-w-[900px] mx-auto p-8">
      <h1 className="h2">Current Affairs (Placeholder)</h1>
      <p className="mt-3 text-muted">Placeholder for daily current affairs content and briefs.</p>
      <div className="mt-6"><Link href="/">← Back to home</Link></div>
    </main>
  );
}
