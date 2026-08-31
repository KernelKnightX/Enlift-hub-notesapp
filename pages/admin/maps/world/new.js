import AdminLayout from "@/layouts/AdminLayout";
import CategoryMapForm from "@/components/admin/CategoryMapForm";
import useAdminGate from "@/hooks/admin/useAdminGate";

export default function NewWorldMap() {
  const { user, loading, isAdmin } = useAdminGate();
  if (loading) return null;
  if (!isAdmin) return null;

  return (
    <AdminLayout title="Add World Map" subtitle="Create world map entry" backHref="/admin/maps/world">
      <CategoryMapForm category="world" user={user} />
    </AdminLayout>
  );
}
