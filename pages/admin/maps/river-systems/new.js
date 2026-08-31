import AdminLayout from "@/layouts/AdminLayout";
import CategoryMapForm from "@/components/admin/CategoryMapForm";
import useAdminGate from "@/hooks/admin/useAdminGate";

const CATEGORY = "river-systems";

export default function NewRiver() {
  const { user, loading, isAdmin } = useAdminGate();

  if (loading) return null;
  if (!isAdmin) return null;

  return (
    <AdminLayout title="Add River System" subtitle="Create river system map" backHref="/admin/maps/river-systems">
      <CategoryMapForm category={CATEGORY} user={user} />
    </AdminLayout>
  );
}
