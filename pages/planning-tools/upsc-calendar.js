import Head from "next/head";
import ResourceHero from "@/components/public/ResourceHero";

const events = [
  {
    exam: "Civil Services (Prelims) 2026",
    event: "Exam Date",
    date: "24 May 2026 (Sunday)",
  },
  {
    exam: "Civil Services (Prelims) 2026",
    event: "Notification Release",
    date: "14 January 2026",
  },
  {
    exam: "Civil Services (Prelims) 2026",
    event: "Last Date to Apply",
    date: "3 February 2026",
  },
  {
    exam: "Civil Services (Main) 2026",
    event: "Exam Start Date",
    date: "21 August 2026 (Friday)",
  },
  {
    exam: "Civil Services (Main) 2026",
    event: "Duration",
    date: "5 Days",
  },
  {
    exam: "Indian Forest Service (Prelims) 2026",
    event: "Details",
    date: "Through Civil Services (Prelims)",
  },
  {
    exam: "Indian Forest Service (Main) 2026",
    event: "Exam Start Date",
    date: "22 November 2026",
  },
  {
    exam: "NDA & CDS (I & II) 2026",
    event: "Examination Months",
    date: "April & September 2026",
  },
  {
    exam: "CAPF (Assistant Commandants) 2026",
    event: "Exam Date",
    date: "19 July 2026",
  },
];

