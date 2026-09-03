import RevisionPlannerPageView from "@/components/public/RevisionPlannerPageView";
import { getMergedPublicPageContent } from "@/lib/firestore/publicPages";
import { defaultRevisionPlannerContent } from "@/data/planning-tools/revision-planner-content";

export default function RevisionPlannerPage({ pageData }) {
  return <RevisionPlannerPageView pageData={pageData} />;
}

export async function getStaticProps() {
  try {
    const pageData = await getMergedPublicPageContent("planning-revision-planner", defaultRevisionPlannerContent);
    return { props: { pageData }, revalidate: 60 };
  } catch (error) {
    console.error("Failed to load revision planner page:", error);
    return { props: { pageData: {} }, revalidate: 60 };
  }
}
