import React, { useState, useEffect } from 'react';
import { auth, db } from '@/firebase/config';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
  query,
  orderBy,
  updateDoc
} from 'firebase/firestore';
import Papa from 'papaparse';

// These must stay in sync with EXAM_TABS on the student-facing Mock Tests
// page — a test's examType is matched exactly against that tab list, so any
// value outside this set will never show up under any tab.
const EXAM_TYPES = ['CSE Prelims', 'CSE Mains', 'CAPF', 'CDS', 'IFoS', 'ESE'];

// Older tests may have been saved with the previous upsc/nda/cds/afcat
// scheme. Map them to a sensible current label purely for display/editing —
// every new save always uses one of EXAM_TYPES.
const LEGACY_EXAM_MAP = { upsc: 'CSE Prelims', nda: 'CDS', cds: 'CDS', afcat: 'CAPF' };
const displayExamType = (examType) => {
  if (EXAM_TYPES.includes(examType)) return examType;
  return LEGACY_EXAM_MAP[examType?.toLowerCase()] || 'CSE Prelims';
};

// Must stay in sync with TYPE_META on the student Mock Tests page — this is
// what drives the icon/label/color on each card there.
const TEST_TYPES = [
  { key: 'full', label: 'Full Length' },
  { key: 'sectional', label: 'Sectional' },
  { key: 'topic', label: 'Topic Test' },
  { key: 'pyq', label: 'Previous Year Paper' },
];

const SUBJECT_CHIP = {
  general: 'chip-blue',
  english: 'chip-violet',
  mathematics: 'chip-pink',
  reasoning: 'chip-cyan',
  current_affairs: 'chip-amber',
  defence_awareness: 'chip-green',
  general_science: 'chip-lime',
  history: 'chip-gold',
  geography: 'chip-blue',
  economy: 'chip-green',
  polity: 'chip-violet',
};

const DIFFICULTY_CHIP = {
  easy: 'chip-green',
  medium: 'chip-amber',
  hard: 'chip-accent',
};

const TEST_FORM_DEFAULTS = {
  title: '',
  description: '',
  examType: 'CSE Prelims',
  subject: '',
  marks: 0,
  type: 'full',
  duration: 60,
  questions: []
};

