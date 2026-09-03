import StudyTimetablePageView from "@/components/public/StudyTimetablePageView";
import { getMergedPublicPageContent } from "@/lib/firestore/publicPages";
import { defaultStudyTimetableContent } from "@/data/planning-tools/study-timetable-content";

export default function StudyTimetablePage({ pageData }) {
  return <StudyTimetablePageView pageData={pageData} />;
}

export async function getStaticProps() {
  try {
    const pageData = await getMergedPublicPageContent("planning-study-timetable", defaultStudyTimetableContent);
    return { props: { pageData }, revalidate: 60 };
  } catch (error) {
    console.error("Failed to load study timetable page:", error);
    return { props: { pageData: {} }, revalidate: 60 };
  }
}
