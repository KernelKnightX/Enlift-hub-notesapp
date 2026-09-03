import StudyPlannerPageView from "@/components/public/StudyPlannerPageView";
import { getMergedPublicPageContent } from "@/lib/firestore/publicPages";
import { defaultStudyPlannerContent } from "@/data/planning-tools/study-planner-content";

export default function StudyPlannerPage({ pageData }) {
  return <StudyPlannerPageView pageData={pageData} />;
}

export async function getStaticProps() {
  try {
    const pageData = await getMergedPublicPageContent("planning-study-planner", defaultStudyPlannerContent);
    return { props: { pageData }, revalidate: 60 };
  } catch (error) {
    console.error("Failed to load study planner page:", error);
    return { props: { pageData: {} }, revalidate: 60 };
  }
}
