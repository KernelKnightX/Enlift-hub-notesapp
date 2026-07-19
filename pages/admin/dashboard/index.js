import { useEffect } from "react";
import { useRouter } from "next/router";

// /admin/dashboard/ does not exist — redirect to /admin/
export default function AdminDashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin");
  }, [router]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f0f4f8",
      }}
    >
      <div className="text-center">
        <div className="spinner-border text-primary" role="status" />
        <div className="mt-3 text-muted small">Redirecting to Admin Panel…</div>
      </div>
    </div>
  );
}
