import React, { useState } from 'react';
import { BookOpen, Target, Award, Calendar } from 'lucide-react';

const Syllabus = () => {
  const [activeTab, setActiveTab] = useState('cds');

  const tabs = [
    { id: 'cds', label: 'CDS', icon: '🪖' },
    { id: 'afcat', label: 'AFCAT', icon: '✈️' },
    { id: 'nda', label: 'NDA', icon: '🎖️' },
    { id: 'roadmap', label: 'Prep Plan', icon: '🗓️' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-800">Defence Examination Syllabus</h1>
          </div>
          <p className="text-gray-600">Complete syllabus guide for CDS, AFCAT & NDA exams</p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-6 p-2">
          <div className="flex gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {activeTab === 'cds' && <CDSContent />}
          {activeTab === 'afcat' && <AFCATContent />}
          {activeTab === 'nda' && <NDAContent />}
          {activeTab === 'roadmap' && <RoadmapContent />}
        </div>
      </div>
    </div>
  );
};

const CDSContent = () => (
  <div>
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-3">Combined Defence Services (CDS)</h2>
      <div className="flex gap-4 text-sm text-gray-600">
        <span className="bg-blue-100 px-3 py-1 rounded-full">Conducted by: UPSC</span>
        <span className="bg-green-100 px-3 py-1 rounded-full">For: IMA, INA, AFA, OTA</span>
      </div>
    </div>

    <div className="mb-8">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Target className="w-5 h-5 text-indigo-600" />
        Exam Pattern
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-indigo-600 text-white">
              <th className="p-3 text-left">Academy</th>
              <th className="p-3 text-left">Subjects</th>
              <th className="p-3 text-left">Marks</th>
              <th className="p-3 text-left">Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b hover:bg-gray-50">
              <td className="p-3 font-medium">IMA, INA, AFA</td>
              <td className="p-3">English, GK, Elementary Mathematics</td>
              <td className="p-3">300 (100 each)</td>
              <td className="p-3">2 hrs per paper</td>
            </tr>
            <tr className="border-b hover:bg-gray-50">
              <td className="p-3 font-medium">OTA</td>
              <td className="p-3">English, General Knowledge</td>
              <td className="p-3">200 (100 each)</td>
              <td className="p-3">2 hrs per paper</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-indigo-600" />
        Detailed Syllabus
      </h3>

      <SyllabusSection
        title="A. English"
        items={[
          'Vocabulary (Synonyms, Antonyms)',
          'Sentence Correction & Improvement',
          'Spotting Errors',
          'Fill in the Blanks',
          'Reading Comprehension',
          'Active–Passive Voice, Direct–Indirect Speech',
          'Para Jumbles, Cloze Test'
        ]}
      />

      <SyllabusSection
        title="B. General Knowledge"
        items={[
          'Current Affairs (National + International)',
          'Indian History (Modern, Medieval, Ancient)',
          'Indian Polity & Constitution',
          'Geography (India + World)',
          'Economy & Budget',
          'Science (Physics, Chemistry, Biology – basics)',
          'Defence-related Awareness (Commands, Ranks, Aircrafts, Missiles)',
          'Awards, Sports, Books, Important Dates'
        ]}
      />

      <SyllabusSection
        title="C. Elementary Mathematics"
        subtitle="(For IMA, INA, AFA only)"
        items={[
          'Arithmetic: Number System, Ratio & Proportion, Percentage, Time-Speed-Distance, Simple & Compound Interest, Average, Profit & Loss',
          'Algebra: Basic Operations, Linear & Quadratic Equations, Inequalities',
          'Geometry: Lines, Angles, Triangles, Circles, Mensuration',
          'Trigonometry: Height & Distance, Basic Identities, Values of Angles',
          'Statistics: Mean, Median, Mode, Bar Graphs, Pie Charts'
        ]}
      />
    </div>
  </div>
);

const AFCATContent = () => (
  <div>
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-3">Air Force Common Admission Test (AFCAT)</h2>
      <div className="flex gap-4 text-sm text-gray-600">
        <span className="bg-blue-100 px-3 py-1 rounded-full">Conducted by: Indian Air Force</span>
        <span className="bg-green-100 px-3 py-1 rounded-full">For: Flying Branch, Ground Duty</span>
      </div>
    </div>

    <div className="mb-8">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Target className="w-5 h-5 text-indigo-600" />
        Exam Pattern
      </h3>
      <div className="bg-gray-50 border-l-4 border-indigo-600 p-4 rounded">
        <p className="text-gray-700"><strong>Paper:</strong> AFCAT</p>
        <p className="text-gray-700"><strong>Subjects:</strong> General Awareness, Verbal Ability, Numerical Ability, Reasoning & Military Aptitude</p>
        <p className="text-gray-700"><strong>Marks:</strong> 300</p>
        <p className="text-gray-700"><strong>Duration:</strong> 2 hours</p>
      </div>
    </div>

    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-indigo-600" />
        Detailed Syllabus
      </h3>

      <SyllabusSection
        title="A. General Awareness"
        items={[
          'Current Affairs (Defence, Economy, Sports, Awards)',
          'History (Freedom Struggle, Cultural Movements)',
          'Geography (Physical + Political)',
          'Polity & Constitution',
          'Environment & Ecology',
          'Science and Technology'
        ]}
      />

      <SyllabusSection
        title="B. Verbal Ability (English)"
        items={[
          'Synonyms, Antonyms',
          'Error Detection',
          'Sentence Completion',
          'Comprehension Passage',
          'Idioms & Phrases',
          'Fill in the Blanks',
          'Grammar Rules (Tenses, Voice, Speech)'
        ]}
      />

      <SyllabusSection
        title="C. Numerical Ability"
        items={[
          'Ratio & Proportion',
          'Average',
          'Percentage',
          'Profit & Loss',
          'Simple & Compound Interest',
          'Time, Speed, Distance',
          'Number System',
          'Probability & Permutation (basic)'
        ]}
      />

      <SyllabusSection
        title="D. Reasoning and Military Aptitude"
        items={[
          'Verbal Reasoning (Analogy, Coding-Decoding, Series)',
          'Non-Verbal Reasoning (Figures, Mirror Images, Odd One Out)',
          'Spatial Ability',
          'Direction & Distance',
          'Embedded Figures'
        ]}
      />
    </div>
  </div>
);

const NDAContent = () => (
  <div>
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-3">National Defence Academy (NDA)</h2>
      <div className="flex gap-4 text-sm text-gray-600">
        <span className="bg-blue-100 px-3 py-1 rounded-full">Conducted by: UPSC</span>
        <span className="bg-green-100 px-3 py-1 rounded-full">For: Army, Navy, Air Force wings</span>
      </div>
    </div>

    <div className="mb-8">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Target className="w-5 h-5 text-indigo-600" />
        Exam Pattern
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-indigo-600 text-white">
              <th className="p-3 text-left">Paper</th>
              <th className="p-3 text-left">Subject</th>
              <th className="p-3 text-left">Marks</th>
              <th className="p-3 text-left">Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b hover:bg-gray-50">
              <td className="p-3 font-medium">Paper I</td>
              <td className="p-3">Mathematics</td>
              <td className="p-3">300</td>
              <td className="p-3">2.5 hrs</td>
            </tr>
            <tr className="border-b hover:bg-gray-50">
              <td className="p-3 font-medium">Paper II</td>
              <td className="p-3">General Ability Test (GAT)</td>
              <td className="p-3">600</td>
              <td className="p-3">2.5 hrs</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-indigo-600" />
        Detailed Syllabus
      </h3>

      <SyllabusSection
        title="A. Mathematics"
        items={[
          'Algebra',
          'Matrices and Determinants',
          'Trigonometry',
          'Analytical Geometry (2D & 3D)',
          'Differential Calculus',
          'Integral Calculus & Differential Equations',
          'Vector Algebra',
          'Statistics & Probability'
        ]}
      />

      <SyllabusSection
        title="B. General Ability Test (GAT)"
        subtitle="Part A – English (200 marks)"
        items={[
          'Grammar & Usage',
          'Vocabulary',
          'Comprehension',
          'Synonyms/Antonyms',
          'Sentence Correction',
          'Para Jumbles'
        ]}
      />

      <SyllabusSection
        subtitle="Part B – General Knowledge (400 marks)"
        items={[
          'Physics: Laws of Motion, Light, Sound, Electricity, Magnetism',
          'Chemistry: Elements, Compounds, Acids, Bases, Salts, Carbon Compounds',
          'Biology: Human Body, Food, Health & Diseases',
          'History: Indian Freedom Struggle, Culture, Constitution',
          'Geography: Earth Structure, Climate, Soils, Minerals, Rivers',
          'Current Events: Defence Exercises, International Relations, Awards, Sports'
        ]}
      />
    </div>
  </div>
);

const RoadmapContent = () => (
  <div>
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-3 flex items-center gap-2">
        <Calendar className="w-7 h-7 text-indigo-600" />
        Preparation Roadmap (3-6 Months)
      </h2>
      <p className="text-gray-600">Strategic month-by-month preparation plan</p>
    </div>

    <div className="space-y-4">
      {[
        {
          month: 'Month 1',
          focus: 'Foundation Building',
          tasks: 'Revise NCERT (6-10) for Maths, Science, Polity, Geography',
          color: 'blue'
        },
        {
          month: 'Month 2',
          focus: 'Practice & Application',
          tasks: 'Daily 2 mock tests (subject-wise) + Current Affairs',
          color: 'green'
        },
        {
          month: 'Month 3',
          focus: 'Full Revision',
          tasks: 'Previous year papers (CDS + NDA + AFCAT)',
          color: 'purple'
        },
        {
          month: 'Month 4-6',
          focus: 'Advanced Practice',
          tasks: 'Weekly full mocks, speed accuracy drills, newspaper summaries',
          color: 'orange'
        }
      ].map((phase, idx) => (
        <div key={idx} className={`border-l-4 border-${phase.color}-500 bg-gray-50 p-5 rounded-r-lg`}>
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-bold text-gray-800">{phase.month}</h3>
            <span className={`bg-${phase.color}-100 text-${phase.color}-700 px-3 py-1 rounded-full text-sm font-medium`}>
              {phase.focus}
            </span>
          </div>
          <p className="text-gray-700">{phase.tasks}</p>
        </div>
      ))}
    </div>

    <div className="mt-8 bg-indigo-50 border border-indigo-200 rounded-lg p-6">
      <h3 className="font-semibold text-indigo-900 mb-3">📌 Quick Tips</h3>
      <ul className="space-y-2 text-gray-700">
        <li className="flex items-start gap-2">
          <span className="text-indigo-600 font-bold">•</span>
          <span>Maintain a daily current affairs notebook</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-indigo-600 font-bold">•</span>
          <span>Focus on accuracy over speed initially</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-indigo-600 font-bold">•</span>
          <span>Revise formulas and concepts weekly</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-indigo-600 font-bold">•</span>
          <span>Analyze mistakes in mock tests thoroughly</span>
        </li>
      </ul>
    </div>
  </div>
);

const SyllabusSection = ({ title, subtitle, items }) => (
  <div className="border-l-4 border-indigo-400 pl-4">
    {title && <h4 className="font-semibold text-gray-800 mb-2">{title}</h4>}
    {subtitle && <p className="text-sm text-gray-600 italic mb-2">{subtitle}</p>}
    <ul className="space-y-2">
      {items.map((item, idx) => (
        <li key={idx} className="flex items-start gap-2 text-gray-700">
          <span className="text-indigo-600 mt-1">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default Syllabus;