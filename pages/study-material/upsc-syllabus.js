import UpscSyllabusPageView from "@/components/public/UpscSyllabusPageView";
import { getUpscSyllabusPageContent } from "@/lib/firestore/publicPages";

export default function SyllabusPage({ pageData }) {
  return <UpscSyllabusPageView pageData={pageData} />;
}

export async function getStaticProps() {
  try {
    const pageData = await getUpscSyllabusPageContent();
    return { props: { pageData }, revalidate: 60 };
  } catch (error) {
    console.error("Failed to load UPSC syllabus page:", error);
    return { props: { pageData: {} }, revalidate: 60 };
  }
}
