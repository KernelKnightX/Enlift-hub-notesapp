import AdminLayout from "@/layouts/AdminLayout";
import CategoryMapForm from "@/components/admin/CategoryMapForm";
import useAdminGate from "@/hooks/admin/useAdminGate";

export default function NewNationalPark() {
  const { user, loading, isAdmin } = useAdminGate();
  if (loading) return null;
  if (!isAdmin) return null;

  return (
    <AdminLayout title="Add National Park" subtitle="Create national park entry" backHref="/admin/maps/national-parks">
      <CategoryMapForm category="national-parks" user={user} />
    </AdminLayout>
  );
}
