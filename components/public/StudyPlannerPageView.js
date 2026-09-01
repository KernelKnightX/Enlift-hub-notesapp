import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ResourceHero from "@/components/public/ResourceHero";
import InlineFormattedText from "@/components/public/InlineFormattedText";
import { defaultStudyPlannerContent } from "@/data/planning-tools/study-planner-content";

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

export default function StudyPlannerPageView({ pageData }) {
  const content = { ...defaultStudyPlannerContent, ...pageData };
  const [activeSection, setActiveSection] = useState(
    content.tableOfContents[0]?.id || "why-planner"
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

            <section id={content.whyPlanner.id} className="upsc-calendar-section">
              <h2>{content.whyPlanner.title}</h2>
              <Paragraph>{content.whyPlanner.intro}</Paragraph>
              <div className="upsc-calendar-tips">
                {content.whyPlanner.points.map((point, index) => (
                  <div key={point.title} className="upsc-calendar-tip">
                    <h3>
                      {index + 1}. {point.title}
                    </h3>
                    <Paragraph>{point.body}</Paragraph>
                  </div>
                ))}
              </div>
            </section>

            <section id={content.howToPlan.id} className="upsc-calendar-section">
              <h2>{content.howToPlan.title}</h2>
              <Paragraph>{content.howToPlan.intro}</Paragraph>
              {content.howToPlan.steps.map((step) => (
                <div key={step.title}>
                  <h3>{step.title}</h3>
                  {step.paragraphs?.map((paragraph) => (
                    <Paragraph key={paragraph}>{paragraph}</Paragraph>
                  ))}
                  {step.listItems?.length ? (
                    <ul>
                      {step.listItems.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}
              <div className="upsc-calendar-callout upsc-calendar-callout--note">
                <InlineFormattedText text={content.howToPlan.callout} />
              </div>
            </section>

            <section id={content.sampleWeek.id} className="upsc-calendar-section">
              <h2>{content.sampleWeek.title}</h2>
              <Paragraph>{content.sampleWeek.intro}</Paragraph>
              <ContentTable
                headers={content.sampleWeek.table.headers}
                rows={content.sampleWeek.table.rows}
              />
              <Paragraph>{content.sampleWeek.closing}</Paragraph>
            </section>

            <section id={content.subjectBalance.id} className="upsc-calendar-section">
              <h2>{content.subjectBalance.title}</h2>
              <Paragraph>{content.subjectBalance.intro}</Paragraph>
              <ContentTable
                headers={content.subjectBalance.table.headers}
                rows={content.subjectBalance.table.rows}
              />
              {content.subjectBalance.paragraphs.map((paragraph) => (
                <Paragraph key={paragraph}>{paragraph}</Paragraph>
              ))}
            </section>

            <section id={content.revisionMocks.id} className="upsc-calendar-section">
              <h2>{content.revisionMocks.title}</h2>
              <Paragraph>{content.revisionMocks.intro}</Paragraph>
              <div className="upsc-calendar-tips">
                {content.revisionMocks.tips.map((tip, index) => (
                  <div key={tip.title} className="upsc-calendar-tip">
                    <h3>
                      {index + 1}. {tip.title}
                    </h3>
                    <Paragraph>{tip.body}</Paragraph>
                  </div>
                ))}
              </div>
            </section>

            <section id={content.sundayReview.id} className="upsc-calendar-section">
              <h2>{content.sundayReview.title}</h2>
              <Paragraph>{content.sundayReview.intro}</Paragraph>
              <ul>
                {content.sundayReview.listItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Paragraph>{content.sundayReview.closing}</Paragraph>
            </section>

            <section id={content.conclusion.id} className="upsc-calendar-section">
              <h2>{content.conclusion.title}</h2>
              {content.conclusion.paragraphs.map((paragraph) => (
                <Paragraph key={paragraph}>{paragraph}</Paragraph>
              ))}
            </section>

            <section id={content.faqs.id} className="upsc-calendar-section">
              <h2>{content.faqs.title}</h2>
              <div className="upsc-calendar-tips">
                {content.faqs.items.map((item) => (
                  <div key={item.q} className="upsc-calendar-tip">
                    <h3>{item.q}</h3>
                    <Paragraph>{item.a}</Paragraph>
                  </div>
                ))}
              </div>
            </section>
          </article>

          <Sidebar widgets={content.sidebarWidgets} />
        </div>
      </main>
    </>
  );
}
