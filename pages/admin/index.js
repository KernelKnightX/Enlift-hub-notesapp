// pages/admin/index.jsx
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

import { useAuth } from "../../contexts/AuthContext";

import { db } from "../../firebase/config";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

function AdminDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  /* ------------------------- Auth guard ------------------------- */
  useEffect(() => {
    if (!user) {
      router.replace("/");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        // Check admin access using the same method as /admin/dashboard
        const adminDoc = await getDoc(doc(db, 'admins', user.uid));
        const isAdmin = adminDoc.exists() && adminDoc.data().isAdmin === true;

        if (!isAdmin) {
          toast.error("Access denied. Admin privileges required.");
          if (!cancelled) router.replace("/");
          return;
        }

        // Get user profile data
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        const userData = snap.exists() ? snap.data() : {};

        if (!cancelled) {
          setProfile(userData);
          setIsAdmin(true);
        }
      } catch (e) {
        console.error("Admin check error:", e);
        if (!cancelled) router.replace("/");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, router]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully!");
      router.push("/");
    } catch (e) {
      console.error("Logout error:", e);
      toast.error("Error logging out. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: "#f8f9fa" }}>
        <div className="text-center">
          <div className="spinner-border text-success" role="status" style={{ width: '3rem', height: '3rem' }} />
          <div className="mt-3 text-muted fw-semibold">Loading Admin Dashboard...</div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect
  }

  return (
    <div className="container-fluid py-3 px-2 px-md-4" style={{ background: "#f8f9fa", minHeight: "100vh" }}>
      {/* Header */}
      <div className="card shadow-sm border-0 mb-3" style={{ background: "white" }}>
        <div className="card-body p-3">
          <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">
            <div className="w-100 w-md-auto">
              <h1 className="h5 mb-2 fw-bold" style={{ color: "#2d3748" }}>
                🛠️ Admin Dashboard - The Enlift Hub
              </h1>
              <div className="d-flex flex-wrap align-items-center gap-2 small">
                <span className="badge bg-danger text-white">Administrator</span>
                <span className="d-none d-sm-inline text-muted">•</span>
                <span style={{ color: "#10b981" }}>Welcome, Admin {profile?.name || "User"}!</span>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              <Link href="/" className="btn btn-sm fw-semibold d-flex align-items-center gap-1" style={{ background: "#6b7280", color: "white", border: "none", padding: "6px 16px" }}>
                <span>🏠</span>
                <span>View Site</span>
              </Link>
              <button
                className="btn btn-sm fw-semibold d-flex align-items-center gap-1"
                style={{
                  background: "#ef4444",
                  color: "white",
                  border: "none",
                  padding: "6px 16px"
                }}
                onClick={handleLogout}
              >
                <span>🚪</span>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Management Sections */}
      <div className="row g-2 g-md-3 mb-3">
        <div className="col-12 col-md-6 col-lg-4">
          <AdminCard
            title="TAT Management"
            description="Upload & manage TAT pictures"
            icon="🎭"
            bgColor="#f0fdf4"
            iconBg="#10b981"
            href="/admin/tat"
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <AdminCard
            title="SRT Management"
            description="Upload & manage SRT questions"
            icon="💭"
            bgColor="#fef3c7"
            iconBg="#f59e0b"
            href="/admin/srt"
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <AdminCard
            title="OIR Management"
            description="Upload & manage OIR questions"
            icon="👁️"
            bgColor="#f0f9ff"
            iconBg="#3b82f6"
            href="/admin/oir"
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <AdminCard
            title="WAT Management"
            description="Upload & manage WAT questions"
            icon="📝"
            bgColor="#fce7f3"
            iconBg="#ec4899"
            href="/admin/wat"
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <AdminCard
            title="PPDT Management"
            description="Upload & manage PPDT pictures"
            icon="🖼️"
            bgColor="#ede9fe"
            iconBg="#8b5cf6"
            href="/admin/ppdt"
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <AdminCard
            title="User Management"
            description="Manage users & permissions"
            icon="👥"
            bgColor="#fee2e2"
            iconBg="#ef4444"
            href="/admin/users"
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="row g-2 g-md-3">
        <div className="col-12">
          <div className="card shadow-sm border-0" style={{ background: "white" }}>
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0 fw-bold">📊 System Overview</h5>
            </div>
            <div className="card-body p-4">
              <div className="row g-4">
                <div className="col-md-3">
                  <div className="text-center">
                    <div className="h3 fw-bold text-primary mb-2">--</div>
                    <div className="small text-muted">Total Users</div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="text-center">
                    <div className="h3 fw-bold text-success mb-2">--</div>
                    <div className="small text-muted">Active Tests</div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="text-center">
                    <div className="h3 fw-bold text-warning mb-2">--</div>
                    <div className="small text-muted">TAT Images</div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="text-center">
                    <div className="h3 fw-bold text-info mb-2">--</div>
                    <div className="small text-muted">SRT Questions</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------- Child Components --------------------------- */

function AdminCard({ title, description, icon, count, href, bgColor, iconBg }) {
  return (
    <Link href={href} className="text-decoration-none">
      <div
        className="card h-100 border-0 shadow-sm"
        style={{
          background: "white",
          transition: 'transform 0.2s, box-shadow 0.2s',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
        }}
      >
        <div className="card-body p-3">
          <div
            className="mx-auto d-flex align-items-center justify-content-center rounded mb-3"
            style={{ width: 60, height: 60, background: bgColor }}
          >
            <div
              className="rounded d-flex align-items-center justify-content-center"
              style={{ width: 44, height: 44, background: iconBg, color: "white" }}
            >
              <span style={{ fontSize: '1.5rem' }}>{icon}</span>
            </div>
          </div>
          <div className="text-center">
            <div className="fw-semibold mb-1" style={{ color: "#2d3748" }}>{title}</div>
            <div className="small mb-2" style={{ color: "#6b7280" }}>{description}</div>
            {count !== undefined && (
              <div className="small fw-bold" style={{ color: iconBg }}>{count} Items</div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default AdminDashboard;