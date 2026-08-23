import Link from 'next/link';

const ITEMS = ['Syllabus','Books','Important Reports','Government Schemes','Polity','History','Geography','Economy','Environment','Science & Technology','International Relations','Ethics','Security','Agriculture','Art & Culture'];

export default function ResourcesIndex() {
  return (
    <main className="max-w-[900px] mx-auto p-8">
      <h1 className="h2">Resources (Placeholder)</h1>
      <p className="mt-3 text-muted">A simple index of resources. Click an item to see a placeholder detail page.</p>
      <ul className="mt-4 list-disc pl-6">
        {ITEMS.map(i => (
          <li key={i} className="py-1">
            <Link href={`/resources/${i.toLowerCase().replace(/\s+/g,'-')}`}>{i}</Link>
          </li>
        ))}
      </ul>
      <div className="mt-6">
        <Link href="/">← Back to home</Link>
      </div>
    </main>
  );
}
