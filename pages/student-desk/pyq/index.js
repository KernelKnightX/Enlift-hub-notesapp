import { useEffect, useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useRouter } from "next/router";
import { withAuth } from "@/utils/withAuth";
import { db } from "../../../firebase/config";
import {
  collection,
  getDocs,
  query,
  orderBy
} from "firebase/firestore";

function PYQDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [pyqSubjects, setPyqSubjects] = useState([]);

  // Load PYQ subjects and PDFs from Firestore (separate from admin nodes)
  useEffect(() => {
    const loadPyqSubjects = async () => {
      // ✅ FIX: Don't run if user is not authenticated
      if (!user) {
        console.log('Waiting for user authentication...');
        return;
      }

      try {
        // Fetch from 'pyqs' collection (plural) as used in admin
        const q = query(collection(db, 'pyqs'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const pyqData = snapshot.docs.map((pyqDoc) => {
          const data = pyqDoc.data();
          return {
            id: pyqDoc.id,
            name: data.title || 'Untitled PYQ',
            examType: data.examType,
            year: data.year,
            description: data.description,
            pdfs: [{
              id: pyqDoc.id,
              name: data.fileName || 'PYQ Paper',
              url: data.downloadURL,
              size: data.fileSize ? `${(data.fileSize / (1024 * 1024)).toFixed(2)} MB` : 'Size N/A',
              uploadedAt: data.createdAt
            }]
          };
        });
        setPyqSubjects(pyqData);
      } catch (error) {
        console.error('Error loading PYQ subjects:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPyqSubjects();
  }, [user]); // ✅ FIX: Add user as dependency

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ 
          width: '50px', 
          height: '50px', 
          border: '5px solid rgba(255,255,255,0.3)',
          borderTop: '5px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '20px'
    }}>
      {/* Header Section */}
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{
              fontSize: '32px',
              margin: '0',
              color: '#2D3748',
              fontWeight: '700'
            }}>
              📚 PYQ Papers
            </h1>
            <p style={{
              fontSize: '16px',
              color: '#718096',
              margin: '8px 0 0 0'
            }}>
              Download Previous Year Question Papers for UPSC CDS
            </p>
          </div>
          <button
            onClick={() => router.push('/student-desk/dashboard')}
            style={{
              background: '#E2E8F0',
              color: '#4A5568',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#CBD5E0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#E2E8F0';
            }}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {/* PYQ Subjects Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '20px'
      }}>
        {pyqSubjects.map((subject) => (
          <PyqSubjectCard
            key={subject.id}
            subject={subject}
          />
        ))}
      </div>

      {pyqSubjects.length === 0 && !loading && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: 'white',
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
          <h3 style={{ margin: '0 0 8px 0', color: '#2D3748' }}>No PYQ Papers Available</h3>
          <p style={{ margin: '0', color: '#718096' }}>PYQ papers will be uploaded soon by administrators.</p>
        </div>
      )}
    </div>
  );
}

// PYQ Subject Card Component
function PyqSubjectCard({ subject }) {
  const totalPdfs = subject.pdfs?.length || 0;

  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
    }}
    >
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#2D3748',
          margin: '0 0 8px 0'
        }}>
          {subject.name}
        </h3>
        <p style={{
          fontSize: '14px',
          color: '#718096',
          margin: '0'
        }}>
          {subject.examType} {subject.year ? `• ${subject.year}` : ''} • {totalPdfs} {totalPdfs === 1 ? 'file' : 'files'} available
        </p>
        {subject.description && (
          <p style={{
            fontSize: '12px',
            color: '#A0AEC0',
            margin: '4px 0 0 0'
          }}>
            {subject.description}
          </p>
        )}
      </div>

      {subject.pdfs && subject.pdfs.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {subject.pdfs.map((pdf) => (
            <div key={pdf.id} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px',
              background: '#F8FAFC',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#EFF6FF';
              e.currentTarget.style.borderColor = '#BFDBFE';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#F8FAFC';
              e.currentTarget.style.borderColor = '#E2E8F0';
            }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: '#DC2626',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  flexShrink: 0
                }}>
                  📄
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#2D3748',
                    marginBottom: '2px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {pdf.name}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#718096'
                  }}>
                    {pdf.size && `${pdf.size} • `}
                    {pdf.uploadedAt?.toDate ? pdf.uploadedAt.toDate().toLocaleDateString() : 'Date N/A'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => window.open(pdf.url, '_blank')}
                style={{
                  background: '#3B82F6',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  flexShrink: 0,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#2563EB';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#3B82F6';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                📥 Download
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#718096'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>📄</div>
          <div style={{ fontSize: '14px' }}>No PDFs uploaded yet</div>
        </div>
      )}
    </div>
  );
}

export default withAuth(PYQDashboard);