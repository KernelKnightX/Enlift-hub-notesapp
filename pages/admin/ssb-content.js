import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

import { useAuth } from "../../contexts/AuthContext";
import { db, storage } from "../../firebase/config";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  getDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

function SSBContentAdmin() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ppdt");

  // Content state
  const [ppdtPictures, setPpdtPictures] = useState([]);
  const [tatPictures, setTatPictures] = useState([]);
  const [watWords, setWatWords] = useState([]);
  const [srtSituations, setSrtSituations] = useState([]);

  // Upload state
  const [uploading, setUploading] = useState(false);

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
          if (!cancelled) router.push("/student-desk/dashboard");
          return;
        }

        if (!cancelled) loadContent();
      } catch (e) {
        console.error("Admin check error:", e);
        if (!cancelled) router.push("/student-desk/dashboard");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, router]);

  const loadContent = async () => {
    try {
      setLoading(true);

      // Load PPDT Pictures
      const ppdtQuery = query(collection(db, "ssb_ppdt_pictures"), orderBy("createdAt", "desc"));
      const ppdtSnap = await getDocs(ppdtQuery);
      setPpdtPictures(ppdtSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Load TAT Pictures
      const tatQuery = query(collection(db, "ssb_tat_pictures"), orderBy("createdAt", "desc"));
      const tatSnap = await getDocs(tatQuery);
      setTatPictures(tatSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Load WAT Words
      const watQuery = query(collection(db, "ssb_wat_words"), orderBy("createdAt", "desc"));
      const watSnap = await getDocs(watQuery);
      setWatWords(watSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Load SRT Situations
      const srtQuery = query(collection(db, "ssb_srt_situations"), orderBy("createdAt", "desc"));
      const srtSnap = await getDocs(srtQuery);
      setSrtSituations(srtSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

    } catch (error) {
      console.error("Error loading content:", error);
      toast.error("Failed to load content");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (files, collectionName, setState) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadPromises = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileName = `${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `ssb/${collectionName}/${fileName}`);

      try {
        // Upload file to storage
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);

        // Save metadata to Firestore
        const docData = {
          fileName: file.name,
          url: downloadURL,
          storagePath: `ssb/${collectionName}/${fileName}`,
          createdAt: new Date(),
          uploadedBy: user.uid,
        };

        // Add specific fields based on collection
        if (collectionName === "ppdt_pictures") {
          docData.title = `PPDT Picture ${ppdtPictures.length + i + 1}`;
        } else if (collectionName === "tat_pictures") {
          docData.title = `TAT Picture ${tatPictures.length + i + 1}`;
        }

        const docRef = await addDoc(collection(db, `ssb_${collectionName}`), docData);
        uploadPromises.push({ id: docRef.id, ...docData });

      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    // Update state with new items
    if (uploadPromises.length > 0) {
      setState(prev => [...uploadPromises, ...prev]);
      toast.success(`Successfully uploaded ${uploadPromises.length} item(s)`);
    }

    setUploading(false);
  };

  const handleTextUpload = async (text, collectionName, setState, fieldName) => {
    if (!text || text.trim() === "") return;

    try {
      const docData = {
        [fieldName]: text.trim(),
        createdAt: new Date(),
        uploadedBy: user.uid,
      };

      const docRef = await addDoc(collection(db, `ssb_${collectionName}`), docData);
      setState(prev => [{ id: docRef.id, ...docData }, ...prev]);
      toast.success("Content added successfully");
    } catch (error) {
      console.error("Error adding content:", error);
      toast.error("Failed to add content");
    }
  };

  const handleDelete = async (item, collectionName, setState) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      // Delete from Firestore
      await deleteDoc(doc(db, `ssb_${collectionName}`, item.id));

      // Delete from Storage if it's a file
      if (item.storagePath) {
        const storageRef = ref(storage, item.storagePath);
        await deleteObject(storageRef);
      }

      // Update state
      setState(prev => prev.filter(i => i.id !== item.id));
      toast.success("Item deleted successfully");
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item");
    }
  };

  const handleCSVUpload = async (file, collectionName, setState, fieldName) => {
    if (!file) return;

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const items = [];

      // Skip header row and process data
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
          const docData = {
            [fieldName]: line,
            createdAt: new Date(),
            uploadedBy: user.uid,
          };

          const docRef = await addDoc(collection(db, `ssb_${collectionName}`), docData);
          items.push({ id: docRef.id, ...docData });
        }
      }

      if (items.length > 0) {
        setState(prev => [...items, ...prev]);
        toast.success(`Successfully imported ${items.length} ${fieldName}s from CSV!`);
      } else {
        toast.error('No valid data found in CSV file.');
      }
    } catch (error) {
      console.error('CSV upload error:', error);
      toast.error('Error reading CSV file: ' + error.message);
    }
  };

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
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: "#f8f9fa" }}>
        <div className="text-center">
          <div className="spinner-border text-success" role="status" style={{ width: '3rem', height: '3rem' }} />
          <div className="mt-3 text-muted fw-semibold">Loading Admin Panel...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-3 px-2 px-md-4" style={{ background: "#f8f9fa", minHeight: "100vh" }}>
      {/* Header */}
      <div className="card shadow-sm border-0 mb-3" style={{ background: "white" }}>
        <div className="card-body p-2 p-md-3">
          <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2 gap-sm-3">
            <div className="flex-grow-1">
              <h1 className="h6 h5-md mb-1 mb-2 fw-bold" style={{ color: "#2d3748" }}>
                🎯 SSB Content Management
              </h1>
              <div className="d-flex flex-wrap align-items-center gap-1 gap-sm-2 small">
                <span className="badge badge-sm" style={{ background: "#8b5cf6", color: "white" }}>Admin Panel</span>
                <span className="d-none d-md-inline text-muted">•</span>
                <span className="text-success">Manage SSB Test Content</span>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2 mt-2 mt-sm-0">
              <button
                className="btn btn-sm fw-semibold d-flex align-items-center gap-1"
                style={{
                  background: "#ef4444",
                  color: "white",
                  border: "none",
                  padding: "6px 12px",
                  fontSize: "0.875rem"
                }}
                onClick={handleLogout}
              >
                <span>🚪</span>
                <span className="d-none d-sm-inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Overview */}
      <div className="row g-2 g-lg-3 mb-3">
        <div className="col-6 col-sm-3">
          <div className="card h-100 border-0 shadow-sm" style={{ background: "white" }}>
            <div className="card-body p-2 p-md-3 text-center">
              <div className="fs-3 fs-md-2 mb-1 mb-2">🖼️</div>
              <div className="h6 h5-md fw-bold text-primary mb-1">{ppdtPictures.length}</div>
              <div className="small text-muted">PPDT Pictures</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-sm-3">
          <div className="card h-100 border-0 shadow-sm" style={{ background: "white" }}>
            <div className="card-body p-2 p-md-3 text-center">
              <div className="fs-3 fs-md-2 mb-1 mb-2">🎭</div>
              <div className="h6 h5-md fw-bold text-success mb-1">{tatPictures.length}</div>
              <div className="small text-muted">TAT Pictures</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-sm-3">
          <div className="card h-100 border-0 shadow-sm" style={{ background: "white" }}>
            <div className="card-body p-2 p-md-3 text-center">
              <div className="fs-3 fs-md-2 mb-1 mb-2">📝</div>
              <div className="h6 h5-md fw-bold text-warning mb-1">{watWords.length}</div>
              <div className="small text-muted">WAT Words</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-sm-3">
          <div className="card h-100 border-0 shadow-sm" style={{ background: "white" }}>
            <div className="card-body p-2 p-md-3 text-center">
              <div className="fs-3 fs-md-2 mb-1 mb-2">💭</div>
              <div className="h6 h5-md fw-bold text-info mb-1">{srtSituations.length}</div>
              <div className="small text-muted">SRT Situations</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card shadow-sm border-0 mb-3">
        <div className="card-header bg-white border-0 p-2 p-md-3">
          <ul className="nav nav-tabs border-0 flex-column flex-sm-row">
            <li className="nav-item flex-fill">
              <button
                className={`nav-link w-100 ${activeTab === 'ppdt' ? 'active' : ''} border-0 text-start text-sm-center`}
                onClick={() => setActiveTab('ppdt')}
              >
                <span className="d-inline d-sm-none">🖼️ PPDT ({ppdtPictures.length})</span>
                <span className="d-none d-sm-inline">🖼️ PPDT Pictures ({ppdtPictures.length})</span>
              </button>
            </li>
            <li className="nav-item flex-fill">
              <button
                className={`nav-link w-100 ${activeTab === 'tat' ? 'active' : ''} border-0 text-start text-sm-center`}
                onClick={() => setActiveTab('tat')}
              >
                <span className="d-inline d-sm-none">🎭 TAT ({tatPictures.length})</span>
                <span className="d-none d-sm-inline">🎭 TAT Pictures ({tatPictures.length})</span>
              </button>
            </li>
            <li className="nav-item flex-fill">
              <button
                className={`nav-link w-100 ${activeTab === 'wat' ? 'active' : ''} border-0 text-start text-sm-center`}
                onClick={() => setActiveTab('wat')}
              >
                <span className="d-inline d-sm-none">📝 WAT ({watWords.length})</span>
                <span className="d-none d-sm-inline">📝 WAT Words ({watWords.length})</span>
              </button>
            </li>
            <li className="nav-item flex-fill">
              <button
                className={`nav-link w-100 ${activeTab === 'srt' ? 'active' : ''} border-0 text-start text-sm-center`}
                onClick={() => setActiveTab('srt')}
              >
                <span className="d-inline d-sm-none">💭 SRT ({srtSituations.length})</span>
                <span className="d-none d-sm-inline">💭 SRT Situations ({srtSituations.length})</span>
              </button>
            </li>
          </ul>
        </div>

        <div className="card-body">
          {/* PPDT Pictures Tab */}
          {activeTab === 'ppdt' && (
            <ContentManager
              title="PPDT Pictures"
              items={ppdtPictures}
              onUpload={(files) => handleFileUpload(files, 'ppdt_pictures', setPpdtPictures)}
              onDelete={(item) => handleDelete(item, 'ppdt_pictures', setPpdtPictures)}
              uploading={uploading}
              accept="image/*"
              multiple={true}
              itemType="picture"
            />
          )}

          {/* TAT Pictures Tab */}
          {activeTab === 'tat' && (
            <ContentManager
              title="TAT Pictures"
              items={tatPictures}
              onUpload={(files) => handleFileUpload(files, 'tat_pictures', setTatPictures)}
              onDelete={(item) => handleDelete(item, 'tat_pictures', setTatPictures)}
              uploading={uploading}
              accept="image/*"
              multiple={true}
              itemType="picture"
            />
          )}

          {/* WAT Words Tab */}
          {activeTab === 'wat' && (
            <TextContentManager
              title="WAT Words"
              items={watWords}
              onAdd={(text) => handleTextUpload(text, 'wat_words', setWatWords, 'word')}
              onDelete={(item) => handleDelete(item, 'wat_words', setWatWords)}
              onCSVUpload={(file) => handleCSVUpload(file, 'wat_words', setWatWords, 'word')}
              placeholder="Enter a word for WAT test..."
              itemType="word"
              csvFormat="Word"
            />
          )}

          {/* SRT Situations Tab */}
          {activeTab === 'srt' && (
            <TextContentManager
              title="SRT Situations"
              items={srtSituations}
              onAdd={(text) => handleTextUpload(text, 'srt_situations', setSrtSituations, 'situation')}
              onDelete={(item) => handleDelete(item, 'srt_situations', setSrtSituations)}
              onCSVUpload={(file) => handleCSVUpload(file, 'srt_situations', setSrtSituations, 'situation')}
              placeholder="Enter a situation for SRT test..."
              itemType="situation"
              csvFormat="Situation"
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------- Child Components --------------------------- */

function ContentManager({ title, items, onUpload, onDelete, uploading, accept, multiple, itemType }) {
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileSelect = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const handleUpload = () => {
    if (selectedFiles.length > 0) {
      onUpload(selectedFiles);
      setSelectedFiles([]);
    }
  };

  return (
    <div>
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-3 gap-2">
        <h5 className="mb-0 h6 h5-sm">{title}</h5>
        <span className="badge bg-primary">{items.length} items</span>
      </div>

      {/* Upload Section */}
      <div className="card border-dashed mb-4" style={{ border: '2px dashed #dee2e6' }}>
        <div className="card-body text-center py-3 py-md-4">
          <div className="mb-3">
            <input
              type="file"
              accept={accept}
              multiple={multiple}
              onChange={handleFileSelect}
              className="form-control form-control-sm"
              disabled={uploading}
            />
          </div>
          {selectedFiles.length > 0 && (
            <div className="mb-3">
              <small className="text-muted">
                {selectedFiles.length} file(s) selected
              </small>
            </div>
          )}
          <button
            className="btn btn-primary btn-sm"
            onClick={handleUpload}
            disabled={uploading || selectedFiles.length === 0}
          >
            {uploading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Uploading...
              </>
            ) : (
              <>📤 Upload {itemType}(s)</>
            )}
          </button>
        </div>
      </div>

      {/* Items List */}
      <div className="row g-2 g-md-3">
        {items.map((item) => (
          <div key={item.id} className="col-12 col-sm-6 col-lg-4">
            <div className="card h-100">
              <div className="card-body p-2 p-md-3">
                {item.url && (
                  <img
                    src={item.url}
                    alt={item.title || item.fileName}
                    className="img-fluid rounded mb-2"
                    style={{ height: '120px', objectFit: 'cover', width: '100%' }}
                  />
                )}
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1 min-w-0">
                    <h6 className="mb-1 text-truncate">{item.title || item.fileName}</h6>
                    <small className="text-muted">
                      {item.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown date'}
                    </small>
                  </div>
                  <button
                    className="btn btn-sm btn-outline-danger ms-2 flex-shrink-0"
                    onClick={() => onDelete(item)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-5 text-muted">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
          <p>No {itemType}s uploaded yet</p>
        </div>
      )}
    </div>
  );
}

function TextContentManager({ title, items, onAdd, onDelete, onCSVUpload, placeholder, itemType, csvFormat }) {
  const [text, setText] = useState('');

  const handleAdd = () => {
    if (text.trim()) {
      onAdd(text);
      setText('');
    }
  };

  const handleCSVFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith('.csv')) {
      onCSVUpload(file);
      e.target.value = '';
    } else {
      alert('Please select a valid CSV file');
    }
  };

  return (
    <div>
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-3 gap-2">
        <h5 className="mb-0 h6 h5-sm">{title}</h5>
        <span className="badge bg-primary">{items.length} items</span>
      </div>

      {/* Add Section */}
      <div className="card border-dashed mb-4" style={{ border: '2px dashed #dee2e6' }}>
        <div className="card-body py-3 py-md-4">
          <div className="mb-3">
            <textarea
              className="form-control form-control-sm"
              rows="3"
              placeholder={placeholder}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
          <div className="d-flex flex-column flex-sm-row gap-2">
            <button
              className="btn btn-primary btn-sm"
              onClick={handleAdd}
              disabled={!text.trim()}
            >
              ➕ Add {itemType}
            </button>
            <div className="d-flex align-items-center gap-2">
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVFileSelect}
                style={{ display: 'none' }}
                id={`csv-upload-${itemType}`}
              />
              <label
                htmlFor={`csv-upload-${itemType}`}
                className="btn btn-outline-success btn-sm mb-0"
                style={{ cursor: 'pointer' }}
              >
                📄 Upload CSV
              </label>
            </div>
          </div>
          <div className="mt-2">
            <small className="text-muted">
              CSV format: Single column with header "{csvFormat}"
            </small>
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="row g-2 g-md-3">
        {items.map((item) => (
          <div key={item.id} className="col-12">
            <div className="card">
              <div className="card-body p-2 p-md-3">
                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start gap-2">
                  <div className="flex-grow-1 min-w-0">
                    <p className="mb-1 text-break">{item[itemType]}</p>
                    <small className="text-muted">
                      {item.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown date'}
                    </small>
                  </div>
                  <button
                    className="btn btn-sm btn-outline-danger flex-shrink-0 align-self-start"
                    onClick={() => onDelete(item)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-5 text-muted">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
          <p>No {itemType}s added yet</p>
        </div>
      )}
    </div>
  );
}

export default SSBContentAdmin;