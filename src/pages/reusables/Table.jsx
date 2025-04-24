import React, { useState } from 'react'
import { Eye, Pencil, Phone, Map, Trash } from "../../assets"

const Table = ({ columns, data, onView, onRowClick, onEdit, actionIcons = ['phone', 'eye', 'pencil'] }) => {
    const [selectedRows, setSelectedRows] = useState([]);
    
    const renderActionColumn = (row) => (
        <div className="d-flex" style={{gap: "10px"}}>
            {actionIcons.includes('phone') && (
              <img 
                src={Phone} 
                alt="" 
                style={{cursor: 'pointer'}} 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  onCall && onCall(row); 
                }}
              />
            )}
            
            {actionIcons.includes('eye') && (
              <img 
                src={Eye} 
                alt="" 
                style={{cursor: 'pointer'}} 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  onView && onView(row); 
                }}
              />
            )}
            
            {actionIcons.includes('pencil') && (
              <img 
                src={Pencil} 
                alt="" 
                style={{cursor: 'pointer'}} 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  onEdit && onEdit(row); 
                }}
              />
            )}
            
            {actionIcons.includes('map') && (
              <img 
                src={Map} 
                alt="" 
                style={{cursor: 'pointer'}} 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  onMap && onMap(row); 
                }}
              />
            )}
            
            {actionIcons.includes('trash') && (
              <img 
                src={Trash} 
                alt="" 
                style={{cursor: 'pointer'}} 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  onDelete && onDelete(row); 
                }}
              />
            )}
        </div>
    );

    // Check if data is available
    if (!data || !Array.isArray(data) || data.length === 0) {
        return <div>No data available</div>;
    }

    return (
        <div className="table-content">
            <div className="table-container">
                <table className="my-table w-100">
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