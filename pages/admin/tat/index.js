// pages/admin/tat/index.jsx
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

import { useAuth } from "../../../contexts/AuthContext";

import { db, storage } from "../../../firebase/config";
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
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

function TATAdmin() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tatImages, setTatImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

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

  /* ------------------------- Load TAT Images ------------------------- */
  useEffect(() => {
    if (!isAdmin) return;

    const qRef = query(
      collection(db, "tatImages"),
      orderBy("order", "asc")
    );

    const unsub = onSnapshot(qRef, (snap) => {
      const images = [];
      snap.forEach((d) => {
        images.push({
          id: d.id,
          ...d.data(),
        });
      });
      setTatImages(images);
    });

    return () => unsub();
  }, [isAdmin]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("File size must be less than 5MB.");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first.");
      return;
    }

    setUploading(true);
    try {
      // Create storage reference
      const storageRef = ref(storage, `tat-images/${Date.now()}_${selectedFile.name}`);

      // Upload file
      const snapshot = await uploadBytes(storageRef, selectedFile);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Save to Firestore
      const nextOrder = tatImages.length + 1;
      await addDoc(collection(db, "tatImages"), {
        imageUrl: downloadURL,
        fileName: selectedFile.name,
        order: nextOrder,
        isActive: true,
        uploadedBy: user.uid,
        uploadedAt: serverTimestamp(),
      });

      toast.success("TAT image uploaded successfully!");
      setSelectedFile(null);
      // Reset file input
      const fileInput = document.getElementById('tatFileInput');
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleToggleActive = async (imageId, currentStatus) => {
    try {
      await updateDoc(doc(db, "tatImages", imageId), {
        isActive: !currentStatus,
        updatedAt: serverTimestamp(),
      });
      toast.success(`Image ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
    } catch (error) {
      console.error("Toggle error:", error);
      toast.error("Failed to update image status.");
    }
  };

  const handleDelete = async (imageId, imageUrl) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;

    try {
      // Delete from Storage
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);

      // Delete from Firestore
      await deleteDoc(doc(db, "tatImages", imageId));

      toast.success("Image deleted successfully!");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete image.");
    }
  };

  const handleReorder = async (imageId, direction) => {
    const currentImage = tatImages.find(img => img.id === imageId);
    if (!currentImage) return;

    const newOrder = direction === 'up' ? currentImage.order - 1 : currentImage.order + 1;
    if (newOrder < 1 || newOrder > tatImages.length) return;

    const swapImage = tatImages.find(img => img.order === newOrder);
    if (!swapImage) return;

    try {
      // Swap orders
      await updateDoc(doc(db, "tatImages", currentImage.id), {
        order: newOrder,
        updatedAt: serverTimestamp(),
      });
      await updateDoc(doc(db, "tatImages", swapImage.id), {
        order: currentImage.order,
        updatedAt: serverTimestamp(),
      });
      toast.success("Order updated successfully!");
    } catch (error) {
      console.error("Reorder error:", error);
      toast.error("Failed to reorder images.");
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
          <div className="mt-3 text-muted fw-semibold">Loading TAT Admin...</div>
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
                🎭 TAT Image Management
              </h1>
              <div className="d-flex flex-wrap align-items-center gap-2 small">
                <span className="badge bg-danger text-white">Administrator</span>
                <span className="d-none d-sm-inline text-muted">•</span>
                <span style={{ color: "#10b981" }}>Total Images: {tatImages.length}</span>
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
          <h5 className="fw-bold mb-4" style={{ color: "#2d3748" }}>📤 Upload New TAT Image</h5>
          <div className="row g-3 align-items-end">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Select Image File</label>
              <input
                type="file"
                className="form-control"
                id="tatFileInput"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={uploading}
              />
              <div className="form-text">
                Supported formats: JPG, PNG, GIF. Max size: 5MB
              </div>
            </div>
            <div className="col-md-6">
              <button
                className="btn btn-success btn-lg px-4"
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
              >
                {uploading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <span>📤</span> Upload Image
                  </>
                )}
              </button>
            </div>
          </div>
          {selectedFile && (
            <div className="mt-3 p-3 bg-light rounded">
              <strong>Selected File:</strong> {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </div>
          )}
        </div>
      </div>

      {/* Images List */}
      <div className="card shadow-sm border-0" style={{ background: "white" }}>
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0 fw-bold">🖼️ TAT Images ({tatImages.length})</h5>
        </div>
        <div className="card-body p-0">
          {tatImages.length === 0 ? (
            <div className="text-center py-5">
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎭</div>
              <h5 className="text-muted">No TAT images uploaded yet</h5>
              <p className="text-muted">Upload your first TAT image to get started</p>
            </div>
          ) : (
            <div className="row g-0">
              {tatImages.map((image, index) => (
                <div key={image.id} className="col-12 border-bottom">
                  <div className="p-3">
                    <div className="row align-items-center g-3">
                      <div className="col-auto">
                        <span className="badge bg-secondary fs-6 px-3 py-2">
                          #{image.order}
                        </span>
                      </div>
                      <div className="col-md-3">
                        <img
                          src={image.imageUrl}
                          alt={`TAT ${image.order}`}
                          className="img-fluid rounded shadow-sm"
                          style={{ maxHeight: '100px', width: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <div className="col-md-4">
                        <div className="fw-semibold" style={{ color: "#2d3748" }}>
                          {image.fileName}
                        </div>
                        <div className="small text-muted">
                          Uploaded: {image.uploadedAt?.toDate?.().toLocaleDateString() || 'Unknown'}
                        </div>
                        <div className={`small ${image.isActive ? 'text-success' : 'text-danger'}`}>
                          Status: {image.isActive ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="d-flex gap-2">
                          <button
                            className={`btn btn-sm ${image.isActive ? 'btn-warning' : 'btn-success'}`}
                            onClick={() => handleToggleActive(image.id, image.isActive)}
                          >
                            {image.isActive ? '🚫 Deactivate' : '✅ Activate'}
                          </button>
                          <div className="btn-group-vertical btn-group-sm">
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => handleReorder(image.id, 'up')}
                              disabled={image.order === 1}
                              title="Move Up"
                            >
                              ↑
                            </button>
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => handleReorder(image.id, 'down')}
                              disabled={image.order === tatImages.length}
                              title="Move Down"
                            >
                              ↓
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-2">
                        <button
                          className="btn btn-danger btn-sm w-100"
                          onClick={() => handleDelete(image.id, image.imageUrl)}
                        >
                          🗑️ Delete
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

export default TATAdmin;