const AdminMockTests = () => {
  // Auth states
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Mock Tests Data
  const [mockTests, setMockTests] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Create Test Form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [testForm, setTestForm] = useState(TEST_FORM_DEFAULTS);

  // CSV Upload
  const [showCSVUpload, setShowCSVUpload] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [csvHeaders, setCsvHeaders] = useState([]);

  // Current Question Form
  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    subject: 'general',
    difficulty: 'medium',
    source: ''
  });

  // Check admin access
  const checkAdmin = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      return userDoc.exists() && userDoc.data().isAdmin === true;
    } catch (err) {
      console.error('Admin check error:', err);
      return false;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const admin = await checkAdmin(currentUser.uid);
        setUser(currentUser);
        setIsAdmin(admin);
        if (admin) loadMockTests();
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const admin = await checkAdmin(userCredential.user.uid);
      if (!admin) {
        await signOut(auth);
        setError('Access denied. Not an admin.');
        return;
      }
      setEmail('');
      setPassword('');
    } catch (err) {
      setError('Login failed. Check credentials.');
      console.error(err);
    }
  };

  const handleLogout = () => signOut(auth);

  const loadMockTests = async () => {
    try {
      const q = query(collection(db, 'mockTests'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const tests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMockTests(tests);
    } catch (err) {
      console.error('Load error:', err);
      alert('Error loading mock tests. Please check your Firestore security rules and try again.');
    }
  };

  const saveTest = async (e) => {
    e.preventDefault();
    if (!testForm.title.trim() || testForm.questions.length === 0) {
      alert('Please provide a title and at least one question.');
      return;
    }
    if (!testForm.subject.trim()) {
      alert('Please provide a subject — the student page groups and filters tests by this.');
      return;
    }

    setUploading(true);
    try {
      const testData = {
        ...testForm,
        marks: Number(testForm.marks) || 0,
        updatedAt: new Date(),
        updatedBy: user.uid
      };

      if (editingTest) {
        await updateDoc(doc(db, 'mockTests', editingTest.id), testData);
      } else {
        testData.createdAt = new Date();
        testData.createdBy = user.uid;
        if (testData.questions) {
          testData.questions = testData.questions.map(q => ({
            ...q,
            id: q.id || `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            question: q.question || '',
            options: q.options || ['', '', '', ''],
            correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
            explanation: q.explanation || ''
          }));
        }
        await addDoc(collection(db, 'mockTests'), testData);
      }

      resetForm();
      await loadMockTests();
      alert(editingTest ? 'Test updated successfully!' : 'Test created successfully!');
    } catch (err) {
      alert('Failed to save test');
      console.error(err);
    }
    setUploading(false);
  };

  const addQuestion = () => {
    if (!currentQuestion.question.trim() || currentQuestion.options.some(opt => !opt.trim())) {
      alert('Please fill all question fields.');
      return;
    }

    const newQuestion = {
      id: Date.now().toString(),
      ...currentQuestion
    };

    setTestForm(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));

    setCurrentQuestion({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      subject: 'general',
      difficulty: 'medium',
      source: ''
    });
  };

  const removeQuestion = (questionId) => {
    setTestForm(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
  };

  const editTest = (test) => {
    setEditingTest(test);
    setTestForm({
      title: test.title || '',
      description: test.description || '',
      examType: displayExamType(test.examType),
      subject: test.subject || '',
      marks: test.marks ?? test.totalMarks ?? 0,
      type: TEST_TYPES.some(t => t.key === test.type) ? test.type : 'full',
      duration: test.duration || 60,
      questions: test.questions || []
    });
    setShowCreateForm(true);
  };

  const deleteTest = async (testId) => {
    if (!window.confirm('Delete this test and all its attempts? This action cannot be undone.')) return;
    setUploading(true);
    try {
      await deleteDoc(doc(db, 'mockTests', testId));
      await loadMockTests();
    } catch (err) {
      alert('Failed to delete test');
      console.error(err);
    }
    setUploading(false);
  };

  const resetForm = () => {
    setTestForm(TEST_FORM_DEFAULTS);
    setCurrentQuestion({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      subject: 'general',
      difficulty: 'medium',
      source: ''
    });
    setEditingTest(null);
    setShowCreateForm(false);
    setShowCSVUpload(false);
    setCsvFile(null);
    setCsvData([]);
    setCsvHeaders([]);
  };

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      alert('Please select a CSV file');
      return;
    }

    setCsvFile(file);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          alert('Error parsing CSV: ' + results.errors[0].message);
          return;
        }

        setCsvHeaders(results.meta.fields);
        setCsvData(results.data);
      },
      error: (error) => {
        alert('Error reading CSV file: ' + error.message);
      }
    });
  };

  const processCSVData = () => {
    if (csvData.length === 0) return;

    const questions = [];
    let questionNumber = 1;

    csvData.forEach((row, index) => {
      const question = row.Question || row.question || row.QUESTION;
      const optionA = row.OptionA || row.optionA || row.Option_A || row.A;
      const optionB = row.OptionB || row.optionB || row.Option_B || row.B;
      const optionC = row.OptionC || row.optionC || row.Option_C || row.C;
      const optionD = row.OptionD || row.optionD || row.Option_D || row.D;
      const correctAnswerText = row.CorrectAnswer || row.correctAnswer || row.CORRECT_ANSWER || row.Answer;
      const explanation = row.Explanation || row.explanation || row.EXPLANATION || '';
      const subject = row.Subject || row.subject || row.SUBJECT || 'general';
      const difficulty = row.Difficulty || row.difficulty || row.DIFFICULTY || 'medium';
      const source = row.Source || row.source || row.SOURCE || row.Year || row.year || '';

      if (!question || !optionA || !optionB || !optionC || !optionD) {
        console.warn(`Skipping row ${index + 1}: Missing required fields`);
        return;
      }

      let correctAnswerIndex = 0;
      if (correctAnswerText) {
        const answer = correctAnswerText.toString().toUpperCase().trim();
        if (answer === 'A' || answer === '0') correctAnswerIndex = 0;
        else if (answer === 'B' || answer === '1') correctAnswerIndex = 1;
        else if (answer === 'C' || answer === '2') correctAnswerIndex = 2;
        else if (answer === 'D' || answer === '3') correctAnswerIndex = 3;
      }

      questions.push({
        id: `csv_${questionNumber}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        question: question.trim(),
        options: [optionA.trim(), optionB.trim(), optionC.trim(), optionD.trim()],
        correctAnswer: correctAnswerIndex,
        explanation: explanation.trim(),
        subject: subject.toString().trim().toLowerCase().replace(/\s+/g, '_'),
        difficulty: difficulty.toString().trim().toLowerCase(),
        source: source.toString().trim()
      });

      questionNumber++;
    });

    setTestForm(prev => ({
      ...prev,
      questions: [...prev.questions, ...questions]
    }));

    alert(`Successfully imported ${questions.length} questions from CSV!`);
    setShowCSVUpload(false);
    setCsvFile(null);
    setCsvData([]);
    setCsvHeaders([]);
  };

  const inputCls = "w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition";
  const labelCls = "block mb-1.5 text-[13px] font-medium text-[var(--color-ink-muted)]";

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] font-sans">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto mb-4 rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-primary)] animate-spin" />
          <p className="text-sm text-[var(--color-ink-muted)]">Loading…</p>
        </div>
      </div>
    );
  }

  // Login screen
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] dot-grid font-sans px-4">
        <div className="card w-full max-w-[400px] p-8 fade-up">
          <div className="text-center mb-7">
            <div className="w-12 h-12 mx-auto mb-4 rounded-2xl grad-hero flex items-center justify-center text-white text-xl">🔐</div>
            <h1 className="hero-display text-2xl text-[var(--color-ink)]">Admin Login</h1>
            <p className="text-sm text-[var(--color-ink-muted)] mt-1">Sign in to manage mock tests</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className={labelCls}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={inputCls}
                placeholder="admin@example.com"
              />
            </div>

            <div className="mb-5">
              <label className={labelCls}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={inputCls}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="mb-4 px-3.5 py-2.5 rounded-xl bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/25 text-[var(--color-danger)] text-sm">
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary w-full justify-center">
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  const totalQuestions = mockTests.reduce((acc, test) => acc + (test.questions?.length || 0), 0);

  // Main Admin UI
  return (
    <div className="min-h-screen bg-[var(--color-bg)] font-sans">
      {/* Header */}
      <div className="hairline-b bg-[var(--color-surface)]">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow mb-1">Admin</p>
            <h1 className="hero-display text-2xl text-[var(--color-ink)]">📝 Mock Tests</h1>
            <p className="text-sm text-[var(--color-ink-muted)] mt-1">
              Create and manage UPSC, NDA, CDS, and AFCAT practice tests
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="chip">{user.email}</span>
            <button onClick={handleLogout} className="btn btn-ghost">Logout</button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="card p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl chip-primary flex items-center justify-center text-xl">📝</div>
            <div>
              <div className="display-num text-2xl text-[var(--color-ink)]">{mockTests.length}</div>
              <div className="text-xs text-[var(--color-ink-muted)]">Total Tests</div>
            </div>
          </div>
          <div className="card p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl chip-accent flex items-center justify-center text-xl">❓</div>
            <div>
              <div className="display-num text-2xl text-[var(--color-ink)]">{totalQuestions}</div>
              <div className="text-xs text-[var(--color-ink-muted)]">Questions</div>
            </div>
          </div>
          <div className="card p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl chip-green flex items-center justify-center text-xl">👥</div>
            <div>
              <div className="display-num text-2xl text-[var(--color-success)]">Active</div>
              <div className="text-xs text-[var(--color-ink-muted)]">Status</div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="card p-5 mb-5">
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="btn btn-primary"
              disabled={uploading}
            >
              {showCreateForm ? 'Cancel' : '+ Create New Test'}
            </button>
            <button
              onClick={() => setShowCSVUpload(!showCSVUpload)}
              className="btn btn-ghost"
              disabled={uploading}
            >
              📄 Upload CSV
            </button>
          </div>
        </div>

        {/* CSV Upload Form */}
        {showCSVUpload && (
          <div className="card p-6 mb-5 fade-up">
            <h3 className="font-serif text-lg text-[var(--color-ink)] mb-4">📄 Upload Questions from CSV</h3>

            <div className="mb-5 rounded-2xl bg-[var(--cat-cyan-t)] border border-[var(--cat-cyan)]/20 p-4">
              <h5 className="text-sm font-semibold text-[var(--cat-cyan)] mb-2">📋 CSV Format Requirements</h5>
              <p className="text-sm text-[var(--color-ink-muted)] mb-2">Your CSV file should have these columns:</p>
              <code className="block bg-[var(--color-surface)] px-3 py-2 rounded-lg text-[13px] font-mono text-[var(--color-ink)] hairline">
                Question, OptionA, OptionB, OptionC, OptionD, CorrectAnswer, Explanation, Subject, Difficulty, Source
              </code>
              <p className="text-xs mt-2 text-[var(--color-ink-muted)] leading-relaxed">
                <strong>CorrectAnswer:</strong> Use A, B, C, or D (case insensitive)<br />
                <strong>Subject:</strong> general, english, mathematics, reasoning, current_affairs, defence_awareness, general_science, history, geography, economy, polity<br />
                <strong>Difficulty:</strong> easy, medium, hard<br />
                <strong>Source:</strong> PYQ 2023, Test Series, NCERT, etc. (optional)
              </p>
            </div>

            <div className="mb-4">
              <label className={labelCls}>Select CSV File *</label>
              <input type="file" accept=".csv" onChange={handleCSVUpload} className={inputCls} />
            </div>

            {csvData.length > 0 && (
              <div className="mb-4 rounded-2xl bg-[var(--cat-green-t)] border border-[var(--color-success)]/25 p-4">
                <h6 className="text-sm font-semibold text-[var(--color-success)] mb-2">✅ CSV Preview</h6>
                <p className="text-sm text-[var(--color-ink-muted)] mb-3">
                  Found <strong className="text-[var(--color-ink)]">{csvData.length}</strong> questions in your CSV file.
                </p>
                <div className="max-h-[200px] overflow-y-auto bg-[var(--color-surface)] rounded-xl hairline p-2">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-[var(--color-surface-alt)]">
                        {csvHeaders.slice(0, 6).map(header => (
                          <th key={header} className="p-1.5 text-left hairline-b text-[var(--color-ink-muted)] font-semibold">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {csvData.slice(0, 3).map((row, index) => (
                        <tr key={index}>
                          <td className="p-1.5 hairline-b">{row.Question || row.question || 'N/A'}</td>
                          <td className="p-1.5 hairline-b">{row.OptionA || row.optionA || 'N/A'}</td>
                          <td className="p-1.5 hairline-b">{row.OptionB || row.optionB || 'N/A'}</td>
                          <td className="p-1.5 hairline-b">{row.OptionC || row.optionC || 'N/A'}</td>
                          <td className="p-1.5 hairline-b">{row.OptionD || row.optionD || 'N/A'}</td>
                          <td className="p-1.5 hairline-b">{row.CorrectAnswer || row.correctAnswer || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {csvData.length > 3 && (
                    <p className="text-xs text-[var(--color-ink-faint)] mt-2 px-1">
                      … and {csvData.length - 3} more questions
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3 flex-wrap">
              <button onClick={processCSVData} className="btn btn-primary" disabled={csvData.length === 0}>
                📥 Import Questions ({csvData.length})
              </button>
              <button
                onClick={() => {
                  setShowCSVUpload(false);
                  setCsvFile(null);
                  setCsvData([]);
                  setCsvHeaders([]);
                }}
                className="btn btn-ghost"
              >
                Cancel
              </button>
            </div>

            {testForm.questions.length > 0 && (
              <div className="mt-4 rounded-2xl bg-[var(--cat-amber-t)] border border-[var(--color-gold)]/30 p-4">
                <h6 className="text-sm font-semibold text-[#B45309] mb-2">📋 Questions Ready to Save</h6>
                <p className="text-sm text-[#B45309] mb-2">
                  You have <strong>{testForm.questions.length}</strong> questions ready. Fill in the test details below and click &quot;Create Test&quot;.
                </p>
                <div className="flex gap-2 flex-wrap">
                  {testForm.questions.slice(0, 5).map((q, index) => (
                    <span key={q.id} className="chip chip-amber">Q{index + 1}</span>
                  ))}
                  {testForm.questions.length > 5 && (
                    <span className="chip chip-amber">+{testForm.questions.length - 5} more</span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Create/Edit Test Form */}
        {showCreateForm && (
          <div className="card p-6 mb-5 fade-up">
            <h3 className="font-serif text-lg text-[var(--color-ink)] mb-5">
              {editingTest ? 'Edit Test' : 'Create New Test'}
            </h3>

            <form onSubmit={saveTest}>
              {/* Basic Info */}
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className={labelCls}>Test Title *</label>
                    <input
                      type="text"
                      value={testForm.title}
                      onChange={(e) => setTestForm(prev => ({ ...prev, title: e.target.value }))}
                      className={inputCls}
                      placeholder="e.g., Full-Length Mock #12"
                      required
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Exam *</label>
                    <select
                      value={testForm.examType}
                      onChange={(e) => setTestForm(prev => ({ ...prev, examType: e.target.value }))}
                      className={inputCls}
                      required
                    >
                      {EXAM_TYPES.map(ex => <option key={ex} value={ex}>{ex}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Duration (minutes) *</label>
                    <input
                      type="number"
                      value={testForm.duration}
                      onChange={(e) => setTestForm(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                      className={inputCls}
                      min="1"
                      max="300"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className={labelCls}>Subject *</label>
                    <input
                      type="text"
                      value={testForm.subject}
                      onChange={(e) => setTestForm(prev => ({ ...prev, subject: e.target.value }))}
                      className={inputCls}
                      placeholder="e.g., General Studies I, Polity, Economy"
                      required
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Total Marks</label>
                    <input
                      type="number"
                      value={testForm.marks}
                      onChange={(e) => setTestForm(prev => ({ ...prev, marks: e.target.value }))}
                      className={inputCls}
                      min="0"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Test Type *</label>
                    <select
                      value={testForm.type}
                      onChange={(e) => setTestForm(prev => ({ ...prev, type: e.target.value }))}
                      className={inputCls}
                      required
                    >
                      {TEST_TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Description</label>
                  <textarea
                    value={testForm.description}
                    onChange={(e) => setTestForm(prev => ({ ...prev, description: e.target.value }))}
                    className={`${inputCls} min-h-[70px] resize-y`}
                    placeholder="Brief description of the test..."
                  />
                </div>
              </div>

              {/* Questions Section */}
              <div className="mb-6">
                <h4 className="font-serif text-base text-[var(--color-ink)] mb-3">
                  Questions ({testForm.questions.length})
                </h4>

                {/* Add Question Form */}
                <div className="rounded-2xl bg-[var(--color-surface-alt)] border border-[var(--color-border)] p-5 mb-4">
                  <h5 className="text-sm font-semibold text-[var(--color-ink)] mb-4">Add Question</h5>

                  <div className="mb-4">
                    <label className={labelCls}>Question *</label>
                    <textarea
                      value={currentQuestion.question}
                      onChange={(e) => setCurrentQuestion(prev => ({ ...prev, question: e.target.value }))}
                      className={`${inputCls} min-h-[80px]`}
                      placeholder="Enter the question..."
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className={labelCls}>Options *</label>
                    {currentQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center gap-2.5 mb-2">
                        <input
                          type="radio"
                          name="correctAnswer"
                          checked={currentQuestion.correctAnswer === index}
                          onChange={() => setCurrentQuestion(prev => ({ ...prev, correctAnswer: index }))}
                          className="w-4 h-4 accent-[var(--color-primary)]"
                        />
                        <span className="font-semibold text-sm text-[var(--color-ink-muted)] min-w-[20px]">
                          {String.fromCharCode(65 + index)}.
                        </span>
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...currentQuestion.options];
                            newOptions[index] = e.target.value;
                            setCurrentQuestion(prev => ({ ...prev, options: newOptions }));
                          }}
                          className={`${inputCls} flex-1`}
                          placeholder={`Option ${String.fromCharCode(65 + index)}`}
                          required
                        />
                      </div>
                    ))}
                  </div>

                  <div className="mb-4">
                    <label className={labelCls}>Explanation</label>
                    <textarea
                      value={currentQuestion.explanation}
                      onChange={(e) => setCurrentQuestion(prev => ({ ...prev, explanation: e.target.value }))}
                      className={`${inputCls} min-h-[60px]`}
                      placeholder="Explain why this answer is correct..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-1">
                    <div>
                      <label className={labelCls}>Subject</label>
                      <select
                        value={currentQuestion.subject}
                        onChange={(e) => setCurrentQuestion(prev => ({ ...prev, subject: e.target.value }))}
                        className={inputCls}
                      >
                        <option value="general">General Awareness</option>
                        <option value="english">English</option>
                        <option value="mathematics">Mathematics</option>
                        <option value="reasoning">Reasoning</option>
                        <option value="current_affairs">Current Affairs</option>
                        <option value="defence_awareness">Defence Awareness</option>
                        <option value="general_science">General Science</option>
                        <option value="history">History</option>
                        <option value="geography">Geography</option>
                        <option value="economy">Indian Economy</option>
                        <option value="polity">Indian Polity</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Difficulty</label>
                      <select
                        value={currentQuestion.difficulty}
                        onChange={(e) => setCurrentQuestion(prev => ({ ...prev, difficulty: e.target.value }))}
                        className={inputCls}
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Source (e.g., PYQ 2023)</label>
                      <input
                        type="text"
                        value={currentQuestion.source}
                        onChange={(e) => setCurrentQuestion(prev => ({ ...prev, source: e.target.value }))}
                        className={inputCls}
                        placeholder="PYQ 2023 / Test Series"
                      />
                    </div>
                  </div>

                  <button type="button" onClick={addQuestion} className="btn btn-ghost mt-3">
                    + Add Question
                  </button>
                </div>

                {/* Questions List */}
                <div className="space-y-2.5">
                  {testForm.questions.map((q, index) => (
                    <div key={q.id} className="card card-hover p-4">
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <span className="font-semibold text-sm text-[var(--color-ink)]">Q{index + 1}:</span>
                            <span className="text-sm text-[var(--color-ink)]">{q.question}</span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            {q.subject && <span className={`chip ${SUBJECT_CHIP[q.subject] || 'chip-blue'}`}>{q.subject.replace(/_/g, ' ')}</span>}
                            {q.difficulty && <span className={`chip ${DIFFICULTY_CHIP[q.difficulty] || 'chip-amber'}`}>{q.difficulty}</span>}
                          </div>
                          <div className="text-sm text-[var(--color-ink-muted)] space-y-0.5">
                            {q.options.map((opt, i) => (
                              <div
                                key={i}
                                className={i === q.correctAnswer ? 'text-[var(--color-success)] font-semibold' : ''}
                              >
                                {String.fromCharCode(65 + i)}. {opt}
                              </div>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={() => removeQuestion(q.id)}
                          className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 transition"
                          aria-label="Remove question"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3">
                <button type="submit" className="btn btn-primary" disabled={uploading}>
                  {uploading ? '⏳ Saving...' : (editingTest ? 'Update Test' : 'Create Test')}
                </button>
                <button type="button" onClick={resetForm} className="btn btn-ghost">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tests List */}
        {mockTests.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📝</div>
            <h3 className="font-serif text-lg text-[var(--color-ink)] mb-1">No tests yet</h3>
            <p className="text-sm text-[var(--color-ink-muted)]">Create your first mock test to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockTests.map((test) => (
              <div key={test.id} className="card card-hover p-5">
                <div className="flex justify-between items-start gap-3 mb-3">
                  <div>
                    <h3 className="font-serif text-base text-[var(--color-ink)]">{test.title}</h3>
                    <div className="flex items-center gap-2 flex-wrap mt-2">
                      <span className="chip chip-primary">{displayExamType(test.examType)}</span>
                      {test.subject && <span className="chip">{test.subject}</span>}
                      {test.type && (
                        <span className="chip">{TEST_TYPES.find(t => t.key === test.type)?.label || test.type}</span>
                      )}
                      <span className="text-xs text-[var(--color-ink-faint)]">
                        {test.questions?.length || 0} questions • {test.duration} min{test.marks ? ` • ${test.marks} marks` : ''}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => editTest(test)}
                      className="btn btn-ghost !px-3 !py-1.5 !text-xs"
                      disabled={uploading}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => deleteTest(test.id)}
                      className="!px-3 !py-1.5 rounded-xl text-xs font-semibold text-[var(--color-danger)] border border-[var(--color-danger)]/25 bg-[var(--color-danger)]/5 hover:bg-[var(--color-danger)]/10 transition"
                      disabled={uploading}
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {test.description && (
                  <p className="text-sm text-[var(--color-ink-muted)] mb-3 clamp-2">{test.description}</p>
                )}

                <div className="text-xs text-[var(--color-ink-faint)] hairline-t pt-3">
                  Created: {test.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {uploading && (
        <div className="fixed inset-0 bg-[var(--color-ink)]/40 backdrop-blur-sm flex items-center justify-center z-[1000]">
          <div className="card px-8 py-7 text-center">
            <div className="w-9 h-9 mx-auto mb-3 rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-primary)] animate-spin" />
            <p className="text-sm text-[var(--color-ink-muted)]">Processing…</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMockTests;