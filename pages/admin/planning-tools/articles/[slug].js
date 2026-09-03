import { useRouter } from "next/router";
import PlanningContentEditor from "@/components/admin/PlanningContentEditor";
import { getPlanningArticleBySlug } from "@/lib/planning/planningPagesConfig";

export default function AdminPlanningArticlePage() {
  const router = useRouter();
  const slug = typeof router.query.slug === "string" ? router.query.slug : "";
  const page = getPlanningArticleBySlug(slug);

  if (!router.isReady) {
    return null;
  }

  if (!page || page.editorType === "goal-tracker") {
    if (typeof window !== "undefined") {
      router.replace("/admin/planning-tools");
    }
    return null;
  }

  return (
    <PlanningContentEditor
      pageId={page.pageId}
      label={page.label}
      publicPath={page.publicPath}
      getDefaults={page.getDefaults}
    />
  );
}
