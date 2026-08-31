import AdminLayout from "@/layouts/AdminLayout";
import CategoryMapForm from "@/components/admin/CategoryMapForm";
import useAdminGate from "@/hooks/admin/useAdminGate";
import { getMapCategoryAdmin, getMapCategoryListPath } from "@/lib/mapCategoryFields";
import { useRouter } from "next/router";

export default function NewCategoryMapPage() {
  const { user, loading, isAdmin } = useAdminGate();
  const router = useRouter();
  const category = router.query.category || "india-states";
  const config = getMapCategoryAdmin(category);
  const listPath = getMapCategoryListPath(category);

  if (loading) return null;
  if (!isAdmin) return null;

  if (router.isReady && !config) {
    return (
      <AdminLayout title="Maps" subtitle="Unknown category">
        <div className="card p-12 text-center">Unknown map category</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={`Add ${config?.label || "Map"}`}
      subtitle="Create a new map entry"
      backHref={listPath}
    >
      <CategoryMapForm category={category} user={user} />
    </AdminLayout>
  );
}
