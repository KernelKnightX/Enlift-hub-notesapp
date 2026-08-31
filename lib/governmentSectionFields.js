import { GOV_SECTIONS } from "@/lib/firestore/government";

const UPSC_FACT = { key: "upscFact", label: "UPSC fact", type: "textarea", rows: 4 };

export const GOV_SECTION_ADMIN = {
  schemes: {
    label: "Scheme",
    fields: [
      { key: "ministry", label: "Ministry", type: "text" },
      { key: "launchYear", label: "Launch Year", type: "text" },
      { key: "objective", label: "Objective", type: "textarea", rows: 3 },
      { key: "benefits", label: "Benefits", type: "textarea", rows: 3 },
      UPSC_FACT,
    ],
  },
  "constitution-articles": {
    label: "Constitution Article",
    fields: [
      { key: "articleNumber", label: "Article Number", type: "text" },
      { key: "part", label: "Part", type: "text" },
      { key: "provision", label: "Provision", type: "textarea", rows: 3 },
      { key: "explanation", label: "Explanation", type: "textarea", rows: 4 },
      { key: "relatedArticles", label: "Related Articles", type: "text", fullWidth: true },
      { key: "importantPoints", label: "Important Points", type: "textarea", rows: 3, fullWidth: true },
      UPSC_FACT,
    ],
  },
  "important-acts": {
    label: "Important Act",
    fields: [
      { key: "year", label: "Year", type: "text" },
      { key: "objective", label: "Objective", type: "textarea", rows: 3 },
      { key: "ministry", label: "Ministry", type: "text" },
      { key: "keyProvisions", label: "Key Provisions", type: "textarea", rows: 3, fullWidth: true },
      { key: "significance", label: "Significance", type: "textarea", rows: 3 },
      { key: "amendments", label: "Amendments", type: "text" },
      UPSC_FACT,
    ],
  },
  committees: {
    label: "Committee",
    fields: [
      { key: "chairperson", label: "Chairperson", type: "text" },
      { key: "year", label: "Year", type: "text" },
      { key: "mandate", label: "Mandate", type: "textarea", rows: 3 },
      { key: "report", label: "Report", type: "text" },
      { key: "recommendations", label: "Recommendations", type: "textarea", rows: 3, fullWidth: true },
      { key: "significance", label: "Significance", type: "textarea", rows: 3 },
      UPSC_FACT,
    ],
  },
  ministries: {
    label: "Ministry",
    fields: [
      { key: "minister", label: "Minister", type: "text" },
      { key: "department", label: "Department", type: "text" },
      { key: "mandate", label: "Mandate", type: "textarea", rows: 3 },
      { key: "schemes", label: "Schemes", type: "textarea", rows: 3 },
      { key: "functions", label: "Functions", type: "textarea", rows: 3 },
      UPSC_FACT,
    ],
  },
  "reports-and-indices": {
    label: "Report / Index",
    fields: [
      { key: "publisher", label: "Publisher", type: "text" },
      { key: "releaseYear", label: "Release Year", type: "text" },
      { key: "scope", label: "Scope", type: "textarea", rows: 3 },
      { key: "highlights", label: "Highlights", type: "textarea", rows: 3, fullWidth: true },
      UPSC_FACT,
    ],
  },
  "constitutional-bodies": {
    label: "Constitutional Body",
    fields: [
      { key: "establishedYear", label: "Established Year", type: "text" },
      { key: "mandate", label: "Mandate", type: "textarea", rows: 3 },
      { key: "articles", label: "Related Articles", type: "text", fullWidth: true },
      { key: "composition", label: "Composition", type: "textarea", rows: 3 },
      UPSC_FACT,
    ],
  },
  policies: {
    label: "Policy",
    fields: [
      { key: "ministry", label: "Ministry", type: "text" },
      { key: "year", label: "Year", type: "text" },
      { key: "objective", label: "Objective", type: "textarea", rows: 3 },
      { key: "keyFeatures", label: "Key Features", type: "textarea", rows: 3, fullWidth: true },
      UPSC_FACT,
    ],
  },
  "international-organizations": {
    label: "International Organization",
    fields: [
      { key: "headquarters", label: "Headquarters", type: "text" },
      { key: "foundedYear", label: "Founded Year", type: "text" },
      { key: "members", label: "Members", type: "text", fullWidth: true },
      { key: "mandate", label: "Mandate", type: "textarea", rows: 3 },
      UPSC_FACT,
    ],
  },
};

export const getGovSectionAdmin = (section) => GOV_SECTION_ADMIN[section] || null;

export function buildGovPayload(section, values, user, media = {}) {
  const payload = {
    title: values.title.trim(),
    slug: values.slug,
    section,
    status: values.status,
    region: values.region?.trim() || undefined,
    summary: values.summary?.trim() || undefined,
    authorId: user?.uid || "",
    authorName: user?.displayName || user?.email || "Admin",
    imageUrl: media.imageUrl || undefined,
    thumbnailUrl: media.imageUrl || undefined,
    pdfUrl: media.pdfUrl || undefined,
  };

  const config = GOV_SECTION_ADMIN[section];
  if (config) {
    config.fields.forEach((field) => {
      const raw = values[field.key];
      if (raw === undefined || raw === null || raw === "") return;
      payload[field.key] = String(raw).trim();
    });
  }

  Object.keys(payload).forEach((key) => {
    if (payload[key] === undefined) delete payload[key];
  });

  return payload;
}

