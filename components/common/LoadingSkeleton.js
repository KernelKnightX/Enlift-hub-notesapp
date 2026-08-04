import React from 'react';

export const CardSkeleton = ({ height = '200px' }) => (
  <div
    className="card border-0 shadow-sm"
    style={{ height }}
  >
    <div className="card-body p-4">
      <div className="d-flex align-items-center gap-3 mb-3">
        <div className="skeleton-circle"></div>
        <div className="flex-grow-1">
          <div className="skeleton-line w-50 mb-2"></div>
          <div className="skeleton-line w-75"></div>
        </div>
      </div>
      <div className="skeleton-line w-100 mb-2"></div>
      <div className="skeleton-line w-80 mb-2"></div>
      <div className="skeleton-line w-60"></div>
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 3 }) => (
  <div className="table-responsive">
    <table className="table table-hover">
      <thead>
        <tr>
          <th><div className="skeleton-line w-100"></div></th>
          <th><div className="skeleton-line w-100"></div></th>
          <th><div className="skeleton-line w-100"></div></th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }, (_, i) => (
          <tr key={i}>
            <td><div className="skeleton-line w-75"></div></td>
            <td><div className="skeleton-line w-50"></div></td>
            <td><div className="skeleton-line w-60"></div></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const ListSkeleton = ({ items = 5 }) => (
  <div className="list-group list-group-flush">
    {Array.from({ length: items }, (_, i) => (
      <div key={i} className="list-group-item px-0">
        <div className="d-flex justify-content-between align-items-center">
          <div className="flex-grow-1">
            <div className="skeleton-line w-60 mb-2"></div>
            <div className="skeleton-line w-40"></div>
          </div>
          <div className="skeleton-line w-20" style={{ height: '30px' }}></div>
        </div>
      </div>
    ))}
  </div>
);

export const PDFCardSkeleton = () => (
  <div className="card border-0 shadow-sm">
    <div className="card-body p-4">
      <div className="mb-3">
        <div className="skeleton-line w-40 mb-2"></div>
        <div className="skeleton-line w-30"></div>
      </div>
      <div className="d-flex flex-column gap-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="d-flex align-items-center justify-content-between p-3 rounded" style={{ background: '#f8f9fa' }}>
            <div className="d-flex align-items-center gap-3">
              <div className="skeleton-circle" style={{ width: '32px', height: '32px' }}></div>
              <div>
                <div className="skeleton-line w-50 mb-1"></div>
                <div className="skeleton-line w-30"></div>
              </div>
            </div>
            <div className="skeleton-line w-20" style={{ height: '32px' }}></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);