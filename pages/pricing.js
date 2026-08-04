import Link from 'next/link';

export default function Pricing() {
  return (
    <main className="max-w-[900px] mx-auto p-8">
      <h1 className="h2">Pricing (Placeholder)</h1>
      <p className="mt-3 text-muted">Placeholder for subscription plans and pricing details.</p>
      <div className="mt-6"><Link href="/">← Back to home</Link></div>
    </main>
  );
}
