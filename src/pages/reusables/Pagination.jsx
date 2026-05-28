import React from 'react'

const Pagination = ({currentPage, lastPage, onPageChange, nextPageUrl, prevPageUrl, totalItems, perPage}) => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    const hasPreviousPage = currentPage > 1 || Boolean(prevPageUrl);
    const hasNextPage = currentPage < lastPage || Boolean(nextPageUrl);
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(lastPage, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    const baseButtonStyle = {
      minWidth: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1px solid #E8E8E9',
      borderRadius: '8px',
      backgroundColor: '#fff',
      color: '#14181F',
      fontWeight: '500',
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      margin: 0
    };

    const activeButtonStyle = {
      ...baseButtonStyle,
      backgroundColor: '#2E3192',
      color: '#fff',
      border: '1px solid #2E3192'
    };

    const disabledButtonStyle = {
      ...baseButtonStyle,
      backgroundColor: '#F5F5F5',
      color: '#A0A0A0',
      cursor: 'not-allowed'
    };

    const navButtonStyle = {
      ...baseButtonStyle,
      padding: '0 12px'
    };

  return (
    <>
     <div className="pagination-shell d-flex justify-content-between align-items-center px-2">
      <div className="pagination-info">
        <p className="mb-0" style={{ color: '#707A8F', fontSize: '14px' }}>
          Showing <span style={{ fontWeight: '600', color: '#14181F' }}>{Math.min((currentPage - 1) * perPage + 1, totalItems)}</span> to <span style={{ fontWeight: '600', color: '#14181F' }}>{Math.min(currentPage * perPage, totalItems)}</span> of <span style={{ fontWeight: '600', color: '#14181F' }}>{totalItems}</span> entries
        </p>
      </div>
      
      <div className="pagination-buttons d-flex align-items-center">
        <button 
          className="pagination-button"
          style={!hasPreviousPage ? disabledButtonStyle : navButtonStyle}
          onClick={() => hasPreviousPage && onPageChange(currentPage - 1)}
          disabled={!hasPreviousPage}
        >
          ← Prev
        </button>
        
        {pageNumbers.map(number => (
          <button 
            className="pagination-button"
            key={number} 
            style={currentPage === number ? activeButtonStyle : baseButtonStyle}
            onClick={() => onPageChange(number)}
          >
            {number}
          </button>
        ))}
        
        <button 
          className="pagination-button"
          style={!hasNextPage ? disabledButtonStyle : navButtonStyle}
          onClick={() => hasNextPage && onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
        >
          Next →
        </button>
      </div>
     </div>
    </>
  )
}

export default Pagination
