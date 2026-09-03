export const UPSC_SYLLABUS_PAGE_ID = "upsc-syllabus";

export const defaultUpscSyllabusContent = {
  slug: UPSC_SYLLABUS_PAGE_ID,
  status: "published",
  hero: {
    title: "UPSC Civil Services Examination",
    description: "Complete syllabus for Preliminary and Main Examination.",
    eyebrow: "Notes Cafe · Reference",
  },
  seo: {
    title: "UPSC Syllabus | Notes Cafe",
    description:
      "Explore the complete UPSC Civil Services Examination syllabus for Preliminary and Main Examination.",
  },
  prelimIntro:
    "The Preliminary Examination consists of two compulsory objective-type papers.",
  mainIntro:
    "The Main Examination consists of nine written papers, of which two (language papers) are qualifying, followed by a Personality Test (Interview) worth 275 marks.",
  pdfDownload: {
    enabled: false,
    label: "Download Complete Syllabus (PDF)",
    hint: "Coming soon",
    url: "",
  },
  prelimPapers: [
    {
      id: "gs1",
      title: "General Studies Paper I",
      marks: "200 Marks",
      duration: "2 Hours",
      topics: [
        "Current events of national and international importance",
        "History of India and Indian National Movement",
        "Indian and World Geography — Physical, Social, Economic Geography of India and the World",
        "Indian Polity and Governance — Constitution, Political System, Panchayati Raj, Public Policy, Rights Issues, etc.",
        "Economic and Social Development — Sustainable Development, Poverty, Inclusion, Demographics, Social Sector Initiatives, etc.",
        "General issues on Environmental Ecology, Biodiversity and Climate Change — that do not require subject specialization",
        "General Science",
      ],
    },
    {
      id: "gs2",
      title: "General Studies Paper II (CSAT)",
      marks: "200 Marks",
      duration: "2 Hours",
      note: "Qualifying — minimum 33% required. Not counted for merit ranking.",
      topics: [
        "Comprehension",
        "Interpersonal skills including communication skills",
        "Logical reasoning and analytical ability",
        "Decision-making and problem-solving",
        "General mental ability",
        "Basic numeracy (numbers, orders of magnitude, etc.) — Class X level",
        "Data interpretation (charts, graphs, tables, data sufficiency) — Class X level",
      ],
    },
  ],
  mainPapers: [
    {
      id: "essay",
      title: "Essay Paper",
      marks: "250 Marks",
      duration: "3 Hours",
      topics: [
        "Two essays to be written, one from each of two sections, on multiple topics",
        "Tests the candidate's ability to present ideas clearly, coherently, and concisely",
      ],
    },
    {
      id: "gs1m",
      title: "General Studies Paper I",
      marks: "250 Marks",
      duration: "3 Hours",
      topics: ["Indian Heritage and Culture", "History and Geography of the World and Society"],
    },
    {
      id: "gs2m",
      title: "General Studies Paper II",
      marks: "250 Marks",
      duration: "3 Hours",
      topics: ["Governance, Constitution, Polity", "Social Justice and International Relations"],
    },
    {
      id: "gs3m",
      title: "General Studies Paper III",
      marks: "250 Marks",
      duration: "3 Hours",
      topics: [
        "Technology, Economic Development, Biodiversity",
        "Environment, Security and Disaster Management",
      ],
    },
    {
      id: "gs4m",
      title: "General Studies Paper IV",
      marks: "250 Marks",
      duration: "3 Hours",
      topics: ["Ethics, Integrity and Aptitude"],
    },
    {
      id: "indianlang",
      title: "Indian Language (Qualifying)",
      marks: "300 Marks",
      duration: "3 Hours",
      note: "Qualifying — does not count toward merit ranking.",
      topics: ["Comprehension, precis writing, translation, and essay in the chosen Indian language"],
    },
    {
      id: "english",
      title: "English Language (Qualifying)",
      marks: "300 Marks",
      duration: "3 Hours",
      note: "Qualifying — does not count toward merit ranking.",
      topics: ["Comprehension, precis writing, translation, and essay in English"],
    },
    {
      id: "optional",
      title: "Optional Subject",
      marks: "500 Marks",
      duration: "3 Hours each",
      topics: ["Paper I — 250 Marks", "Paper II — 250 Marks", "Chosen from the UPSC optional subjects list"],
    },
  ],
};
