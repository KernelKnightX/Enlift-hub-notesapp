import AdminLayout from "@/layouts/AdminLayout";
import RiverSystemForm from "@/components/admin/RiverSystemForm";
import useAdminGate from "@/hooks/admin/useAdminGate";

export default function NewRiver() {
  const { user, loading, isAdmin } = useAdminGate();

  if (loading) return null;
  if (!isAdmin) return null;

  return (
    <AdminLayout title="Add River System" subtitle="Create river system map" backHref="/admin/maps/river-systems">
      <RiverSystemForm user={user} />
    </AdminLayout>
  );
}
