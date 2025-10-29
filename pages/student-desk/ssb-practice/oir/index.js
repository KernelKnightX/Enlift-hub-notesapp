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
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

function OIRTest() {
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(40 * 60);
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
    if (!testStarted || timeLeft <= 0 || testCompleted) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleTestSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testStarted, timeLeft, testCompleted]);

  const loadQuestions = async () => {
    try {
      // Load OIR questions from Firebase
      const oirQuery = query(collection(db, "ssb_oir_questions"), orderBy("createdAt", "desc"));
      const snap = await getDocs(oirQuery);

      if (snap.empty) {
        toast.error("No OIR questions available. Please contact admin.");
        router.push('/student-desk/ssb-practice');
        return;
      }

      const loadedQuestions = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const shuffledQuestions = [...loadedQuestions].sort(() => Math.random() - 0.5);
      setQuestions(shuffledQuestions);
    } catch (error) {
      console.error("Error loading questions:", error);
      toast.error("Failed to load test questions");
    }
  };

  const startTest = () => {
    setShowInstructions(false);
    setTestStarted(true);
    loadQuestions();
  };

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleTestSubmit = async () => {
    try {
      // Calculate score
      let correctAnswers = 0;
      questions.forEach((q, index) => {
        if (answers[index] === q.correctAnswer) {
          correctAnswers++;
        }
      });

      const score = Math.round((correctAnswers / questions.length) * 100);
      const timeSpent = (40 * 60) - timeLeft;

      // Save results to Firebase
      await addDoc(collection(db, "oirAttempts"), {
        userId: user.uid,
        testType: 'OIR',
        score,
        totalQuestions: questions.length,
        correctAnswers,
        answeredQuestions: Object.keys(answers).length,
        timeSpent,
        createdAt: serverTimestamp(),
      });

      setTestStarted(false);
      setTestCompleted(true);
      toast.success("OIR Test completed successfully!");
    } catch (error) {
      console.error("Error submitting test:", error);
      toast.error("Failed to submit test");
    }
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
                  👁️ Officer Intelligence Rating (OIR)
                </h1>
                <div className="d-flex flex-wrap align-items-center gap-2 small">
                  <span className="badge" style={{ background: "#8b5cf6", color: "white" }}>SSB Intelligence Test</span>
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
                <h4 className="mb-3">📋 OIR Test Instructions</h4>
                
                <div className="alert alert-info mb-4">
                  <p className="mb-0">This is an intelligence test with picture-based questions. Select the most appropriate description for each image.</p>
                </div>

                <div className="row mb-4">
                  <div className="col-md-6 mb-3">
                    <h6 className="mb-3">⏱️ Test Details:</h6>
                    <ul className="list-unstyled ms-3">
                      <li className="mb-2"><strong>Total Time:</strong> 40 minutes</li>
                      <li className="mb-2"><strong>Format:</strong> Multiple choice questions</li>
                      <li className="mb-2"><strong>Navigation:</strong> Move freely between questions</li>
                    </ul>
                  </div>
                  <div className="col-md-6 mb-3">
                    <h6 className="mb-3">📝 How to Answer:</h6>
                    <ul className="list-unstyled ms-3">
                      <li className="mb-2">Look at the picture carefully</li>
                      <li className="mb-2">Read all options thoroughly</li>
                      <li className="mb-2">Select the best description</li>
                      <li className="mb-2">You can change answers anytime</li>
                    </ul>
                  </div>
                  <div className="col-md-6 mb-3">
                    <h6 className="mb-3">🎯 Key Points:</h6>
                    <ul className="list-unstyled ms-3">
                      <li className="mb-2">Answer all questions</li>
                      <li className="mb-2">Manage your time wisely</li>
                      <li className="mb-2">Review before submitting</li>
                      <li className="mb-2">Trust your first instinct</li>
                    </ul>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="alert alert-light mb-0">
                      <h6 className="mb-2">💡 Tip:</h6>
                      <p className="mb-0 small">Focus on the most logical and officer-like interpretation of each scenario.</p>
                    </div>
                  </div>
                </div>

                <button className="btn btn-success btn-lg" onClick={startTest}>
                  🚀 Start OIR Test
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  if (testCompleted) {
    const answeredCount = Object.keys(answers).length;
    const correctCount = questions.reduce((count, q, index) => {
      return count + (answers[index] === q.correctAnswer ? 1 : 0);
    }, 0);
    const score = Math.round((correctCount / questions.length) * 100);
    const timeSpent = (40 * 60) - timeLeft;

    return (
      <div className="container-fluid py-3 px-2 px-md-4" style={{ background: "#f8f9fa", minHeight: "100vh" }}>
        {/* Header */}
        <div className="card shadow-sm border-0 mb-3" style={{ background: "white" }}>
          <div className="card-body p-3">
            <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">
              <div className="w-100 w-md-auto">
                <h1 className="h5 mb-2 fw-bold" style={{ color: "#2d3748" }}>
                  👁️ Officer Intelligence Rating (OIR)
                </h1>
                <div className="d-flex flex-wrap align-items-center gap-2 small">
                  <span className="badge" style={{ background: "#8b5cf6", color: "white" }}>SSB Intelligence Test</span>
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
                  <h2 className="mb-3">OIR Test Completed!</h2>
                  <p className="text-muted">
                    You have completed the Officer Intelligence Rating test in {formatTime(timeSpent)}.
                  </p>
                </div>
                
                <div className="row g-3 mb-4">
                  <div className="col-md-3">
                    <div className="card bg-light border-0">
                      <div className="card-body p-3">
                        <div className="h4 fw-bold text-primary mb-1">{questions.length}</div>
                        <small className="text-muted">Total Questions</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card bg-light border-0">
                      <div className="card-body p-3">
                        <div className="h4 fw-bold text-success mb-1">{answeredCount}</div>
                        <small className="text-muted">Answered</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card bg-light border-0">
                      <div className="card-body p-3">
                        <div className="h4 fw-bold text-info mb-1">{formatTime(timeSpent)}</div>
                        <small className="text-muted">Time Taken</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card bg-light border-0">
                      <div className="card-body p-3">
                        <div className="h4 fw-bold text-warning mb-1">{score}%</div>
                        <small className="text-muted">Score</small>
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
                      setCurrentQuestion(0);
                      setTimeLeft(40 * 60);
                      setQuestions([]);
                      setAnswers({});
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

  const currentQ = questions[currentQuestion];
  const answeredCount = Object.keys(answers).length;
  const progressPercentage = (answeredCount / questions.length) * 100;

  return (
    <div className="container-fluid py-3 px-2 px-md-4" style={{ background: "#f8f9fa", minHeight: "100vh" }}>
      {/* Header */}
      <div className="card shadow-sm border-0 mb-3" style={{ background: "white" }}>
        <div className="card-body p-3">
          <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">
            <div className="w-100 w-md-auto">
              <h1 className="h5 mb-2 fw-bold" style={{ color: "#2d3748" }}>
                👁️ Officer Intelligence Rating (OIR)
              </h1>
              <div className="d-flex flex-wrap align-items-center gap-2 small">
                <span className="badge" style={{ background: "#8b5cf6", color: "white" }}>SSB Intelligence Test</span>
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
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className={`badge ${timeLeft < 300 ? 'bg-danger' : 'bg-success'} fs-6 px-3 py-2`}>
              ⏱️ {formatTime(timeLeft)}
            </span>
          </div>
          <div className="progress" style={{ height: '8px' }}>
            <div
              className="progress-bar bg-primary"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="mt-2 d-flex justify-content-between">
            <small className="text-muted">{answeredCount} answered</small>
            <small className="text-muted">{questions.length - answeredCount} remaining</small>
          </div>
        </div>
      </div>

      {/* Question Display */}
      <div className="card shadow-sm border-0 mb-3">
        <div className="card-body p-4">
          <div className="row">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <div className="text-center">
                <img
                  src={currentQ.imageUrl || currentQ.url}
                  alt="OIR Question"
                  className="img-fluid rounded shadow"
                  style={{ maxHeight: '400px', width: '100%', objectFit: 'contain' }}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
                  }}
                />
              </div>
            </div>
            <div className="col-lg-6">
              <h5 className="mb-4">Select the most appropriate description:</h5>
              <div className="d-grid gap-3">
                {currentQ.options?.map((option, index) => (
                  <button
                    key={index}
                    className={`btn text-start p-3 ${
                      answers[currentQuestion] === index
                        ? 'btn-primary'
                        : 'btn-outline-secondary'
                    }`}
                    onClick={() => handleAnswerSelect(currentQuestion, index)}
                  >
                    <strong>{String.fromCharCode(65 + index)}.</strong> {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-3">
          <div className="row g-3">
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <button
                  className="btn btn-outline-secondary"
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                >
                  ← Previous
                </button>

                {currentQuestion === questions.length - 1 ? (
                  <button
                    className="btn btn-success px-4"
                    onClick={handleTestSubmit}
                  >
                    ✅ Submit Test
                  </button>
                ) : (
                  <button
                    className="btn btn-primary"
                    onClick={handleNext}
                  >
                    Next →
                  </button>
                )}
              </div>
            </div>

            <div className="col-12">
              <div className="text-center">
                <small className="text-muted d-block mb-2">Question Navigator</small>
                <div className="d-flex flex-wrap gap-2 justify-content-center">
                  {questions.map((_, index) => (
                    <button
                      key={index}
                      className={`btn btn-sm ${
                        index === currentQuestion
                          ? 'btn-primary'
                          : answers[index] !== undefined
                          ? 'btn-success'
                          : 'btn-outline-secondary'
                      }`}
                      onClick={() => setCurrentQuestion(index)}
                      style={{ width: '40px', height: '40px', borderRadius: '8px' }}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OIRTest;