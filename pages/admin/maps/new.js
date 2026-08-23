import AdminLayout from "@/layouts/AdminLayout";
import MapForm from "@/components/admin/MapForm";
import useAdminGate from "@/hooks/admin/useAdminGate";

export default function NewMapPage() {
  const { user, loading, isAdmin } = useAdminGate();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[var(--color-bg)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-border-strong)] border-t-[var(--color-primary)]" />
      </div>
    );
  }
  if (!isAdmin) return null;

  return (
    <AdminLayout title="Add Map" subtitle="Upload a new Firestore-driven Maps & Atlas entry." backHref="/admin/maps">
      <MapForm user={user} />
    </AdminLayout>
  );
}