const CSV_EXAMPLES = {
  schemes: `title,slug,status,section,ministry,launchYear,objective,benefits,summary,upscFact
PM-KISAN,pm-kisan,published,schemes,Ministry of Agriculture,2019,Income support to farmers,Direct cash transfer,Central sector scheme for small farmers,Important for agriculture and welfare questions`,
  "constitution-articles": `title,slug,status,section,articleNumber,part,provision,explanation,relatedArticles,importantPoints,summary,upscFact
Article 21,article-21,published,constitution-articles,21,III,Protection of life and personal liberty,Right to life includes dignity and privacy,"14, 19","Due process, privacy",Fundamental right to life and liberty,Most frequently tested fundamental right`,
  "important-acts": `title,slug,status,section,year,objective,ministry,keyProvisions,significance,amendments,summary,upscFact
RTI Act 2005,rti-act-2005,published,important-acts,2005,Transparency in governance,DoPT,"Right to information, appeals",Landmark transparency law,Amended in 2019,Right to Information Act,Important for polity and governance`,
  committees: `title,slug,status,section,chairperson,year,mandate,report,recommendations,significance,summary,upscFact
Finance Commission,finance-commission,published,committees,President of India,1951,Recommend distribution of tax revenues,Finance Commission Reports,"Vertical and horizontal devolution",Constitutional body under Article 280,Finance Commission recommendations,Important for federal finance questions`,
  ministries: `title,slug,status,section,minister,department,mandate,schemes,functions,summary,upscFact
Ministry of Finance,ministry-of-finance,published,ministries,Union Finance Minister,Department of Economic Affairs,Economic policy and public finance,"Budget, GST reforms",Fiscal policy and taxation,Union finance ministry profile,Key for budget and economy topics`,
  "reports-and-indices": `title,slug,status,section,publisher,releaseYear,scope,highlights,summary,upscFact
Human Development Index,human-development-index,published,reports-and-indices,UNDP,1990,Global human development ranking,"Health, education, income",UNDP's composite development index,Important for international relations and economy`,
  "constitutional-bodies": `title,slug,status,section,establishedYear,mandate,articles,composition,summary,upscFact
Election Commission,election-commission,published,constitutional-bodies,1950,Conduct free and fair elections,"324, 325","Chief Election Commissioner and Commissioners",Independent election body,Important for polity questions`,
  policies: `title,slug,status,section,ministry,year,objective,keyFeatures,summary,upscFact
National Education Policy 2020,national-education-policy-2020,published,policies,Ministry of Education,2020,Transform education system,"5+3+3+4 structure, multidisciplinary",Major education reform policy,Important for social sector questions`,
  "international-organizations": `title,slug,status,section,headquarters,foundedYear,members,mandate,summary,upscFact
United Nations,united-nations,published,international-organizations,New York,1945,193 member states,Maintain international peace and security,Premier global intergovernmental organization,Important for IR and current affairs`,
};

export function getGovImportConfig(section) {
  const admin = GOV_SECTION_ADMIN[section];
  if (!admin) {
    return {
      label: "Optional fields",
      columns: ["region", "summary", "upscFact"],
      example: CSV_EXAMPLES.schemes,
    };
  }

  return {
    label: `${admin.label} fields`,
    columns: ["region", "summary", ...admin.fields.map((field) => field.key)],
    example: CSV_EXAMPLES[section] || CSV_EXAMPLES.schemes,
  };
}

export function buildGovDocFromImportRow(row) {
  const doc = {
    title: row.title,
    slug: row.slug,
    section: row.section,
    status: row.status,
  };

  if (row.region) doc.region = row.region;
  if (row.summary) doc.summary = row.summary;

  const config = GOV_SECTION_ADMIN[row.section];
  if (!config) return doc;

  config.fields.forEach((field) => {
    const value = row[field.key];
    if (value) doc[field.key] = String(value).trim();
  });

  return doc;
}

export const GOV_IMPORT_ALIASES = [
  ["region", ["region", "Region"]],
  ["summary", ["summary", "Summary", "description", "Description"]],
  ["upscFact", ["upscFact", "upscfact", "upsc fact", "fact"]],
  ["ministry", ["ministry", "Ministry"]],
  ["launchYear", ["launchYear", "launch year", "year launched"]],
  ["objective", ["objective", "Objective"]],
  ["benefits", ["benefits", "Benefits"]],
  ["articleNumber", ["articleNumber", "article number", "article"]],
  ["part", ["part", "Part"]],
  ["provision", ["provision", "Provision"]],
  ["explanation", ["explanation", "Explanation"]],
  ["relatedArticles", ["relatedArticles", "related articles"]],
  ["importantPoints", ["importantPoints", "important points"]],
  ["year", ["year", "Year"]],
  ["keyProvisions", ["keyProvisions", "key provisions"]],
  ["significance", ["significance", "Significance"]],
  ["amendments", ["amendments", "Amendments"]],
  ["chairperson", ["chairperson", "Chairperson"]],
  ["mandate", ["mandate", "Mandate"]],
  ["report", ["report", "Report"]],
  ["recommendations", ["recommendations", "Recommendations"]],
  ["minister", ["minister", "Minister"]],
  ["department", ["department", "Department"]],
  ["schemes", ["schemes", "Schemes"]],
  ["functions", ["functions", "Functions"]],
  ["publisher", ["publisher", "Publisher"]],
  ["releaseYear", ["releaseYear", "release year"]],
  ["scope", ["scope", "Scope"]],
  ["highlights", ["highlights", "Highlights"]],
  ["establishedYear", ["establishedYear", "established year"]],
  ["articles", ["articles", "Articles", "related articles"]],
  ["composition", ["composition", "Composition"]],
  ["keyFeatures", ["keyFeatures", "key features"]],
  ["headquarters", ["headquarters", "Headquarters"]],
  ["foundedYear", ["foundedYear", "founded year"]],
  ["members", ["members", "Members"]],
];

export const GOV_SECTION_VALUES = GOV_SECTIONS.map((item) => item.value);
