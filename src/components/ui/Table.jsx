import React from 'react';

const Table = ({ 
  columns, 
  data, 
  onRowClick, 
  isLoading, 
  emptyMessage = "No data available." 
}) => {
  if (isLoading) {
    return (
      <div className="p-16 text-center flex justify-center animate-fade-in">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-12 text-center text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_20px_rgb(0,0,0,0.02)] border border-gray-100 overflow-hidden animate-slide-up">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50/50">
            <tr>
              {columns.map((col, index) => (
                <th 
                  key={index} 
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-50">
            {data.map((row, rowIndex) => (
              <tr 
                key={row.id || rowIndex} 
                onClick={() => onRowClick && onRowClick(row)}
                className={`transition-colors duration-150 ${
                  onRowClick ? 'cursor-pointer hover:bg-indigo-50/30' : 'hover:bg-gray-50/50'
                }`}
              >
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className={`px-6 py-4 whitespace-nowrap text-sm text-gray-700 ${col.cellClassName || ''}`}>
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
