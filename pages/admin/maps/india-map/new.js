import AdminLayout from "@/layouts/AdminLayout";
import CategoryMapForm from "@/components/admin/CategoryMapForm";
import useAdminGate from "@/hooks/admin/useAdminGate";

export default function NewIndiaState() {
  const { user, loading, isAdmin } = useAdminGate();
  if (loading) return null;
  if (!isAdmin) return null;

  return (
    <AdminLayout title="Add India State" subtitle="Create state map entry" backHref="/admin/maps/india-map">
      <CategoryMapForm category="india-states" user={user} />
    </AdminLayout>
  );
}
