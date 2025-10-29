import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

import { useAuth } from "../../../../contexts/AuthContext";
import { db } from "../../../../firebase/config";
import {
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";

function PPDTTest() {
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [pictures, setPictures] = useState([]);
  const [selectedPictureCount, setSelectedPictureCount] = useState(null);
  const [currentPicture, setCurrentPicture] = useState(0);
  const [phase, setPhase] = useState('selection');
  const [timeLeft, setTimeLeft] = useState(0);
  const [testStarted, setTestStarted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [testCompleted, setTestCompleted] = useState(false);

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

  // Timer effect
  useEffect(() => {
    if (!testStarted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handlePhaseTransition();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testStarted, timeLeft, phase]);

  const loadPictures = async () => {
    try {
      const ppdtQuery = query(collection(db, "ssb_ppdt_pictures"), orderBy("createdAt", "desc"));
      const snap = await getDocs(ppdtQuery);

      if (snap.empty) {
        toast.error("No PPDT pictures available. Please contact admin.");
        router.push('/student-desk/ssb-practice');
        return;
      }

      const loadedPictures = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const shuffledPictures = [...loadedPictures].sort(() => Math.random() - 0.5);
      setPictures(shuffledPictures);
    } catch (error) {
      console.error("Error loading pictures:", error);
      toast.error("Failed to load test pictures");
    }
  };

  const startTest = () => {
    setShowInstructions(false);
    loadPictures();
  };

  const handlePictureCountSelect = (count) => {
    if (count > pictures.length) {
      toast.error(`Only ${pictures.length} pictures available`);
      return;
    }
    setSelectedPictureCount(count);
    setPhase('blurred');
    setTimeLeft(30);
    setTestStarted(true);
  };

  const handlePhaseTransition = () => {
    if (phase === 'blurred') {
      setPhase('writing');
      setTimeLeft(4 * 60);
    } else if (phase === 'writing') {
      if (currentPicture < selectedPictureCount - 1) {
        setCurrentPicture(prev => prev + 1);
        setPhase('blurred');
        setTimeLeft(30);
      } else {
        handleTestComplete();
      }
    }
  };

  const handleTestComplete = () => {
    setTestCompleted(true);
    setTestStarted(false);
    toast.success("PPDT Test completed successfully!");
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  if (showInstructions) {
    return (
      <div className="container-fluid py-3 px-2 px-md-4" style={{ background: "#f8f9fa", minHeight: "100vh" }}>
        {/* Header */}
        <div className="card shadow-sm border-0 mb-3" style={{ background: "white" }}>
          <div className="card-body p-3">
            <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">
              <div className="w-100 w-md-auto">
                <h1 className="h5 mb-2 fw-bold" style={{ color: "#2d3748" }}>
                  🖼️ Picture Perception & Description Test (PPDT)
                </h1>
                <div className="d-flex flex-wrap align-items-center gap-2 small">
                  <span className="badge" style={{ background: "#8b5cf6", color: "white" }}>SSB Psychological Test</span>
                  <span className="d-none d-sm-inline text-muted">•</span>
                  <span style={{ color: "#10b981" }}>Welcome, Officer {profile?.name || "Aspirant"}!</span>
                </div>
              </div>
              <div className="d-flex align-items-center gap-2">
                <Link href="/student-desk/ssb-practice" className="btn btn-sm fw-semibold d-flex align-items-center gap-1" style={{ background: "#6b7280", color: "white", border: "none", padding: "6px 16px" }}>
                  <span>⬅️</span>
                  <span>Back to SSB</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions Card */}
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <h4 className="mb-3">📋 PPDT Test Instructions</h4>
                
                <div className="alert alert-info mb-4">
                  <p className="mb-0">Keep your pen and paper ready. You'll view a picture for 30 seconds, then write a story about it for 4 minutes.</p>
                </div>

                <div className="row mb-4">
                  <div className="col-md-6 mb-3">
                    <h6 className="mb-3">⏱️ Timing:</h6>
                    <ul className="list-unstyled ms-3">
                      <li className="mb-2"><strong>Picture Viewing:</strong> 30 seconds</li>
                      <li className="mb-2"><strong>Story Writing:</strong> 4 minutes</li>
                      <li className="mb-2"><strong>Auto-advance:</strong> After each phase</li>
                    </ul>
                  </div>
                  <div className="col-md-6 mb-3">
                    <h6 className="mb-3">✍️ What to Write:</h6>
                    <ul className="list-unstyled ms-3">
                      <li className="mb-2">Characters in the picture</li>
                      <li className="mb-2">What is happening</li>
                      <li className="mb-2">What led to this situation</li>
                      <li className="mb-2">What will be the outcome</li>
                    </ul>
                  </div>
                  <div className="col-md-6 mb-3">
                    <h6 className="mb-3">🎯 Key Points:</h6>
                    <ul className="list-unstyled ms-3">
                      <li className="mb-2">Observe carefully during viewing</li>
                      <li className="mb-2">Create a complete story</li>
                      <li className="mb-2">Include thoughts and emotions</li>
                      <li className="mb-2">Give a logical conclusion</li>
                    </ul>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="alert alert-light mb-0">
                      <h6 className="mb-2">💡 Tip:</h6>
                      <p className="mb-0 small">Focus on positive themes, leadership qualities, and practical solutions in your story.</p>
                    </div>
                  </div>
                </div>

                <button className="btn btn-success btn-lg" onClick={startTest}>
                  🚀 Start PPDT Test
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (pictures.length === 0) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  if (phase === 'selection') {
    return (
      <div className="container-fluid py-3 px-2 px-md-4" style={{ background: "#f8f9fa", minHeight: "100vh" }}>
        {/* Header */}
        <div className="card shadow-sm border-0 mb-3" style={{ background: "white" }}>
          <div className="card-body p-3">
            <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">
              <div className="w-100 w-md-auto">
                <h1 className="h5 mb-2 fw-bold" style={{ color: "#2d3748" }}>
                  🖼️ Picture Perception & Description Test (PPDT)
                </h1>
                <div className="d-flex flex-wrap align-items-center gap-2 small">
                  <span className="badge" style={{ background: "#8b5cf6", color: "white" }}>SSB Psychological Test</span>
                  <span className="d-none d-sm-inline text-muted">•</span>
                  <span style={{ color: "#10b981" }}>Welcome, Officer {profile?.name || "Aspirant"}!</span>
                </div>
              </div>
              <div className="d-flex align-items-center gap-2">
                <Link href="/student-desk/ssb-practice" className="btn btn-sm fw-semibold d-flex align-items-center gap-1" style={{ background: "#6b7280", color: "white", border: "none", padding: "6px 16px" }}>
                  <span>⬅️</span>
                  <span>Back to SSB</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Picture Count Selector */}
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <h4 className="mb-4">🎯 Select Number of Pictures</h4>

                <div className="mb-4">
                  <label className="form-label fw-semibold">How many pictures would you like?</label>
                  <select
                    className="form-select form-select-lg"
                    onChange={(e) => {
                      const count = parseInt(e.target.value);
                      if (count > 0) handlePictureCountSelect(count);
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled>Select number of pictures</option>
                    {Array.from({ length: Math.min(pictures.length, 10) }, (_, i) => i + 1).map(count => (
                      <option key={count} value={count}>
                        {count} picture{count > 1 ? 's' : ''} ({count * 4.5} minutes)
                      </option>
                    ))}
                  </select>
                  <div className="form-text mt-2">
                    Each picture: 30s viewing + 4min writing = 4.5 minutes total
                  </div>
                </div>

                <div className="card bg-light border-0 mb-4">
                  <div className="card-body">
                    <div className="row text-center">
                      <div className="col-4">
                        <div className="h5 fw-bold text-primary mb-1">{pictures.length}</div>
                        <small className="text-muted">Available</small>
                      </div>
                      <div className="col-4">
                        <div className="h5 fw-bold text-success mb-1">30s</div>
                        <small className="text-muted">Viewing</small>
                      </div>
                      <div className="col-4">
                        <div className="h5 fw-bold text-info mb-1">4min</div>
                        <small className="text-muted">Writing</small>
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  className="btn btn-secondary"
                  onClick={() => {
                    setPhase('selection');
                    setShowInstructions(true);
                  }}
                >
                  ← Back to Instructions
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (testCompleted) {
    return (
      <div className="container-fluid py-3 px-2 px-md-4" style={{ background: "#f8f9fa", minHeight: "100vh" }}>
        {/* Header */}
        <div className="card shadow-sm border-0 mb-3" style={{ background: "white" }}>
          <div className="card-body p-3">
            <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">
              <div className="w-100 w-md-auto">
                <h1 className="h5 mb-2 fw-bold" style={{ color: "#2d3748" }}>
                  🖼️ Picture Perception & Description Test (PPDT)
                </h1>
                <div className="d-flex flex-wrap align-items-center gap-2 small">
                  <span className="badge" style={{ background: "#8b5cf6", color: "white" }}>SSB Psychological Test</span>
                  <span className="d-none d-sm-inline text-muted">•</span>
                  <span style={{ color: "#10b981" }}>Welcome, Officer {profile?.name || "Aspirant"}!</span>
                </div>
              </div>
              <div className="d-flex align-items-center gap-2">
                <Link href="/student-desk/ssb-practice" className="btn btn-sm fw-semibold d-flex align-items-center gap-1" style={{ background: "#6b7280", color: "white", border: "none", padding: "6px 16px" }}>
                  <span>⬅️</span>
                  <span>Back to SSB</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Completion Card */}
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card shadow-sm border-0">
              <div className="card-body p-5 text-center">
                <div className="mb-4">
                  <div className="text-success mb-3" style={{ fontSize: '4rem' }}>✅</div>
                  <h2 className="mb-3">PPDT Test Completed!</h2>
                  <p className="text-muted">
                    You have completed {selectedPictureCount} picture{selectedPictureCount > 1 ? 's' : ''} in {selectedPictureCount * 4.5} minutes.
                  </p>
                </div>
                
                <div className="row g-3 mb-4">
                  <div className="col-md-3">
                    <div className="card bg-light border-0">
                      <div className="card-body p-3">
                        <div className="h4 fw-bold text-primary mb-1">{selectedPictureCount}</div>
                        <small className="text-muted">Pictures</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card bg-light border-0">
                      <div className="card-body p-3">
                        <div className="h4 fw-bold text-success mb-1">30s</div>
                        <small className="text-muted">Viewing Time</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card bg-light border-0">
                      <div className="card-body p-3">
                        <div className="h4 fw-bold text-info mb-1">4min</div>
                        <small className="text-muted">Writing Time</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card bg-light border-0">
                      <div className="card-body p-3">
                        <div className="h4 fw-bold text-warning mb-1">{selectedPictureCount * 4.5}min</div>
                        <small className="text-muted">Total Time</small>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="d-flex gap-2 justify-content-center flex-wrap">
                  <Link href="/student-desk/ssb-practice" className="btn btn-primary btn-lg">
                    🏠 Back to SSB Practice
                  </Link>
                  <button
                    className="btn btn-success btn-lg"
                    onClick={() => {
                      setTestCompleted(false);
                      setTestStarted(false);
                      setCurrentPicture(0);
                      setTimeLeft(0);
                      setPictures([]);
                      setSelectedPictureCount(null);
                      setPhase('selection');
                      setShowInstructions(true);
                    }}
                  >
                    🔄 Take Another Test
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentPic = pictures[currentPicture];
  const progressPercentage = ((currentPicture + (phase === 'writing' ? 0.5 : 0)) / selectedPictureCount) * 100;

  return (
    <div className="container-fluid py-3 px-2 px-md-4" style={{ background: "#f8f9fa", minHeight: "100vh" }}>
      {/* Header */}
      <div className="card shadow-sm border-0 mb-3" style={{ background: "white" }}>
        <div className="card-body p-3">
          <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">
            <div className="w-100 w-md-auto">
              <h1 className="h5 mb-2 fw-bold" style={{ color: "#2d3748" }}>
                🖼️ Picture Perception & Description Test (PPDT)
              </h1>
              <div className="d-flex flex-wrap align-items-center gap-2 small">
                <span className="badge" style={{ background: "#8b5cf6", color: "white" }}>SSB Psychological Test</span>
                <span className="d-none d-sm-inline text-muted">•</span>
                <span style={{ color: "#10b981" }}>Welcome, Officer {profile?.name || "Aspirant"}!</span>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              <Link href="/student-desk/ssb-practice" className="btn btn-sm fw-semibold d-flex align-items-center gap-1" style={{ background: "#6b7280", color: "white", border: "none", padding: "6px 16px" }}>
                <span>⬅️</span>
                <span>Back to SSB</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Header */}
      <div className="card shadow-sm border-0 mb-3">
        <div className="card-body p-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-semibold">
              Picture {currentPicture + 1} of {selectedPictureCount} • {phase === 'blurred' ? '👁️ Viewing' : '✍️ Writing'}
            </span>
            <span className={`badge ${timeLeft < 30 ? 'bg-danger' : 'bg-success'} fs-6 px-3 py-2`}>
              ⏱️ {formatTime(timeLeft)}
            </span>
          </div>
          <div className="progress" style={{ height: '8px' }}>
            <div
              className="progress-bar bg-primary"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Picture/Writing Display */}
      <div className="card shadow-sm border-0 mb-3" style={{ minHeight: '500px' }}>
        <div className="card-body p-4 d-flex flex-column justify-content-center align-items-center">
          {phase === 'blurred' ? (
            <div className="text-center w-100">
              <img
                src={currentPic.url}
                alt="PPDT Picture"
                className="img-fluid rounded shadow mb-4"
                style={{ maxHeight: '400px', maxWidth: '100%', objectFit: 'contain' }}
              />
              <div className="alert alert-success">
                <h5 className="mb-2">👁️ Picture Viewing Phase</h5>
                <p className="mb-0">Observe the picture carefully. Note the characters, their actions, and the situation.</p>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📝</div>
              <h4 className="mb-3">✍️ Story Writing Phase</h4>
              <div className="alert alert-info mb-0" style={{ maxWidth: '600px' }}>
                <p className="mb-2"><strong>Write your story on paper. Include:</strong></p>
                <ul className="text-start mb-0">
                  <li>Who are the characters?</li>
                  <li>What is happening?</li>
                  <li>What led to this situation?</li>
                  <li>What will be the outcome?</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-3">
          <div className="d-flex justify-content-center align-items-center gap-2 mb-3">
            {Array.from({ length: selectedPictureCount }, (_, index) => (
              <div
                key={index}
                className={`rounded-circle ${
                  index < currentPicture
                    ? 'bg-success'
                    : index === currentPicture
                    ? 'bg-primary'
                    : 'bg-light border'
                }`}
                style={{ 
                  width: '36px', 
                  height: '36px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '0.875rem'
                }}
              >
                <span className={`fw-bold ${index <= currentPicture ? 'text-white' : 'text-muted'}`}>
                  {index + 1}
                </span>
              </div>
            ))}
          </div>
          <div className="text-center">
            <small className="text-muted">
              {phase === 'blurred' ? 'Viewing picture...' : 'Writing story...'}
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PPDTTest;