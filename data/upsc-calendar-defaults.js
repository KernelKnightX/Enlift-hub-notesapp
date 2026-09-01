export const UPSC_CALENDAR_PAGE_ID = "upsc-calendar";

export const defaultUpscCalendarContent = {
  slug: UPSC_CALENDAR_PAGE_ID,
  status: "published",
  seo: {
    title: "UPSC Calendar 2026: Exam Dates and Details | Notes Cafe",
    description:
      "Check the UPSC Calendar 2026 including Civil Services Prelims, Mains, IFoS, NDA, CDS and CAPF examination dates, notification dates and preparation tips.",
    keywords:
      "UPSC Calendar 2026, UPSC exam dates 2026, UPSC Prelims 2026, UPSC Mains 2026, UPSC notification 2026, UPSC exam schedule",
  },
  hero: {
    eyebrow: "Planning Tools",
    title: "UPSC Calendar 2026: Exam Dates and Details",
    description:
      "Check Civil Services Prelims, Mains, IFoS, NDA, CDS and CAPF dates, then plan syllabus, revision and mocks around them.",
  },
  meta: {
    updatedLabel: "Updated: August 2026",
    readTime: "8 min read",
  },
  tableOfContents: [
    { id: "key-events", label: "Key Events and Dates" },
    { id: "prelims-2026", label: "UPSC Prelims 2026" },
    { id: "mains-2026", label: "UPSC Mains 2026" },
    { id: "download-calendar", label: "Download Calendar" },
    { id: "preparation-tips", label: "Preparation Tips" },
    { id: "study-plan", label: "Study Plan" },
    { id: "notes-cafe", label: "Prepare with Notes Cafe" },
  ],
  intro: {
    lead:
      "Knowing the UPSC exam schedule well in advance can make your preparation much more structured. Once you know when the notification, application deadline, Prelims and Mains examinations are expected, you can plan your syllabus, revision, mock tests and answer writing accordingly.",
    paragraphs: [
      "The **UPSC Calendar 2026** provides the schedule for several major examinations conducted by the Union Public Service Commission, including the Civil Services Examination, Indian Forest Service Examination, NDA, CDS and CAPF examinations.",
      "For UPSC aspirants, the calendar is more than just a list of dates. It can help you understand how much preparation time is available at each stage and where you should focus your efforts.",
    ],
  },
  keyEvents: {
    id: "key-events",
    title: "UPSC Calendar 2026: Key Events and Dates",
    intro:
      "The UPSC Calendar includes important dates related to examination notifications, applications and examinations. The major events for 2026 are listed below.",
    events: [
      { exam: "Civil Services (Prelims) 2026", event: "Exam Date", date: "24 May 2026 (Sunday)" },
      { exam: "Civil Services (Prelims) 2026", event: "Notification Release", date: "14 January 2026" },
      { exam: "Civil Services (Prelims) 2026", event: "Last Date to Apply", date: "3 February 2026" },
      { exam: "Civil Services (Main) 2026", event: "Exam Start Date", date: "21 August 2026 (Friday)" },
      { exam: "Civil Services (Main) 2026", event: "Duration", date: "5 Days" },
      { exam: "Indian Forest Service (Prelims) 2026", event: "Details", date: "Through Civil Services (Prelims)" },
      { exam: "Indian Forest Service (Main) 2026", event: "Exam Start Date", date: "22 November 2026" },
      { exam: "NDA & CDS (I & II) 2026", event: "Examination Months", date: "April & September 2026" },
      { exam: "CAPF (Assistant Commandants) 2026", event: "Exam Date", date: "19 July 2026" },
    ],
    tipCallout:
      "**Quick tip:** Take a printout of the important dates related to your exam and paste it near your study desk, or add them to your digital calendar. It helps you stay focused, manage time better and avoid last-minute stress.",
    noteCallout:
      "**Note:** UPSC schedules can be revised. Always refer to the latest official UPSC notification for any changes in examination dates.",
  },
  prelims: {
    id: "prelims-2026",
    title: "UPSC Prelims 2026",
    subsections: [
      {
        paragraphs: [
          "The **UPSC Civil Services Preliminary Examination 2026** is scheduled for **24 May 2026**. Prelims is the screening stage and consists of two objective-type papers.",
        ],
      },
      {
        title: "General Studies Paper I",
        paragraphs: ["General Studies Paper I contains questions from areas such as:"],
        listItems: [
          "History and Indian National Movement",
          "Indian and World Geography",
          "Indian Polity and Governance",
          "Economic and Social Development",
          "Environment and Ecology",
          "General Science",
          "Current Affairs",
        ],
        closing: "The marks obtained in General Studies Paper I are considered for determining the Prelims cut-off.",
      },
      {
        title: "CSAT — General Studies Paper II",
        paragraphs: [
          "CSAT is a **qualifying paper**, and candidates need to secure at least **33% marks** to qualify. Although CSAT marks are not counted towards the Prelims merit list, failing to qualify means you cannot move forward to the Mains stage.",
          "The **Indian Forest Service Preliminary Examination** also uses the Civil Services Preliminary Examination as its screening examination.",
        ],
      },
    ],
  },
  mains: {
    id: "mains-2026",
    title: "UPSC Mains 2026",
    subsections: [
      {
        paragraphs: [
          "The **Civil Services Main Examination 2026** is scheduled to begin from **21 August 2026**. Unlike Prelims, the Mains examination is descriptive and tests a candidate's ability to understand a topic, analyse it and present a well-structured answer.",
          "The examination includes:",
        ],
        listItems: [
          "Essay Paper",
          "General Studies Paper I to IV",
          "Optional Subject Paper I and II",
        ],
        closing:
          "There is a relatively short gap between Prelims and Mains. Because of this, it is generally better to begin Mains-oriented preparation before the Prelims rather than starting everything from scratch after the Prelims result.",
      },
    ],
  },
  download: {
    id: "download-calendar",
    title: "How to Download the UPSC Calendar 2026",
    intro: "Candidates can access the official UPSC examination calendar through the [UPSC website](https://www.upsc.gov.in/).",
    steps: [
      "Visit the official [UPSC website](https://www.upsc.gov.in/).",
      "Open the **Examination** section.",
      "Look for the **Calendar** option.",
      "Find the annual calendar for **2026**.",
      "Open the official PDF to view or download it.",
    ],
    closing:
      "The official UPSC website should be treated as the primary source whenever there is a difference between a published calendar and a later examination notification.",
  },
  preparationTips: {
    id: "preparation-tips",
    title: "Tips to Align Your Preparation with the UPSC 2026 Calendar",
    intro:
      "Knowing the examination date is only the beginning. The real benefit comes from turning the calendar into a preparation plan.",
    tips: [
      {
        title: "Start Before the Notification",
        paragraphs: [
          "Don't wait for the UPSC notification before beginning serious preparation.",
          "Use the months before the examination to build your fundamentals, complete the basic syllabus and identify areas that require additional revision.",
        ],
      },
      {
        title: "Create a Realistic Timetable",
        paragraphs: ["A timetable should be practical enough to follow consistently."],
        listIntro: "Divide your preparation between:",
        list: ["New topics", "Revision", "Current affairs", "Previous Year Questions", "Mock tests", "Answer writing"],
        closing:
          "A timetable that you can follow every day is more useful than an ambitious schedule that becomes difficult to maintain.",
      },
      {
        title: "Keep CSAT in Your Plan",
        paragraphs: [
          "CSAT is qualifying, but that does not mean it should be ignored.",
          "Regular practice of comprehension, reasoning, basic numeracy and data interpretation can help you stay comfortably above the qualifying requirement.",
        ],
      },
      {
        title: "Start Mains Preparation Early",
        paragraphs: ["Prelims should remain an important priority, but Mains preparation should not be completely postponed."],
        listIntro: "Gradually include:",
        list: ["Answer writing", "Essay practice", "Optional subject preparation", "GS Mains topics", "Current affairs notes"],
        closing: "This reduces the pressure after Prelims.",
      },
      {
        title: "Use PYQs and Mock Tests",
        paragraphs: [
          "Previous Year Questions are one of the most useful resources for understanding UPSC's question pattern.",
          "As Prelims approaches, gradually increase your mock-test practice and use your scores to identify weak areas.",
        ],
        listIntro: "Use PYQs to identify:",
        list: [
          "Frequently tested areas",
          "Question trends",
          "Difficulty level",
          "Important concepts",
          "How UPSC frames questions",
        ],
      },
      {
        title: "Stay Consistent",
        paragraphs: [
          "Your preparation does not have to be perfect every day. What matters is consistency over several months.",
        ],
        listIntro: "At the end of each month, review:",
        list: [
          "Syllabus completed",
          "Revision completed",
          "PYQs attempted",
          "Mock-test performance",
          "Current affairs covered",
          "Topics that still need work",
        ],
        closing: "Then adjust your next month's plan accordingly.",
      },
    ],
  },
  studyPlan: {
    id: "study-plan",
    title: "Turn the UPSC Calendar Into Your Study Plan",
    intro:
      "The best way to use the UPSC calendar is to work backwards from the examination date. Instead of simply noting **24 May — UPSC Prelims**, break your preparation into smaller milestones.",
    beforePrelims: [
      "Complete the core syllabus",
      "Finish important PYQs",
      "Build current affairs revision",
      "Complete multiple revision cycles",
      "Increase mock-test frequency",
    ],
    afterPrelims: [
      "Shift your focus towards Mains",
      "Practise answer writing",
      "Revise GS subjects",
      "Work on Essay and Optional",
      "Analyse previous Mains questions",
    ],
    closing: "This turns the UPSC calendar from a simple list of dates into an actual preparation roadmap.",
  },
  notesCafe: {
    id: "notes-cafe",
    title: "Prepare Smarter with Notes Cafe",
    intro:
      "Notes Cafe brings important UPSC preparation resources together in one place, helping aspirants manage different stages of their preparation.",
    resourceCards: [
      { number: "01", title: "Study Material", description: "Organised notes and study resources for focused preparation." },
      { number: "02", title: "Maps & Atlas", description: "Geography and location-based resources for UPSC preparation." },
      { number: "03", title: "Government Resources", description: "Useful government-related resources collected for aspirants." },
      { number: "04", title: "Practice & Mock Tests", description: "Practice regularly and use your performance to identify areas that need improvement." },
      { number: "05", title: "Previous Year Questions", description: "Understand UPSC's question pattern through PYQs and regular practice." },
      { number: "06", title: "Planning Tools", description: "Use planning resources to organise your preparation around important examination milestones." },
    ],
    paragraphs: [
      "The goal is simple: **know what to study, know when to study it, and keep track of your progress.**",
      "Use the UPSC Calendar 2026 as your starting point, build your preparation milestones around the examination dates, and keep improving your strategy as you move closer to the exam.",
    ],
    closing: "Plan well. Study consistently. Revise smartly.",
  },
  importantNote: {
    title: "Important Note for UPSC Aspirants",
    text:
      "The dates mentioned in the annual calendar provide a useful planning reference, but UPSC may make changes to its examination schedule. Before applying for an examination or making major changes to your preparation plan, check the latest official UPSC notification.",
  },
  sidebarWidgets: [
    {
      type: "cta",
      title: "Plan Your UPSC 2026 Prep",
      description:
        "Turn exam dates into a realistic weekly routine with study planner, revision cycles and focused sessions.",
      href: "/planning-tools/study-planner",
      action: "Open Study Planner",
    },
    {
      type: "dates",
      title: "Key Exam Dates",
      items: [
        { label: "Prelims", value: "24 May 2026" },
        { label: "Notification", value: "14 Jan 2026" },
        { label: "Last Date to Apply", value: "3 Feb 2026" },
        { label: "Mains Start", value: "21 Aug 2026" },
      ],
    },
    {
      type: "links",
      title: "Planning Tools",
      items: [
        { label: "Revision Planner", href: "/planning-tools/revision-planner" },
        { label: "Study Timetable", href: "/planning-tools/study-timetable" },
        { label: "Pomodoro Timer", href: "/planning-tools/pomodoro-timer" },
        { label: "Goal Tracker", href: "/planning-tools/goal-tracker" },
      ],
    },
    {
      type: "links",
      title: "Study Resources",
      items: [
        { label: "UPSC Syllabus", href: "/study-material/upsc-syllabus" },
        { label: "NCERT Books", href: "/study-material/ncert-books" },
        { label: "Maps & Atlas", href: "/maps/upsc-maps" },
        { label: "All Planning Tools", href: "/planning-tools" },
      ],
    },
  ],
};
