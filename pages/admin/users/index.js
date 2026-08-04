// pages/admin/users/index.jsx
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

import { useAuth } from "../../../contexts/AuthContext";

import { db } from "../../../firebase/config";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  getDocs,
  where,
} from "firebase/firestore";

function UsersAdmin() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all'); // all, admin, user
  const [updating, setUpdating] = useState(null);

  /* ------------------------- Auth guard ------------------------- */
  useEffect(() => {
    if (!user) {
      router.replace("/");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          if (!cancelled) router.replace("/");
          return;
        }

        const userData = snap.data();
        if (!userData.isAdmin) {
          toast.error("Access denied. Admin privileges required.");
          if (!cancelled) router.replace("/");
          return;
        }

        if (!cancelled) {
          setProfile(userData);
          setIsAdmin(true);
        }
      } catch (e) {
        console.error("Profile fetch error:", e);
        if (!cancelled) router.replace("/");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, router]);

  /* ------------------------- Load Users ------------------------- */
  useEffect(() => {
    if (!isAdmin) return;

    const qRef = query(
      collection(db, "users"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(qRef, (snap) => {
      const usersList = [];
      snap.forEach((d) => {
        const userData = d.data();
        usersList.push({
          id: d.id,
          ...userData,
          createdAt: userData.createdAt?.toDate?.() || new Date(),
          lastLogin: userData.lastLogin?.toDate?.() || null,
        });
      });
      setUsers(usersList);
    });

    return () => unsub();
  }, [isAdmin]);

  const handleToggleAdmin = async (userId, currentStatus) => {
    if (userId === user.uid) {
      toast.error("You cannot modify your own admin status.");
      return;
    }

    if (!window.confirm(`Are you sure you want to ${currentStatus ? 'remove' : 'grant'} admin privileges for this user?`)) return;

    setUpdating(userId);
    try {
      await updateDoc(doc(db, "users", userId), {
        isAdmin: !currentStatus,
        updatedAt: serverTimestamp(),
        updatedBy: user.uid,
      });
      toast.success(`Admin privileges ${!currentStatus ? 'granted' : 'removed'} successfully!`);
    } catch (error) {
      console.error("Toggle admin error:", error);
      toast.error("Failed to update user privileges.");
    } finally {
      setUpdating(null);
    }
  };

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

  // Filter users based on search and role
  const filteredUsers = users.filter(u => {
    const matchesSearch = !searchTerm ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === 'all' ||
      (filterRole === 'admin' && u.isAdmin) ||
      (filterRole === 'user' && !u.isAdmin);

    return matchesSearch && matchesRole;
  });

  const getUserStats = () => {
    const total = users.length;
    const admins = users.filter(u => u.isAdmin).length;
    const active = users.filter(u => u.lastLogin).length;
    return { total, admins, active };
  };

  const stats = getUserStats();

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: "#f8f9fa" }}>
        <div className="text-center">
          <div className="spinner-border text-success" role="status" style={{ width: '3rem', height: '3rem' }} />
          <div className="mt-3 text-muted fw-semibold">Loading Users Admin...</div>
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
                👥 User Management
              </h1>
              <div className="d-flex flex-wrap align-items-center gap-2 small">
                <span className="badge bg-danger text-white">Administrator</span>
                <span className="d-none d-sm-inline text-muted">•</span>
                <span style={{ color: "#10b981" }}>Total Users: {stats.total}</span>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              <Link href="/admin" className="btn btn-sm fw-semibold d-flex align-items-center gap-1" style={{ background: "#6b7280", color: "white", border: "none", padding: "6px 16px" }}>
                <span>⬅️</span>
                <span>Back to Admin</span>
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

      {/* Stats Cards */}
      <div className="row g-2 g-md-3 mb-3">
        <div className="col-6 col-md-4">
          <div className="card h-100 border-0 shadow-sm" style={{ background: "white" }}>
            <div className="card-body p-3 text-center">
              <div className="fs-3 mb-2">👥</div>
              <div className="h5 fw-bold text-primary mb-1">{stats.total}</div>
              <div className="small text-muted">Total Users</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-4">
          <div className="card h-100 border-0 shadow-sm" style={{ background: "white" }}>
            <div className="card-body p-3 text-center">
              <div className="fs-3 mb-2">👑</div>
              <div className="h5 fw-bold text-danger mb-1">{stats.admins}</div>
              <div className="small text-muted">Administrators</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-4">
          <div className="card h-100 border-0 shadow-sm" style={{ background: "white" }}>
            <div className="card-body p-3 text-center">
              <div className="fs-3 mb-2">✅</div>
              <div className="h5 fw-bold text-success mb-1">{stats.active}</div>
              <div className="small text-muted">Active Users</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card shadow-sm border-0 mb-3" style={{ background: "white" }}>
        <div className="card-body p-3">
          <div className="row g-3 align-items-end">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Search Users</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold">Filter by Role</label>
              <select
                className="form-select"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="all">All Users</option>
                <option value="admin">Administrators Only</option>
                <option value="user">Regular Users Only</option>
              </select>
            </div>
            <div className="col-md-2">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => {
                  setSearchTerm('');
                  setFilterRole('all');
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card shadow-sm border-0" style={{ background: "white" }}>
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0 fw-bold">Users ({filteredUsers.length})</h5>
        </div>
        <div className="card-body p-0">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-5">
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
              <h5 className="text-muted">No users found</h5>
              <p className="text-muted">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="border-0 px-3 py-3">User</th>
                    <th className="border-0 px-3 py-3">Role</th>
                    <th className="border-0 px-3 py-3">Status</th>
                    <th className="border-0 px-3 py-3">Joined</th>
                    <th className="border-0 px-3 py-3">Last Login</th>
                    <th className="border-0 px-3 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td className="px-3 py-3">
                        <div className="d-flex align-items-center gap-3">
                          <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center"
                               style={{ width: '40px', height: '40px', color: 'white' }}>
                            {(u.fullName || u.name || u.email || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="fw-semibold">{u.fullName || u.name || 'Unnamed User'}</div>
                            <div className="small text-muted">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`badge ${u.isAdmin ? 'bg-danger' : 'bg-secondary'}`}>
                          {u.isAdmin ? 'Administrator' : 'User'}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`badge ${u.isProfileComplete ? 'bg-success' : 'bg-warning'}`}>
                          {u.isProfileComplete ? 'Complete' : 'Incomplete'}
                        </span>
                      </td>
                      <td className="px-3 py-3 small text-muted">
                        {u.createdAt?.toLocaleDateString() || 'Unknown'}
                      </td>
                      <td className="px-3 py-3 small text-muted">
                        {u.lastLogin?.toLocaleDateString() || 'Never'}
                      </td>
                      <td className="px-3 py-3">
                        <button
                          className={`btn btn-sm ${u.isAdmin ? 'btn-danger' : 'btn-success'}`}
                          onClick={() => handleToggleAdmin(u.id, u.isAdmin)}
                          disabled={updating === u.id || u.id === user.uid}
                        >
                          {updating === u.id ? (
                            <span className="spinner-border spinner-border-sm" />
                          ) : u.isAdmin ? (
                            'Remove Admin'
                          ) : (
                            'Make Admin'
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UsersAdmin;