import Link from "next/link";
import { Bell } from "lucide-react";
import StudentLayout from "@/layouts/StudentLayout";

export default function StudentNotificationsPage() {
  return (
    <StudentLayout title="Notifications" subtitle="Exam updates, planner reminders, and desk alerts.">
      <div className="card p-10 md:p-14 text-center max-w-lg mx-auto">
        <div
          className="w-14 h-14 rounded-full mx-auto mb-5 flex items-center justify-center"
          style={{ background: "var(--color-primary-tint)", color: "var(--color-primary)" }}
        >
          <Bell size={24} strokeWidth={1.6} />
        </div>
        <h2 className="font-serif text-[22px] mb-2">No notifications yet</h2>
        <p className="text-[14px] mb-6" style={{ color: "var(--color-ink-muted)", lineHeight: 1.6 }}>
          When mock results, planner reminders, or exam date updates are available, they will appear here.
        </p>
        <Link href="/student-desk/dashboard" className="chip chip-primary" style={{ padding: "10px 16px" }}>
          Back to dashboard
        </Link>
      </div>
    </StudentLayout>
  );
}
