import AdminLayout from "@/layouts/AdminLayout";
import MapForm from "@/components/admin/MapForm";
import useAdminGate from "@/hooks/admin/useAdminGate";
import { useRouter } from "next/router";

export default function NewCategoryMapPage() {
  const { user, loading, isAdmin } = useAdminGate();
  const router = useRouter();
  const routeCategory = router.query.category || "india-states";

  if (loading) return null;
  if (!isAdmin) return null;

  const initialMap = { category: routeCategory, status: 'draft' };

  return (
    <AdminLayout title={`Add ${routeCategory} map`} subtitle="Create a new map entry" backHref={`/admin/maps/${routeCategory}`}>
      <MapForm initialMap={initialMap} user={user} />
    </AdminLayout>
  );
}
