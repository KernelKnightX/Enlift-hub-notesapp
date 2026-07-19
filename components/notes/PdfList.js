import { useState, useEffect, useCallback } from 'react';
import { db } from '../../firebase/config';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import PdfCard from './PdfCard';

export default function PdfList({ onSelectPdf, selectedPdfUrl }) {
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPdfsFromFirestore = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch PDFs from Firestore pdfs collection
      const pdfsRef = collection(db, 'pdfs');
      const pdfsSnapshot = await getDocs(query(pdfsRef, orderBy('createdAt', 'desc')));

      const allPdfs = [];

      // Get all PDFs
      pdfsSnapshot.docs.forEach((pdfDoc) => {
        const pdfData = pdfDoc.data();
        allPdfs.push({
          id: pdfDoc.id,
          name: pdfData.title,
          title: pdfData.title,
          url: pdfData.url,
          size: pdfData.size,
          createdAt: pdfData.createdAt?.toDate?.() || new Date(pdfData.createdAt),
          updatedAt: pdfData.createdAt?.toDate?.() || new Date(pdfData.createdAt),
          contentType: 'application/pdf',
          pages: pdfData.pages || null,
          subject: pdfData.subjectId,
          subjectId: pdfData.subjectId,
          description: pdfData.description || pdfData.title,
          fullPath: pdfData.url,
        });
      });

      // Sort by upload date (newest first)
      allPdfs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setPdfs(allPdfs);
    } catch (err) {
      console.error('Error fetching PDFs from Firestore:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPdfsFromFirestore();

    // Optional: Set up periodic refresh to check for new uploads
    const interval = setInterval(() => {
      fetchPdfsFromFirestore();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [fetchPdfsFromFirestore]);

  if (loading) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        color: '#666'
      }}>
        <div style={{ 
          display: 'inline-block',
          width: '20px',
          height: '20px',
          border: '2px solid #3b82f6',
          borderTop: '2px solid transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ marginTop: '10px' }}>Loading PDFs...</p>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        color: '#dc2626',
        backgroundColor: '#fef2f2',
        borderRadius: '8px',
        margin: '10px'
      }}>
        <p>Error loading PDFs: {error}</p>
        <button 
          onClick={fetchPdfsFromFirestore}
          style={{
            padding: '8px 16px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (pdfs.length === 0) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        color: '#666',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        margin: '10px'
      }}>
        <p>No PDFs found</p>
        <p style={{ fontSize: '14px', marginTop: '10px' }}>
          Make sure the admin has uploaded PDFs to the dashboard.
        </p>
        <button 
          onClick={fetchPdfsFromFirestore}
          style={{
            padding: '6px 12px',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '10px',
            fontSize: '12px'
          }}
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '10px',
      maxHeight: '70vh',
      overflowY: 'auto'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px'
      }}>
        <h3 style={{ 
          margin: '0',
          color: '#374151',
          fontSize: '18px'
        }}>
          Available PDFs ({pdfs.length})
        </h3>
        <button 
          onClick={fetchPdfsFromFirestore}
          style={{
            padding: '4px 8px',
            background: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
          title="Refresh PDF list"
        >
          🔄 Refresh
        </button>
      </div>
      
      <div style={{
        display: 'grid',
        gap: '10px'
      }}>
        {pdfs.map((pdf) => (
          <PdfCard
            key={pdf.id}
            pdf={pdf}
            onSelect={() => onSelectPdf(pdf.url)}
            isSelected={selectedPdfUrl === pdf.url}
          />
        ))}
      </div>
    </div>
  );
}
