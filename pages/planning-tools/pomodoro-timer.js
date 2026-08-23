import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import ResourceHero from "@/components/public/ResourceHero";

const MODES = {
  pomodoro: {
    label: "Pomodoro",
    focus: 25,
    break: 5,
    description: "25 min focus · 5 min break",
  },
  deep: {
    label: "Deep Study",
    focus: 50,
    break: 10,
    description: "50 min focus · 10 min break",
  },
  upsc: {
    label: "UPSC Deep Focus",
    focus: 90,
    break: 15,
    description: "90 min focus · 15 min break",
  },
};

const SUBJECTS = [
  "General Studies",
  "Polity",
  "History",
  "Geography",
  "Economy",
  "Environment",
  "Science & Technology",
  "Current Affairs",
  "CSAT",
  "Optional",
  "Answer Writing",
  "Revision",
];

export default function PomodoroTimer() {
  const [mode, setMode] = useState("pomodoro");
  const [phase, setPhase] = useState("focus");
  const [isRunning, setIsRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(
    MODES.pomodoro.focus * 60
  );

  const [sessions, setSessions] = useState(0);
  const [subject, setSubject] = useState("General Studies");

  const currentMinutes =
    phase === "focus"
      ? MODES[mode].focus
      : MODES[mode].break;

  const totalSeconds = currentMinutes * 60;

  const progress = Math.max(
    0,
    Math.min(
      100,
      ((totalSeconds - secondsLeft) / totalSeconds) * 100
    )
  );

  const circumference = 2 * Math.PI * 130;
  const strokeDashoffset =
    circumference - (progress / 100) * circumference;

  const formattedTime = useMemo(() => {
    const minutes = Math.floor(secondsLeft / 60)
      .toString()
      .padStart(2, "0");

    const seconds = (secondsLeft % 60)
      .toString()
      .padStart(2, "0");

    return `${minutes}:${seconds}`;
  }, [secondsLeft]);

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 0) {
          return prev - 1;
        }

        if (phase === "focus") {
          setSessions((value) => value + 1);
          setPhase("break");
          return MODES[mode].break * 60;
        }

        setPhase("focus");
        return MODES[mode].focus * 60;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, phase, mode]);

  function changeMode(nextMode) {
    setMode(nextMode);
    setPhase("focus");
    setIsRunning(false);
    setSecondsLeft(MODES[nextMode].focus * 60);
  }

  function resetTimer() {
    setIsRunning(false);
    setPhase("focus");
    setSecondsLeft(MODES[mode].focus * 60);
  }

  function toggleTimer() {
    setIsRunning((value) => !value);
  }

  return (
    <>
      <Head>
        <title>UPSC Pomodoro Timer | Notes Cafe</title>

        <meta
          name="description"
          content="Focus better with the Notes Cafe UPSC Pomodoro Timer. Use focused study sessions, breaks and deep-work intervals for UPSC preparation."
        />
      </Head>

      <ResourceHero
        withSeo={false}
        eyebrow="Planning Tools"
        title="UPSC Pomodoro Timer"
        description="Stay focused with structured study sessions, breaks, and deep-work intervals for UPSC preparation."
      />

      <main className="pomodoro-page">
        <div className="pomodoro-container">

          {/* Mode Selector */}

          <div className="mode-selector">
            {Object.entries(MODES).map(([key, value]) => (
              <button
                key={key}
                className={`mode-button ${
                  mode === key ? "active" : ""
                }`}
                onClick={() => changeMode(key)}
              >
                <span>{value.label}</span>
                <small>{value.description}</small>
              </button>
            ))}
          </div>

          {/* Main Timer */}

          <section className="timer-card">

            <div className="timer-top">

              <div>
                <div className="phase-label">
                  {phase === "focus"
                    ? "FOCUS SESSION"
                    : "BREAK TIME"}
                </div>

                <h2>
                  {phase === "focus"
                    ? "Time to focus"
                    : "Take a short break"}
                </h2>
              </div>

              <div className="session-count">
                <span>Sessions</span>
                <strong>{sessions}</strong>
              </div>

            </div>

            {/* Timer Circle */}

            <div className="timer-circle">

              <svg
                className="progress-ring"
                width="300"
                height="300"
                viewBox="0 0 300 300"
              >
                <circle
                  className="ring-background"
                  cx="150"
                  cy="150"
                  r="130"
                />

                <circle
                  className="ring-progress"
                  cx="150"
                  cy="150"
                  r="130"
                  style={{
                    strokeDasharray: circumference,
                    strokeDashoffset,
                  }}
                />
              </svg>

              <div className="timer-content">

                <div className="timer-phase">
                  {phase === "focus" ? "FOCUS" : "BREAK"}
                </div>

                <div className="timer-time">
                  {formattedTime}
                </div>

                <div className="timer-subject">
                  {subject}
                </div>

              </div>

            </div>

            {/* Controls */}

            <div className="timer-controls">

              <button
                className="reset-button"
                onClick={resetTimer}
                aria-label="Reset timer"
              >
                ↻
              </button>

              <button
                className="start-button"
                onClick={toggleTimer}
              >
                {isRunning ? "Pause" : "Start Focus"}
              </button>

              <div className="control-spacer" />

            </div>

          </section>

          {/* Study Settings */}

          <section className="settings-section">

            <div className="setting-card">

              <div className="setting-label">
                What are you studying?
              </div>

              <select
                value={subject}
                onChange={(event) =>
                  setSubject(event.target.value)
                }
              >
                {SUBJECTS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

            </div>

            <div className="setting-card">

              <div className="setting-label">
                Current session
              </div>

              <div className="setting-value">
                {phase === "focus"
                  ? `${MODES[mode].focus} minutes`
                  : `${MODES[mode].break} minutes`}
              </div>

            </div>

            <div className="setting-card">

              <div className="setting-label">
                Completed today
              </div>

              <div className="setting-value">
                {sessions} {sessions === 1 ? "session" : "sessions"}
              </div>

            </div>

          </section>

          {/* How to use */}

          <section className="info-section">

            <h2>How to Use the UPSC Pomodoro Timer</h2>

            <p>
              The Pomodoro technique breaks your study time into
              focused intervals followed by short breaks. It can
              help you avoid distractions and make long study
              sessions easier to manage.
            </p>

            <div className="steps">

              <div className="step">
                <span>01</span>
                <div>
                  <h3>Choose a subject</h3>
                  <p>
                    Select the subject or activity you are going
                    to work on.
                  </p>
                </div>
              </div>

              <div className="step">
                <span>02</span>
                <div>
                  <h3>Start your focus session</h3>
                  <p>
                    Put away distractions and focus only on the
                    selected task until the timer ends.
                  </p>
                </div>
              </div>

              <div className="step">
                <span>03</span>
                <div>
                  <h3>Take your break</h3>
                  <p>
                    Step away from your study material and take
                    a proper short break.
                  </p>
                </div>
              </div>

              <div className="step">
                <span>04</span>
                <div>
                  <h3>Repeat</h3>
                  <p>
                    Complete another focus session and gradually
                    build consistent study hours.
                  </p>
                </div>
              </div>

            </div>

          </section>

          {/* UPSC Strategy */}

          <section className="strategy-section">

            <h2>Which Timer Should UPSC Aspirants Use?</h2>

            <div className="strategy-grid">

              <div className="strategy-card">
                <div className="strategy-number">25 min</div>

                <h3>Pomodoro</h3>

                <p>
                  Useful when you are starting a new subject,
                  revising short topics or struggling to maintain
                  concentration.
                </p>
              </div>

              <div className="strategy-card">
                <div className="strategy-number">50 min</div>

                <h3>Deep Study</h3>

                <p>
                  Suitable for reading standard books, studying
                  GS topics and making detailed notes.
                </p>
              </div>

              <div className="strategy-card">
                <div className="strategy-number">90 min</div>

                <h3>UPSC Deep Focus</h3>

                <p>
                  Best suited for answer writing, optional
                  preparation, lengthy topics and intensive
                  revision.
                </p>
              </div>

            </div>

          </section>

        </div>
      </main>

      <style jsx>{`

        .pomodoro-page {
          min-height: 100vh;
          background: #ffffff;
          color: #172033;
        }

        .pomodoro-container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 32px 40px 80px;
        }


        /* Header */

        .page-header {
          width: 100%;
          max-width: none;
          margin-bottom: 32px;
          }
           
        .page-header h1 {
          margin: 0 0 12px;
          font-size: clamp(34px, 4vw, 48px);
          line-height: 1.15;
          letter-spacing: -1.2px;
          color: #111827;
        }

        .page-header p {
          margin: 0;
          font-size: 16px;
          line-height: 1.8;
          color: #64748b;
        }

        /* Modes */

        .mode-selector {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }

        .mode-button {
          padding: 16px 18px;
          text-align: left;
          border: 1px solid #e3e7ed;
          border-radius: 9px;
          background: #ffffff;
          cursor: pointer;
          transition: all 0.18s ease;
        }

        .mode-button:hover {
          border-color: #cbd5e1;
          background: #fafbfc;
        }

        .mode-button.active {
          border-color: #1d4ed8;
          background: #f7f9ff;
          box-shadow: 0 0 0 1px #1d4ed8 inset;
        }

        .mode-button span {
          display: block;
          margin-bottom: 5px;
          font-size: 15px;
          font-weight: 650;
          color: #172033;
        }

        .mode-button small {
          font-size: 12px;
          color: #7a8496;
        }

        /* Timer */

        .timer-card {
          padding: 32px;
          border: 1px solid #e2e6ec;
          border-radius: 12px;
          background: #ffffff;
          box-shadow: 0 10px 35px rgba(15, 23, 42, 0.05);
        }

        .timer-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .phase-label {
          margin-bottom: 6px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: #2563eb;
        }

        .timer-top h2 {
          margin: 0;
          font-size: 23px;
          color: #111827;
        }

        .session-count {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 7px 11px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
        }

        .session-count span {
          font-size: 12px;
          color: #7a8496;
        }

        .session-count strong {
          font-size: 15px;
          color: #172033;
        }

        /* Timer circle */

        .timer-circle {
          position: relative;
          width: 300px;
          height: 300px;
          margin: 32px auto;
        }

        .progress-ring {
          display: block;
          transform: rotate(-90deg);
        }

        .ring-background {
          fill: none;
          stroke: #edf1f5;
          stroke-width: 10;
        }

        .ring-progress {
          fill: none;
          stroke: #2563eb;
          stroke-width: 10;
          stroke-linecap: round;
          transition: stroke-dashoffset 0.5s linear;
        }

        .timer-content {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .timer-phase {
          margin-bottom: 7px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: #94a3b8;
        }

        .timer-time {
          font-size: 58px;
          line-height: 1;
          font-weight: 700;
          letter-spacing: -2px;
          color: #111827;
          font-variant-numeric: tabular-nums;
        }

        .timer-subject {
          margin-top: 12px;
          padding: 5px 10px;
          border-radius: 5px;
          background: #f1f5f9;
          color: #475569;
          font-size: 12px;
          font-weight: 500;
        }

        /* Controls */

        .timer-controls {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 12px;
        }

        .reset-button {
          width: 44px;
          height: 44px;
          border: 1px solid #dce1e8;
          border-radius: 7px;
          background: #ffffff;
          color: #64748b;
          font-size: 21px;
          cursor: pointer;
        }

        .reset-button:hover {
          background: #f8fafc;
          color: #172033;
        }

        .start-button {
          min-width: 145px;
          height: 44px;
          padding: 0 24px;
          border: none;
          border-radius: 7px;
          background: #172033;
          color: #ffffff;
          font-size: 14px;
          font-weight: 650;
          cursor: pointer;
          transition: background 0.18s ease;
        }

        .start-button:hover {
          background: #0f172a;
        }

        .control-spacer {
          width: 44px;
        }

        /* Settings */

        .settings-section {
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr;
          gap: 14px;
          margin-top: 18px;
        }

        .setting-card {
          padding: 17px 18px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: #fafbfc;
        }

        .setting-label {
          margin-bottom: 8px;
          font-size: 11px;
          font-weight: 650;
          color: #7a8496;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .setting-card select {
          width: 100%;
          border: none;
          outline: none;
          background: transparent;
          color: #172033;
          font-family: inherit;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        .setting-value {
          font-size: 15px;
          font-weight: 650;
          color: #172033;
        }

        /* Information */

        .info-section,
        .strategy-section {
          margin-top: 64px;
          max-width: 1000px;
        }

        .info-section h2,
        .strategy-section h2 {
          margin: 0 0 12px;
          font-size: 27px;
          letter-spacing: -0.5px;
          color: #111827;
        }

        .info-section > p {
          margin: 0 0 30px;
          font-size: 15px;
          line-height: 1.8;
          color: #64748b;
        }

        .steps {
          border-top: 1px solid #e5e7eb;
        }

        .step {
          display: grid;
          grid-template-columns: 50px 1fr;
          gap: 18px;
          padding: 22px 0;
          border-bottom: 1px solid #e5e7eb;
        }

        .step > span {
          font-size: 12px;
          font-weight: 700;
          color: #94a3b8;
        }

        .step h3 {
          margin: 0 0 5px;
          font-size: 16px;
          color: #172033;
        }

        .step p {
          margin: 0;
          font-size: 14px;
          line-height: 1.65;
          color: #64748b;
        }

        /* Strategy */

        .strategy-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          margin-top: 26px;
        }

        .strategy-card {
          padding: 22px;
          border: 1px solid #e3e7ed;
          border-radius: 9px;
          background: #ffffff;
        }

        .strategy-number {
          margin-bottom: 13px;
          font-size: 25px;
          font-weight: 700;
          color: #2563eb;
        }

        .strategy-card h3 {
          margin: 0 0 8px;
          font-size: 17px;
          color: #172033;
        }

        .strategy-card p {
          margin: 0;
          font-size: 13px;
          line-height: 1.7;
          color: #64748b;
        }

        /* Mobile */

        @media (max-width: 850px) {
          .pomodoro-container {
            padding-left: 24px;
            padding-right: 24px;
          }

          .mode-selector,
          .strategy-grid {
            grid-template-columns: 1fr;
          }

          .settings-section {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
          .pomodoro-container {
            padding: 24px 16px 60px;
          }

          .page-header h1 {
            font-size: 32px;
          }

          .timer-card {
            padding: 22px 16px;
          }

          .timer-top h2 {
            font-size: 19px;
          }

          .timer-circle {
            width: 260px;
            height: 260px;
          }

          .progress-ring {
            width: 260px;
            height: 260px;
          }

          .timer-time {
            font-size: 48px;
          }

          .control-spacer {
            display: none;
          }

          .info-section,
          .strategy-section {
            margin-top: 48px;
          }
        }

      `}</style>
    </>
  );
}