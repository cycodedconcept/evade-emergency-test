import React, { useState } from 'react'
import { Eye, Pencil, Phone } from "../../assets"

const Table = ({ columns, data, onView }) => {
    const [selectedRows, setSelectedRows] = useState([]);
    
    const renderActionColumn = (row) => (
        <div className="d-flex" style={{gap: "10px"}}>
            <img src={Phone} alt=""/>
            <img src={Eye} alt="" onClick={(e) => { e.stopPropagation(); onView && onView(row); }}/>
            <img src={Pencil} alt=""/>
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
                                <td>{row.deviceid}</td>
                                <td>{row.name}</td>
                                <td>{row.accident_type}</td>
                                <td>{row.nature_of_request}</td>
                                <td>{row.date}</td>
                                <td>{row.time}</td>
                                <td>
                                    <button 
                                        className={row.closed_status === 0 || row.closed_status === "0" ? "inactive" : "active"} 
                                    >
                                        {row.closed_status === 0 || row.closed_status === "0" ? "inactive" : "active"}
                                    </button>
                                </td>
                                <td>{renderActionColumn(row)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Table