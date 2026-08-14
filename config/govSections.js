// config/govSections.js
// Single source of truth for the 6 Government sections.
// Drives: admin nav cards, generic CRUD form fields, Firestore collection names,
// and public listing/detail pages via the [section] dynamic route.

export const govSections = {
  schemes: {
    label: 'Government Schemes',
    singular: 'Scheme',
    collection: 'schemes',
    hasImage: true,
    description: 'Flagship central & state welfare schemes relevant for UPSC.',
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'ministry', label: 'Ministry', type: 'text' },
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'launchYear', label: 'Launch Year', type: 'text' },
      { key: 'eligibility', label: 'Eligibility', type: 'textarea' },
      { key: 'benefits', label: 'Benefits', type: 'textarea' },
      { key: 'description', label: 'Description', type: 'textarea', required: true },
      { key: 'officialLink', label: 'Official Link', type: 'text' },
    ],
  },

  ministries: {
    label: 'Ministries & Departments',
    singular: 'Ministry',
    collection: 'ministries',
    hasImage: false,
    description: 'Union ministries, current ministers, and key departments.',
    fields: [
      { key: 'title', label: 'Ministry Name', type: 'text', required: true },
      { key: 'currentMinister', label: 'Current Minister', type: 'text' },
      { key: 'departments', label: 'Departments (comma separated)', type: 'textarea' },
      { key: 'establishedYear', label: 'Established Year', type: 'text' },
      { key: 'keySchemes', label: 'Key Schemes (comma separated)', type: 'textarea' },
      { key: 'description', label: 'Description', type: 'textarea', required: true },
    ],
  },

  'acts-laws': {
    label: 'Acts & Laws',
    singular: 'Act',
    collection: 'actsLaws',
    hasImage: false,
    description: 'Important Acts, their provisions, and amendments.',
    fields: [
      { key: 'title', label: 'Act Title', type: 'text', required: true },
      { key: 'yearEnacted', label: 'Year Enacted', type: 'text' },
      { key: 'ministry', label: 'Ministry', type: 'text' },
      { key: 'keyProvisions', label: 'Key Provisions', type: 'textarea' },
      { key: 'amendments', label: 'Amendments (comma separated)', type: 'textarea' },
      { key: 'summary', label: 'Summary', type: 'textarea', required: true },
    ],
  },

  'union-state-govt': {
    label: 'Union & State Government',
    singular: 'Topic',
    collection: 'unionStateGovt',
    hasImage: false,
    description: 'President, Governor, PM, CM, Council of Ministers, and related topics.',
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'topic', label: 'Topic (President / Governor / PM / CM etc.)', type: 'text' },
      { key: 'articles', label: 'Related Articles (comma separated)', type: 'text' },
      { key: 'keyPoints', label: 'Key Points', type: 'textarea' },
      { key: 'explanation', label: 'Explanation', type: 'textarea', required: true },
    ],
  },

  'parliament-judiciary-elections': {
    label: 'Parliament, Judiciary & Elections',
    singular: 'Topic',
    collection: 'parliamentJudiciaryElections',
    hasImage: false,
    description: 'Lok Sabha, Rajya Sabha, Judiciary, Election Commission, and related topics.',
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'category', label: 'Category (Parliament / Judiciary / Elections)', type: 'text' },
      { key: 'articles', label: 'Related Articles (comma separated)', type: 'text' },
      { key: 'caseLaws', label: 'Case Laws (comma separated)', type: 'textarea' },
      { key: 'keyPoints', label: 'Key Points', type: 'textarea' },
      { key: 'explanation', label: 'Explanation', type: 'textarea', required: true },
    ],
  },

  'fundamental-rights-dpsp': {
    label: 'Fundamental Rights, DPSP & Duties',
    singular: 'Article',
    collection: 'fundamentalRightsDPSP',
    hasImage: false,
    description: 'Articles 12–51: Fundamental Rights, Directive Principles, and Duties.',
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'articleNumber', label: 'Article Number', type: 'text' },
      { key: 'category', label: 'Category (FR / DPSP / Duty)', type: 'text' },
      { key: 'judgments', label: 'Landmark Judgments (comma separated)', type: 'textarea' },
      { key: 'relatedArticles', label: 'Related Articles (comma separated)', type: 'text' },
      { key: 'upscQuestions', label: 'UPSC Relevance / Sample Questions', type: 'textarea' },
      { key: 'explanation', label: 'Explanation', type: 'textarea', required: true },
    ],
  },
};

export const govSectionOrder = [
  'schemes',
  'ministries',
  'acts-laws',
  'union-state-govt',
  'parliament-judiciary-elections',
  'fundamental-rights-dpsp',
];

export function getGovSection(section) {
  return govSections[section] || null;
}