import AdminLayout from "@/layouts/AdminLayout";
import GovernmentSectionForm from "@/components/admin/GovernmentSectionForm";
import useAdminGate from "@/hooks/admin/useAdminGate";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { createGovItem, isValidSection, sectionLabel } from "@/lib/firestore/government";

export default function NewGovernmentItem() {
  const { user, loading, isAdmin } = useAdminGate();
  const router = useRouter();
  const { section } = router.query;

  if (loading) return null;
  if (!isAdmin) return null;

  if (router.isReady && !isValidSection(section)) {
    return (
      <AdminLayout title="Government" subtitle="Unknown section">
        <div className="card p-12 text-center">Unknown section</div>
      </AdminLayout>
    );
  }

  const handleSubmit = async (payload) => {
    await createGovItem(payload);
    toast.success(`${sectionLabel(section)} item created`);
    router.push(`/admin/government/${section}`);
  };

  return (
    <AdminLayout
      title={`Add ${sectionLabel(section)}`}
      subtitle={`Create ${sectionLabel(section)} item`}
      backHref={`/admin/government/${section}`}
    >
      <GovernmentSectionForm section={section} user={user} onSubmit={handleSubmit} />
    </AdminLayout>
  );
}
