import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ResourceHero from "@/components/public/ResourceHero";
import InlineFormattedText from "@/components/public/InlineFormattedText";
import { normalizeUpscCalendarContent } from "@/lib/upscCalendarContent";

function Paragraph({ children }) {
  return (
    <p>
      <InlineFormattedText text={children} />
    </p>
  );
}

export default function UpscCalendarPageView({ pageData }) {
  const content = normalizeUpscCalendarContent(pageData);
  const [activeSection, setActiveSection] = useState(content.tableOfContents[0]?.id || "key-events");

  useEffect(() => {
    const sections = content.tableOfContents
      .map((item) => document.getElementById(item.id))
      .filter(Boolean);

    if (!sections.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];

        if (visible?.target?.id) {
          setActiveSection(visible.target.id);
        }
      },
      {
        rootMargin: "-20% 0px -55% 0px",
        threshold: [0.1, 0.35, 0.6],
      }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [content.tableOfContents]);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSection(id);
  };

  return (
    <>
      <Head>
        <title>{content.seo.title}</title>
        <meta name="description" content={content.seo.description} />
        <meta name="keywords" content={content.seo.keywords} />
      </Head>

      <ResourceHero
        withSeo={false}
        eyebrow={content.hero.eyebrow}
        title={content.hero.title}
        description={content.hero.description}
      />

      <main className="upsc-calendar-page">
        <div className="upsc-calendar-layout">
          <aside className="upsc-calendar-toc" aria-label="Table of contents">
            <div className="upsc-calendar-toc__box">
              <p className="upsc-calendar-toc__label">Table of Contents</p>
              <ul>
                {content.tableOfContents.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={activeSection === item.id ? "is-active" : ""}
                      onClick={() => scrollToSection(item.id)}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <article className="upsc-calendar-content">
            <div className="upsc-calendar-meta">
              <span>{content.meta.updatedLabel}</span>
              <span className="upsc-calendar-meta__dot">•</span>
              <span>{content.meta.readTime}</span>
            </div>

            <header className="upsc-calendar-intro">
              <p className="lead">
                <InlineFormattedText text={content.intro.lead} />
              </p>
              {content.intro.paragraphs.map((paragraph) => (
                <Paragraph key={paragraph}>{paragraph}</Paragraph>
              ))}
            </header>

            <section id={content.keyEvents.id} className="upsc-calendar-section">
              <h2>{content.keyEvents.title}</h2>
              <Paragraph>{content.keyEvents.intro}</Paragraph>

              <div className="upsc-calendar-table-wrap">
                <table className="upsc-calendar-table">
                  <thead>
                    <tr>
                      <th>Examination</th>
                      <th>Event</th>
                      <th>Date / Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {content.keyEvents.events.map((item, index) => (
                      <tr key={`${item.exam}-${item.event}-${index}`}>
                        <td className="exam-name">{item.exam}</td>
                        <td>{item.event}</td>
                        <td className="exam-date">{item.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="upsc-calendar-callout">
                <InlineFormattedText text={content.keyEvents.tipCallout} />
              </div>
              <div className="upsc-calendar-callout upsc-calendar-callout--note">
                <InlineFormattedText text={content.keyEvents.noteCallout} />
              </div>
            </section>

            <section id={content.prelims.id} className="upsc-calendar-section">
              <h2>{content.prelims.title}</h2>
              {content.prelims.subsections.map((subsection, index) => (
                <div key={`${subsection.title || "block"}-${index}`}>
                  {subsection.title ? <h3>{subsection.title}</h3> : null}
                  {subsection.paragraphs?.map((paragraph) => (
                    <Paragraph key={paragraph}>{paragraph}</Paragraph>
                  ))}
                  {subsection.listItems?.length ? (
                    <ul>
                      {subsection.listItems.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                  {subsection.closing ? <Paragraph>{subsection.closing}</Paragraph> : null}
                </div>
              ))}
            </section>

            <section id={content.mains.id} className="upsc-calendar-section">
              <h2>{content.mains.title}</h2>
              {content.mains.subsections.map((subsection, index) => (
                <div key={`${subsection.title || "block"}-${index}`}>
                  {subsection.title ? <h3>{subsection.title}</h3> : null}
                  {subsection.paragraphs?.map((paragraph) => (
                    <Paragraph key={paragraph}>{paragraph}</Paragraph>
                  ))}
                  {subsection.listItems?.length ? (
                    <ul>
                      {subsection.listItems.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                  {subsection.closing ? <Paragraph>{subsection.closing}</Paragraph> : null}
                </div>
              ))}
            </section>

            <section id={content.download.id} className="upsc-calendar-section">
              <h2>{content.download.title}</h2>
              <Paragraph>{content.download.intro}</Paragraph>
              <p>To find the calendar:</p>
              <ol>
                {content.download.steps.map((step) => (
                  <li key={step}>
                    <InlineFormattedText text={step} />
                  </li>
                ))}
              </ol>
              <Paragraph>{content.download.closing}</Paragraph>
            </section>

            <section id={content.preparationTips.id} className="upsc-calendar-section">
              <h2>{content.preparationTips.title}</h2>
              <Paragraph>{content.preparationTips.intro}</Paragraph>
              <div className="upsc-calendar-tips">
                {content.preparationTips.tips.map((tip, index) => (
                  <div key={tip.title} className="upsc-calendar-tip">
                    <h3>
                      {index + 1}. {tip.title}
                    </h3>
                    {tip.paragraphs?.map((paragraph) => (
                      <Paragraph key={paragraph}>{paragraph}</Paragraph>
                    ))}
                    {tip.listIntro ? <Paragraph>{tip.listIntro}</Paragraph> : null}
                    {tip.list?.length ? (
                      <ul>
                        {tip.list.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    ) : null}
                    {tip.closing ? <Paragraph>{tip.closing}</Paragraph> : null}
                  </div>
                ))}
              </div>
            </section>

            <section id={content.studyPlan.id} className="upsc-calendar-section">
              <h2>{content.studyPlan.title}</h2>
              <Paragraph>{content.studyPlan.intro}</Paragraph>
              <div className="upsc-calendar-plan-grid">
                <div className="upsc-calendar-plan-box">
                  <h3>Before Prelims</h3>
                  <ul>
                    {content.studyPlan.beforePrelims.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="upsc-calendar-plan-box">
                  <h3>After Prelims</h3>
                  <ul>
                    {content.studyPlan.afterPrelims.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <Paragraph>{content.studyPlan.closing}</Paragraph>
            </section>

            <section id={content.notesCafe.id} className="upsc-calendar-section">
              <h2>{content.notesCafe.title}</h2>
              <Paragraph>{content.notesCafe.intro}</Paragraph>
              <div className="upsc-calendar-resource-grid">
                {content.notesCafe.resourceCards.map((card) => (
                  <div key={card.number} className="upsc-calendar-resource-card">
                    <span>{card.number}</span>
                    <h3>{card.title}</h3>
                    <p>{card.description}</p>
                  </div>
                ))}
              </div>
              {content.notesCafe.paragraphs.map((paragraph) => (
                <Paragraph key={paragraph}>{paragraph}</Paragraph>
              ))}
              <p className="upsc-calendar-closing">{content.notesCafe.closing}</p>
            </section>

            <div className="upsc-calendar-important">
              <strong>{content.importantNote.title}</strong>
              <p>{content.importantNote.text}</p>
            </div>
          </article>

          <aside className="upsc-calendar-sidebar" aria-label="Related resources">
            {content.sidebarWidgets.map((widget) => {
              if (widget.type === "cta") {
                return (
                  <div key={widget.title} className="upsc-calendar-widget upsc-calendar-widget--cta">
                    <h3>{widget.title}</h3>
                    <p>{widget.description}</p>
                    <Link href={widget.href} className="upsc-calendar-widget__button">
                      {widget.action}
                      <ArrowRight size={15} strokeWidth={2} />
                    </Link>
                  </div>
                );
              }

              if (widget.type === "dates") {
                return (
                  <div key={widget.title} className="upsc-calendar-widget">
                    <h3>{widget.title}</h3>
                    <ul className="upsc-calendar-widget__dates">
                      {widget.items.map((item) => (
                        <li key={item.label}>
                          <span>{item.label}</span>
                          <strong>{item.value}</strong>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              }

              return (
                <div key={widget.title} className="upsc-calendar-widget">
                  <h3>{widget.title}</h3>
                  <ul className="upsc-calendar-widget__links">
                    {widget.items.map((item) => (
                      <li key={item.href}>
                        <Link href={item.href}>{item.label}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </aside>
        </div>
      </main>
    </>
  );
}
