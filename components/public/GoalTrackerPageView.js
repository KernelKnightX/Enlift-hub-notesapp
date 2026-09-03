import Head from "next/head";
import Link from "next/link";
import ResourceHero from "@/components/public/ResourceHero";
import PlanningSignupBanner from "@/components/planning-tools/PlanningSignupBanner";
import InlineFormattedText from "@/components/public/InlineFormattedText";
import { defaultGoalTrackerContent } from "@/data/planning-tools/goal-tracker-content";

function Block({ block }) {
  if (block.type === "paragraph") {
    return (
      <p>
        <InlineFormattedText text={block.text} />
      </p>
    );
  }

  if (block.type === "ordered-list") {
    return (
      <ol>
        {block.items.map((item) => (
          <li key={item}>
            <InlineFormattedText text={item} />
          </li>
        ))}
      </ol>
    );
  }

  if (block.type === "unordered-list") {
    return (
      <ul>
        {block.items.map((item) => (
          <li key={item}>
            <InlineFormattedText text={item} />
          </li>
        ))}
      </ul>
    );
  }

  if (block.type === "callout") {
    return (
      <div className="goal-blog__callout">
        <p>
          <InlineFormattedText text={block.text} />
        </p>
      </div>
    );
  }

  return null;
}

export default function GoalTrackerPageView({ pageData }) {
  const content = { ...defaultGoalTrackerContent, ...pageData };

  return (
    <>
      <Head>
        <title>{content.seo.title}</title>
        <meta name="description" content={content.seo.description} />
      </Head>

      <ResourceHero
        withSeo={false}
        eyebrow={content.hero.eyebrow}
        title={content.hero.title}
        description={content.hero.description}
      />

      <article className="goal-blog">
        <div className="goal-blog__container">
          <p className="goal-blog__intro">{content.intro}</p>

          <PlanningSignupBanner
            title={content.signupBanner.title}
            description={content.signupBanner.description}
            buttonLabel={content.signupBanner.buttonLabel}
          />

          {content.sections.map((section) => (
            <section key={section.title}>
              <h2>{section.title}</h2>
              {section.blocks.map((block, index) => (
                <Block key={`${section.title}-${index}`} block={block} />
              ))}
            </section>
          ))}

          <div className="goal-blog__related">
            <h3>Related tools</h3>
            <div className="goal-blog__related-links">
              {content.relatedLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
