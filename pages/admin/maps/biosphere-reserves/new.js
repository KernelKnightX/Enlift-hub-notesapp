import AdminLayout from "@/layouts/AdminLayout";
import CategoryMapForm from "@/components/admin/CategoryMapForm";
import useAdminGate from "@/hooks/admin/useAdminGate";

export default function NewBiosphereReserve() {
  const { user, loading, isAdmin } = useAdminGate();
  if (loading) return null;
  if (!isAdmin) return null;

  return (
    <AdminLayout title="Add Biosphere Reserve" subtitle="Create biosphere reserve entry" backHref="/admin/maps/biosphere-reserves">
      <CategoryMapForm category="biosphere-reserves" user={user} />
    </AdminLayout>
  );
}
