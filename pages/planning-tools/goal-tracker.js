import Head from "next/head";
import Link from "next/link";
import ResourceHero from "@/components/public/ResourceHero";
import PlanningSignupBanner from "@/components/planning-tools/PlanningSignupBanner";

export default function GoalTrackerPage() {
  return (
    <>
      <Head>
        <title>How to Track UPSC Goals Without Burning Out | Notes Cafe</title>
        <meta
          name="description"
          content="A practical guide to setting and tracking UPSC preparation goals — syllabus milestones, mock targets, and weekly reviews — without turning progress into pressure."
        />
      </Head>

      <ResourceHero
        withSeo={false}
        eyebrow="Planning Tools"
        title="How to track UPSC goals without burning out"
        description="Goal tracking is not about ticking endless boxes. It is about knowing what you are working toward, seeing real movement, and adjusting before small gaps become big problems."
      />

      <article className="goal-blog">
        <div className="goal-blog__container">
          <p className="goal-blog__intro">
            The UPSC journey runs for years, not weeks. Without some form of goal tracking, it is easy to drift — reading widely but finishing nothing, or feeling busy without knowing if you are actually closer to the exam. This guide explains how to set meaningful goals, review them calmly, and connect them to your daily planner and timetable.
          </p>

          <PlanningSignupBanner
            title="Track goals inside Student Desk"
            description="When you sign up, your study planner, timetable, and progress live in one place — so goals are tied to what you actually do each week."
            buttonLabel="Create free account"
          />

          <section>
            <h2>Why goal tracking matters for UPSC</h2>
            <p>
              Preparation is long and uneven. Some months feel productive; others feel stuck. Goals give you reference points — not to judge yourself harshly, but to answer simple questions: Did I cover what I planned? Am I behind on optional? When did I last attempt a full mock?
            </p>
            <p>
              The best goal systems for UPSC are lightweight. They should take five minutes to update and ten minutes to review on Sunday — not become another source of guilt.
            </p>
          </section>

          <section>
            <h2>Three layers of goals that work</h2>
            <p>Think in three time horizons. Each layer supports the one below it.</p>
            <ol>
              <li>
                <strong>Exam anchor</strong> — Your target attempt year and prelims date (use the{" "}
                <Link href="/planning-tools/upsc-calendar">UPSC calendar</Link> as the fixed reference).
              </li>
              <li>
                <strong>Monthly milestones</strong> — Finish one GS book section, complete 4 mocks, cover 60% of optional once through, etc.
              </li>
              <li>
                <strong>Weekly targets</strong> — Concrete tasks in your{" "}
                <Link href="/planning-tools/study-planner">study planner</Link>: chapters, PYQ sets, answer-writing days.
              </li>
            </ol>
            <div className="goal-blog__callout">
              <p>
                <strong>Rule of thumb:</strong> If you cannot explain your current weekly goal in one sentence, it is probably too vague. “Study Polity” is vague. “Finish Laxmikanth Ch. 12–15 and 40 MCQs” is trackable.
              </p>
            </div>
          </section>

          <section>
            <h2>What to track (and what to ignore)</h2>
            <p>Track outcomes you control and that move the syllabus forward:</p>
            <ul>
              <li>Syllabus units completed (with revision pass noted separately)</li>
              <li>Mock tests attempted and score trend — not just the latest number</li>
              <li>Answer-writing sessions per week (Mains aspirants)</li>
              <li>Current affairs backlog — days since last consolidated notes</li>
              <li>Weak areas identified from mocks — linked to next week’s planner tasks</li>
            </ul>
            <p>
              Avoid tracking vanity metrics: hours logged without quality, number of books “started,” or social media study hours. Hours matter only when they map to finished work.
            </p>
          </section>

          <section>
            <h2>The Sunday review habit</h2>
            <p>
              Once a week, spend 10–15 minutes on a fixed review. Ask four questions:
            </p>
            <ol>
              <li>What did I finish that I planned?</li>
              <li>What slipped — and was the plan unrealistic or execution weak?</li>
              <li>What did mocks or PYQs reveal about weak topics?</li>
              <li>What are the top 3 priorities for next week?</li>
            </ol>
            <p>
              Write the answers briefly. Carry the top 3 priorities into your planner for Monday. This closes the loop between ambition and daily action.
            </p>
          </section>

          <section>
            <h2>Monthly milestones without overwhelm</h2>
            <p>
              At the start of each month, pick at most three milestones. Example for a Prelims-focused month:
            </p>
            <ul>
              <li>Complete Environment + Ecology one full read + revision</li>
              <li>Attempt 3 sectional mocks (Polity, Economy, Environment)</li>
              <li>Maintain daily CA notes with zero backlog on Sundays</li>
            </ul>
            <p>
              At month end, score each milestone: done, partial, or missed. Partial is useful data — it often means the milestone was too large and should be split next month.
            </p>
          </section>

          <section>
            <h2>Connect goals to your daily routine</h2>
            <p>
              Goals fail when they float above your day. Tie weekly targets to a{" "}
              <Link href="/planning-tools/study-timetable">daily timetable</Link> so you know when Polity, optional, and revision actually happen. Use the{" "}
              <Link href="/planning-tools/pomodoro-timer">Pomodoro timer</Link> for focused blocks on hard topics identified in your review.
            </p>
            <p>
              Working professionals should set fewer weekly goals than full-time aspirants — but review more honestly. A smaller plan you complete beats a heroic plan you abandon by Wednesday.
            </p>
          </section>

          <section>
            <h2>When you fall behind</h2>
            <p>
              Falling behind is normal. The mistake is silently doubling next week’s load. Instead: cut one milestone, extend one timeline, or drop a non-essential task. Replan explicitly rather than carrying invisible debt.
            </p>
            <div className="goal-blog__callout">
              <p>
                Repeaters often benefit from fewer goals and deeper revision. One clear monthly goal — e.g. “second pass of entire GS with mock-driven weak-area fixes” — beats a fresh exhaustive list that mirrors a first attempt.
              </p>
            </div>
          </section>

          <section>
            <h2>Start this week</h2>
            <p>
              Pick one exam anchor date, three weekly tasks, and one Sunday review slot. Put the weekly tasks in the sample{" "}
              <Link href="/planning-tools/study-planner">study planner</Link> or your Student Desk planner after signup. After four Sundays, you will have more useful data about your real pace than months of unstructured reading.
            </p>
          </section>

          <div className="goal-blog__related">
            <h3>Related tools</h3>
            <div className="goal-blog__related-links">
              <Link href="/planning-tools/study-planner">Study planner</Link>
              <Link href="/planning-tools/study-timetable">Study timetable</Link>
              <Link href="/planning-tools/upsc-calendar">UPSC calendar</Link>
              <Link href="/planning-tools/pomodoro-timer">Pomodoro timer</Link>
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
