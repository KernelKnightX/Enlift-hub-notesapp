import AdminLayout from "@/layouts/AdminLayout";
import CategoryMapForm from "@/components/admin/CategoryMapForm";
import useAdminGate from "@/hooks/admin/useAdminGate";

export default function NewImportantLocation() {
  const { user, loading, isAdmin } = useAdminGate();
  if (loading) return null;
  if (!isAdmin) return null;

  return (
    <AdminLayout title="Add Important Location" subtitle="Create important location entry" backHref="/admin/maps/important-locations">
      <CategoryMapForm category="important-locations" user={user} />
    </AdminLayout>
  );
}
