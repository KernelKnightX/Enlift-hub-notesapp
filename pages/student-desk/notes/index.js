import React, { useState, useEffect, useRef } from 'react';
import { db, storage } from '../../../firebase/config';
import { onAuthStateChanged, getAuth } from 'firebase/auth';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { getDownloadURL, ref as storageRef } from 'firebase/storage';
import { useRouter } from 'next/router';

import SimplePdfViewer from '../../../components/notes/SimplePdfViewer';

const UPSCNotesModule = () => {
  const auth = getAuth();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [subjects, setSubjects] = useState([]);
  const [expandedSubjects, setExpandedSubjects] = useState({});
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedPDF, setSelectedPDF] = useState(null);

  const [notes, setNotes] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const notesRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email,
        });
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Subjects + PDFs listener
  useEffect(() => {
    if (!user) return;

    const subjectUnsub = onSnapshot(
      collection(db, 'subjects'),
      (snap) => {
        try {
          const base = snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
            pdfs: [],
          }));

          setSubjects(base);

          // Listen to PDFs for each subject
          base.forEach((subj) => {
            const pdfsCol = collection(db, 'subjects', subj.id, 'pdfs');
            onSnapshot(
              pdfsCol,
              (pdfSnap) => {
                try {
                  const pdfs = pdfSnap.docs.map((p) => ({
                    id: p.id,
                    ...p.data(),
                  }));
                  setSubjects((prev) =>
                    prev.map((s) => (s.id === subj.id ? { ...s, pdfs } : s))
                  );
                } catch (error) {
                  console.error('Error processing PDFs for subject', subj.id, ':', error);
                }
              },
              (error) => {
                console.error('Error listening to PDFs for subject', subj.id, ':', error);
              }
            );
          });
        } catch (error) {
          console.error('Error processing subjects:', error);
        }
      },
      (error) => {
        console.error('Error listening to subjects:', error);
      }
    );

    return () => subjectUnsub && subjectUnsub();
  }, [user]);

  // Handle notes change
  const handleNotesChange = (e) => {
    const value = e.target.value;
    setNotes(value);
    
    setIsTyping(true);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      const words = value.split(/\s+/).filter(Boolean).length;
      const chars = value.length;
      setWordCount(words);
      setCharCount(chars);
      setIsTyping(false);
    }, 300);
  };

  // Load notes for subject + PDF
  const loadNotes = async (subject, pdf) => {
    try {
      const noteId = `${auth.currentUser.uid}_${subject.id}_${pdf.id}`;
      const noteDoc = await getDoc(doc(db, 'notes', noteId));
      if (noteDoc.exists()) {
        const content = noteDoc.data().content || '';
        setNotes(content);
        setWordCount(content.split(/\s+/).filter(Boolean).length);
        setCharCount(content.length);
      } else {
        setNotes('');
        setWordCount(0);
        setCharCount(0);
      }
    } catch (err) {
      console.error('Error loading notes:', err);
    }
  };

  // Save notes
  const saveNotes = async () => {
    if (!selectedSubject || !selectedPDF) {
      setSaveStatus('⚠️ Select a PDF first');
      return;
    }

    try {
      setSaveStatus('⏳ Saving...');
      const noteId = `${auth.currentUser.uid}_${selectedSubject.id}_${selectedPDF.id}`;
      await setDoc(
        doc(db, 'notes', noteId),
        {
          userId: auth.currentUser.uid,
          subjectId: selectedSubject.id,
          pdfId: selectedPDF.id,
          content: notes,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      setSaveStatus('✅ Saved!');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (err) {
      console.error(err);
      setSaveStatus('❌ Failed to save');
    }
  };

  // Handle PDF selection
  const handlePDFClick = async (subject, pdf) => {
    try {
      setSelectedSubject(subject);

      let finalUrl = pdf.url;

      // If no direct URL, try to get it from storage path
      if (!finalUrl && pdf.storagePath) {
        try {
          finalUrl = await getDownloadURL(storageRef(storage, pdf.storagePath));
        } catch (storageError) {
          throw new Error(`Failed to get PDF download URL: ${storageError.message}`);
        }
      }

      if (!finalUrl) {
        throw new Error('No PDF URL available');
      }

      setSelectedPDF({ ...pdf, url: finalUrl });
      await loadNotes(subject, pdf);

    } catch (error) {
      console.error('❌ Error in handlePDFClick:', error);
      alert(`Failed to load PDF: ${error.message}\n\nIf this is a legacy PDF, it may need to be re-uploaded by an admin.`);
    }
  };

  // Auto-save
  useEffect(() => {
    if (notes && selectedSubject && selectedPDF && notes.length > 10) {
      const autoSaveTimer = setTimeout(() => {
        const noteId = `${auth.currentUser.uid}_${selectedSubject.id}_${selectedPDF.id}`;
        setDoc(
          doc(db, 'notes', noteId),
          {
            userId: auth.currentUser.uid,
            subjectId: selectedSubject.id,
            pdfId: selectedPDF.id,
            content: notes,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        ).catch(err => console.error('Auto-save error:', err));
      }, 5000);

      return () => clearTimeout(autoSaveTimer);
    }
  }, [notes, selectedSubject, selectedPDF]);

  // Toggle subject expansion
  const toggleSubject = (subjectId) => {
    setExpandedSubjects(prev => ({
      ...prev,
      [subjectId]: !prev[subjectId]
    }));
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="d-flex vh-100 justify-content-center align-items-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="d-flex vh-100 justify-content-center align-items-center bg-gradient">
        <div className="text-center">
          <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🎓</div>
          <h3 className="mb-4">UPSC Study Notes</h3>
          <button
            className="btn btn-primary btn-lg px-4"
            onClick={() => (window.location.href = '/login')}
          >
            Login to continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`d-flex vh-100 ${isDarkMode ? 'bg-dark text-light' : 'bg-light'}`}>
      
      {/* LEFT SIDEBAR - Subject Browser */}
      <div 
        className={`${isDarkMode ? 'bg-dark border-secondary' : 'bg-white'} border-end d-flex flex-column`}
        style={{ 
          width: sidebarCollapsed ? '60px' : '280px',
          transition: 'width 0.3s ease',
          minHeight: '100vh',
          overflowY: 'auto',
          overflowX: 'hidden'
        }}
      >
        {/* Sidebar Header */}
        <div className={`p-3 border-bottom ${isDarkMode ? 'border-secondary' : ''} d-flex align-items-center justify-content-between`}>
          {!sidebarCollapsed && (
            <div>
              <h6 className="mb-0 fw-bold">📚 Subjects</h6>
              <small className={isDarkMode ? 'text-light-emphasis' : 'text-muted'}>
                {subjects.length} available
              </small>
            </div>
          )}
          <button
            className={`btn btn-sm ${isDarkMode ? 'btn-outline-light' : 'btn-outline-secondary'} rounded-circle`}
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{ width: '32px', height: '32px', padding: '0' }}
            title={sidebarCollapsed ? 'Expand' : 'Collapse'}
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        {/* Subjects List */}
        <div className="flex-grow-1 overflow-auto p-2">
          {subjects.length === 0 ? (
            <div className="text-center p-4">
              <div style={{ fontSize: '2rem', opacity: 0.3 }}>📚</div>
              <small className={isDarkMode ? 'text-light-emphasis' : 'text-muted'}>
                No subjects found
              </small>
            </div>
          ) : (
            subjects.map((subject) => (
              <div key={subject.id} className="mb-2">
                <button
                  className={`btn w-100 text-start d-flex align-items-center justify-content-between ${
                    selectedSubject?.id === subject.id
                      ? 'btn-primary'
                      : isDarkMode
                      ? 'btn-outline-light'
                      : 'btn-outline-secondary'
                  }`}
                  onClick={() => toggleSubject(subject.id)}
                  style={{ 
                    whiteSpace: sidebarCollapsed ? 'nowrap' : 'normal',
                    overflow: 'hidden'
                  }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <span style={{ fontSize: '1.2rem' }}>
                      {subject.icon || '📖'}
                    </span>
                    {!sidebarCollapsed && (
                      <span className="fw-semibold">{subject.name}</span>
                    )}
                  </div>
                  {!sidebarCollapsed && (
                    <span style={{ fontSize: '0.8rem' }}>
                      {expandedSubjects[subject.id] ? '▼' : '▶'}
                    </span>
                  )}
                </button>

                {/* PDF List */}
                {expandedSubjects[subject.id] && !sidebarCollapsed && (
                  <div className="ms-3 mt-2">
                    {!subject.pdfs || subject.pdfs.length === 0 ? (
                      <small className={`d-block p-2 ${isDarkMode ? 'text-light-emphasis' : 'text-muted'}`}>
                        No PDFs available
                      </small>
                    ) : (
                      subject.pdfs.map((pdf) => (
                        <button
                          key={pdf.id}
                          className={`btn btn-sm w-100 text-start mb-1 ${
                            selectedPDF?.id === pdf.id
                              ? 'btn-success'
                              : isDarkMode 
                              ? 'btn-outline-secondary' 
                              : 'btn-outline-secondary'
                          }`}
                          onClick={() => handlePDFClick(subject, pdf)}
                        >
                          <span className="me-2">📄</span>
                          <span className="small">{pdf.name}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Sidebar Footer */}
        {!sidebarCollapsed && (
          <div className={`p-3 border-top ${isDarkMode ? 'border-secondary' : ''}`}>
            <div className={`p-2 rounded ${isDarkMode ? 'bg-secondary bg-opacity-25' : 'bg-light'}`}>
              <small className={isDarkMode ? 'text-light-emphasis' : 'text-muted'}>
                <div className="fw-semibold mb-1">💡 Quick Tip</div>
                <div style={{ fontSize: '0.7rem' }}>
                  Click on any subject to expand and view PDFs
                </div>
              </small>
            </div>
          </div>
        )}
      </div>

      {/* CENTER - PDF Viewer */}
      <div className="flex-grow-1 d-flex flex-column">
        {/* Top Bar */}
        <div className={`p-3 border-bottom ${isDarkMode ? 'bg-dark border-secondary' : 'bg-white'} shadow-sm`}>
          <div className="d-flex justify-content-between align-items-center">
            {/* Left Section */}
            <div className="d-flex align-items-center gap-3">
              {selectedSubject && selectedPDF ? (
                <div className="d-flex align-items-center gap-2">
                  <div className={`px-3 py-2 rounded ${isDarkMode ? 'bg-success bg-opacity-10 border border-success' : 'bg-success bg-opacity-10 border border-success'}`}>
                    <div className="d-flex align-items-center gap-2">
                      <span className="badge bg-success rounded-pill" style={{ width: '8px', height: '8px', padding: '0' }}></span>
                      <span className="fw-semibold text-success small">Active</span>
                    </div>
                  </div>
                  <div>
                    <h6 className="mb-0 fw-bold">{selectedSubject.name}</h6>
                    <small className={`${isDarkMode ? 'text-light-emphasis' : 'text-muted'} d-flex align-items-center gap-1`}>
                      <span>📄</span>
                      <span>{selectedPDF.name}</span>
                    </small>
                  </div>
                </div>
              ) : (
                <div>
                  <h6 className={`mb-0 fw-semibold ${isDarkMode ? 'text-light' : 'text-dark'}`}>
                    📚 Enlift Hub Study Notes
                  </h6>
                  <small className={isDarkMode ? 'text-light-emphasis' : 'text-muted'}>
                    Select a PDF from the sidebar to begin
                  </small>
                </div>
              )}
            </div>

            {/* Right Section */}
            <div className="d-flex gap-2 align-items-center">
              <button
                className={`btn ${isDarkMode ? 'btn-outline-light' : 'btn-outline-secondary'} btn-sm`}
                onClick={() => setIsDarkMode(!isDarkMode)}
                title="Toggle Dark Mode"
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>

              <button
                className={`btn ${isDarkMode ? 'btn-outline-light' : 'btn-outline-secondary'} btn-sm`}
                onClick={() => setIsFullscreen(!isFullscreen)}
                title="Toggle Fullscreen"
              >
                ⛶
              </button>

              <button
                className={`btn ${isDarkMode ? 'btn-outline-light' : 'btn-outline-secondary'} btn-sm`}
                onClick={() => router.push('/student-desk/dashboard')}
              >
                ← Dashboard
              </button>

              <button
                className="btn btn-primary btn-sm d-flex align-items-center gap-2"
                onClick={saveNotes}
                disabled={!selectedPDF}
              >
                <span>💾</span>
                <span>Save Notes</span>
              </button>
            </div>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className={`flex-grow-1 ${isDarkMode ? 'bg-dark' : 'bg-white'}`}>
          {selectedPDF ? (
            <SimplePdfViewer pdfUrl={selectedPDF.url} />
          ) : (
            <div className={`d-flex align-items-center justify-content-center h-100 ${isDarkMode ? 'text-light-emphasis' : 'text-muted'}`}>
              <div className="text-center">
                <div style={{ fontSize: '6rem', opacity: 0.3 }}>📚</div>
                <h4>Ready to Study?</h4>
                <p>Select a subject & PDF from the left sidebar</p>
                {subjects.length > 0 && (
                  <div className="mt-4">
                    <small className="d-block mb-2">Available Subjects:</small>
                    <div className="d-flex gap-2 justify-content-center flex-wrap">
                      {subjects.slice(0, 5).map(s => (
                        <span key={s.id} className="badge bg-secondary">
                          {s.icon || '📖'} {s.name}
                        </span>
                      ))}
                      {subjects.length > 5 && (
                        <span className="badge bg-secondary">+{subjects.length - 5} more</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDEBAR - Notes */}
      <div 
        className={`${isDarkMode ? 'bg-dark border-secondary' : 'bg-white'} border-start d-flex flex-column`}
        style={{ 
          width: isFullscreen ? '100vw' : '400px',
          transition: 'width 0.3s ease'
        }}
      >
        {!selectedPDF ? (
          /* Welcome Screen */
          <div className="p-4 h-100 d-flex flex-column overflow-auto">
            <div className="text-center mb-4">
              <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>
                {new Date().getHours() < 12 ? '🌅' : new Date().getHours() < 17 ? '☀️' : '🌙'}
              </div>
              <h4 className="mb-2">
                {new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 17 ? 'Good Afternoon' : 'Good Evening'}, {user.name?.split(' ')[0] || 'Student'}!
              </h4>
              <p className={`${isDarkMode ? 'text-light-emphasis' : 'text-muted'} mb-0`}>
                Ready to continue your journey with Enlift Hub?
              </p>
            </div>

            <div className="row g-3 mb-4">
              <div className="col-6">
                <div className={`p-3 rounded ${isDarkMode ? 'bg-secondary bg-opacity-25' : 'bg-light'}`}>
                  <div className="text-center">
                    <div style={{ fontSize: '1.5rem' }}>📚</div>
                    <div className="fw-bold mt-2">{subjects.length}</div>
                    <small className={isDarkMode ? 'text-light-emphasis' : 'text-muted'}>Subjects</small>
                  </div>
                </div>
              </div>
              <div className="col-6">
                <div className={`p-3 rounded ${isDarkMode ? 'bg-secondary bg-opacity-25' : 'bg-light'}`}>
                  <div className="text-center">
                    <div style={{ fontSize: '1.5rem' }}>📄</div>
                    <div className="fw-bold mt-2">
                      {subjects.reduce((acc, subj) => acc + (subj.pdfs?.length || 0), 0)}
                    </div>
                    <small className={isDarkMode ? 'text-light-emphasis' : 'text-muted'}>Resources</small>
                  </div>
                </div>
              </div>
            </div>

            <div className={`p-3 rounded mb-4 ${isDarkMode ? 'bg-primary bg-opacity-10 border border-primary' : 'bg-primary bg-opacity-10 border border-primary'}`}>
              <div className="d-flex align-items-start">
                <div style={{ fontSize: '1.5rem', marginRight: '0.75rem' }}>💡</div>
                <div>
                  <div className="fw-semibold mb-1">Study Tip</div>
                  <small className={isDarkMode ? 'text-light-emphasis' : 'text-muted'}>
                    Take regular breaks every 45 minutes. Active note-taking improves retention by 40%!
                  </small>
                </div>
              </div>
            </div>

            <div className={`p-3 rounded ${isDarkMode ? 'bg-secondary bg-opacity-10' : 'bg-light'}`}>
              <h6 className="mb-2 fw-semibold" style={{ fontSize: '0.85rem' }}>
                <span className="me-2">ℹ️</span>
                How to Use
              </h6>
              <div className="small" style={{ fontSize: '0.75rem' }}>
                <div className="mb-2"><strong>1.</strong> Select a subject from the left sidebar</div>
                <div className="mb-2"><strong>2.</strong> Choose a PDF to view</div>
                <div className="mb-2"><strong>3.</strong> Take notes here - they auto-save!</div>
                <div><strong>4.</strong> Use 🌙 for dark mode & Aa for font size</div>
              </div>
            </div>

            <div className="mt-auto text-center pt-4">
              <small className={`${isDarkMode ? 'text-light-emphasis' : 'text-muted'} fst-italic`} style={{ fontSize: '0.7rem' }}>
                "Success is the sum of small efforts repeated day in and day out."
              </small>
            </div>
          </div>
        ) : (
          /* Notes Section */
          <>
            <div className={`p-3 border-bottom ${isDarkMode ? 'border-secondary' : ''}`}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="d-flex align-items-center">
                  <div className={`p-2 rounded-circle me-3 ${isDarkMode ? 'bg-primary bg-opacity-20' : 'bg-primary bg-opacity-10'}`}>
                    <span>📝</span>
                  </div>
                  <div>
                    <h6 className="mb-0 fw-bold">
                      Smart Notes
                      {isTyping && (
                        <span className="ms-2 spinner-border spinner-border-sm text-primary" role="status"></span>
                      )}
                    </h6>
                    <small className={isDarkMode ? 'text-light-emphasis' : 'text-muted'}>
                      Auto-save enabled
                    </small>
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <button
                    className={`btn btn-sm ${isDarkMode ? 'btn-outline-light' : 'btn-outline-secondary'} rounded-pill`}
                    onClick={() => setIsDarkMode(!isDarkMode)}
                  >
                    {isDarkMode ? '☀️' : '🌙'}
                  </button>
                  <div className="dropdown">
                    <button 
                      className={`btn btn-sm ${isDarkMode ? 'btn-outline-light' : 'btn-outline-secondary'} dropdown-toggle rounded-pill`}
                      data-bs-toggle="dropdown"
                    >
                      Aa
                    </button>
                    <ul className="dropdown-menu">
                      <li><button className="dropdown-item" onClick={() => setFontSize(12)}>Small (12px)</button></li>
                      <li><button className="dropdown-item" onClick={() => setFontSize(14)}>Medium (14px)</button></li>
                      <li><button className="dropdown-item" onClick={() => setFontSize(16)}>Large (16px)</button></li>
                      <li><button className="dropdown-item" onClick={() => setFontSize(18)}>Extra Large (18px)</button></li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center">
                <small className={`badge ${saveStatus.includes('✅') ? 'bg-success' : saveStatus.includes('❌') ? 'bg-danger' : 'bg-secondary'} rounded-pill`}>
                  {saveStatus || '💾 Auto-save enabled'}
                </small>
                <div className="d-flex gap-2">
                  <small className="fw-semibold">📊 {wordCount} words</small>
                  <small className="fw-semibold">📏 {charCount} chars</small>
                </div>
              </div>
            </div>

            <div className="flex-grow-1 p-3 position-relative" style={{ minHeight: 0 }}>
              <textarea
                ref={notesRef}
                value={notes}
                onChange={handleNotesChange}
                className={`form-control h-100 border-0 ${isDarkMode ? 'bg-dark text-light' : 'bg-white'}`}
                placeholder="✨ Start taking your notes here...

💡 Pro Tips:
• Use bullet points for key concepts
• Highlight important dates & terms
• Add your own insights
• Keep it concise but comprehensive"
                style={{
                  resize: 'none',
                  fontSize: `${fontSize}px`,
                  lineHeight: '1.6',
                  outline: 'none'
                }}
              />
            </div>

            {notes.length > 50 && (
              <div className="px-3 pb-3">
                <small className="fw-semibold d-block mb-2">📈 Note Progress</small>
                <div className="progress" style={{ height: '5px' }}>
                  <div
                    className="progress-bar"
                    style={{
                      width: `${Math.min((notes.length / 1000) * 100, 100)}%`,
                      background: 'linear-gradient(90deg, #0d6efd 0%, #6610f2 100%)'
                    }}
                  />
                </div>
                <div className="text-center mt-2">
                  <small className={`badge ${notes.length < 100 ? 'bg-warning' : notes.length < 500 ? 'bg-info' : 'bg-success'}`}>
                    {notes.length < 100 ? '🚀 Getting started' :
                     notes.length < 500 ? '📝 Making progress' :
                     '🎯 Detailed notes!'}
                  </small>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UPSCNotesModule;