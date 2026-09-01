export const defaultStudyPlannerContent = {
  seo: {
    title: "UPSC Study Planner: Weekly Plan Guide | Notes Cafe",
    description:
      "Learn how to build a weekly UPSC study planner — subject rotation, revision slots, mocks, and Sunday reviews. Sample plan included.",
    keywords:
      "UPSC study planner, weekly study plan IAS, UPSC preparation planner, study schedule UPSC, weekly revision plan",
  },
  hero: {
    eyebrow: "Planning Tools",
    title: "How to build a UPSC study planner that actually works",
    description:
      "A weekly study planner turns your syllabus into concrete tasks. Learn how to plan each week, balance subjects, and review progress without overwhelm.",
  },
  meta: {
    updatedLabel: "Updated: September 2026",
    readTime: "10 min read",
  },
  tableOfContents: [
    { id: "why-planner", label: "Why a weekly planner" },
    { id: "how-to-plan", label: "How to plan your week" },
    { id: "sample-week", label: "Sample weekly plan" },
    { id: "subject-balance", label: "Balancing subjects" },
    { id: "revision-mocks", label: "Revision & mocks" },
    { id: "sunday-review", label: "Sunday review" },
    { id: "conclusion", label: "Conclusion" },
    { id: "faqs", label: "FAQs" },
  ],
  intro: {
    lead:
      "Most aspirants know what they should study — Polity, History, Economy, optional, current affairs — but struggle to translate that into a week they can actually finish. A **UPSC study planner** bridges that gap: it is your weekly contract with yourself.",
    paragraphs: [
      "Unlike a daily timetable (which answers *when* you study), a weekly planner answers *what* you will finish this week and how those tasks connect to Prelims, Mains, or foundation-stage goals.",
      "This guide explains how to plan a realistic week, includes a sample schedule for a Prelims-focused aspirant, and shows how to connect your planner to the [study timetable](/planning-tools/study-timetable) and [UPSC calendar](/planning-tools/upsc-calendar).",
    ],
  },
  whyPlanner: {
    id: "why-planner",
    title: "Why a weekly study planner matters",
    intro:
      "Daily motivation fluctuates. A weekly plan keeps you oriented when energy dips mid-week or when one subject starts eating all your time.",
    points: [
      {
        title: "Turns the syllabus into actions",
        body: "“Cover Polity” is vague. “Finish Laxmikanth Ch. 12–15 and 40 MCQs by Thursday” is a planner task you can check off and measure.",
      },
      {
        title: "Prevents lopsided preparation",
        body: "Without a weekly view, it is easy to spend five days on your favourite subject while optional and CA fall behind. The planner forces balance across GS, optional, practice, and revision.",
      },
      {
        title: "Makes revision non-negotiable",
        body: "Revision should appear on the planner every week — not as a vague intention but as scheduled tasks: “Revise Monday’s History notes,” “CA week review on Friday.”",
      },
      {
        title: "Connects mocks to weak areas",
        body: "After each mock, add analysis tasks to next week’s plan. The planner becomes a feedback loop instead of a static to-do list.",
      },
      {
        title: "Supports long preparation timelines",
        body: "UPSC prep runs for months or years. Weekly planning breaks that into manageable cycles you can review and adjust every Sunday.",
      },
    ],
  },
  howToPlan: {
    id: "how-to-plan",
    title: "How to plan your week in 15 minutes",
    intro:
      "Set aside Sunday evening or Monday morning for planning. Fifteen focused minutes beats an hour of vague worrying.",
    steps: [
      {
        title: "1. Check exam stage and calendar",
        paragraphs: [
          "Are you in foundation, Prelims-focused, or Mains mode? Cross-check key dates on the [UPSC calendar](/planning-tools/upsc-calendar) so your week aligns with how many months remain.",
        ],
      },
      {
        title: "2. List 3–5 weekly priorities",
        paragraphs: [
          "Pick at most five outcomes for the week — e.g. finish one Environment unit, attempt one sectional mock, maintain daily CA with zero Sunday backlog.",
        ],
        listItems: [
          "One new syllabus chunk (GS or optional)",
          "One revision block for last week’s topics",
          "One practice session (MCQs or answer writing)",
          "Current affairs coverage for the week",
          "One mock or PYQ set (if in Prelims phase)",
        ],
      },
      {
        title: "3. Assign tasks to days",
        paragraphs: [
          "Spread tasks across the week using your [daily timetable](/planning-tools/study-timetable). Hard topics go on high-energy days; lighter revision on tired evenings.",
        ],
      },
      {
        title: "4. Keep daily tasks countable",
        paragraphs: [
          "Each day should have **5–7 tasks maximum**. Overloading the list makes you ignore the planner entirely. If a task is too big, split it across two days.",
        ],
      },
    ],
    callout:
      "**Tip:** Plan the week, then trust the plan. Mid-week changes are fine for genuine emergencies — but avoid reshuffling every day out of discomfort with hard subjects.",
  },
  sampleWeek: {
    id: "sample-week",
    title: "Sample weekly study plan (Prelims focus)",
    intro:
      "Below is a realistic week for someone preparing for Prelims with a mix of GS, optional, CA, and practice. Adjust subjects to your stage and weak areas.",
    table: {
      headers: ["Day", "Focus tasks"],
      rows: [
        [
          "Monday",
          "Polity — Fundamental Rights (new reading) • Newspaper + CA notes • 25 Polity MCQs",
        ],
        [
          "Tuesday",
          "Modern History — Congress sessions • Optional — 20 pages • Revise Monday Polity notes",
        ],
        [
          "Wednesday",
          "Geography — monsoon & rainfall • Map work — rivers of India • CSAT comprehension set",
        ],
        [
          "Thursday",
          "Economy — Budget basics • Answer writing — 2 GS questions (Mains-oriented)",
        ],
        [
          "Friday",
          "Environment — biodiversity • Weekly CA revision • 30 mixed PYQs",
        ],
        [
          "Saturday",
          "Full Prelims mock (timed) • Mock analysis + mistake notebook",
        ],
        [
          "Sunday",
          "Light revision — weak topics from the week • Plan next week in planner",
        ],
      ],
    },
    closing:
      "This is a reference structure — not a rulebook. Working professionals might compress weekday tasks and expand Saturday–Sunday blocks.",
  },
  subjectBalance: {
    id: "subject-balance",
    title: "Balancing subjects across the week",
    intro:
      "A common mistake is planning seven days of new reading with zero revision. Use this rough split as a starting point.",
    table: {
      headers: ["Area", "Suggested weekly share", "Example tasks"],
      rows: [
        ["GS static (new topics)", "40–50%", "2–3 chapters or units across subjects"],
        ["Optional subject", "15–20%", "3–4 focused sessions"],
        ["Current affairs", "10–15%", "Daily notes + Friday week review"],
        ["Revision", "15–20%", "Daily 30 min + Sunday block"],
        ["Practice / mocks", "10–15%", "MCQs, PYQs, or one sectional mock"],
      ],
    },
    paragraphs: [
      "During the last three months before Prelims, shift weight toward practice and revision. During Mains preparation, add more answer-writing slots to the weekly plan.",
    ],
  },
  revisionMocks: {
    id: "revision-mocks",
    title: "Scheduling revision and mock tests",
    intro:
      "Revision and mocks should be on the planner from the beginning — not crammed in the final month.",
    tips: [
      {
        title: "Space revision across the week",
        body: "Revise yesterday’s topic for 30–60 minutes daily. Use Sunday for a broader weekly sweep of weak areas identified during the week.",
      },
      {
        title: "One mock per week minimum (Prelims phase)",
        body: "Schedule mocks on Saturday when possible. **Always** block time for analysis — listing mistakes and adding revision tasks to next week’s plan.",
      },
      {
        title: "PYQs before random MCQ banks",
        body: "Previous year questions show how UPSC frames topics. Add “15 PYQs — Polity” as a planner task rather than vague “practice Polity.”",
      },
      {
        title: "Mains aspirants: answer writing on the planner",
        body: "Two questions twice a week is a strong start. Increase frequency as Mains approaches.",
      },
    ],
  },
  sundayReview: {
    id: "sunday-review",
    title: "The Sunday review ritual",
    intro:
      "Ten to fifteen minutes every Sunday keeps your planner honest and prevents silent backlog.",
    listItems: [
      "What did I finish that I planned?",
      "What slipped — unrealistic plan or weak execution?",
      "What did mocks or PYQs reveal about weak topics?",
      "What are my top 3 priorities for next week?",
    ],
    closing:
      "Write brief answers, then build next week’s planner around the top 3 priorities. See the [goal tracking guide](/planning-tools/goal-tracker) for connecting weekly tasks to monthly milestones.",
  },
  conclusion: {
    id: "conclusion",
    title: "Conclusion",
    paragraphs: [
      "A UPSC study planner works when it is realistic, reviewed weekly, and tied to your exam stage. Start with the sample week above, adapt it to your timetable, and refine every Sunday.",
      "When you are ready to save a personal planner, sync tasks across devices, and use AI to replan around mock results, log in to Student Desk and open your study planner dashboard.",
    ],
  },
  faqs: {
    id: "faqs",
    title: "FAQs — UPSC study planner",
    items: [
      {
        q: "How many tasks should I plan per day?",
        a: "Aim for 5–7 countable tasks. Fewer is fine on busy workdays; more than seven often leads to an ignored list.",
      },
      {
        q: "Should I plan every day on Sunday or plan one day at a time?",
        a: "Plan the full week on Sunday (or Monday morning). Daily tweaks are fine, but weekly planning gives you balance across subjects.",
      },
      {
        q: "What if I miss half my tasks?",
        a: "Do not double next week’s load. Carry only the most important missed items forward and cut something else to make room.",
      },
      {
        q: "How is a study planner different from a timetable?",
        a: "The timetable is hour-by-hour (when you study). The planner is task-by-task (what you finish this week). Use both together.",
      },
      {
        q: "Can I use this as a working professional?",
        a: "Yes. Plan fewer weekday tasks and heavier weekend blocks. Consistency over three months beats a heroic week you cannot repeat.",
      },
    ],
  },
  sidebarWidgets: [
    {
      type: "cta",
      title: "Make your own study planner",
      description:
        "Log in to Student Desk to save a personal weekly planner, sync tasks across devices, and use AI replanning based on your mocks and weak areas.",
      action: "Log in",
      href: "/login",
      secondaryAction: "Sign up free",
      secondaryHref: "/register",
    },
    {
      type: "links",
      title: "Planning tools",
      items: [
        { label: "Study timetable", href: "/planning-tools/study-timetable" },
        { label: "UPSC calendar 2026", href: "/planning-tools/upsc-calendar" },
        { label: "Goal tracking guide", href: "/planning-tools/goal-tracker" },
        { label: "Pomodoro timer", href: "/planning-tools/pomodoro-timer" },
      ],
    },
    {
      type: "dates",
      title: "Weekly planning",
      items: [
        { label: "Tasks per day", value: "5–7 max" },
        { label: "Plan on", value: "Sunday PM" },
        { label: "Review on", value: "Sunday PM" },
        { label: "Mock day", value: "Saturday" },
      ],
    },
  ],
};
