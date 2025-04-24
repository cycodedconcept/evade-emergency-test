import React from 'react'

const Pagination = ({currentPage, lastPage, onPageChange, nextPageUrl, prevPageUrl, totalItems, perPage}) => {
    const pageNumbers = [];
    const maxPagesToShow = 5; // Show at most 5 page numbers
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(lastPage, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

  return (
    <>
     <div className="pagination-container d-flex justify-content-between align-items-center mt-4">
      <div>
        <p className="mb-0 text-muted">
          Showing {Math.min((currentPage - 1) * perPage + 1, totalItems)} to {Math.min(currentPage * perPage, totalItems)} of {totalItems} entries
        </p>
      </div>
      
      <ul className="pagination mb-0">
        <li className={`page-item ${!prevPageUrl ? 'disabled' : ''}`}>
          <button 
            className="page-link" 
            onClick={() => prevPageUrl && onPageChange(currentPage - 1)}
            disabled={!prevPageUrl}
          >
            &laquo;
          </button>
        </li>
        
        {pageNumbers.map(number => (
          <li 
            key={number} 
            className={`page-item ${currentPage === number ? 'active' : ''}`}
          >
            <button 
              className="page-link" 
              onClick={() => onPageChange(number)}
            >
              {number}
            </button>
          </li>
        ))}
        
        <li className={`page-item ${!nextPageUrl ? 'disabled' : ''}`}>
          <button 
            className="page-link" 
            onClick={() => nextPageUrl && onPageChange(currentPage + 1)}
            disabled={!nextPageUrl}
          >
            &raquo;
          </button>
        </li>
      </ul>
     </div>
    </>
  )
}

export default Pagination