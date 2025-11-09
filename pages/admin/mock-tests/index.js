import React, { useState, useEffect } from 'react';
import { auth, db } from '../../../firebase/config';
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
  const [testForm, setTestForm] = useState({
    title: '',
    description: '',
    duration: 60,
    questions: []
  });

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
    explanation: ''
  });

  // 🔐 Check admin access
  const checkAdmin = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      return userDoc.exists() && userDoc.data().isAdmin === true;
    } catch (err) {
      console.error('Admin check error:', err);
      return false;
    }
  };

  // 👂 Listen to auth changes
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

  // 🔑 Login
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

  // 🚪 Logout
  const handleLogout = () => signOut(auth);

  // 📚 Load mock tests
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
      // Show user-friendly error message
      alert('Error loading mock tests. Please check your Firestore security rules and try again.');
    }
  };

  // ➕ Create/Update Test
  const saveTest = async (e) => {
    e.preventDefault();
    if (!testForm.title.trim() || testForm.questions.length === 0) {
      alert('Please provide a title and at least one question.');
      return;
    }

    setUploading(true);
    try {
      const testData = {
        ...testForm,
        updatedAt: new Date(),
        updatedBy: user.uid
      };

      if (editingTest) {
        await updateDoc(doc(db, 'mockTests', editingTest.id), testData);
      } else {
        testData.createdAt = new Date();
        testData.createdBy = user.uid;
        // Ensure all question data is properly formatted
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

  // ➕ Add Question
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

    // Reset question form
    setCurrentQuestion({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: ''
    });
  };

  // 🗑️ Remove Question
  const removeQuestion = (questionId) => {
    setTestForm(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
  };

  // ✏️ Edit Test
  const editTest = (test) => {
    setEditingTest(test);
    setTestForm({
      title: test.title || '',
      description: test.description || '',
      duration: test.duration || 60,
      questions: test.questions || []
    });
    setShowCreateForm(true);
  };

  // 🗑️ Delete Test
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

  // 🔄 Reset Form
  const resetForm = () => {
    setTestForm({
      title: '',
      description: '',
      duration: 60,
      questions: []
    });
    setCurrentQuestion({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: ''
    });
    setEditingTest(null);
    setShowCreateForm(false);
    setShowCSVUpload(false);
    setCsvFile(null);
    setCsvData([]);
    setCsvHeaders([]);
  };

  // 📄 Handle CSV File Upload
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

  // 📊 Process CSV Data into Questions
  const processCSVData = () => {
    if (csvData.length === 0) return;

    const questions = [];
    let questionNumber = 1;

    csvData.forEach((row, index) => {
      // Expected CSV format: Question,OptionA,OptionB,OptionC,OptionD,CorrectAnswer,Explanation
      const question = row.Question || row.question || row.QUESTION;
      const optionA = row.OptionA || row.optionA || row.Option_A || row.A;
      const optionB = row.OptionB || row.optionB || row.Option_B || row.B;
      const optionC = row.OptionC || row.optionC || row.Option_C || row.C;
      const optionD = row.OptionD || row.optionD || row.Option_D || row.D;
      const correctAnswerText = row.CorrectAnswer || row.correctAnswer || row.CORRECT_ANSWER || row.Answer;
      const explanation = row.Explanation || row.explanation || row.EXPLANATION || '';

      if (!question || !optionA || !optionB || !optionC || !optionD) {
        console.warn(`Skipping row ${index + 1}: Missing required fields`);
        return;
      }

      // Convert correct answer to index (0-3)
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
        explanation: explanation.trim()
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

  // 🧭 Loading state
  if (loading) {
    return (
      <div style={styles.center}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // 🔐 Login screen
  if (!user || !isAdmin) {
    return (
      <div style={styles.center}>
        <div style={styles.loginCard}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>
            <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Admin Login</h1>
          </div>

          <form onSubmit={handleLogin}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={styles.input}
                placeholder="admin@example.com"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={styles.input}
                placeholder="••••••••"
              />
            </div>

            {error && <div style={styles.error}>{error}</div>}

            <button type="submit" style={styles.primaryBtn}>
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 🏠 Main Admin UI
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>📝 Admin - Mock Tests</h1>
          <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9, fontSize: '0.875rem' }}>
            Create and manage practice tests
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.875rem' }}>{user.email}</span>
          <button onClick={handleLogout} style={styles.secondaryBtn}>
            Logout
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={styles.stats}>
        <div style={styles.statCard}>
          <div style={{ fontSize: '2rem' }}>📝</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1e40af' }}>
            {mockTests.length}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Total Tests</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ fontSize: '2rem' }}>❓</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#dc2626' }}>
            {mockTests.reduce((acc, test) => acc + (test.questions?.length || 0), 0)}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Questions</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ fontSize: '2rem' }}>👥</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#059669' }}>
            Active
          </div>
          <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Status</div>
        </div>
      </div>

      {/* Create Test Button */}
      <div style={styles.content}>
        <div style={styles.card}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              style={styles.primaryBtn}
              disabled={uploading}
            >
              {showCreateForm ? 'Cancel' : '+ Create New Test'}
            </button>
            <button
              onClick={() => setShowCSVUpload(!showCSVUpload)}
              style={{ ...styles.secondaryBtn, backgroundColor: '#059669', color: 'white', border: '1px solid #059669' }}
              disabled={uploading}
            >
              📄 Upload CSV
            </button>
          </div>
        </div>

        {/* CSV Upload Form */}
        {showCSVUpload && (
          <div style={styles.card}>
            <h3 style={{ marginBottom: '1rem' }}>📄 Upload Questions from CSV</h3>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ backgroundColor: '#f0f9ff', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                <h5 style={{ marginBottom: '0.5rem', color: '#0369a1' }}>📋 CSV Format Requirements:</h5>
                <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: '#0369a1' }}>
                  Your CSV file should have these columns:
                </p>
                <code style={{ display: 'block', backgroundColor: '#e0f2fe', padding: '0.5rem', borderRadius: '0.25rem', fontSize: '0.8rem' }}>
                  Question, OptionA, OptionB, OptionC, OptionD, CorrectAnswer, Explanation
                </code>
                <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: '#0369a1' }}>
                  <strong>CorrectAnswer:</strong> Use A, B, C, or D (case insensitive)<br/>
                  <strong>Explanation:</strong> Optional field for answer explanation
                </p>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={styles.label}>Select CSV File *</label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCSVUpload}
                  style={styles.input}
                />
              </div>

              {csvData.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ backgroundColor: '#f0fdf4', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #bbf7d0' }}>
                    <h6 style={{ marginBottom: '0.5rem', color: '#166534' }}>✅ CSV Preview</h6>
                    <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: '#166534' }}>
                      Found <strong>{csvData.length}</strong> questions in your CSV file.
                    </p>
                    <div style={{ maxHeight: '200px', overflowY: 'auto', backgroundColor: 'white', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #d1d5db' }}>
                      <table style={{ width: '100%', fontSize: '0.8rem' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#f9fafb' }}>
                            {csvHeaders.slice(0, 6).map(header => (
                              <th key={header} style={{ padding: '0.25rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {csvData.slice(0, 3).map((row, index) => (
                            <tr key={index}>
                              <td style={{ padding: '0.25rem', borderBottom: '1px solid #e5e7eb' }}>
                                {row.Question || row.question || 'N/A'}
                              </td>
                              <td style={{ padding: '0.25rem', borderBottom: '1px solid #e5e7eb' }}>
                                {row.OptionA || row.optionA || 'N/A'}
                              </td>
                              <td style={{ padding: '0.25rem', borderBottom: '1px solid #e5e7eb' }}>
                                {row.OptionB || row.optionB || 'N/A'}
                              </td>
                              <td style={{ padding: '0.25rem', borderBottom: '1px solid #e5e7eb' }}>
                                {row.OptionC || row.optionC || 'N/A'}
                              </td>
                              <td style={{ padding: '0.25rem', borderBottom: '1px solid #e5e7eb' }}>
                                {row.OptionD || row.optionD || 'N/A'}
                              </td>
                              <td style={{ padding: '0.25rem', borderBottom: '1px solid #e5e7eb' }}>
                                {row.CorrectAnswer || row.correctAnswer || 'N/A'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {csvData.length > 3 && (
                        <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
                          ... and {csvData.length - 3} more questions
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={processCSVData}
                  style={styles.primaryBtn}
                  disabled={csvData.length === 0}
                >
                  📥 Import Questions ({csvData.length})
                </button>
                <button
                  onClick={() => {
                    setShowCSVUpload(false);
                    setCsvFile(null);
                    setCsvData([]);
                    setCsvHeaders([]);
                  }}
                  style={styles.secondaryBtn}
                >
                  Cancel
                </button>
              </div>

              {testForm.questions.length > 0 && (
                <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#fef3c7', borderRadius: '0.5rem', border: '1px solid #f59e0b' }}>
                  <h6 style={{ marginBottom: '0.5rem', color: '#92400e' }}>📋 Questions Ready to Save</h6>
                  <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: '#92400e' }}>
                    You have <strong>{testForm.questions.length}</strong> questions ready. Fill in the test details below and click "Create Test".
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {testForm.questions.slice(0, 5).map((q, index) => (
                      <span key={q.id} style={{ fontSize: '0.75rem', backgroundColor: '#fbbf24', color: '#92400e', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}>
                        Q{index + 1}
                      </span>
                    ))}
                    {testForm.questions.length > 5 && (
                      <span style={{ fontSize: '0.75rem', backgroundColor: '#fbbf24', color: '#92400e', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}>
                        +{testForm.questions.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create/Edit Test Form */}
        {showCreateForm && (
          <div style={styles.card}>
            <h3 style={{ marginBottom: '1rem' }}>
              {editingTest ? 'Edit Test' : 'Create New Test'}
            </h3>

            <form onSubmit={saveTest}>
              {/* Basic Info */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={styles.label}>Test Title *</label>
                    <input
                      type="text"
                      value={testForm.title}
                      onChange={(e) => setTestForm(prev => ({ ...prev, title: e.target.value }))}
                      style={styles.input}
                      placeholder="e.g., UPSC Prelims Practice Test 1"
                      required
                    />
                  </div>
                  <div>
                    <label style={styles.label}>Duration (minutes) *</label>
                    <input
                      type="number"
                      value={testForm.duration}
                      onChange={(e) => setTestForm(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                      style={styles.input}
                      min="1"
                      max="300"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label style={styles.label}>Description</label>
                  <textarea
                    value={testForm.description}
                    onChange={(e) => setTestForm(prev => ({ ...prev, description: e.target.value }))}
                    style={{ ...styles.input, minHeight: '60px', resize: 'vertical' }}
                    placeholder="Brief description of the test..."
                  />
                </div>
              </div>

              {/* Questions Section */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ marginBottom: '1rem' }}>Questions ({testForm.questions.length})</h4>

                {/* Add Question Form */}
                <div style={{ ...styles.card, backgroundColor: '#f9fafb', marginBottom: '1rem' }}>
                  <h5 style={{ marginBottom: '1rem' }}>Add Question</h5>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={styles.label}>Question *</label>
                    <textarea
                      value={currentQuestion.question}
                      onChange={(e) => setCurrentQuestion(prev => ({ ...prev, question: e.target.value }))}
                      style={{ ...styles.input, minHeight: '80px' }}
                      placeholder="Enter the question..."
                      required
                    />
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={styles.label}>Options *</label>
                    {currentQuestion.options.map((option, index) => (
                      <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <input
                          type="radio"
                          name="correctAnswer"
                          checked={currentQuestion.correctAnswer === index}
                          onChange={() => setCurrentQuestion(prev => ({ ...prev, correctAnswer: index }))}
                        />
                        <span style={{ fontWeight: 'bold', minWidth: '20px' }}>
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
                          style={{ ...styles.input, flex: 1 }}
                          placeholder={`Option ${String.fromCharCode(65 + index)}`}
                          required
                        />
                      </div>
                    ))}
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={styles.label}>Explanation</label>
                    <textarea
                      value={currentQuestion.explanation}
                      onChange={(e) => setCurrentQuestion(prev => ({ ...prev, explanation: e.target.value }))}
                      style={{ ...styles.input, minHeight: '60px' }}
                      placeholder="Explain why this answer is correct..."
                    />
                  </div>

                  <button type="button" onClick={addQuestion} style={styles.secondaryBtn}>
                    + Add Question
                  </button>
                </div>

                {/* Questions List */}
                {testForm.questions.map((q, index) => (
                  <div key={q.id} style={{ ...styles.card, marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                          Q{index + 1}: {q.question}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                          {q.options.map((opt, i) => (
                            <div key={i} style={{
                              color: i === q.correctAnswer ? '#059669' : 'inherit',
                              fontWeight: i === q.correctAnswer ? 'bold' : 'normal'
                            }}>
                              {String.fromCharCode(65 + i)}. {opt}
                            </div>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => removeQuestion(q.id)}
                        style={{ ...styles.deleteBtn, marginLeft: '1rem' }}
                      >
                        ❌
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Form Actions */}
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" style={styles.primaryBtn} disabled={uploading}>
                  {uploading ? '⏳ Saving...' : (editingTest ? 'Update Test' : 'Create Test')}
                </button>
                <button type="button" onClick={resetForm} style={styles.secondaryBtn}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tests List */}
        {mockTests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
            <h3>No tests yet</h3>
            <p>Create your first mock test to get started</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {mockTests.map((test) => (
              <div key={test.id} style={styles.subjectCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.125rem' }}>{test.title}</h3>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                      {test.questions?.length || 0} questions • {test.duration} min
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => editTest(test)}
                      style={{ ...styles.secondaryBtn, padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                      disabled={uploading}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => deleteTest(test.id)}
                      style={styles.deleteBtn}
                      disabled={uploading}
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {test.description && (
                  <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem' }}>
                    {test.description}
                  </p>
                )}

                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Created: {test.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {uploading && (
        <div style={styles.overlay}>
          <div style={styles.loadingBox}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
            <p>Processing...</p>
          </div>
        </div>
      )}
    </div>
  );
};

// 🎨 Styles
const styles = {
  center: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9', fontFamily: 'system-ui, sans-serif' },
  loginCard: { backgroundColor: 'white', padding: '2rem', borderRadius: '0.75rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' },
  formGroup: { marginBottom: '1rem' },
  label: { display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem' },
  input: { width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.875rem' },
  error: { backgroundColor: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '0.375rem', marginBottom: '1rem', fontSize: '0.875rem' },
  primaryBtn: { padding: '0.75rem 1rem', backgroundColor: '#1e40af', color: 'white', border: 'none', borderRadius: '0.375rem', fontWeight: '500', cursor: 'pointer' },
  secondaryBtn: { padding: '0.5rem 1rem', backgroundColor: 'white', color: '#1e40af', border: '1px solid #1e40af', borderRadius: '0.375rem', cursor: 'pointer' },
  container: { minHeight: '100vh', backgroundColor: '#f1f5f9' },
  header: { backgroundColor: '#1e40af', color: 'white', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  stats: { padding: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' },
  statCard: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  content: { padding: '0 2rem 2rem' },
  card: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '1.5rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1rem' },
  subjectCard: { backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  deleteBtn: { padding: '0.25rem 0.75rem', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.75rem' },
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  loadingBox: { backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' },
};

export default AdminMockTests;