import Link from 'next/link';

export default function Contact() {
  return (
    <main className="max-w-[900px] mx-auto p-8">
      <h1 className="h2">Contact (Placeholder)</h1>
      <p className="mt-3 text-muted">Placeholder for contact form and support details.</p>
      <div className="mt-6"><Link href="/">← Back to home</Link></div>
    </main>
  );
}
