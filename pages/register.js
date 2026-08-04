import Link from 'next/link';

export default function Register() {
  return (
    <main className="max-w-[520px] mx-auto p-8">
      <h1 className="h2">Register (Placeholder)</h1>
      <p className="mt-3 text-muted">Use the signup form in `components/login/EmailSignup.js` when wiring this route fully.</p>
      <div className="mt-6"><Link href="/">← Back to home</Link></div>
    </main>
  );
}
