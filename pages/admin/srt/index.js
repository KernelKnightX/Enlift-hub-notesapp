// pages/admin/srt/index.jsx
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import Papa from "papaparse";

import { useAuth } from "../../../contexts/AuthContext";

import { db } from "../../../firebase/config";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";

function SRTAdmin() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [srtQuestions, setSrtQuestions] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

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

  /* ------------------------- Load SRT Questions ------------------------- */
  useEffect(() => {
    if (!isAdmin) return;

    const qRef = query(
      collection(db, "srtQuestions"),
      orderBy("order", "asc")
    );

    const unsub = onSnapshot(qRef, (snap) => {
      const questions = [];
      snap.forEach((d) => {
        questions.push({
          id: d.id,
          ...d.data(),
        });
      });
      setSrtQuestions(questions);
    });

    return () => unsub();
  }, [isAdmin]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        toast.error("Please select a CSV file.");
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error("File size must be less than 10MB.");
        return;
      }
      setSelectedFile(file);

      // Parse CSV
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            toast.error("Error parsing CSV file. Please check the format.");
            console.error("CSV parsing errors:", results.errors);
            return;
          }

          const validData = results.data.filter(row =>
            row.question && row.question.trim() !== ''
          );

          if (validData.length === 0) {
            toast.error("No valid questions found in CSV. Please ensure 'question' column exists.");
            return;
          }

          setCsvData(validData);
          setShowPreview(true);
          toast.success(`Parsed ${validData.length} questions from CSV.`);
        },
        error: (error) => {
          toast.error("Failed to parse CSV file.");
          console.error("CSV parsing error:", error);
        }
      });
    }
  };

  const handleUpload = async () => {
    if (csvData.length === 0) {
      toast.error("No data to upload. Please select a valid CSV file.");
      return;
    }

    setUploading(true);
    try {
      const batch = writeBatch(db);
      const questionsRef = collection(db, "srtQuestions");

      // Get current max order
      const currentMaxOrder = srtQuestions.length > 0
        ? Math.max(...srtQuestions.map(q => q.order || 0))
        : 0;

      csvData.forEach((row, index) => {
        const docRef = doc(questionsRef);
        batch.set(docRef, {
          question: row.question.trim(),
          order: currentMaxOrder + index + 1,
          isActive: true,
          uploadedBy: user.uid,
          uploadedAt: serverTimestamp(),
        });
      });

      await batch.commit();

      toast.success(`Successfully uploaded ${csvData.length} SRT questions!`);
      setSelectedFile(null);
      setCsvData([]);
      setShowPreview(false);
      // Reset file input
      const fileInput = document.getElementById('srtFileInput');
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload questions. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleToggleActive = async (questionId, currentStatus) => {
    try {
      await updateDoc(doc(db, "srtQuestions", questionId), {
        isActive: !currentStatus,
        updatedAt: serverTimestamp(),
      });
      toast.success(`Question ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
    } catch (error) {
      console.error("Toggle error:", error);
      toast.error("Failed to update question status.");
    }
  };

  const handleDelete = async (questionId) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;

    try {
      await deleteDoc(doc(db, "srtQuestions", questionId));
      toast.success("Question deleted successfully!");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete question.");
    }
  };

  const handleReorder = async (questionId, direction) => {
    const currentQuestion = srtQuestions.find(q => q.id === questionId);
    if (!currentQuestion) return;

    const newOrder = direction === 'up' ? currentQuestion.order - 1 : currentQuestion.order + 1;
    if (newOrder < 1 || newOrder > srtQuestions.length) return;

    const swapQuestion = srtQuestions.find(q => q.order === newOrder);
    if (!swapQuestion) return;

    try {
      // Swap orders
      await updateDoc(doc(db, "srtQuestions", currentQuestion.id), {
        order: newOrder,
        updatedAt: serverTimestamp(),
      });
      await updateDoc(doc(db, "srtQuestions", swapQuestion.id), {
        order: currentQuestion.order,
        updatedAt: serverTimestamp(),
      });
      toast.success("Order updated successfully!");
    } catch (error) {
      console.error("Reorder error:", error);
      toast.error("Failed to reorder questions.");
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

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: "#f8f9fa" }}>
        <div className="text-center">
          <div className="spinner-border text-success" role="status" style={{ width: '3rem', height: '3rem' }} />
          <div className="mt-3 text-muted fw-semibold">Loading SRT Admin...</div>
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
                💭 SRT Question Management
              </h1>
              <div className="d-flex flex-wrap align-items-center gap-2 small">
                <span className="badge bg-danger text-white">Administrator</span>
                <span className="d-none d-sm-inline text-muted">•</span>
                <span style={{ color: "#10b981" }}>Total Questions: {srtQuestions.length}</span>
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

      {/* Upload Section */}
      <div className="card shadow-sm border-0 mb-3" style={{ background: "white" }}>
        <div className="card-body p-4">
          <h5 className="fw-bold mb-4" style={{ color: "#2d3748" }}>📤 Upload SRT Questions (CSV)</h5>
          <div className="row g-3 align-items-end">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Select CSV File</label>
              <input
                type="file"
                className="form-control"
                id="srtFileInput"
                accept=".csv"
                onChange={handleFileSelect}
                disabled={uploading}
              />
              <div className="form-text">
                CSV should have a 'question' column. Max size: 10MB
              </div>
            </div>
            <div className="col-md-6">
              <button
                className="btn btn-success btn-lg px-4"
                onClick={handleUpload}
                disabled={!selectedFile || csvData.length === 0 || uploading}
              >
                {uploading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <span>📤</span> Upload Questions
                  </>
                )}
              </button>
            </div>
          </div>

          {/* CSV Format Example */}
          <div className="mt-4 p-3 bg-light rounded">
            <h6 className="fw-bold mb-2">📋 CSV Format Example:</h6>
            <pre className="mb-0 small text-muted">
{`question
You see a person drowning in a river. What would you do?
Your friend is caught cheating in exam. How do you react?
You find a wallet with money on the street. What action do you take?`}
            </pre>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && csvData.length > 0 && (
        <div className="card shadow-sm border-0 mb-3" style={{ background: "white" }}>
          <div className="card-header bg-info text-white">
            <h5 className="mb-0 fw-bold">👁️ Preview - {csvData.length} Questions</h5>
          </div>
          <div className="card-body" style={{ maxHeight: "300px", overflowY: "auto" }}>
            <div className="row g-2">
              {csvData.slice(0, 10).map((row, index) => (
                <div key={index} className="col-12">
                  <div className="p-2 border rounded">
                    <strong>{index + 1}.</strong> {row.question}
                  </div>
                </div>
              ))}
              {csvData.length > 10 && (
                <div className="col-12 text-center text-muted">
                  ... and {csvData.length - 10} more questions
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Questions List */}
      <div className="card shadow-sm border-0" style={{ background: "white" }}>
        <div className="card-header bg-warning text-dark">
          <h5 className="mb-0 fw-bold">📝 SRT Questions ({srtQuestions.length})</h5>
        </div>
        <div className="card-body p-0">
          {srtQuestions.length === 0 ? (
            <div className="text-center py-5">
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💭</div>
              <h5 className="text-muted">No SRT questions uploaded yet</h5>
              <p className="text-muted">Upload a CSV file to get started</p>
            </div>
          ) : (
            <div className="list-group list-group-flush">
              {srtQuestions.map((question, index) => (
                <div key={question.id} className="list-group-item p-3">
                  <div className="row align-items-center g-3">
                    <div className="col-auto">
                      <span className="badge bg-secondary fs-6 px-3 py-2">
                        #{question.order}
                      </span>
                    </div>
                    <div className="col">
                      <div className="fw-semibold mb-1" style={{ color: "#2d3748" }}>
                        {question.question}
                      </div>
                      <div className="small text-muted">
                        Uploaded: {question.uploadedAt?.toDate?.().toLocaleDateString() || 'Unknown'}
                        {question.isActive ? (
                          <span className="badge bg-success ms-2">Active</span>
                        ) : (
                          <span className="badge bg-danger ms-2">Inactive</span>
                        )}
                      </div>
                    </div>
                    <div className="col-auto">
                      <div className="d-flex gap-2">
                        <button
                          className={`btn btn-sm ${question.isActive ? 'btn-warning' : 'btn-success'}`}
                          onClick={() => handleToggleActive(question.id, question.isActive)}
                        >
                          {question.isActive ? '🚫 Deactivate' : '✅ Activate'}
                        </button>
                        <div className="btn-group-vertical btn-group-sm">
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => handleReorder(question.id, 'up')}
                            disabled={question.order === 1}
                            title="Move Up"
                          >
                            ↑
                          </button>
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => handleReorder(question.id, 'down')}
                            disabled={question.order === srtQuestions.length}
                            title="Move Down"
                          >
                            ↓
                          </button>
                        </div>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(question.id)}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SRTAdmin;