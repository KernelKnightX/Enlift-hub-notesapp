import Link from "next/link";
import { ArrowUpRight, CalendarDays, FileText, Target } from "lucide-react";
import AdminLayout from "@/layouts/AdminLayout";
import useAdminGate from "@/hooks/admin/useAdminGate";
import { PLANNING_HUB_PAGES } from "@/lib/planning/planningPagesConfig";

const ICONS = {
  "upsc-calendar": CalendarDays,
  "study-planner": FileText,
  "study-timetable": FileText,
  "revision-planner": FileText,
  "goal-tracker": Target,
  "preparation-strategy": FileText,
  "beginner-roadmap": FileText,
};

export default function AdminPlanningToolsHub() {
  const { loading, isAdmin } = useAdminGate();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[var(--color-bg)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-border-strong)] border-t-[var(--color-primary)]" />
      </div>
    );
  }
  if (!isAdmin) return null;

  return (
    <AdminLayout
      title="Planning tools"
      subtitle="Edit public planning articles, calendar, and strategy pages from one place."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {PLANNING_HUB_PAGES.map((page) => {
          const Icon = ICONS[page.slug] || FileText;
          return (
            <Link key={page.pageId} href={page.adminPath} className="card card-hover p-5 block">
              <div className="flex items-start gap-4">
                <div
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl"
                  style={{ background: "var(--color-primary-tint)", color: "var(--color-primary)" }}
                >
                  <Icon size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{page.label}</span>
                    <ArrowUpRight size={14} className="text-[var(--color-ink-faint)]" />
                  </div>
                  <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{page.publicPath}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </AdminLayout>
  );
}
