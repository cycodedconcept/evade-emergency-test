import React, { useState } from 'react'
import { Eye, Pencil, Phone } from "../../assets"

const Table = ({ columns, data }) => {
    const [selectedRows, setSelectedRows] = useState([]);
    
    // Modify action column to add actions (example)
    const renderActionColumn = () => (
        <div className="d-flex" style={{gap: "10px"}}>
            <img src={Phone} alt=""/>
            <img src={Eye} alt=""/>
            <img src={Pencil} alt=""/>
        </div>
    );

    return (
        <div className="table-content">
            <div className="table-container">
                <table className="my-table w-100">
                    <thead>
                        <tr>
                            {columns.map((col, index) => (
                                <th key={index} style={{width: "15%"}}>{col.header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                <td>
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
                                {columns.slice(1).map((col, colIndex) => (
                                    <td key={colIndex} style={{cursor: "pointer"}}>
                                        {col.accessor === 'name' && col.header === 'ACTION' 
                                            ? renderActionColumn()
                                            : row[col.accessor]
                                        }
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Table