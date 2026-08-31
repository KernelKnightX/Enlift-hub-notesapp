import AdminLayout from "@/layouts/AdminLayout";
import CategoryMapForm from "@/components/admin/CategoryMapForm";
import useAdminGate from "@/hooks/admin/useAdminGate";

export default function NewMountainRange() {
  const { user, loading, isAdmin } = useAdminGate();
  if (loading) return null;
  if (!isAdmin) return null;

  return (
    <AdminLayout title="Add Mountain Range" subtitle="Create mountain range entry" backHref="/admin/maps/mountain-ranges">
      <CategoryMapForm category="mountain-ranges" user={user} />
    </AdminLayout>
  );
}
