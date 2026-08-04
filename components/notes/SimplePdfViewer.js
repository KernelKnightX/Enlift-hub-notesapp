import React, { useState, useEffect } from 'react';

const SimplePdfViewer = ({ pdfUrl }) => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize loading state when PDF URL changes
  useEffect(() => {
    if (pdfUrl) {
      setLoading(true);
      setError(null);
    }
  }, [pdfUrl]);

  const handleIframeError = () => {
    console.error('PDF iframe failed to load');
    setError(true);
    setLoading(false);
  };

  const handleIframeLoad = () => {
    console.log('PDF iframe loaded successfully');
    setLoading(false);
    setError(false);
  };

  // Prevent cross-origin access attempts
  const handleIframeMessage = (event) => {
    // Only allow messages from the same origin
    if (event.origin !== window.location.origin) {
      console.warn('Blocked cross-origin message from iframe:', event.origin);
      return;
    }
    // Handle any legitimate messages if needed
  };

  // Add message listener for iframe communication
  useEffect(() => {
    window.addEventListener('message', handleIframeMessage);
    return () => window.removeEventListener('message', handleIframeMessage);
  }, []);

  // Handle case when no PDF is selected
  if (!pdfUrl) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        flexDirection: 'column',
        color: '#64748b',
        backgroundColor: '#f8fafc',
        border: '2px dashed #e2e8f0',
        borderRadius: '8px'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
        <p>Select a PDF to view</p>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', minHeight: '500px' }}>
      <div style={{ flex: 1, position: 'relative', minHeight: '500px' }}>
        {error ? (
          // Error state - show fallback UI
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            flexDirection: 'column',
            color: '#dc2626',
            backgroundColor: '#fef2f2',
            border: '2px dashed #fecaca',
            borderRadius: '8px',
            padding: '2rem'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <h4 style={{ margin: '0 0 10px 0' }}>Cannot display PDF</h4>
            <p style={{ 
              margin: '0 0 20px 0', 
              textAlign: 'center', 
              color: '#64748b', 
              maxWidth: '80%' 
            }}>
              The PDF viewer failed to load. Try opening it in a new tab.
            </p>
            <button 
              onClick={() => window.open(pdfUrl, '_blank')}
              style={{
                padding: '10px 20px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
            >
              Open in New Tab
            </button>
          </div>
        ) : (
          <>
            {/* Loading overlay */}
            {loading && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(248, 250, 252, 0.95)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                backdropFilter: 'blur(2px)'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div 
                    className="spinner-border text-primary mb-3" 
                    role="status" 
                    style={{ width: '3rem', height: '3rem' }}
                  >
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <div style={{ color: '#64748b', fontWeight: '500' }}>
                    Loading PDF...
                  </div>
                  <small style={{ 
                    color: '#94a3b8', 
                    marginTop: '8px', 
                    display: 'block' 
                  }}>
                    This may take a moment for large files
                  </small>
                </div>
              </div>
            )}
            
            {/* PDF Viewer - Use Google Docs Viewer for Firebase Storage URLs */}
            <iframe
              src={`https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`}
              style={{
                width: '100%',
                height: '100%',
                minHeight: '500px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                backgroundColor: 'white'
              }}
              onError={handleIframeError}
              onLoad={handleIframeLoad}
              title="PDF Viewer"
              allow="fullscreen"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default SimplePdfViewer;