import UpscCalendarPageView from "@/components/public/UpscCalendarPageView";
import { getUpscCalendarPageContent } from "@/lib/firestore/publicPages";

export default function UPSCCalendar({ pageData }) {
  return <UpscCalendarPageView pageData={pageData} />;
}

export async function getStaticProps() {
  try {
    const pageData = await getUpscCalendarPageContent();
    return {
      props: { pageData },
      revalidate: 60,
    };
  } catch (error) {
    console.error("Failed to load UPSC calendar page:", error);
    return {
      props: { pageData: {} },
      revalidate: 60,
    };
  }
}
