import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ResourceHero from "@/components/public/ResourceHero";
import InlineFormattedText from "@/components/public/InlineFormattedText";
import { defaultRevisionPlannerContent } from "@/data/planning-tools/revision-planner-content";

function Paragraph({ children }) {
  return (
    <p>
      <InlineFormattedText text={children} />
    </p>
  );
}

function ContentTable({ headers, rows }) {
  return (
    <div className="upsc-calendar-table-wrap">
      <table className="upsc-calendar-table">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className={cellIndex === 0 ? "exam-name" : ""}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Sidebar({ widgets }) {
  return (
    <aside className="upsc-calendar-sidebar" aria-label="Related resources">
      {widgets.map((widget) => {
        if (widget.type === "cta") {
          return (
            <div key={widget.title} className="upsc-calendar-widget upsc-calendar-widget--cta">
              <h3>{widget.title}</h3>
              <p>{widget.description}</p>
              <Link href={widget.href} className="upsc-calendar-widget__button">
                {widget.action}
                <ArrowRight size={15} strokeWidth={2} />
              </Link>
              {widget.secondaryHref ? (
                <Link
                  href={widget.secondaryHref}
                  className="upsc-calendar-widget__button upsc-calendar-widget__button--secondary"
                  style={{ marginTop: 10 }}
                >
                  {widget.secondaryAction}
                </Link>
              ) : null}
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
  );
}

export default function RevisionPlannerPageView({ pageData }) {
  const content = { ...defaultRevisionPlannerContent, ...pageData };
  const [activeSection, setActiveSection] = useState(
    content.tableOfContents[0]?.id || "understanding-upsc"
  );

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

  const { understandingUpsc, monthByMonth, studyTechniques, finalPush } = content;

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
              <blockquote className="upsc-calendar-quote">
                <p>{content.intro.quote}</p>
                <cite>{content.intro.quoteAttribution}</cite>
              </blockquote>
              <p className="lead">
                <InlineFormattedText text={content.intro.lead} />
              </p>
              {content.intro.paragraphs.map((paragraph) => (
                <Paragraph key={paragraph}>{paragraph}</Paragraph>
              ))}
            </header>

            <section id={understandingUpsc.id} className="upsc-calendar-section">
              <h2>{understandingUpsc.title}</h2>
              <Paragraph>{understandingUpsc.intro}</Paragraph>
              <ul>
                {understandingUpsc.stages.map((stage) => (
                  <li key={stage}>{stage}</li>
                ))}
              </ul>
              <Paragraph>{understandingUpsc.closing}</Paragraph>

              <h3>{understandingUpsc.prelims.title}</h3>
              <Paragraph>{understandingUpsc.prelims.intro}</Paragraph>
              {understandingUpsc.prelims.papers.map((paper) => (
                <div key={paper.label} className="upsc-calendar-callout">
                  <strong>{paper.label}:</strong> {paper.description}
                </div>
              ))}
              <ul>
                {understandingUpsc.prelims.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>

              <h3>{understandingUpsc.mains.title}</h3>
              <Paragraph>{understandingUpsc.mains.intro}</Paragraph>
              <ContentTable
                headers={understandingUpsc.mains.table.headers}
                rows={understandingUpsc.mains.table.rows}
              />
              <ul>
                {understandingUpsc.mains.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>

              <h3>{understandingUpsc.interview.title}</h3>
              {understandingUpsc.interview.paragraphs.map((paragraph) => (
                <Paragraph key={paragraph}>{paragraph}</Paragraph>
              ))}

              <Paragraph>{understandingUpsc.sectionClosing}</Paragraph>
            </section>

            <section id={monthByMonth.id} className="upsc-calendar-section">
              <h2>{monthByMonth.title}</h2>
              <Paragraph>{monthByMonth.intro}</Paragraph>
              <Paragraph>{monthByMonth.introClosing}</Paragraph>

              {monthByMonth.phases.map((phase) => (
                <div key={phase.title} className="upsc-calendar-phase">
                  <h3>{phase.title}</h3>
                  <Paragraph>{phase.intro}</Paragraph>
                  <p className="upsc-calendar-phase__label">{phase.focusTitle}</p>
                  <ul>
                    {phase.focusItems.map((item) => (
                      <li key={item}>
                        <InlineFormattedText text={item} />
                      </li>
                    ))}
                  </ul>

                  {phase.resourcesTable ? (
                    <>
                      <p>To effectively cover your study syllabus, consider the following key sources:</p>
                      <ContentTable
                        headers={phase.resourcesTable.headers}
                        rows={phase.resourcesTable.rows}
                      />
                    </>
                  ) : null}

                  {phase.timetableTable ? (
                    <>
                      <p>
                        {phase.title.includes("Months 1")
                          ? "Here's an ideal timetable that you can follow to cover the syllabus extensively in the first two months of your 6 months UPSC preparation plan:"
                          : "Follow this sample daily study schedule (Months 5–6) for the last tuning of your preparation:"}
                      </p>
                      <ContentTable
                        headers={phase.timetableTable.headers}
                        rows={phase.timetableTable.rows}
                      />
                    </>
                  ) : null}

                  {phase.weeklyTable ? (
                    <>
                      <p>
                        Go through this recommended weekly study plan for the third and fourth months to cover the general studies syllabus in detail:
                      </p>
                      <ContentTable
                        headers={phase.weeklyTable.headers}
                        rows={phase.weeklyTable.rows}
                      />
                    </>
                  ) : null}

                  {phase.booksTable ? (
                    <>
                      <p>
                        Do not overburden yourself with every bulky resource available in the market. Take note of this recommended list of reference books useful for covering the Mains syllabus for each paper:
                      </p>
                      <ContentTable
                        headers={phase.booksTable.headers}
                        rows={phase.booksTable.rows}
                      />
                    </>
                  ) : null}

                  {phase.tip ? (
                    <div className="upsc-calendar-callout upsc-calendar-callout--note">
                      <InlineFormattedText text={phase.tip} />
                    </div>
                  ) : null}

                  {phase.alsoRead ? (
                    <p>
                      <InlineFormattedText text={phase.alsoRead} />
                    </p>
                  ) : null}

                  {phase.closing ? <Paragraph>{phase.closing}</Paragraph> : null}
                </div>
              ))}
            </section>

            <section id={studyTechniques.id} className="upsc-calendar-section">
              <h2>{studyTechniques.title}</h2>
              <Paragraph>{studyTechniques.intro}</Paragraph>
              <Paragraph>{studyTechniques.introClosing}</Paragraph>
              <div className="upsc-calendar-tips">
                {studyTechniques.techniques.map((technique) => (
                  <div key={technique.title} className="upsc-calendar-tip">
                    <h3>{technique.title}</h3>
                    <Paragraph>{technique.body}</Paragraph>
                  </div>
                ))}
              </div>
              <Paragraph>{studyTechniques.closing}</Paragraph>
            </section>

            <section id={finalPush.id} className="upsc-calendar-section">
              <h2>{finalPush.title}</h2>
              <Paragraph>{finalPush.intro}</Paragraph>
              {finalPush.sections.map((subsection) => (
                <div key={subsection.title}>
                  <h3>{subsection.title}</h3>
                  <ul>
                    {subsection.listItems.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
              <Paragraph>{finalPush.closing}</Paragraph>
            </section>

            <section id={content.conclusion.id} className="upsc-calendar-section">
              <h2>{content.conclusion.title}</h2>
              {content.conclusion.paragraphs.map((paragraph) => (
                <Paragraph key={paragraph}>{paragraph}</Paragraph>
              ))}
            </section>
          </article>

          <Sidebar widgets={content.sidebarWidgets} />
        </div>
      </main>
    </>
  );
}
