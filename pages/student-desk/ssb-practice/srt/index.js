import React, { useEffect, useState } from "react";
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
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

function SRTPractice() {
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [situations, setSituations] = useState([]);
  const [currentSituationIndex, setCurrentSituationIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [selectedSituationCount, setSelectedSituationCount] = useState(60);
  const [showSituationCountSelector, setShowSituationCountSelector] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

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

  /* ------------------------- Load Situations ------------------------- */
  const loadSituations = async (situationCount = 60) => {
    try {
      const srtQuery = query(collection(db, "ssb_srt_situations"), orderBy("createdAt", "desc"));
      const snap = await getDocs(srtQuery);

      if (snap.empty) {
        toast.error("No SRT situations available. Please contact admin.");
        router.push('/student-desk/ssb-practice');
        return;
      }

      const loadedSituations = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const shuffledSituations = [...loadedSituations].sort(() => Math.random() - 0.5);
      const testSituations = shuffledSituations.slice(0, situationCount);
      
      if (testSituations.length < situationCount) {
        toast.warning(`Only ${testSituations.length} situations available.`);
      }

      setSituations(testSituations);
    } catch (error) {
      console.error("Error loading situations:", error);
      toast.error("Failed to load test situations");
    }
  };

  /* ------------------------- Auto-Advance Timer ------------------------- */
  useEffect(() => {
    if (!testStarted || testCompleted || situations.length === 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Move to next situation
          if (currentSituationIndex < situations.length - 1) {
            setCurrentSituationIndex(curr => curr + 1);
            return 30; // Reset timer for next situation
          } else {
            // Test completed
            setTestStarted(false);
            setTestCompleted(true);
            toast.success("SRT Test completed successfully!");
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testStarted, testCompleted, currentSituationIndex, situations.length]);

  const startTest = () => {
    setShowInstructions(false);
    setShowSituationCountSelector(true);
  };

  const startTestWithSituationCount = () => {
    setShowSituationCountSelector(false);
    setTestStarted(true);
    setTimeLeft(30);
    setCurrentSituationIndex(0);
    loadSituations(selectedSituationCount);
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
                  💭 Situation Reaction Test (SRT)
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
                <h4 className="mb-3">📋 SRT Test Instructions</h4>
                
                <div className="alert alert-info mb-4">
                  <p className="mb-0"><strong>📝 Keep your pen and paper ready!</strong> Each situation will be displayed on screen for 30 seconds. Write your immediate reaction and solution on paper.</p>
                </div>

                <div className="row mb-4">
                  <div className="col-md-6 mb-3">
                    <h6 className="mb-3">⏱️ Timing:</h6>
                    <ul className="list-unstyled ms-3">
                      <li className="mb-2"><strong>Per Situation:</strong> 30 seconds</li>
                      <li className="mb-2"><strong>Auto-advance:</strong> Automatically moves to next situation</li>
                      <li className="mb-2"><strong>Write on Paper:</strong> No typing required - write on your paper</li>
                    </ul>
                  </div>
                  <div className="col-md-6 mb-3">
                    <h6 className="mb-3">✍️ What to Write (On Paper):</h6>
                    <ul className="list-unstyled ms-3">
                      <li className="mb-2">Your immediate reaction</li>
                      <li className="mb-2">Practical solution</li>
                      <li className="mb-2">Leadership approach</li>
                      <li className="mb-2">Moral/ethical consideration</li>
                    </ul>
                  </div>
                  <div className="col-md-6 mb-3">
                    <h6 className="mb-3">🎯 Assessment Criteria:</h6>
                    <ul className="list-unstyled ms-3">
                      <li className="mb-2">Speed of Thinking</li>
                      <li className="mb-2">Decision Making</li>
                      <li className="mb-2">Sense of Responsibility</li>
                      <li className="mb-2">Calm Under Pressure</li>
                    </ul>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="alert alert-light mb-0">
                      <h6 className="mb-2">💡 Tip:</h6>
                      <p className="mb-0 small">Show maturity, responsibility, and practical problem-solving. Avoid extreme reactions. Write quickly!</p>
                    </div>
                  </div>
                </div>

                <button className="btn btn-success btn-lg" onClick={startTest}>
                  🚀 Start SRT Test
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showSituationCountSelector) {
    return (
      <div className="container-fluid py-3 px-2 px-md-4" style={{ background: "#f8f9fa", minHeight: "100vh" }}>
        {/* Header */}
        <div className="card shadow-sm border-0 mb-3" style={{ background: "white" }}>
          <div className="card-body p-3">
            <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">
              <div className="w-100 w-md-auto">
                <h1 className="h5 mb-2 fw-bold" style={{ color: "#2d3748" }}>
                  💭 Situation Reaction Test (SRT)
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

        {/* Situation Count Selector */}
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <h4 className="mb-4">🎯 Select Number of Situations</h4>

                <div className="mb-4">
                  <label className="form-label fw-semibold">How many situations would you like?</label>
                  <select
                    className="form-select form-select-lg"
                    value={selectedSituationCount}
                    onChange={(e) => setSelectedSituationCount(parseInt(e.target.value))}
                  >
                    {Array.from({ length: 30 }, (_, i) => (i + 1) * 10).map(count => (
                      <option key={count} value={count}>
                        {count} situations ({Math.round(count * 30 / 60)} minutes)
                      </option>
                    ))}
                  </select>
                  <div className="form-text mt-2">Each situation displays for 30 seconds then auto-advances</div>
                </div>

                <div className="card bg-light border-0 mb-4">
                  <div className="card-body">
                    <div className="row text-center">
                      <div className="col-4">
                        <div className="h5 fw-bold text-primary mb-1">{selectedSituationCount}</div>
                        <small className="text-muted">Situations</small>
                      </div>
                      <div className="col-4">
                        <div className="h5 fw-bold text-success mb-1">30s</div>
                        <small className="text-muted">Per Situation</small>
                      </div>
                      <div className="col-4">
                        <div className="h5 fw-bold text-info mb-1">{Math.round(selectedSituationCount * 30 / 60)} min</div>
                        <small className="text-muted">Total Time</small>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="alert alert-warning mb-4">
                  <strong>⚡ Auto-Advance Mode:</strong> Situations will automatically change every 30 seconds. Write your answers on paper as they appear on screen.
                </div>

                <div className="d-flex gap-2">
                  <button 
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowSituationCountSelector(false);
                      setShowInstructions(true);
                    }}
                  >
                    ← Back
                  </button>
                  <button 
                    className="btn btn-success flex-fill"
                    onClick={startTestWithSituationCount}
                  >
                    🚀 Start Test
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (situations.length === 0 && testStarted) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="spinner-border text-primary" />
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
                  💭 Situation Reaction Test (SRT)
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
                  <h2 className="mb-3">SRT Test Completed!</h2>
                  <p className="text-muted">
                    You have completed {situations.length} situations in {Math.round(situations.length * 30 / 60)} minutes.
                  </p>
                  <p className="text-muted">
                    Please review your written answers on paper.
                  </p>
                </div>
                
                <div className="row g-3 mb-4 justify-content-center">
                  <div className="col-md-4">
                    <div className="card bg-light border-0">
                      <div className="card-body p-3">
                        <div className="h4 fw-bold text-primary mb-1">{situations.length}</div>
                        <small className="text-muted">Total Situations</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card bg-light border-0">
                      <div className="card-body p-3">
                        <div className="h4 fw-bold text-success mb-1">{Math.round(situations.length * 30 / 60)}</div>
                        <small className="text-muted">Minutes Completed</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card bg-light border-0">
                      <div className="card-body p-3">
                        <div className="h4 fw-bold text-info mb-1">30s</div>
                        <small className="text-muted">Per Situation</small>
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
                      setCurrentSituationIndex(0);
                      setTimeLeft(30);
                      setSituations([]);
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

  const currentSituation = situations[currentSituationIndex];
  const progressPercentage = ((currentSituationIndex + 1) / situations.length) * 100;

  return (
    <div className="container-fluid py-3 px-2 px-md-4" style={{ background: "#f8f9fa", minHeight: "100vh" }}>
      {/* Header */}
      <div className="card shadow-sm border-0 mb-3" style={{ background: "white" }}>
        <div className="card-body p-3">
          <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">
            <div className="w-100 w-md-auto">
              <h1 className="h5 mb-2 fw-bold" style={{ color: "#2d3748" }}>
                💭 Situation Reaction Test (SRT)
              </h1>
              <div className="d-flex flex-wrap align-items-center gap-2 small">
                <span className="badge" style={{ background: "#8b5cf6", color: "white" }}>SSB Psychological Test</span>
                <span className="d-none d-sm-inline text-muted">•</span>
                <span style={{ color: "#10b981" }}>Welcome, Officer {profile?.name || "Aspirant"}!</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Header */}
      <div className="card shadow-sm border-0 mb-3">
        <div className="card-body p-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-semibold">Situation {currentSituationIndex + 1} of {situations.length}</span>
            <span className={`badge ${timeLeft <= 10 ? 'bg-danger' : timeLeft <= 20 ? 'bg-warning' : 'bg-success'} fs-5 px-4 py-2`}>
              ⏱️ {timeLeft}s
            </span>
          </div>
          <div className="progress" style={{ height: '10px' }}>
            <div
              className="progress-bar bg-success"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="mt-2 text-center">
            <small className="text-muted">
              ⚡ Auto-advances in {timeLeft} seconds | Write your answer on paper
            </small>
          </div>
        </div>
      </div>

      {/* Situation Display - FULLSCREEN */}
      <div className="card shadow-sm border-0 mb-3">
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <div className="badge bg-primary fs-6 px-3 py-2 mb-3">
              Situation #{currentSituationIndex + 1}
            </div>
          </div>
          
          <div className="p-5 rounded text-center" style={{ 
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
            minHeight: "300px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <p className="mb-0 fs-3 lh-lg fw-semibold" style={{ color: "white" }}>
              {currentSituation.situation}
            </p>
          </div>

          <div className="text-center mt-4">
            <div className="alert alert-light d-inline-block">
              <strong>📝 Write your answer on paper now!</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Footer */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-3">
          <div className="row text-center g-3">
            <div className="col-4">
              <div className="fw-bold text-primary h5 mb-1">{Math.round(progressPercentage)}%</div>
              <small className="text-muted">Complete</small>
            </div>
            <div className="col-4">
              <div className="fw-bold text-success h5 mb-1">{currentSituationIndex + 1}</div>
              <small className="text-muted">Current</small>
            </div>
            <div className="col-4">
              <div className="fw-bold text-info h5 mb-1">{situations.length - currentSituationIndex - 1}</div>
              <small className="text-muted">Remaining</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SRTPractice;