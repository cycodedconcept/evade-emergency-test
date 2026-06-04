import React, { useState, useRef, useEffect } from 'react'
import { Eye, Pencil, Phone, Map, Trash } from "../../assets"

const Table = ({
    columns,
    data,
    onView,
    onRowClick,
    onEdit,
    onCall,
    onMap,
    onDelete,
    actionIcons = ['phone', 'eye', 'pencil']
}) => {
    const [selectedRows, setSelectedRows] = useState([]);
    const [showScrollHint, setShowScrollHint] = useState(false);
    const tableContainerRef = useRef(null);

    useEffect(() => {
        const container = tableContainerRef.current;
        if (!container) return;

        const checkScroll = () => {
            const hasOverflow = container.scrollWidth > container.clientWidth;
            const isAtEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 10;
            setShowScrollHint(hasOverflow && !isAtEnd);
        };

        checkScroll();
        container.addEventListener('scroll', checkScroll);
        window.addEventListener('resize', checkScroll);

        return () => {
            container.removeEventListener('scroll', checkScroll);
            window.removeEventListener('resize', checkScroll);
        };
    }, [data]);
    
    const renderActionColumn = (row) => {
        const rowActionIcons = Array.isArray(row?.actionIcons) ? row.actionIcons : actionIcons;
        const disabledActionIcons = Array.isArray(row?.disabledActionIcons) ? row.disabledActionIcons : [];
        const renderActionIcon = (iconKey, src, handler) => {
            const isDisabled = disabledActionIcons.includes(iconKey);

            return (
              <img
                src={src}
                alt=""
                style={{
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  opacity: isDisabled ? 0.4 : 1,
                }}
                onClick={(e) => {
                  e.stopPropagation();

                  if (isDisabled) {
                    return;
                  }

                  handler && handler(row);
                }}
              />
            );
        };

        return (
        <div className="d-flex" style={{gap: "10px"}}>
            {rowActionIcons.includes('phone') && (
              renderActionIcon('phone', Phone, onCall)
            )}
            
            {rowActionIcons.includes('eye') && (
              renderActionIcon('eye', Eye, onView)
            )}
            
            {rowActionIcons.includes('pencil') && (
              renderActionIcon('pencil', Pencil, onEdit)
            )}
            
            {rowActionIcons.includes('map') && (
              renderActionIcon('map', Map, onMap)
            )}
            
            {rowActionIcons.includes('trash') && (
              renderActionIcon('trash', Trash, onDelete)
            )}
        </div>
        );
    };

    // Check if data is available
    if (!data || !Array.isArray(data) || data.length === 0) {
        return <div className='text-center text-muted'>No data available</div>;
    }

    const scrollIndicatorStyle = {
        position: 'absolute',
        right: '10px',
        top: '20%',
        transform: 'translateY(-50%)',
        backgroundColor: 'rgba(46, 49, 146, 0.9)',
        color: '#fff',
        padding: '10px 12px',
        borderRadius: '50%',
        cursor: 'pointer',
        zIndex: 10,
        animation: 'bounceRight 1s infinite',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
    };

    return (
        <div className="table-content" style={{ position: 'relative' }}>
            <style>
                {`
                    @keyframes bounceRight {
                        0%, 100% { transform: translateY(-50%) translateX(0); }
                        50% { transform: translateY(-50%) translateX(5px); }
                    }
                `}
            </style>
            
            {showScrollHint && (
                <div 
                    style={scrollIndicatorStyle}
                    onClick={() => {
                        const container = tableContainerRef.current;
                        if (container) {
                            container.scrollBy({ left: 150, behavior: 'smooth' });
                        }
                    }}
                >
                    →
                </div>
            )}
            
            <div 
                ref={tableContainerRef}
                className="table-container" 
                style={{backgroundColor: '#fff', border: '1px solid #d3d6dc', borderRadius: '20px', overflowX: 'auto'}}
            >
              <table className="my-table w-100 no-lines-table">
                    <thead>
                        <tr>
                            {columns.map((col, index) => (
                                <th key={index} style={{width: col.width || "auto"}}>{col.header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, rowIndex) => (
                                <tr key={rowIndex} onClick={() => onRowClick && onRowClick(row)} style={{cursor: 'pointer'}}>
                                {columns.map((col, colIndex) => {
                                    // For the index column (first column)
                                    if (colIndex === 0) {
                                        return (
                                            <td key={colIndex}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedRows.includes(rowIndex)}
                                                    onChange={(e) => {
                                                        const isChecked = e.target.checked;
                                                        setSelectedRows(prev => 
                                                            isChecked 
                                                            ? [...prev, rowIndex]
                                                            : prev.filter(index => index !== rowIndex)
                                                        );
                                                    }}
                                                />
                                            </td>
                                        );
                                    }
                                    
                                    // For the action column (last column)
                                    if (col.header === 'ACTION') {
                                        return (
                                            <td key={colIndex}>
                                                {renderActionColumn(row)}
                                            </td>
                                        );
                                    }
                                    
                                    // For the status column
                                    if (col.accessor === 'status' || col.accessor === 'closed_status') {
                                        const isActive = row.status === 'online' || 
                                                      row.closed_status === 1 || 
                                                      row.closed_status === '1';
                                        
                                        return (
                                            <td key={colIndex}>
                                                <button 
                                                    className={isActive ? "active" : "inactive"}
                                                >
                                                    {isActive ? "active" : "inactive"}
                                                </button>
                                            </td>
                                        );
                                    }
                                    
                                    // For all other columns
                                    return (
                                        <td key={colIndex}>
                                            {row[col.accessor] || 'N/A'}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Table;
