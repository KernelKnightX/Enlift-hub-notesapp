import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { db } from '../../../firebase/config';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { onAuthStateChanged, getAuth } from 'firebase/auth';

const MockTestsModule = () => {
  const auth = getAuth();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Mock Tests Data
  const [mockTests, setMockTests] = useState([]);
  const [userAttempts, setUserAttempts] = useState([]);

  // Test Taking State
  const [selectedTest, setSelectedTest] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);

  // Results State
  const [testResults, setTestResults] = useState(null);
  const [showResults, setShowResults] = useState(false);

  // Timer ref
  const timerRef = useRef(null);

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

  // Load mock tests
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'mockTests'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMockTests(tests);
    }, (error) => {
      console.error('Error loading mock tests:', error);
      setMockTests([]);
    });

    return () => unsubscribe();
  }, [user]);

  // Load user attempts
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'users', user.uid, 'mockTestAttempts'), orderBy('completedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const attempts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUserAttempts(attempts);
    }, (error) => {
      console.error('Error loading user attempts:', error);
      setUserAttempts([]);
    });

    return () => unsubscribe();
  }, [user]);

  // Timer effect
  useEffect(() => {
    if (testStarted && timeRemaining > 0 && !testCompleted) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleTestSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [testStarted, timeRemaining, testCompleted]);

  const startTest = (test) => {
    setSelectedTest(test);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setTimeRemaining(test.duration * 60);
    setTestStarted(true);
    setTestCompleted(false);
    setShowResults(false);
  };

  const handleAnswerSelect = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleQuestionNavigation = (index) => {
    setCurrentQuestionIndex(index);
  };

  const handleTestSubmit = async () => {
    if (!selectedTest || !user) return;

    setTestCompleted(true);
    clearInterval(timerRef.current);

    const questions = selectedTest.questions || [];
    let correct = 0;
    let total = questions.length;

    const detailedResults = questions.map(question => {
      const userAnswer = answers[question.id];
      const wasAnswered = userAnswer !== undefined;
      const isCorrect = wasAnswered && userAnswer === question.correctAnswer;
      if (isCorrect) correct++;

      return {
        questionId: question.id || `q_${Math.random()}`,
        question: question.question || '',
        userAnswer: wasAnswered ? userAnswer : null,
        correctAnswer: question.correctAnswer || 0,
        isCorrect: isCorrect,
        isUnanswered: !wasAnswered,
        explanation: question.explanation || '',
        wasAnswered: wasAnswered
      };
    });

    const score = Math.round((correct / total) * 100);
    const timeTaken = selectedTest.duration * 60 - timeRemaining;

    const results = {
      testId: selectedTest.id,
      testTitle: selectedTest.title,
      score: score || 0,
      correct: correct || 0,
      total: total || 0,
      timeTaken: timeTaken || 0,
      timeLimit: selectedTest.duration || 60,
      completedAt: serverTimestamp(),
      answers: detailedResults || [],
      totalAnswered: Object.keys(answers).length || 0,
      totalUnanswered: (total - Object.keys(answers).length) || 0
    };

    try {
      const cleanResults = JSON.parse(JSON.stringify(results, (key, value) =>
        value === undefined ? null : value
      ));

      await addDoc(collection(db, 'users', user.uid, 'mockTestAttempts'), cleanResults);
      setTestResults(cleanResults);
      setShowResults(true);
    } catch (error) {
      console.error('Error saving test results:', error);
      alert('Error saving results. Please try again.');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  // Login required
  if (!user) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center">
          <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>📝</div>
          <h3 className="mb-4">Mock Tests</h3>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => (window.location.href = '/login')}
          >
            Login to Continue
          </button>
        </div>
      </div>
    );
  }

  // Test Taking Interface
  if (testStarted && !showResults) {
    const currentQuestion = selectedTest.questions[currentQuestionIndex];

    return (
      <div className="bg-light min-vh-100">
        <div className="container py-4">
          {/* Header */}
          <div className="card shadow-sm mb-3">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                <div>
                  <h5 className="mb-1">{selectedTest.title}</h5>
                  <small className="text-muted">
                    Question {currentQuestionIndex + 1} of {selectedTest.questions.length}
                  </small>
                </div>
                <div className="text-end">
                  <div className={`badge fs-6 px-3 py-2 ${timeRemaining < 300 ? 'bg-danger' : 'bg-primary'}`}>
                    ⏱️ {formatTime(timeRemaining)}
                  </div>
                  <div className="mt-1">
                    <small className="text-muted">
                      Answered: {Object.keys(answers).length}/{selectedTest.questions.length}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Question */}
          <div className="card shadow-sm mb-3">
            <div className="card-body p-4">
              <h6 className="mb-4">{currentQuestion.question}</h6>
              <div className="d-grid gap-2">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    className={`btn text-start ${
                      answers[currentQuestion.id] === index
                        ? 'btn-primary'
                        : 'btn-outline-secondary'
                    }`}
                    onClick={() => handleAnswerSelect(currentQuestion.id, index)}
                    style={{ minHeight: '50px' }}
                  >
                    <span className="badge bg-light text-dark me-3">
                      {String.fromCharCode(65 + index)}
                    </span>
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                <button
                  className="btn btn-secondary"
                  disabled={currentQuestionIndex === 0}
                  onClick={() => handleQuestionNavigation(currentQuestionIndex - 1)}
                >
                  ← Previous
                </button>

                <div className="d-flex gap-2 flex-wrap justify-content-center">
                  {selectedTest.questions.map((_, index) => (
                    <button
                      key={index}
                      className={`btn ${
                        index === currentQuestionIndex
                          ? 'btn-primary'
                          : answers[selectedTest.questions[index].id] !== undefined
                          ? 'btn-success'
                          : 'btn-outline-secondary'
                      }`}
                      onClick={() => handleQuestionNavigation(index)}
                      style={{
                        width: '40px',
                        height: '40px',
                        padding: '0'
                      }}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>

                {currentQuestionIndex === selectedTest.questions.length - 1 ? (
                  <button
                    className="btn btn-success"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to submit the test?')) {
                        handleTestSubmit();
                      }
                    }}
                  >
                    Submit Test
                  </button>
                ) : (
                  <button
                    className="btn btn-primary"
                    onClick={() => handleQuestionNavigation(currentQuestionIndex + 1)}
                  >
                    Next →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Results Screen
  if (showResults && testResults) {
    return (
      <div className="bg-light min-vh-100">
        <div className="container py-4">
          {/* Results Header */}
          <div className="card shadow-sm mb-4">
            <div className="card-body text-center p-4">
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
                {testResults.score >= 80 ? '🎉' : testResults.score >= 60 ? '👍' : '💪'}
              </div>
              <h3 className="mb-3">Test Completed!</h3>
              <div className="display-4 fw-bold mb-3" style={{ color: getScoreColor(testResults.score) }}>
                {testResults.score}%
              </div>
              <div className="row text-center g-3">
                <div className="col-3">
                  <div className="fw-bold text-success fs-4">{testResults.correct}</div>
                  <small className="text-muted">Correct</small>
                </div>
                <div className="col-3">
                  <div className="fw-bold text-danger fs-4">{testResults.total - testResults.correct}</div>
                  <small className="text-muted">Incorrect</small>
                </div>
                <div className="col-3">
                  <div className="fw-bold text-warning fs-4">{testResults.totalAnswered}</div>
                  <small className="text-muted">Answered</small>
                </div>
                <div className="col-3">
                  <div className="fw-bold text-primary fs-4">{formatTime(testResults.timeTaken)}</div>
                  <small className="text-muted">Time</small>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Results */}
          <div className="card shadow-sm mb-3">
            <div className="card-header">
              <h6 className="mb-0">Question Review</h6>
            </div>
            <div className="card-body p-0" style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {testResults.answers.map((answer, index) => (
                <div key={index} className="p-3 border-bottom">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h6 className="mb-0">Q{index + 1}: {answer.question}</h6>
                    <span className={`badge ${
                      answer.isUnanswered ? 'bg-secondary' :
                      answer.isCorrect ? 'bg-success' : 'bg-danger'
                    }`}>
                      {answer.isUnanswered ? 'Not Attempted' :
                       answer.isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>

                  {!answer.isUnanswered && (
                    <div className="mb-2">
                      <small className="text-muted">Your answer: </small>
                      <span className={`badge ${answer.isCorrect ? 'bg-success' : 'bg-danger'}`}>
                        {String.fromCharCode(65 + answer.userAnswer)}
                      </span>
                      {!answer.isCorrect && (
                        <>
                          <small className="text-muted ms-3">Correct answer: </small>
                          <span className="badge bg-success">
                            {String.fromCharCode(65 + answer.correctAnswer)}
                          </span>
                        </>
                      )}
                    </div>
                  )}

                  {answer.explanation && (
                    <div className="mt-2 p-2 bg-light rounded">
                      <small className="fw-bold">Explanation: </small>
                      <small>{answer.explanation}</small>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="d-flex gap-2">
            <button
              className="btn btn-primary"
              onClick={() => {
                setSelectedTest(null);
                setTestStarted(false);
                setTestCompleted(false);
                setShowResults(false);
                setTestResults(null);
              }}
            >
              Back to Tests
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => router.push('/student-desk/dashboard')}
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main Tests List
  return (
    <div className="bg-light min-vh-100">
      <div className="container py-4">
        {/* Header */}
        <div className="card shadow-sm mb-4" style={{ borderRadius: '12px' }}>
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
              <div>
                <h3 className="mb-2 fw-bold">Mock Tests</h3>
                <p className="text-muted mb-0">{mockTests.length} tests available</p>
              </div>
              <button
                className="btn btn-secondary"
                onClick={() => router.push('/student-desk/dashboard')}
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Available Tests */}
        <div className="row g-4 mb-4">
          {mockTests.map((test) => {
            const userAttempt = userAttempts.find(attempt => attempt.testId === test.id);
            const bestScore = userAttempt ? Math.max(...userAttempts.filter(a => a.testId === test.id).map(a => a.score)) : null;

            return (
              <div key={test.id} className="col-md-6 col-lg-4">
                <div 
                  className="card h-100 shadow-sm border-0" 
                  style={{ borderRadius: '12px' }}
                >
                  <div className="card-body p-4">
                    <h5 className="card-title mb-2">{test.title}</h5>
                    <p className="card-text text-muted small mb-3">
                      {test.description || 'Practice test for UPSC preparation'}
                    </p>

                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="badge bg-primary">
                        {test.questions?.length || 0} Questions
                      </span>
                      <small className="text-muted">
                        ⏱️ {test.duration} min
                      </small>
                      {bestScore !== null && (
                        <span 
                          className="badge" 
                          style={{ backgroundColor: getScoreColor(bestScore) }}
                        >
                          Best: {bestScore}%
                        </span>
                      )}
                    </div>

                    <button
                      className="btn btn-primary w-100"
                      onClick={() => startTest(test)}
                      disabled={!test.questions || test.questions.length === 0}
                    >
                      {userAttempt ? 'Retake Test' : 'Start Test'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Test History */}
        {userAttempts.length > 0 && (
          <div className="card shadow-sm border-0" style={{ borderRadius: '12px' }}>
            <div className="card-header bg-white border-0 p-3">
              <h5 className="mb-0">Recent Attempts</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="border-0">Test</th>
                      <th className="border-0">Score</th>
                      <th className="border-0">Date</th>
                      <th className="border-0">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userAttempts.slice(0, 10).map((attempt) => (
                      <tr key={attempt.id}>
                        <td>{attempt.testTitle}</td>
                        <td>
                          <span 
                            className="badge" 
                            style={{ backgroundColor: getScoreColor(attempt.score) }}
                          >
                            {attempt.score}%
                          </span>
                        </td>
                        <td className="text-muted small">
                          {attempt.completedAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                        </td>
                        <td className="text-muted small">
                          {formatTime(attempt.timeTaken)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {mockTests.length === 0 && (
          <div className="text-center py-5">
            <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.5 }}>📝</div>
            <h4 className="text-muted">No Mock Tests Available</h4>
            <p className="text-muted">Check back later for new tests.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MockTestsModule;