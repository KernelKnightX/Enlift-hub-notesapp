import { defaultStudyPlannerContent } from "@/data/planning-tools/study-planner-content";
import { defaultStudyTimetableContent } from "@/data/planning-tools/study-timetable-content";
import { defaultRevisionPlannerContent } from "@/data/planning-tools/revision-planner-content";
import { defaultGoalTrackerContent } from "@/data/planning-tools/goal-tracker-content";
import { UPSC_CALENDAR_PAGE_ID } from "@/data/upsc-calendar-defaults";

export const PLANNING_ARTICLE_PAGES = [
  {
    slug: "study-planner",
    pageId: "planning-study-planner",
    label: "Study Planner",
    publicPath: "/planning-tools/study-planner",
    getDefaults: () => defaultStudyPlannerContent,
  },
  {
    slug: "study-timetable",
    pageId: "planning-study-timetable",
    label: "Study Timetable",
    publicPath: "/planning-tools/study-timetable",
    getDefaults: () => defaultStudyTimetableContent,
  },
  {
    slug: "revision-planner",
    pageId: "planning-revision-planner",
    label: "Revision Planner",
    publicPath: "/planning-tools/revision-planner",
    getDefaults: () => defaultRevisionPlannerContent,
  },
  {
    slug: "goal-tracker",
    pageId: "planning-goal-tracker",
    label: "Goal Tracker",
    publicPath: "/planning-tools/goal-tracker",
    getDefaults: () => defaultGoalTrackerContent,
    editorType: "goal-tracker",
  },
];

export const GENERIC_PLANNING_PAGES = [
  {
    slug: "preparation-strategy",
    pageId: "planning-preparation-strategy",
    label: "Preparation Strategy",
    publicPath: "/planning-tools/preparation-strategy",
  },
  {
    slug: "beginner-roadmap",
    pageId: "planning-beginner-roadmap",
    label: "Beginner Roadmap",
    publicPath: "/planning-tools/beginner-roadmap",
  },
];

export const PLANNING_HUB_PAGES = [
  {
    slug: UPSC_CALENDAR_PAGE_ID,
    pageId: UPSC_CALENDAR_PAGE_ID,
    label: "UPSC Calendar",
    publicPath: "/planning-tools/upsc-calendar",
    adminPath: "/admin/planning-tools/upsc-calendar",
    editorType: "upsc-calendar",
  },
  ...PLANNING_ARTICLE_PAGES.map((page) => ({
    ...page,
    adminPath:
      page.editorType === "goal-tracker"
        ? "/admin/planning-tools/goal-tracker"
        : `/admin/planning-tools/articles/${page.slug}`,
  })),
  ...GENERIC_PLANNING_PAGES.map((page) => ({
    ...page,
    adminPath: `/admin/planning-tools/generic/${page.slug}`,
    editorType: "generic",
  })),
];

export function getPlanningArticleBySlug(slug) {
  return PLANNING_ARTICLE_PAGES.find((page) => page.slug === slug) || null;
}

export function getGenericPlanningPageBySlug(slug) {
  return GENERIC_PLANNING_PAGES.find((page) => page.slug === slug) || null;
}
