import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { auth, db } from "../../../firebase/config";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { Pencil, LogOut, Camera, User, MapPin, GraduationCap, BookOpen, Building2 } from "lucide-react";
import Sidebar from "../../../components/common/sidebar";

export default function ProfileSetupSinglePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const defaultExampleImage = "/images/student-image.png";
  const [photoPreview, setPhotoPreview] = useState(defaultExampleImage);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    gender: "",
    dob: "",
    city: "",
    district: "",
    state: "",
    pincode: "",
    exam: "",
    attemptYear: "",
    medium: "",
    qualification: "",
    discipline: "",
    college: "",
    coaching: "",
    coachingName: "",
    profileImage: "",
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      if (!authUser) {
        router.replace("/login");
        return;
      }
      setUser(authUser);
      const docRef = doc(db, "users", authUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setForm((prev) => ({ ...prev, ...docSnap.data() }));
        if (docSnap.data().profileImage) setPhotoPreview(docSnap.data().profileImage);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      setPhotoPreview(preview);
      setForm({ ...form, profileImage: preview });
    }
  };

  const handleSubmit = async () => {
    try {
      await setDoc(doc(db, "users", user.uid), {
        phone: user.phoneNumber,
        ...form,
        updatedAt: new Date(),
      });
      toast.success("Profile saved successfully!");
      setIsEditing(false);
      router.push("/student-desk/dashboard");
    } catch (error) {
      toast.error("Failed to save profile. Try again.");
      console.error(error);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      toast.success('Logged out successfully!');
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        :root {
          --ink: #0f1923;
          --ink-2: #2c3e50;
          --ink-3: #64748b;
          --paper: #f5f2ee;
          --paper-2: #ede9e3;
          --paper-3: #e2ddd6;
          --gold: #c9a84c;
          --gold-light: #f0d98a;
          --emerald: #1a6b4a;
          --radius: 16px;
          --shadow: 0 4px 24px rgba(15,25,35,.08);
          --shadow-lg: 0 12px 40px rgba(15,25,35,.14);
          --sidebar-w: 260px;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body { font-family: 'DM Sans', sans-serif; background: var(--paper); color: var(--ink); }
        .layout { display: flex; min-height: 100vh; }

        .main { margin-left: var(--sidebar-w); flex: 1; min-width: 0; }
        
        /* Topbar */
        .topbar {
          position: sticky; top: 0; z-index: 50;
          background: rgba(245,242,238,.96); backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--paper-3); padding: 0 28px; height: 56px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .topbar-left { display: flex; align-items: center; gap: 12px; }
        .hamburger {
          display: none; width: 36px; height: 36px; border-radius: 8px;
          border: 1px solid var(--paper-3); background: white;
          align-items: center; justify-content: center; cursor: pointer; font-size: 1.1rem;
        }
        .topbar-title { font-family: 'Playfair Display', serif; font-size: 1.1rem; color: var(--ink); font-weight: 600; }
        .topbar-right { display: flex; align-items: center; gap: 10px; }
        .avatar {
          width: 36px; height: 36px; border-radius: 50%; background: var(--ink); color: var(--gold);
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: .9rem; font-family: 'Playfair Display', serif;
        }

        /* Content Area */
        .content { padding: 28px 32px; max-width: 1100px; }

        /* Profile Hero Card */
        .profile-hero {
          background: linear-gradient(135deg, var(--ink) 0%, #1a2a38 100%);
          border-radius: var(--radius);
          padding: 40px;
          margin-bottom: 28px;
          position: relative;
          overflow: hidden;
          box-shadow: var(--shadow-lg);
        }
        .profile-hero::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -20%;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(201,168,76,0.15) 0%, transparent 70%);
          pointer-events: none;
        }
        .profile-hero::after {
          content: '';
          position: absolute;
          bottom: -30%;
          left: -10%;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(26,107,74,0.2) 0%, transparent 70%);
          pointer-events: none;
        }
        .profile-main {
          display: flex; align-items: center; gap: 28px;
          position: relative; z-index: 1;
        }
        .profile-avatar-wrap {
          position: relative;
          flex-shrink: 0;
        }
        .profile-avatar {
          width: 140px; height: 140px; border-radius: 50%;
          border: 4px solid var(--gold);
          object-fit: cover;
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }
        .profile-avatar-edit {
          position: absolute; bottom: 4px; right: 4px;
          width: 40px; height: 40px; border-radius: 50%;
          background: var(--gold); border: 3px solid var(--ink);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all .2s;
        }
        .profile-avatar-edit:hover { transform: scale(1.1); background: var(--gold-light); }
        .profile-info { flex: 1; }
        .profile-name {
          font-family: 'Playfair Display', serif;
          font-size: 2rem; font-weight: 700; color: white;
          margin-bottom: 6px;
        }
        .profile-greeting { color: var(--gold); font-size: .95rem; font-weight: 500; margin-bottom: 4px; }
        .profile-phone { color: rgba(255,255,255,.6); font-size: .85rem; }
        .profile-edit-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 20px; border-radius: 10px;
          border: none; background: var(--gold); color: var(--ink);
          font-weight: 600; font-size: .85rem; cursor: pointer;
          transition: all .2s; font-family: 'DM Sans', sans-serif;
        }
        .profile-edit-btn:hover { background: var(--gold-light); transform: translateY(-2px); }
        
        /* Info Cards Grid */
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 20px;
          margin-bottom: 28px;
        }
        .info-card {
          background: white; border-radius: var(--radius);
          padding: 24px; box-shadow: var(--shadow);
          border: 1px solid var(--paper-3);
          transition: all .2s;
        }
        .info-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); }
        .info-card-header {
          display: flex; align-items: center; gap: 12px;
          margin-bottom: 20px; padding-bottom: 14px;
          border-bottom: 1px solid var(--paper-2);
        }
        .info-card-icon {
          width: 42px; height: 42px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.2rem;
        }
        .info-card-icon.personal { background: #eff6ff; color: #3b82f6; }
        .info-card-icon.address { background: #fff7ed; color: #f97316; }
        .info-card-icon.exam { background: #f0fdf4; color: #10b981; }
        .info-card-icon.education { background: #fdf4ff; color: #8b5cf6; }
        .info-card-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.1rem; color: var(--ink); font-weight: 600;
        }
        
        /* Form Grid */
        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        .form-group { display: flex; flex-direction: column; gap: 6px; }
        .form-group.full { grid-column: 1 / -1; }
        .form-label {
          font-size: .75rem; font-weight: 600; color: var(--ink-3);
          text-transform: uppercase; letter-spacing: .5px;
        }
        .form-input, .form-select {
          padding: 12px 14px; border-radius: 10px;
          border: 1.5px solid var(--paper-3);
          font-size: .9rem; font-family: 'DM Sans', sans-serif;
          color: var(--ink); background: var(--paper);
          transition: all .15s; outline: none;
        }
        .form-input:focus, .form-select:focus {
          border-color: var(--gold); background: white;
          box-shadow: 0 0 0 3px rgba(201,168,76,.12);
        }
        .form-input::placeholder { color: var(--ink-3); }

        /* Submit Button */
        .submit-section {
          display: flex; justify-content: center; gap: 16px; margin-top: 32px;
        }
        .submit-btn {
          display: flex; align-items: center; gap: 10px;
          padding: 14px 36px; border-radius: 12px;
          border: none; background: linear-gradient(135deg, var(--emerald) 0%, #23755a 100%);
          color: white; font-weight: 600; font-size: 1rem;
          cursor: pointer; transition: all .2s;
          font-family: 'DM Sans', sans-serif;
          box-shadow: 0 4px 16px rgba(26,107,74,.3);
        }
        .submit-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(26,107,74,.4); }
        .cancel-btn {
          padding: 14px 28px; border-radius: 12px;
          border: 1.5px solid var(--paper-3); background: white;
          color: var(--ink-3); font-weight: 500; font-size: 1rem;
          cursor: pointer; transition: all .2s;
          font-family: 'DM Sans', sans-serif;
        }
        .cancel-btn:hover { border-color: var(--ink-3); color: var(--ink); }

        /* Read-only view */
        .info-value {
          font-size: .95rem; color: var(--ink); font-weight: 500;
          padding: 8px 0; border-bottom: 1px solid var(--paper-2);
        }
        .info-value:last-child { border-bottom: none; }
        .info-label-small {
          font-size: .7rem; color: var(--ink-3); text-transform: uppercase;
          letter-spacing: .5px; margin-bottom: 2px;
        }

        /* Mobile */
        @media (max-width: 768px) {
          .main { margin-left: 0; }
          .hamburger { display: flex; }
          .content { padding: 20px 16px; }
          .profile-hero { padding: 24px 20px; }
          .profile-main { flex-direction: column; text-align: center; }
          .profile-avatar { width: 110px; height: 110px; }
          .profile-name { font-size: 1.5rem; }
          .form-grid { grid-template-columns: 1fr; }
          .info-grid { grid-template-columns: 1fr; }
          .topbar { padding: 0 18px; }
        }
      `}</style>
      
      <div className="layout">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onLogout={handleLogout} />

        <main className="main">
          <header className="topbar">
            <div className="topbar-left">
              <button className="hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
              <div className="topbar-title">My Profile</div>
            </div>
            <div className="topbar-right">
              <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '8px' }}>
                <LogOut size={20} color="#64748b" />
              </button>
            </div>
          </header>

          <div className="content">
            {/* Profile Hero Card */}
            <div className="profile-hero">
              <div className="profile-main">
                <div className="profile-avatar-wrap">
                  <img src={photoPreview} alt="Profile" className="profile-avatar" />
                  <label htmlFor="uploadPhoto" className="profile-avatar-edit">
                    <Camera size={18} color="#0f1923" />
                    <input id="uploadPhoto" type="file" accept="image/*" className="d-none" onChange={handlePhotoChange} />
                  </label>
                </div>
                <div className="profile-info">
                  <div className="profile-greeting">Welcome back,</div>
                  <h1 className="profile-name">{form.fullName || "Aspirant"}</h1>
                  <div className="profile-phone">📱 {user?.phoneNumber || "Your registered phone number"}</div>
                </div>
                <button className="profile-edit-btn" onClick={() => setIsEditing(!isEditing)}>
                  <Pencil size={16} />
                  {isEditing ? "Cancel" : "Edit Profile"}
                </button>
              </div>
            </div>

            {isEditing ? (
              /* Edit Mode - Form Cards */
              <>
                <div className="info-grid">
                  {/* Personal Info Card */}
                  <div className="info-card">
                    <div className="info-card-header">
                      <div className="info-card-icon personal">👤</div>
                      <div className="info-card-title">Personal Information</div>
                    </div>
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input type="text" name="fullName" className="form-input" value={form.fullName} onChange={handleChange} placeholder="Enter your full name" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Gender</label>
                        <select name="gender" className="form-select" value={form.gender} onChange={handleChange}>
                          <option value="">Select Gender</option>
                          <option>Male</option>
                          <option>Female</option>
                          <option>Other</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Date of Birth</label>
                        <input type="date" name="dob" className="form-input" value={form.dob} onChange={handleChange} />
                      </div>
                    </div>
                  </div>

                  {/* Address Card */}
                  <div className="info-card">
                    <div className="info-card-header">
                      <div className="info-card-icon address">📍</div>
                      <div className="info-card-title">Address Details</div>
                    </div>
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">City</label>
                        <input type="text" name="city" className="form-input" value={form.city} onChange={handleChange} placeholder="City" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">District</label>
                        <input type="text" name="district" className="form-input" value={form.district} onChange={handleChange} placeholder="District" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">State</label>
                        <input type="text" name="state" className="form-input" value={form.state} onChange={handleChange} placeholder="State" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">PIN Code</label>
                        <input type="text" name="pincode" className="form-input" value={form.pincode} onChange={handleChange} placeholder="PIN" />
                      </div>
                    </div>
                  </div>

                  {/* Exam Details Card */}
                  <div className="info-card">
                    <div className="info-card-header">
                      <div className="info-card-icon exam">📋</div>
                      <div className="info-card-title">Exam Information</div>
                    </div>
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">Exam</label>
                        <select name="exam" className="form-select" value={form.exam} onChange={handleChange}>
                          <option value="">Select Exam</option>
                          <option>UPSC CSE</option>
                          <option>UPPSC PCS</option>
                          <option>SSC CGL</option>
                          <option>State PSC</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Attempt Year</label>
                        <input type="text" name="attemptYear" className="form-input" value={form.attemptYear} onChange={handleChange} placeholder="e.g., 2026" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Medium</label>
                        <select name="medium" className="form-select" value={form.medium} onChange={handleChange}>
                          <option value="">Select Medium</option>
                          <option>English</option>
                          <option>Hindi</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Education Card */}
                  <div className="info-card">
                    <div className="info-card-header">
                      <div className="info-card-icon education">🎓</div>
                      <div className="info-card-title">Education & Coaching</div>
                    </div>
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">Qualification</label>
                        <select name="qualification" className="form-select" value={form.qualification} onChange={handleChange}>
                          <option value="">Select Qualification</option>
                          <option>Graduation</option>
                          <option>Post-Graduation</option>
                          <option>PhD</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Discipline</label>
                        <input type="text" name="discipline" className="form-input" value={form.discipline} onChange={handleChange} placeholder="e.g., Arts, Science" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">College/University</label>
                        <input type="text" name="college" className="form-input" value={form.college} onChange={handleChange} placeholder="Your college name" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Enrolled in Coaching?</label>
                        <select name="coaching" className="form-select" value={form.coaching} onChange={handleChange}>
                          <option value="">Select</option>
                          <option>Yes</option>
                          <option>No</option>
                        </select>
                      </div>
                      {form.coaching === "Yes" && (
                        <div className="form-group full">
                          <label className="form-label">Coaching Name</label>
                          <input type="text" name="coachingName" className="form-input" value={form.coachingName} onChange={handleChange} placeholder="Name of your coaching institute" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="submit-section">
                  <button className="cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                  <button className="submit-btn" onClick={handleSubmit}>
                    <Pencil size={18} /> Save Changes
                  </button>
                </div>
              </>
            ) : (
              /* View Mode - Read Only Cards */
              <div className="info-grid">
                <div className="info-card">
                  <div className="info-card-header">
                    <div className="info-card-icon personal"><User size={20} /></div>
                    <div className="info-card-title">Personal Details</div>
                  </div>
                  <div className="info-value">
                    <div className="info-label-small">Full Name</div>
                    {form.fullName || "Not provided"}
                  </div>
                  <div className="info-value">
                    <div className="info-label-small">Gender</div>
                    {form.gender || "Not specified"}
                  </div>
                  <div className="info-value">
                    <div className="info-label-small">Date of Birth</div>
                    {form.dob || "Not provided"}
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-card-header">
                    <div className="info-card-icon address"><MapPin size={20} /></div>
                    <div className="info-card-title">Location</div>
                  </div>
                  <div className="info-value">
                    <div className="info-label-small">City</div>
                    {form.city || "Not provided"}
                  </div>
                  <div className="info-value">
                    <div className="info-label-small">District</div>
                    {form.district || "Not provided"}
                  </div>
                  <div className="info-value">
                    <div className="info-label-small">State</div>
                    {form.state || "Not provided"}
                  </div>
                  <div className="info-value">
                    <div className="info-label-small">PIN Code</div>
                    {form.pincode || "Not provided"}
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-card-header">
                    <div className="info-card-icon exam"><BookOpen size={20} /></div>
                    <div className="info-card-title">Exam Details</div>
                  </div>
                  <div className="info-value">
                    <div className="info-label-small">Target Exam</div>
                    {form.exam || "Not selected"}
                  </div>
                  <div className="info-value">
                    <div className="info-label-small">Attempt Year</div>
                    {form.attemptYear || "Not specified"}
                  </div>
                  <div className="info-value">
                    <div className="info-label-small">Medium</div>
                    {form.medium || "Not selected"}
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-card-header">
                    <div className="info-card-icon education"><GraduationCap size={20} /></div>
                    <div className="info-card-title">Education</div>
                  </div>
                  <div className="info-value">
                    <div className="info-label-small">Qualification</div>
                    {form.qualification || "Not selected"}
                  </div>
                  <div className="info-value">
                    <div className="info-label-small">Discipline</div>
                    {form.discipline || "Not provided"}
                  </div>
                  <div className="info-value">
                    <div className="info-label-small">College</div>
                    {form.college || "Not provided"}
                  </div>
                  <div className="info-value">
                    <div className="info-label-small">Coaching</div>
                    {form.coaching === "Yes" ? form.coachingName || "Enrolled" : "Self Study"}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
