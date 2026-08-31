import { useEffect, useState } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import GovernmentSectionForm from "@/components/admin/GovernmentSectionForm";
import useAdminGate from "@/hooks/admin/useAdminGate";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import {
  getGovItemById,
  updateGovItem,
  isValidSection,
  sectionLabel,
} from "@/lib/firestore/government";

export default function EditGovernmentItem() {
  const { user, loading, isAdmin } = useAdminGate();
  const router = useRouter();
  const { section, id } = router.query;
  const [item, setItem] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAdmin || !id) return;
    let cancelled = false;
    getGovItemById(id).then((found) => {
      if (cancelled) return;
      if (!found) {
        toast.error("Item not found.");
        router.replace(`/admin/government/${section || ""}`);
        return;
      }
      setItem(found);
      setReady(true);
    }).catch((error) => {
      console.error(error);
      toast.error("Could not load this item.");
    });
    return () => { cancelled = true; };
  }, [isAdmin, id, router, section]);

  if (loading || (isAdmin && id && !ready)) {
    return (
      <div className="grid min-h-screen place-items-center bg-[var(--color-bg)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-border-strong)] border-t-[var(--color-primary)]" />
      </div>
    );
  }
  if (!isAdmin) return null;

  if (router.isReady && !isValidSection(section)) {
    return (
      <AdminLayout title="Government" subtitle="Unknown section">
        <div className="card p-12 text-center">Unknown section</div>
      </AdminLayout>
    );
  }

  const handleSubmit = async (payload) => {
    await updateGovItem(id, payload);
    toast.success("Item updated.");
    router.push(`/admin/government/${section}`);
  };

  return (
    <AdminLayout
      title={`Edit ${sectionLabel(section)}`}
      subtitle="Update the public government page for this item."
      backHref={`/admin/government/${section}`}
    >
      <GovernmentSectionForm
        section={section}
        initialItem={item}
        user={user}
        onSubmit={handleSubmit}
      />
    </AdminLayout>
  );
}
