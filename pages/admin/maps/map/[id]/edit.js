import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import AdminLayout from "@/layouts/AdminLayout";
import MapForm from "@/components/admin/MapForm";
import useAdminGate from "@/hooks/admin/useAdminGate";
import { getMapById } from "@/lib/firestore/maps";

export default function EditMapPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading, isAdmin } = useAdminGate();
  const [mapItem, setMapItem] = useState(null);
  const [mapLoading, setMapLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin || !id) return;
    let cancelled = false;
    (async () => {
      try {
        const found = await getMapById(id);
        if (!found) {
          toast.error("Map not found.");
          router.replace("/admin/maps");
          return;
        }
        if (!cancelled) setMapItem(found);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load map.");
      } finally {
        if (!cancelled) setMapLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, isAdmin, router]);

  if (loading || mapLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[var(--color-bg)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-border-strong)] border-t-[var(--color-primary)]" />
      </div>
    );
  }
  if (!isAdmin || !mapItem) return null;

  return (
    <AdminLayout title="Edit Map" subtitle={mapItem.title} backHref="/admin/maps">
      <MapForm initialMap={mapItem} user={user} />
    </AdminLayout>
  );
}
