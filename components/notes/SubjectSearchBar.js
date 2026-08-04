'use client';

import { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, query, getDocs } from 'firebase/firestore';

export default function SubjectSearchBar({ onSearch, onSubjectSelect, selectedSubject }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch all subjects from Firestore
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        const subjectsRef = collection(db, 'subjects');
        const snapshot = await getDocs(subjectsRef);
        
        const subjectsList = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          ...doc.data()
        }));
        
        setSubjects(subjectsList);
      } catch (error) {
        console.error('Error fetching subjects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowDropdown(true);
    
    // Filter subjects based on search
    const filtered = subjects.filter(subject =>
      subject.name?.toLowerCase().includes(value.toLowerCase())
    );
    
    if (onSearch) {
      onSearch(value);
    }
  };

  // Handle subject selection
  const handleSubjectSelect = (subject) => {
    setSearchTerm(subject.name);
    setShowDropdown(false);
    if (onSubjectSelect) {
      onSubjectSelect(subject);
    }
  };

  // Clear selection
  const handleClear = () => {
    setSearchTerm('');
    setShowDropdown(false);
    if (onSubjectSelect) {
      onSubjectSelect(null);
    }
  };

  // Filtered subjects for dropdown
  const filteredSubjects = searchTerm
    ? subjects.filter(subject =>
        subject.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : subjects;

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '8px 12px',
        backgroundColor: 'white',
        gap: '8px'
      }}>
        {/* Search Icon */}
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="#9ca3af" 
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>

        {/* Search Input */}
        <input
          type="text"
          placeholder={loading ? "Loading subjects..." : "Search subjects..."}
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={() => setShowDropdown(true)}
          disabled={loading}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            fontSize: '14px',
            color: '#374151',
            backgroundColor: 'transparent'
          }}
        />

        {/* Clear Button */}
        {searchTerm && (
          <button
            onClick={handleClear}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#9ca3af" 
              strokeWidth="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Filter Indicator */}
        {selectedSubject && (
          <span style={{
            backgroundColor: '#dbeafe',
            color: '#1e40af',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '500'
          }}>
            {selectedSubject.name}
          </span>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && filteredSubjects.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '4px',
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          maxHeight: '300px',
          overflowY: 'auto',
          zIndex: 50
        }}>
          {filteredSubjects.map((subject) => (
            <div
              key={subject.id}
              onClick={() => handleSubjectSelect(subject)}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                borderBottom: '1px solid #f3f4f6',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f9fafb';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'white';
              }}
            >
              {/* Subject Icon */}
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#e0f2fe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0369a1',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                {subject.name?.charAt(0)?.toUpperCase() || 'S'}
              </div>

              {/* Subject Info */}
              <div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#111827'
                }}>
                  {subject.name}
                </div>
                {subject.description && (
                  <div style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    marginTop: '2px'
                  }}>
                    {subject.description}
                  </div>
                )}
              </div>

              {/* Selected Indicator */}
              {selectedSubject?.id === subject.id && (
                <div style={{
                  marginLeft: 'auto',
                  color: '#3b82f6'
                }}>
                  ✓
                </div>
              )}
            </div>
          ))}

          {/* Show "No results" if search has no matches */}
          {searchTerm && filteredSubjects.length === 0 && (
            <div style={{
              padding: '16px',
              textAlign: 'center',
              color: '#6b7280',
              fontSize: '14px'
            }}>
              No subjects found for &quot;{searchTerm}&quot;
            </div>
          )}
        </div>
      )}

      {/* Click outside to close */}
      {showDropdown && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 49
          }}
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}
