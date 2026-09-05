import { Play, Clock, ClipboardList, AlertTriangle, RotateCcw } from 'lucide-react';
import { UPSC_MARKS_CORRECT, UPSC_MARKS_WRONG, formatMarks } from '@/lib/mockTestScoring';

export default function MockTestInstructions({ test, savedSession, onStart, onResume, onDiscardResume }) {
  const total = test.questions.length;
  const duration = test.duration;

  return (
    <div className="mock-instructions">
      <div className="mock-instructions__hero card">
        <span className="eyebrow">{test.subject}</span>
        <h1 className="mock-instructions__title">{test.title}</h1>
        <p className="mock-instructions__sub">
          Read the rules below. The timer starts only when you tap Begin test.
        </p>

        <div className="mock-instructions__stats">
          <div className="mock-instructions__stat">
            <ClipboardList size={18} />
            <div>
              <strong>{total}</strong>
              <span>Questions</span>
            </div>
          </div>
          <div className="mock-instructions__stat">
            <Clock size={18} />
            <div>
              <strong>{duration} min</strong>
              <span>Duration</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card mock-instructions__rules">
        <h2 className="mock-instructions__rules-title">Exam rules (UPSC Prelims style)</h2>
        <ul className="mock-instructions__list">
          <li>
            <strong>+{formatMarks(UPSC_MARKS_CORRECT)} marks</strong> for every correct answer
          </li>
          <li>
            <strong>{formatMarks(UPSC_MARKS_WRONG)} marks</strong> for every wrong answer (⅔ deducted)
          </li>
          <li>
            <strong>0 marks</strong> for questions left unattempted
          </li>
          <li>You can flag questions and revisit them before submitting</li>
          <li>Use keyboard keys <kbd>A</kbd> <kbd>B</kbd> <kbd>C</kbd> <kbd>D</kbd> to select options</li>
          <li>The test auto-submits when the timer reaches zero</li>
        </ul>

        <div className="mock-instructions__warn">
          <AlertTriangle size={16} />
          <span>Do not refresh or close this tab during the test. Your progress is saved locally as a backup.</span>
        </div>
      </div>

      {savedSession ? (
        <div className="card mock-instructions__resume">
          <p className="mock-instructions__resume-text">
            You have an unfinished attempt saved{' '}
            {savedSession.timeLeft != null ? `with ${Math.ceil(savedSession.timeLeft / 60)} min left` : 'from earlier'}.
          </p>
          <div className="mock-instructions__resume-actions">
            <button type="button" className="btn btn-primary" onClick={onResume}>
              <RotateCcw size={14} /> Resume attempt
            </button>
            <button type="button" className="btn btn-ghost" onClick={onDiscardResume}>
              Start fresh
            </button>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        className="btn btn-primary mock-instructions__start"
        onClick={onStart}
        data-testid="begin-test"
      >
        <Play size={16} fill="currentColor" /> Begin test
      </button>
    </div>
  );
}
