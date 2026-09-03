import Head from "next/head";
import ResourceHero from "@/components/public/ResourceHero";
import { defaultUpscSyllabusContent } from "@/data/study-material/upsc-syllabus-defaults";

function PaperCard({ paper }) {
  return (
    <div
      id={paper.id}
      className="rounded-2xl border border-black/5 bg-white shadow-sm overflow-hidden scroll-mt-24"
    >
      <div className="px-6 py-5 border-b border-black/5">
        <h3 className="font-serif text-lg text-[#1E1B4B]">{paper.title}</h3>
        <p className="mt-1 text-sm text-neutral-500">
          {paper.marks} <span className="mx-1.5">•</span> Duration: {paper.duration}
        </p>
      </div>

      <div className="px-6 py-5">
        {paper.note ? (
          <p className="mb-4 text-xs font-mono uppercase tracking-wide text-[#FF6B5B] bg-[#FF6B5B]/10 inline-block px-2.5 py-1 rounded-full">
            {paper.note}
          </p>
        ) : null}
        <ol className="space-y-3">
          {paper.topics.map((topic, index) => (
            <li key={topic} className="flex gap-3">
              <span className="shrink-0 grid place-items-center h-6 w-6 rounded-full bg-[#4F46E5] text-white text-xs font-mono mt-0.5">
                {index + 1}
              </span>
              <span className="text-sm leading-relaxed text-neutral-700">{topic}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export default function UpscSyllabusPageView({ pageData }) {
  const content = { ...defaultUpscSyllabusContent, ...pageData };

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const pdfEnabled = content.pdfDownload?.enabled && content.pdfDownload?.url;

  return (
    <div className="min-h-screen bg-[#FAFAF7] font-sans">
      <Head>
        <title>{content.seo.title}</title>
        <meta name="description" content={content.seo.description} />
      </Head>

      <ResourceHero
        title={content.hero.title}
        description={content.hero.description}
        eyebrow={content.hero.eyebrow}
        seoTitle={content.seo.title}
        seoDescription={content.seo.description}
      />

      <div className="w-[90%] mx-auto py-8 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-10">
        <aside className="hidden md:block">
          <div className="sticky top-6 space-y-6">
            <div>
              <p className="text-xs font-mono uppercase tracking-wide text-neutral-400 mb-3">
                On this page
              </p>
              <p className="text-sm font-semibold text-[#1E1B4B] mb-2">
                Preliminary Examination
              </p>
              <ul className="space-y-1.5 text-sm text-neutral-500 mb-5">
                {content.prelimPapers.map((paper) => (
                  <li key={paper.id}>
                    <button onClick={() => scrollTo(paper.id)} className="hover:text-[#4F46E5] text-left">
                      {paper.title}
                    </button>
                  </li>
                ))}
              </ul>

              <p className="text-sm font-semibold text-[#1E1B4B] mb-2">Main Examination</p>
              <ul className="space-y-1.5 text-sm text-neutral-500">
                {content.mainPapers.map((paper) => (
                  <li key={paper.id}>
                    <button onClick={() => scrollTo(paper.id)} className="hover:text-[#4F46E5] text-left">
                      {paper.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {pdfEnabled ? (
              <a
                href={content.pdfDownload.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-3 rounded-xl border border-black/5 bg-white px-4 py-3 text-left"
              >
                <span className="text-lg">⬇</span>
                <span>
                  <span className="block text-sm font-semibold text-[#1E1B4B]">
                    {content.pdfDownload.label}
                  </span>
                </span>
              </a>
            ) : (
              <button
                disabled
                title={content.pdfDownload?.hint || "Coming soon"}
                className="w-full flex items-center gap-3 rounded-xl border border-black/5 bg-white px-4 py-3 text-left opacity-60 cursor-not-allowed"
              >
                <span className="text-lg">⬇</span>
                <span>
                  <span className="block text-sm font-semibold text-[#1E1B4B]">
                    {content.pdfDownload?.label || "Download Complete Syllabus (PDF)"}
                  </span>
                  <span className="block text-xs text-neutral-400">
                    {content.pdfDownload?.hint || "Coming soon"}
                  </span>
                </span>
              </button>
            )}
          </div>
        </aside>

        <main className="space-y-16">
          <section>
            <h2 className="font-serif text-2xl text-[#1E1B4B] mb-1">Preliminary Examination</h2>
            <p className="text-sm text-neutral-500 mb-6">{content.prelimIntro}</p>
            <div className="space-y-5">
              {content.prelimPapers.map((paper) => (
                <PaperCard key={paper.id} paper={paper} />
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-[#1E1B4B] mb-1">Main Examination</h2>
            <p className="text-sm text-neutral-500 mb-6">{content.mainIntro}</p>
            <div className="space-y-5">
              {content.mainPapers.map((paper) => (
                <PaperCard key={paper.id} paper={paper} />
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
