import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { auth, db } from "../../../firebase/config";
import { doc, setDoc, getDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import { Pencil, LogOut } from "lucide-react";

export default function ProfileSetupSinglePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const defaultExampleImage = "public/images/student-image.png";
  const [photoPreview, setPhotoPreview] = useState(defaultExampleImage);
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
      router.push("/student-desk/dashboard");
    } catch (error) {
      toast.error("Failed to save profile. Try again.");
      console.error(error);
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/login");
  };

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-success mb-0">🧑‍🎓 Profile Setup</h2>
        <button onClick={handleLogout} className="btn btn-outline-danger d-flex align-items-center">
          <LogOut size={18} className="me-2" /> Logout
        </button>
      </div>

      {/* Profile Card */}
      <div className="card shadow-sm p-4 border-0 rounded-4">
        {/* Profile Photo Section */}
        <div className="d-flex align-items-center mb-4 gap-4 flex-wrap">
          <div className="position-relative">
            <img
              src={photoPreview}
              alt="Profile"
              className="rounded-circle shadow"
              style={{ width: 130, height: 130, objectFit: "cover", border: "4px solid #198754" }}
            />
            <label htmlFor="uploadPhoto">
              <div
                className="position-absolute bg-white border rounded-circle p-2"
                style={{ bottom: 0, right: 0, cursor: "pointer", boxShadow: "0 2px 6px rgba(0,0,0,0.2)" }}
              >
                <Pencil size={20} color="#198754" />
              </div>
              <input
                id="uploadPhoto"
                type="file"
                accept="image/*"
                className="d-none"
                onChange={handlePhotoChange}
              />
            </label>
          </div>
          <div>
            <h4 className="fw-bold text-success mb-0">{form.fullName || "👋 Hello, Aspirant"}</h4>
            <small className="text-muted">{user?.phoneNumber || "Your registered phone number"}</small>
            <div className="text-muted small mt-1">Click the avatar to upload your own</div>
          </div>
        </div>

        {/* Form Section */}
        <form>
          <h5 className="text-success fw-bold mt-4">👤 Personal Info</h5>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Full Name</label>
              <input type="text" name="fullName" className="form-control" value={form.fullName} onChange={handleChange} />
            </div>
            <div className="col-md-3">
              <label className="form-label">Gender</label>
              <select name="gender" className="form-select" value={form.gender} onChange={handleChange}>
                <option value="">Select</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Date of Birth</label>
              <input type="date" name="dob" className="form-control" value={form.dob} onChange={handleChange} />
            </div>
          </div>

          <h5 className="text-success fw-bold mt-4">📍 Address</h5>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">City</label>
              <input type="text" name="city" className="form-control" value={form.city} onChange={handleChange} />
            </div>
            <div className="col-md-4">
              <label className="form-label">District</label>
              <input type="text" name="district" className="form-control" value={form.district} onChange={handleChange} />
            </div>
            <div className="col-md-3">
              <label className="form-label">State</label>
              <input type="text" name="state" className="form-control" value={form.state} onChange={handleChange} />
            </div>
            <div className="col-md-1">
              <label className="form-label">PIN</label>
              <input type="text" name="pincode" className="form-control" value={form.pincode} onChange={handleChange} />
            </div>
          </div>

          <h5 className="text-success fw-bold mt-4">🎓 Exam & Education</h5>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Exam</label>
              <select name="exam" className="form-select" value={form.exam} onChange={handleChange}>
                <option value="">Select Exam</option>
                <option>UPSC CSE</option>
                <option>UPPSC PCS</option>
                <option>SSC CGL</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Attempt Year</label>
              <input type="text" name="attemptYear" className="form-control" value={form.attemptYear} onChange={handleChange} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Medium</label>
              <select name="medium" className="form-select" value={form.medium} onChange={handleChange}>
                <option value="">Select Medium</option>
                <option>English</option>
                <option>Hindi</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Qualification</label>
              <select name="qualification" className="form-select" value={form.qualification} onChange={handleChange}>
                <option value="">Select Qualification</option>
                <option>Graduation</option>
                <option>Post-Graduation</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Discipline</label>
              <input type="text" name="discipline" className="form-control" value={form.discipline} onChange={handleChange} />
            </div>
            <div className="col-md-4">
              <label className="form-label">College</label>
              <input type="text" name="college" className="form-control" value={form.college} onChange={handleChange} />
            </div>
          </div>

          <h5 className="text-success fw-bold mt-4">🏫 Coaching</h5>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Enrolled in Coaching?</label>
              <select name="coaching" className="form-select" value={form.coaching} onChange={handleChange}>
                <option value="">Select</option>
                <option>Yes</option>
                <option>No</option>
              </select>
            </div>
            {form.coaching === "Yes" && (
              <div className="col-md-8">
                <label className="form-label">Coaching Name</label>
                <input type="text" name="coachingName" className="form-control" value={form.coachingName} onChange={handleChange} />
              </div>
            )}
          </div>

          <div className="text-center">
            <button type="button" className="btn btn-success mt-4 px-5 py-2" onClick={handleSubmit}>
              ✅ Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
