import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

import { useAuth } from "../../../contexts/AuthContext";

import { db } from "../../../firebase/config";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";

function SSBPractice() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  // SSB Practice data
  const [ssbStats, setSsbStats] = useState({
    screeningTests: 0,
    psychologicalTests: 0,
    gtoTasks: 0,
    interviews: 0,
    medicalExams: 0,
  });

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
        if (!snap.exists() || !snap.data()?.isProfileComplete) {
          if (!cancelled) router.push("/profile-setup");
          return;
        }
        if (!cancelled) setProfile(snap.data());
      } catch (e) {
        console.error("Profile fetch error:", e);
        if (!cancelled) setProfile({ name: "Officer" });
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
      router.push("/login");
    } catch (e) {
      console.error("Logout error:", e);
      toast.error("Error logging out. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100">
      <div className="container py-4">
        {/* Header */}
        <div className="card shadow-sm mb-4" style={{ borderRadius: '12px' }}>
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
              <div>
                <h1 className="h3 mb-2 fw-bold text-dark">SSB Practice Center</h1>
                <p className="text-muted mb-0">Welcome, {profile?.name || "Officer"}!</p>
              </div>
              <div className="d-flex gap-2">
                <Link href="/student-desk/dashboard" className="btn btn-secondary">
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="btn btn-danger">
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Practice Cards */}
        <div className="row g-4">
          <div className="col-md-6 col-lg-4">
            <PracticeCard
              title="OIR Test"
              description="Officer Intelligence Rating"
              icon="🧠"
              href="/student-desk/ssb-practice/oir"
              color="#10b981"
            />
          </div>
          <div className="col-md-6 col-lg-4">
            <PracticeCard
              title="PPDT"
              description="Picture Perception & Description"
              icon="🖼️"
              href="/student-desk/ssb-practice/ppdt"
              color="#f59e0b"
            />
          </div>
          <div className="col-md-6 col-lg-4">
            <PracticeCard
              title="TAT"
              description="Thematic Apperception Test"
              icon="🎭"
              href="/student-desk/ssb-practice/tat"
              color="#3b82f6"
            />
          </div>
          <div className="col-md-6 col-lg-4">
            <PracticeCard
              title="WAT"
              description="Word Association Test"
              icon="⚡"
              href="/student-desk/ssb-practice/wat"
              color="#ec4899"
            />
          </div>
          <div className="col-md-6 col-lg-4">
            <PracticeCard
              title="SRT"
              description="Situation Reaction Test"
              icon="💡"
              href="/student-desk/ssb-practice/srt"
              color="#8b5cf6"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------- Child Components --------------------------- */

function PracticeCard({ title, description, icon, href, color }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <Link href={href} className="text-decoration-none">
      <div 
        className="card h-100 border-0 shadow-sm"
        style={{
          borderRadius: '12px',
          transition: 'all 0.3s ease',
          transform: isHovered ? 'translateY(-5px)' : 'translateY(0)',
          boxShadow: isHovered ? '0 8px 16px rgba(0,0,0,0.1)' : '0 2px 4px rgba(0,0,0,0.05)'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="card-body text-center p-4">
          <div 
            className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
            style={{
              width: '80px',
              height: '80px',
              backgroundColor: `${color}20`,
              fontSize: '2.5rem'
            }}
          >
            {icon}
          </div>
          <h5 className="card-title fw-bold mb-2">{title}</h5>
          <p className="card-text text-muted mb-0">{description}</p>
        </div>
      </div>
    </Link>
  );
}

export default SSBPractice;