export default function UPSCCalendar() {
  return (
    <>
      <Head>
        <title>UPSC Calendar 2026: Exam Dates and Details | Notes Cafe</title>

        <meta
          name="description"
          content="Check the UPSC Calendar 2026 including Civil Services Prelims, Mains, IFoS, NDA, CDS and CAPF examination dates, notification dates and preparation tips."
        />

        <meta
          name="keywords"
          content="UPSC Calendar 2026, UPSC exam dates 2026, UPSC Prelims 2026, UPSC Mains 2026, UPSC notification 2026, UPSC exam schedule"
        />
      </Head>

      <ResourceHero
        withSeo={false}
        eyebrow="Planning Tools"
        title="UPSC Calendar 2026: Exam Dates and Details"
        description="Check Civil Services Prelims, Mains, IFoS, NDA, CDS and CAPF dates, then plan syllabus, revision and mocks around them."
      />

      <main className="upsc-page">
        <div className="article-container">

          <header className="article-header">
            <div className="article-meta">
              <span>Updated: August 2026</span>
              <span className="meta-dot">•</span>
             
            </div>

            <p className="intro">
              Knowing the UPSC exam schedule well in advance can make your
              preparation much more structured. Once you know when the
              notification, application deadline, Prelims and Mains
              examinations are expected, you can plan your syllabus,
              revision, mock tests and answer writing accordingly.
            </p>

            <p>
              The <strong>UPSC Calendar 2026</strong> provides the schedule
              for several major examinations conducted by the Union Public
              Service Commission, including the Civil Services Examination,
              Indian Forest Service Examination, NDA, CDS and CAPF
              examinations.
            </p>

            <p>
              For UPSC aspirants, the calendar is more than just a list of
              dates. It can help you understand how much preparation time is
              available at each stage and where you should focus your efforts.
            </p>

            <p>
              Let's look at the important UPSC examination dates for 2026 and
              understand how you can use the calendar to plan your
              preparation.
            </p>
          </header>

          {/* Calendar Table */}

          <section className="article-section">
            <h2>UPSC Calendar 2026: Key Events and Dates</h2>

            <p>
              The UPSC Calendar includes important dates related to
              examination notifications, applications and examinations. The
              major events for 2026 are listed below.
            </p>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Examination</th>
                    <th>Event</th>
                    <th>Date / Details</th>
                  </tr>
                </thead>

                <tbody>
                  {events.map((item, index) => (
                    <tr key={index}>
                      <td className="exam-name">{item.exam}</td>
                      <td>{item.event}</td>
                      <td className="exam-date">{item.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="note">
              <strong>Note:</strong>
              UPSC schedules can be revised. Always refer to the latest
              official UPSC notification for any changes in examination dates.
            </div>

            <p>
              A simple way to use these dates is to keep them visible near
              your study desk or add them to your digital calendar. This can
              help you plan your preparation around actual examination
              milestones rather than studying without a fixed timeline.
            </p>
          </section>

          {/* Prelims */}

          <section className="article-section">
            <h2>UPSC Prelims 2026</h2>

            <p>
              The <strong>UPSC Civil Services Preliminary Examination
              2026</strong> is scheduled for <strong>24 May 2026</strong>.
            </p>

            <p>
              Prelims is the screening stage of the Civil Services
              Examination and consists of two objective-type papers.
            </p>

            <h3>General Studies Paper I</h3>

            <p>
              General Studies Paper I contains questions from areas such as:
            </p>

            <ul>
              <li>History and Indian National Movement</li>
              <li>Indian and World Geography</li>
              <li>Indian Polity and Governance</li>
              <li>Economic and Social Development</li>
              <li>Environment and Ecology</li>
              <li>General Science</li>
              <li>Current Affairs</li>
            </ul>

            <p>
              The marks obtained in General Studies Paper I are considered
              for determining the Prelims cut-off.
            </p>

            <h3>CSAT — General Studies Paper II</h3>

            <p>
              The Civil Services Aptitude Test, commonly known as CSAT, is
              the second paper of Prelims.
            </p>

            <p>
              CSAT is a <strong>qualifying paper</strong>, and candidates
              need to secure at least <strong>33% marks</strong> to qualify.
            </p>

            <p>
              Although CSAT marks are not counted towards the Prelims merit
              list, failing to qualify in CSAT means you cannot move forward
              to the Mains stage.
            </p>

            <p>
              Both papers are objective and conducted on the same day.
            </p>

            <p>
              The <strong>Indian Forest Service Preliminary Examination</strong>
              also uses the Civil Services Preliminary Examination as its
              screening examination.
            </p>
          </section>

          {/* Mains */}

          <section className="article-section">
            <h2>UPSC Mains 2026</h2>

            <p>
              The <strong>Civil Services Main Examination 2026</strong> is
              scheduled to begin from <strong>21 August 2026</strong>.
            </p>

            <p>
              Unlike Prelims, the Mains examination is descriptive and tests
              a candidate's ability to understand a topic, analyse it and
              present a well-structured answer.
            </p>

            <p>The examination includes:</p>

            <ul>
              <li>Essay Paper</li>
              <li>General Studies Paper I</li>
              <li>General Studies Paper II</li>
              <li>General Studies Paper III</li>
              <li>General Studies Paper IV</li>
              <li>Optional Subject Paper I</li>
              <li>Optional Subject Paper II</li>
            </ul>

            <p>
              Mains preparation requires more than simply remembering facts.
              Candidates need regular answer writing, revision, conceptual
              clarity and the ability to connect different topics.
            </p>

            <p>
              There is a relatively short gap between Prelims and Mains.
              Because of this, it is generally better to begin Mains-oriented
              preparation before the Prelims rather than starting everything
              from scratch after the Prelims result.
            </p>
          </section>

          {/* Download Calendar */}

          <section className="article-section">
            <h2>How to Download the UPSC Calendar 2026</h2>

            <p>
              Candidates can access the official UPSC examination calendar
              through the UPSC website.
            </p>

            <p>To find the calendar:</p>

            <ol>
              <li>
                Visit the official <strong>UPSC website</strong>.
              </li>

              <li>
                Open the <strong>Examination</strong> section.
              </li>

              <li>
                Look for the <strong>Calendar</strong> option.
              </li>

              <li>
                Find the annual calendar for <strong>2026</strong>.
              </li>

              <li>
                Open the official PDF to view or download it.
              </li>
            </ol>

            <p>
              The official UPSC website should be treated as the primary
              source whenever there is a difference between a published
              calendar and a later examination notification.
            </p>
          </section>

          {/* Preparation Tips */}

          <section className="article-section">
            <h2>How to Use the UPSC Calendar for Your Preparation</h2>

            <p>
              Knowing the examination date is only the beginning. The real
              benefit comes from turning the calendar into a preparation
              plan.
            </p>

            <h3>1. Start Before the Notification</h3>

            <p>
              Don't wait for the UPSC notification before beginning serious
              preparation.
            </p>

            <p>
              Use the months before the examination to build your
              fundamentals, complete the basic syllabus and identify areas
              that require additional revision.
            </p>

            <h3>2. Create a Realistic Timetable</h3>

            <p>
              A timetable should be practical enough to follow consistently.
            </p>

            <p>Divide your preparation between:</p>

            <ul>
              <li>New topics</li>
              <li>Revision</li>
              <li>Current affairs</li>
              <li>Previous Year Questions</li>
              <li>Mock tests</li>
              <li>Answer writing</li>
            </ul>

            <p>
              A timetable that you can follow every day is more useful than
              an ambitious schedule that becomes difficult to maintain.
            </p>

            <h3>3. Keep CSAT in Your Plan</h3>

            <p>
              CSAT is qualifying, but that does not mean it should be
              ignored.
            </p>

            <p>
              Regular practice of comprehension, reasoning, basic numeracy
              and data interpretation can help you stay comfortably above the
              qualifying requirement.
            </p>

            <h3>4. Start Mains Preparation Early</h3>

            <p>
              Prelims should remain an important priority, but Mains
              preparation should not be completely postponed.
            </p>

            <p>Gradually include:</p>

            <ul>
              <li>Answer writing</li>
              <li>Essay practice</li>
              <li>Optional subject preparation</li>
              <li>GS Mains topics</li>
              <li>Current affairs notes</li>
            </ul>

            <p>
              This reduces the pressure after Prelims.
            </p>

            <h3>5. Use PYQs and Mock Tests</h3>

            <p>
              Previous Year Questions are one of the most useful resources
              for understanding UPSC's question pattern.
            </p>

            <p>Use PYQs to identify:</p>

            <ul>
              <li>Frequently tested areas</li>
              <li>Question trends</li>
              <li>Difficulty level</li>
              <li>Important concepts</li>
              <li>How UPSC frames questions</li>
            </ul>

            <p>
              As Prelims approaches, gradually increase your mock-test
              practice and use your scores to identify weak areas.
            </p>

            <h3>6. Stay Consistent</h3>

            <p>
              Your preparation does not have to be perfect every day.
            </p>

            <p>
              What matters is consistency over several months.
            </p>

            <p>At the end of each month, review:</p>

            <ul>
              <li>Syllabus completed</li>
              <li>Revision completed</li>
              <li>PYQs attempted</li>
              <li>Mock-test performance</li>
              <li>Current affairs covered</li>
              <li>Topics that still need work</li>
            </ul>

            <p>
              Then adjust your next month's plan accordingly.
            </p>
          </section>

          {/* Study Plan */}

          <section className="article-section">
            <h2>Turn the UPSC Calendar Into Your Study Plan</h2>

            <p>
              The best way to use the UPSC calendar is to work backwards from
              the examination date.
            </p>

            <p>
              Instead of simply noting <strong>24 May — UPSC Prelims</strong>,
              break your preparation into smaller milestones.
            </p>

            <div className="plan-box">
              <h3>Before Prelims</h3>

              <ul>
                <li>Complete the core syllabus</li>
                <li>Finish important PYQs</li>
                <li>Build current affairs revision</li>
                <li>Complete multiple revision cycles</li>
                <li>Increase mock-test frequency</li>
              </ul>
            </div>

            <div className="plan-box">
              <h3>After Prelims</h3>

              <ul>
                <li>Shift your focus towards Mains</li>
                <li>Practise answer writing</li>
                <li>Revise GS subjects</li>
                <li>Work on Essay and Optional</li>
                <li>Analyse previous Mains questions</li>
              </ul>
            </div>

            <p>
              This turns the UPSC calendar from a simple list of dates into
              an actual preparation roadmap.
            </p>
          </section>

          {/* Notes Cafe */}

          <section className="article-section">
            <h2>Prepare Smarter with Notes Cafe</h2>

            <p>
              Notes Cafe brings important UPSC preparation resources
              together in one place, helping aspirants manage different
              stages of their preparation.
            </p>

            <div className="resource-grid">
              <div className="resource-card">
                <span>01</span>
                <h3>Study Material</h3>
                <p>
                  Organised notes and study resources for focused preparation.
                </p>
              </div>

              <div className="resource-card">
                <span>02</span>
                <h3>Maps & Atlas</h3>
                <p>
                  Geography and location-based resources for UPSC preparation.
                </p>
              </div>

              <div className="resource-card">
                <span>03</span>
                <h3>Government Resources</h3>
                <p>
                  Useful government-related resources collected for aspirants.
                </p>
              </div>

              <div className="resource-card">
                <span>04</span>
                <h3>Practice & Mock Tests</h3>
                <p>
                  Practice regularly and use your performance to identify
                  areas that need improvement.
                </p>
              </div>

              <div className="resource-card">
                <span>05</span>
                <h3>Previous Year Questions</h3>
                <p>
                  Understand UPSC's question pattern through PYQs and regular
                  practice.
                </p>
              </div>

              <div className="resource-card">
                <span>06</span>
                <h3>Planning Tools</h3>
                <p>
                  Use planning resources to organise your preparation around
                  important examination milestones.
                </p>
              </div>
            </div>

            <p className="closing-text">
              The goal is simple: <strong>know what to study, know when to
              study it, and keep track of your progress.</strong>
            </p>

            <p>
              Use the UPSC Calendar 2026 as your starting point, build your
              preparation milestones around the examination dates, and keep
              improving your strategy as you move closer to the exam.
            </p>

            <p className="final-line">
              Plan well. Study consistently. Revise smartly.
            </p>
          </section>

          {/* Important Note */}

          <div className="important-note">
            <strong>Important Note for UPSC Aspirants</strong>

            <p>
              The dates mentioned in the annual calendar provide a useful
              planning reference, but UPSC may make changes to its
              examination schedule. Before applying for an examination or
              making major changes to your preparation plan, check the latest
              official UPSC notification.
            </p>
          </div>

        </div>
      </main>

      <style jsx>{`
        .upsc-page {
          min-height: 100vh;
          background: #ffffff;
          color: #030406;
        }

        .article-container {
          width: 100%;
          max-width: 1440px;
          margin: 0 auto;
          padding: 32px 48px 90px;
        }

        /* Breadcrumb */

        .breadcrumb {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 34px;
          font-size: 13px;
          line-height: 1.5;
          color: #7a8496;
        }

        .breadcrumb strong {
          color: #374151;
          font-weight: 500;
        }

        /* Header */

        .article-header {
          max-width: 1180px;
        }

        .article-header h1 {
          margin: 0 0 12px;
          font-size: clamp(34px, 4vw, 52px);
          line-height: 1.12;
          letter-spacing: -1.5px;
          font-weight: 750;
          color: #111827;
        }

        .article-meta {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 30px;
          font-size: 13px;
          color: #0c111c;
        }

        .meta-dot {
          color: #15181e;
        }

        /* Typography */

        .article-container p {
          margin: 0 0 18px;
          font-size: 16px;
          line-height: 1.85;
          color: #64748b;
        }

        .article-header p {
          max-width: 1280px;
        }

        .article-header .intro {
          font-size: 17px;
          line-height: 1.85;
          color: #070809;
        }

        .article-container strong {
          color: #010101;
          font-weight: 650;
        }

        /* Sections */

        .article-section {
          margin-top: 58px;
          max-width: 1120px;
        }

        .article-section h2 {
          margin: 0 0 12px;
          font-size: 28px;
          line-height: 1.3;
          letter-spacing: -0.5px;
          color: #111827;
          font-weight: 720;
        }

        .article-section h3 {
          margin: 30px 0 9px;
          font-size: 19px;
          line-height: 1.4;
          color: #172033;
          font-weight: 650;
        }

        /* Lists */

        .article-container ul,
        .article-container ol {
          margin: 10px 0 22px;
          padding-left: 24px;
        }

        .article-container li {
          margin-bottom: 9px;
          padding-left: 4px;
          font-size: 15px;
          line-height: 1.7;
          color: #020408;
        }

        .article-container ol li::marker {
          color: #060a13;
          font-weight: 600;
        }

        /* Table */

        .table-wrapper {
          width: 100%;
          overflow-x: auto;
          margin: 26px 0 20px;
          border: 1px solid #e2e6ec;
          border-radius: 9px;
          background: #ffffff;
        }

        table {
          width: 100%;
          min-width: 760px;
          border-collapse: collapse;
        }

        thead {
          background: #f7f8fa;
        }

        th {
          padding: 16px 18px;
          text-align: left;
          font-size: 13px;
          font-weight: 650;
          color: #090f17;
          border-bottom: 1px solid #e2e6ec;
        }

        td {
          padding: 18px;
          vertical-align: top;
          font-size: 14px;
          line-height: 1.6;
          color: #07080a;
          border-bottom: 1px solid #edf0f3;
        }

        tbody tr:last-child td {
          border-bottom: none;
        }

        tbody tr:hover {
          background: #fafbfc;
        }

        .exam-name {
          width: 38%;
          color: #172033;
          font-weight: 620;
        }

        .exam-date {
          color: #172033;
          font-weight: 620;
        }

        /* Note */

        .note {
          margin: 22px 0 26px;
          padding: 16px 18px;
          border-left: 3px solid #3b82f6;
          background: #f7f9fc;
          border-radius: 4px;
          font-size: 14px;
          line-height: 1.7;
          color: #64748b;
        }

        .note strong {
          color: #172033;
        }

        /* Preparation plan */

        .plan-box {
          margin: 20px 0;
          padding: 22px 24px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: #fafbfc;
        }

        .plan-box h3 {
          margin: 0 0 10px;
          font-size: 17px;
        }

        .plan-box ul {
          margin-bottom: 0;
        }

        /* Resources */

        .resource-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin: 28px 0 30px;
        }

        .resource-card {
          padding: 22px;
          border: 1px solid #e3e7ed;
          border-radius: 9px;
          background: #ffffff;
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease,
            transform 0.2s ease;
        }

        .resource-card:hover {
          border-color: #cfd5df;
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
          transform: translateY(-2px);
        }

        .resource-card span {
          display: block;
          margin-bottom: 13px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #94a3b8;
        }

        .resource-card h3 {
          margin: 0 0 8px;
          font-size: 16px;
          color: #172033;
        }

        .resource-card p {
          margin: 0;
          font-size: 13px;
          line-height: 1.65;
        }

        .closing-text {
          margin-top: 30px !important;
        }

        .final-line {
          margin-top: 26px !important;
          font-size: 18px !important;
          font-weight: 650;
          color: #172033 !important;
        }

        /* Important note */

        .important-note {
          max-width: 1120px;
          margin-top: 58px;
          padding: 22px 24px;
          border: 1px solid #e1e5eb;
          border-radius: 8px;
          background: #f8fafc;
        }

        .important-note strong {
          display: block;
          margin-bottom: 8px;
          font-size: 15px;
          color: #172033;
        }

        .important-note p {
          margin: 0;
          font-size: 14px;
          line-height: 1.7;
        }

        /* Responsive */

        @media (max-width: 1000px) {
          .article-container {
            padding-left: 30px;
            padding-right: 30px;
          }

          .resource-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 700px) {
          .article-container {
            padding: 26px 18px 60px;
          }

          .breadcrumb {
            margin-bottom: 26px;
            font-size: 12px;
          }

          .article-header h1 {
            font-size: 32px;
            letter-spacing: -0.8px;
          }

          .article-header .intro {
            font-size: 15px;
          }

          .article-container p {
            font-size: 15px;
            line-height: 1.75;
          }

          .article-section {
            margin-top: 44px;
          }

          .article-section h2 {
            font-size: 24px;
          }

          .article-section h3 {
            font-size: 18px;
          }

          .resource-grid {
            grid-template-columns: 1fr;
          }

          .table-wrapper {
            border-radius: 7px;
          }

          th,
          td {
            padding: 14px;
          }
        }
      `}</style>
    </>
  );
}