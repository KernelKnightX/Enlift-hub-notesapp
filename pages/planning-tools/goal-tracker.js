import GoalTrackerPageView from "@/components/public/GoalTrackerPageView";
import { getMergedPublicPageContent } from "@/lib/firestore/publicPages";
import { defaultGoalTrackerContent } from "@/data/planning-tools/goal-tracker-content";

export default function GoalTrackerPage({ pageData }) {
  return <GoalTrackerPageView pageData={pageData} />;
}

export async function getStaticProps() {
  try {
    const pageData = await getMergedPublicPageContent("planning-goal-tracker", defaultGoalTrackerContent);
    return { props: { pageData }, revalidate: 60 };
  } catch (error) {
    console.error("Failed to load goal tracker page:", error);
    return { props: { pageData: {} }, revalidate: 60 };
  }
}
