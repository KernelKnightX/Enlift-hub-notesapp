export const defaultGoalTrackerContent = {
  slug: "planning-goal-tracker",
  status: "published",
  seo: {
    title: "How to Track UPSC Goals Without Burning Out | Notes Cafe",
    description:
      "A practical guide to setting and tracking UPSC preparation goals — syllabus milestones, mock targets, and weekly reviews — without turning progress into pressure.",
  },
  hero: {
    eyebrow: "Planning Tools",
    title: "How to track UPSC goals without burning out",
    description:
      "Goal tracking is not about ticking endless boxes. It is about knowing what you are working toward, seeing real movement, and adjusting before small gaps become big problems.",
  },
  intro:
    "The UPSC journey runs for years, not weeks. Without some form of goal tracking, it is easy to drift — reading widely but finishing nothing, or feeling busy without knowing if you are actually closer to the exam. This guide explains how to set meaningful goals, review them calmly, and connect them to your daily planner and timetable.",
  signupBanner: {
    title: "Track goals inside Student Desk",
    description:
      "When you sign up, your study planner, timetable, and progress live in one place — so goals are tied to what you actually do each week.",
    buttonLabel: "Create free account",
  },
  sections: [
    {
      title: "Why goal tracking matters for UPSC",
      blocks: [
        {
          type: "paragraph",
          text: "Preparation is long and uneven. Some months feel productive; others feel stuck. Goals give you reference points — not to judge yourself harshly, but to answer simple questions: Did I cover what I planned? Am I behind on optional? When did I last attempt a full mock?",
        },
        {
          type: "paragraph",
          text: "The best goal systems for UPSC are lightweight. They should take five minutes to update and ten minutes to review on Sunday — not become another source of guilt.",
        },
      ],
    },
    {
      title: "Three layers of goals that work",
      blocks: [
        { type: "paragraph", text: "Think in three time horizons. Each layer supports the one below it." },
        {
          type: "ordered-list",
          items: [
            "**Exam anchor** — Your target attempt year and prelims date (use the [UPSC calendar](/planning-tools/upsc-calendar) as the fixed reference).",
            "**Monthly milestones** — Finish one GS book section, complete 4 mocks, cover 60% of optional once through, etc.",
            "**Weekly targets** — Concrete tasks in your [study planner](/planning-tools/study-planner): chapters, PYQ sets, answer-writing days.",
          ],
        },
        {
          type: "callout",
          text: "**Rule of thumb:** If you cannot explain your current weekly goal in one sentence, it is probably too vague. “Study Polity” is vague. “Finish Laxmikanth Ch. 12–15 and 40 MCQs” is trackable.",
        },
      ],
    },
    {
      title: "What to track (and what to ignore)",
      blocks: [
        { type: "paragraph", text: "Track outcomes you control and that move the syllabus forward:" },
        {
          type: "unordered-list",
          items: [
            "Syllabus units completed (with revision pass noted separately)",
            "Mock tests attempted and score trend — not just the latest number",
            "Answer-writing sessions per week (Mains aspirants)",
            "Current affairs backlog — days since last consolidated notes",
            "Weak areas identified from mocks — linked to next week’s planner tasks",
          ],
        },
        {
          type: "paragraph",
          text: "Avoid tracking vanity metrics: hours logged without quality, number of books “started,” or social media study hours. Hours matter only when they map to finished work.",
        },
      ],
    },
    {
      title: "The Sunday review habit",
      blocks: [
        {
          type: "paragraph",
          text: "Once a week, spend 10–15 minutes on a fixed review. Ask four questions:",
        },
        {
          type: "ordered-list",
          items: [
            "What did I finish that I planned?",
            "What slipped — and was the plan unrealistic or execution weak?",
            "What did mocks or PYQs reveal about weak topics?",
            "What are the top 3 priorities for next week?",
          ],
        },
        {
          type: "paragraph",
          text: "Write the answers briefly. Carry the top 3 priorities into your planner for Monday. This closes the loop between ambition and daily action.",
        },
      ],
    },
    {
      title: "Monthly milestones without overwhelm",
      blocks: [
        {
          type: "paragraph",
          text: "At the start of each month, pick at most three milestones. Example for a Prelims-focused month:",
        },
        {
          type: "unordered-list",
          items: [
            "Complete Environment + Ecology one full read + revision",
            "Attempt 3 sectional mocks (Polity, Economy, Environment)",
            "Maintain daily CA notes with zero backlog on Sundays",
          ],
        },
        {
          type: "paragraph",
          text: "At month end, score each milestone: done, partial, or missed. Partial is useful data — it often means the milestone was too large and should be split next month.",
        },
      ],
    },
    {
      title: "Connect goals to your daily routine",
      blocks: [
        {
          type: "paragraph",
          text: "Goals fail when they float above your day. Tie weekly targets to a [daily timetable](/planning-tools/study-timetable) so you know when Polity, optional, and revision actually happen. Use the [Pomodoro timer](/planning-tools/pomodoro-timer) for focused blocks on hard topics identified in your review.",
        },
        {
          type: "paragraph",
          text: "Working professionals should set fewer weekly goals than full-time aspirants — but review more honestly. A smaller plan you complete beats a heroic plan you abandon by Wednesday.",
        },
      ],
    },
    {
      title: "When you fall behind",
      blocks: [
        {
          type: "paragraph",
          text: "Falling behind is normal. The mistake is silently doubling next week’s load. Instead: cut one milestone, extend one timeline, or drop a non-essential task. Replan explicitly rather than carrying invisible debt.",
        },
        {
          type: "callout",
          text: "Repeaters often benefit from fewer goals and deeper revision. One clear monthly goal — e.g. “second pass of entire GS with mock-driven weak-area fixes” — beats a fresh exhaustive list that mirrors a first attempt.",
        },
      ],
    },
    {
      title: "Start this week",
      blocks: [
        {
          type: "paragraph",
          text: "Pick one exam anchor date, three weekly tasks, and one Sunday review slot. Put the weekly tasks in the sample [study planner](/planning-tools/study-planner) or your Student Desk planner after signup. After four Sundays, you will have more useful data about your real pace than months of unstructured reading.",
        },
      ],
    },
  ],
  relatedLinks: [
    { label: "Study planner", href: "/planning-tools/study-planner" },
    { label: "Study timetable", href: "/planning-tools/study-timetable" },
    { label: "UPSC calendar", href: "/planning-tools/upsc-calendar" },
    { label: "Pomodoro timer", href: "/planning-tools/pomodoro-timer" },
  ],
};
