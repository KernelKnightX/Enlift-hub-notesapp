import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import AdminLayout from "@/layouts/AdminLayout";
import RiverSystemForm from "@/components/admin/RiverSystemForm";
import useAdminGate from "@/hooks/admin/useAdminGate";
import { getMapById } from "@/lib/firestore/maps";

export default function EditRiverSystemPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading, isAdmin } = useAdminGate();
  const [river, setRiver] = useState(null);
  const [riverLoading, setRiverLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin || !id) return;
    let cancelled = false;

    (async () => {
      try {
        const found = await getMapById(id);
        if (!found) {
          toast.error("River not found.");
          router.replace("/admin/maps/river-systems");
          return;
        }
        if (found.category !== "river-systems") {
          toast.error("This entry is not a river system.");
          router.replace("/admin/maps/river-systems");
          return;
        }
        if (!cancelled) setRiver(found);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load river.");
      } finally {
        if (!cancelled) setRiverLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, isAdmin, router]);

  if (loading || riverLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[var(--color-bg)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-border-strong)] border-t-[var(--color-primary)]" />
      </div>
    );
  }

  if (!isAdmin || !river) return null;

  return (
    <AdminLayout
      title="Edit River System"
      subtitle={river.title}
      backHref="/admin/maps/river-systems"
    >
      <RiverSystemForm initialMap={river} user={user} />
    </AdminLayout>
  );
}
