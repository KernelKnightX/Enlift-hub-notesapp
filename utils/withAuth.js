// utils/withAuth.js
'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";

export const withAuth = (WrappedComponent) => {
  const AuthWrapper = (props) => {
    const { user, authLoading } = useAuth();
    const router = useRouter();
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
      if (!authLoading && !user) {
        router.replace("/");
      }
    }, [user, authLoading, router]);

    // Show loading while auth is being determined
    if (authLoading) {
      return (
        <div className="d-flex justify-content-center align-items-center vh-100">
          <div className="spinner-border text-primary" role="status" />
        </div>
      );
    }

    if (!user) return null;

    const navItems = [
      { href: "/student-desk/dashboard", label: "Dashboard", icon: "bi-house" },
      { href: "/student-desk/notes", label: "Notes", icon: "bi-journal" },
      { href: "/student-desk/profile", label: "Profile", icon: "bi-person" },
    ];

    const isActive = (href) => router.pathname === href;

    return (
      <div className="d-flex" style={{ height: "100vh", overflow: "hidden" }}>
        {/* Sidebar */}
        <div
          className={`bg-white border-end flex-shrink-0 ${collapsed ? "collapsed-sidebar" : ""}`}
          style={{
            width: collapsed ? "70px" : "220px",
            transition: "all 0.3s ease",
            overflowX: "hidden",
          }}
        >
          {/* Sidebar Header */}
          <div className="d-flex align-items-center justify-content-between px-3 py-3 border-bottom">
            {!collapsed && (
              <div className="d-flex align-items-center gap-2">
                <span className="fw-bold text-success">Notes Cafe</span>
              </div>
            )}
            <button
              className="btn btn-sm btn-light ms-auto"
              onClick={() => setCollapsed(!collapsed)}
              title="Toggle Sidebar"
            >
              <i className={`bi ${collapsed ? "bi-chevron-right" : "bi-chevron-left"}`} />
            </button>
          </div>

          {/* User Info */}
          {!collapsed && (
            <div className="px-3 py-2 border-bottom">
              <p className="fw-semibold mb-0">{user?.fullName || user?.name || "Student"}</p>
              <small className="text-muted">{user?.email}</small>
            </div>
          )}

          {/* Navigation Items */}
          <ul className="list-unstyled px-2 pt-3">
            {navItems.map((item) => (
              <li key={item.href} className="mb-2">
                <Link
                  href={item.href}
                  className={`d-flex align-items-center p-2 rounded text-decoration-none ${isActive(item.href) ? "bg-success text-white" : "text-dark"
                    } ${collapsed ? "justify-content-center" : ""}`}
                  title={collapsed ? item.label : ""}
                >
                  <i className={`bi ${item.icon} me-2 fs-5`} />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Main Content */}
        <div className="flex-grow-1 bg-light scrollable-content">
          <WrappedComponent {...props} />
        </div>
      </div>
    );
  };

  AuthWrapper.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return AuthWrapper;
};