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

function WATTest() {
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [words, setWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [testStarted, setTestStarted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [showWordCountSelector, setShowWordCountSelector] = useState(false);
  const [selectedWordCount, setSelectedWordCount] = useState(60);
  const [testCompleted, setTestCompleted] = useState(false);

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

  useEffect(() => {
    if (!testStarted || testCompleted || words.length === 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Move to next word
          if (currentWordIndex < words.length - 1) {
            setCurrentWordIndex(prevIndex => prevIndex + 1);
            return 15;
          } else {
            // Test complete
            setTestCompleted(true);
            toast.success("WAT Test completed!");
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testStarted, testCompleted, currentWordIndex, words.length]);

  const loadWords = async (wordCount = 60) => {
    try {
      const watQuery = query(collection(db, "ssb_wat_words"), orderBy("createdAt", "desc"));
      const snap = await getDocs(watQuery);

      if (snap.empty) {
        toast.error("No WAT words available. Please contact admin.");
        router.push('/student-desk/ssb-practice');
        return;
      }

      const loadedWords = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const shuffledWords = [...loadedWords].sort(() => Math.random() - 0.5);
      const testWords = shuffledWords.slice(0, wordCount);
      
      if (testWords.length < wordCount) {
        toast.warning(`Only ${testWords.length} words available.`);
      }

      setWords(testWords);
    } catch (error) {
      console.error("Error loading words:", error);
      toast.error("Failed to load test words");
    }
  };

  const startTest = () => {
    setShowInstructions(false);
    setShowWordCountSelector(true);
  };

  const startTestWithWordCount = () => {
    setShowWordCountSelector(false);
    setTestStarted(true);
    loadWords(selectedWordCount);
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
                  📝 Word Association Test (WAT)
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
          <div className="col-lg-8">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <h4 className="mb-3">📋 WAT Test Instructions</h4>
                
                <div className="alert alert-info mb-4">
                  <p className="mb-0">Keep your pen and paper ready. Write your response for each word that appears on screen.</p>
                </div>

                <div className="row mb-4">
                  <div className="col-md-6 mb-3">
                    <h6 className="mb-3">⏱️ Timing:</h6>
                    <ul className="list-unstyled ms-3">
                      <li className="mb-2"><strong>Per Word:</strong> 15 seconds</li>
                      <li className="mb-2"><strong>Auto-advance:</strong> After 15 seconds</li>
                    </ul>
                  </div>
                  <div className="col-md-6 mb-3">
                    <h6 className="mb-3">✍️ What to Write:</h6>
                    <ul className="list-unstyled ms-3">
                      <li className="mb-2">Your immediate reaction</li>
                      <li className="mb-2">First association on paper</li>
                    </ul>
                  </div>
                </div>

                <div className="alert alert-light mb-4">
                  <h6 className="mb-2">💡 Tip:</h6>
                  <p className="mb-0 small">Write the first thought that comes to your mind. Be spontaneous and honest in your responses.</p>
                </div>

                <button className="btn btn-success btn-lg" onClick={startTest}>
                  🚀 Start WAT Test
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showWordCountSelector) {
    return (
      <div className="container-fluid py-3 px-2 px-md-4" style={{ background: "#f8f9fa", minHeight: "100vh" }}>
        {/* Header */}
        <div className="card shadow-sm border-0 mb-3" style={{ background: "white" }}>
          <div className="card-body p-3">
            <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">
              <div className="w-100 w-md-auto">
                <h1 className="h5 mb-2 fw-bold" style={{ color: "#2d3748" }}>
                  📝 Word Association Test (WAT)
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

        {/* Word Count Selector */}
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <h4 className="mb-4">🎯 Select Number of Words</h4>

                <div className="mb-4">
                  <label className="form-label fw-semibold">Number of words:</label>
                  <select
                    className="form-select form-select-lg"
                    value={selectedWordCount}
                    onChange={(e) => setSelectedWordCount(parseInt(e.target.value))}
                  >
                    {Array.from({ length: 30 }, (_, i) => (i + 1) * 10).map(count => (
                      <option key={count} value={count}>
                        {count} words ({Math.round(count * 15 / 60)} minutes)
                      </option>
                    ))}
                  </select>
                  <div className="form-text mt-2">Each word is displayed for 15 seconds</div>
                </div>

                <div className="card bg-light border-0 mb-4">
                  <div className="card-body">
                    <div className="row text-center">
                      <div className="col-4">
                        <div className="h5 fw-bold text-primary mb-1">{selectedWordCount}</div>
                        <small className="text-muted">Words</small>
                      </div>
                      <div className="col-4">
                        <div className="h5 fw-bold text-success mb-1">15s</div>
                        <small className="text-muted">Per Word</small>
                      </div>
                      <div className="col-4">
                        <div className="h5 fw-bold text-info mb-1">{Math.round(selectedWordCount * 15 / 60)} min</div>
                        <small className="text-muted">Total Time</small>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button 
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowWordCountSelector(false);
                      setShowInstructions(true);
                    }}
                  >
                    ← Back
                  </button>
                  <button 
                    className="btn btn-success flex-fill"
                    onClick={startTestWithWordCount}
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

  if (words.length === 0) {
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
                  📝 Word Association Test (WAT)
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
                  <h2 className="mb-3">Test Completed!</h2>
                  <p className="text-muted">
                    You have completed {words.length} words in {Math.round(words.length * 15 / 60)} minutes.
                  </p>
                </div>
                
                <div className="row g-3 mb-4">
                  <div className="col-md-4">
                    <div className="card bg-light border-0">
                      <div className="card-body p-3">
                        <div className="h4 fw-bold text-primary mb-1">{words.length}</div>
                        <small className="text-muted">Words Completed</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card bg-light border-0">
                      <div className="card-body p-3">
                        <div className="h4 fw-bold text-success mb-1">15s</div>
                        <small className="text-muted">Per Word</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card bg-light border-0">
                      <div className="card-body p-3">
                        <div className="h4 fw-bold text-info mb-1">{Math.round(words.length * 15 / 60)} min</div>
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
                      setCurrentWordIndex(0);
                      setTimeLeft(15);
                      setWords([]);
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

  const currentWord = words[currentWordIndex];
  const progressPercentage = ((currentWordIndex + 1) / words.length) * 100;

  return (
    <div className="container-fluid py-3 px-2 px-md-4" style={{ background: "#f8f9fa", minHeight: "100vh" }}>
      {/* Header */}
      <div className="card shadow-sm border-0 mb-3" style={{ background: "white" }}>
        <div className="card-body p-3">
          <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">
            <div className="w-100 w-md-auto">
              <h1 className="h5 mb-2 fw-bold" style={{ color: "#2d3748" }}>
                📝 Word Association Test (WAT)
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
            <span className="fw-semibold">Word {currentWordIndex + 1} of {words.length}</span>
            <span className={`badge ${timeLeft <= 5 ? 'bg-danger' : 'bg-primary'} fs-6 px-3 py-2`}>
              ⏱️ {timeLeft}s
            </span>
          </div>
          <div className="progress" style={{ height: '8px' }}>
            <div
              className="progress-bar"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Word Display */}
      <div className="card shadow-sm border-0 mb-3" style={{ minHeight: '400px' }}>
        <div className="card-body d-flex flex-column justify-content-center align-items-center p-5">
          <div 
            className="display-1 fw-bold text-primary mb-4"
            style={{ fontSize: 'clamp(3rem, 10vw, 5rem)' }}
          >
            {currentWord.word}
          </div>

          <div className="mb-3">
            <div 
              className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
              style={{ width: '100px', height: '100px', fontSize: '2.5rem' }}
            >
              {timeLeft}
            </div>
          </div>

          <p className="text-muted">Write your response on paper</p>
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
              <div className="fw-bold text-success h5 mb-1">{currentWordIndex + 1}</div>
              <small className="text-muted">Current</small>
            </div>
            <div className="col-4">
              <div className="fw-bold text-info h5 mb-1">{words.length - currentWordIndex - 1}</div>
              <small className="text-muted">Remaining</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WATTest;