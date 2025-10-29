import { useState } from 'react';

export default function PdfCard({ pdf, onSelect, isSelected }) {
  const [imageError, setImageError] = useState(false);

  const cardStyle = {
    border: isSelected ? '2px solid #3b82f6' : '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: isSelected ? '#eff6ff' : 'white',
    boxShadow: isSelected ? '0 4px 12px rgba(59, 130, 246, 0.15)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
    ':hover': {
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      transform: 'translateY(-1px)'
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div 
      style={cardStyle}
      onClick={onSelect}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
          e.target.style.transform = 'translateY(-1px)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
          e.target.style.transform = 'translateY(0)';
        }
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        {/* PDF Thumbnail/Icon */}
        <div style={{
          width: '48px',
          height: '60px',
          backgroundColor: '#dc2626',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          position: 'relative'
        }}>
          {pdf.thumbnail && !imageError ? (
            <img 
              src={pdf.thumbnail}
              alt={pdf.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '4px'
              }}
              onError={() => setImageError(true)}
            />
          ) : (
            <span style={{
              color: 'white',
              fontSize: '10px',
              fontWeight: 'bold'
            }}>
              PDF
            </span>
          )}
        </div>

        {/* PDF Details */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{
            margin: '0 0 4px 0',
            fontSize: '14px',
            fontWeight: '600',
            color: '#111827',
            lineHeight: '1.3',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {pdf.name || pdf.title || 'Unnamed PDF'}
          </h4>
          
          {pdf.description && (
            <p style={{
              margin: '0 0 8px 0',
              fontSize: '12px',
              color: '#6b7280',
              lineHeight: '1.4',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}>
              {pdf.description}
            </p>
          )}

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            fontSize: '11px',
            color: '#9ca3af'
          }}>
            {pdf.size && (
              <span>{formatFileSize(pdf.size)}</span>
            )}
            {pdf.pages && (
              <span>{pdf.pages} pages</span>
            )}
            {pdf.createdAt && (
              <span>{formatDate(pdf.createdAt)}</span>
            )}
          </div>

          {pdf.subject && (
            <span style={{
              display: 'inline-block',
              backgroundColor: '#e0f2fe',
              color: '#0369a1',
              padding: '2px 6px',
              borderRadius: '12px',
              fontSize: '10px',
              fontWeight: '500',
              marginTop: '6px'
            }}>
              {pdf.subject}
            </span>
          )}
        </div>

        {/* Selection Indicator */}
        {isSelected && (
          <div style={{
            width: '20px',
            height: '20px',
            backgroundColor: '#3b82f6',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <span style={{ color: 'white', fontSize: '12px' }}>✓</span>
          </div>
        )}
      </div>
    </div>
  );
}