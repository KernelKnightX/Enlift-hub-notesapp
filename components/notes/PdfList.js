import { useState, useEffect, useCallback } from 'react';
import { storage } from '../../firebase/config'; // Adjust path to your firebase config
import { ref, listAll, getDownloadURL, getMetadata } from 'firebase/storage';
import PdfCard from './PdfCard';

export default function PdfList({ onSelectPdf, selectedPdfUrl }) {
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPdfsFromFirebase();

    // Optional: Set up periodic refresh to check for new uploads
    const interval = setInterval(() => {
      fetchPdfsFromFirebase();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [fetchPdfsFromFirebase]);

  const fetchPdfsFromFirebase = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Reference to your PDFs folder in Firebase Storage
      const pdfsRef = ref(storage, 'pdfs'); // Adjust path as needed
      
      // List all files in the pdfs folder
      const result = await listAll(pdfsRef);
      
      if (result.items.length === 0) {
        setPdfs([]);
        setLoading(false);
        return;
      }

      // Get download URLs and metadata for each file
      const pdfPromises = result.items.map(async (itemRef, index) => {
        try {
          const [downloadURL, metadata] = await Promise.all([
            getDownloadURL(itemRef),
            getMetadata(itemRef)
          ]);

          return {
            id: `${itemRef.fullPath}-${index}`,
            name: itemRef.name.replace('.pdf', ''),
            title: itemRef.name.replace('.pdf', '').replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            url: downloadURL,
            size: metadata.size,
            createdAt: metadata.timeCreated,
            updatedAt: metadata.updated,
            contentType: metadata.contentType,
            pages: null,
            subject: extractSubjectFromFilename(itemRef.name),
            description: `PDF document: ${itemRef.name.replace('.pdf', '').replace(/[-_]/g, ' ')}`,
            fullPath: itemRef.fullPath,
            bucket: metadata.bucket,
            customMetadata: metadata.customMetadata || {},
            fileName: itemRef.name
          };
        } catch (fileError) {
          console.error(`Error processing file ${itemRef.name}:`, fileError);
          return null;
        }
      });

      const pdfResults = await Promise.all(pdfPromises);
      const validPdfs = pdfResults.filter(pdf => pdf !== null);
      
      // Sort by creation date (newest first)
      validPdfs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setPdfs(validPdfs);
    } catch (err) {
      console.error('Error fetching PDFs from Firebase Storage:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const extractSubjectFromFilename = (filename) => {
    const name = filename.toLowerCase();
    
    if (name.includes('current') && name.includes('affairs')) return 'Current Affairs';
    if (name.includes('math') || name.includes('mathematics')) return 'Mathematics';
    if (name.includes('science')) return 'Science';
    if (name.includes('history')) return 'History';
    if (name.includes('english')) return 'English';
    if (name.includes('physics')) return 'Physics';
    if (name.includes('chemistry')) return 'Chemistry';
    if (name.includes('biology')) return 'Biology';
    if (name.includes('geography')) return 'Geography';
    if (name.includes('economics')) return 'Economics';
    if (name.includes('political')) return 'Political Science';
    
    return 'General';
  };

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
        <p style={{ marginTop: '10px' }}>Loading PDFs from Firebase Storage...</p>
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
        <p>Firebase Storage Error: {error}</p>
        <button 
          onClick={fetchPdfsFromFirebase}
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
        <p>No PDFs found in Firebase Storage</p>
        <p style={{ fontSize: '14px', marginTop: '10px' }}>
          Make sure the admin has uploaded PDFs to Firebase Storage.
        </p>
        <button 
          onClick={fetchPdfsFromFirebase}
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
          onClick={fetchPdfsFromFirebase}
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