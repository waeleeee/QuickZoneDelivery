import React from "react";
import ActionButtons from "./ActionButtons";

const DataTable = ({ 
  data, 
  columns, 
  onEdit, 
  onDelete, 
  searchTerm = "", 
  onSearchChange,
  showSearch = true,
  showActions = true,
  onRowClick
}) => {
  const filteredData = data.filter(item =>
    Object.values(item).some(value =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      {/* Search Bar */}
      {showSearch && (
        <div className="p-4 border-b border-gray-200">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Rechercher..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-left"
                >
                  {column.header}
                </th>
              ))}
              {showActions && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.map((item, index) => (
              <tr
                key={index}
                className={`hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={onRowClick ? () => onRowClick(item) : undefined}
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left"
                  >
                    {column.render ? column.render(item[column.key], item) : item[column.key]}
                  </td>
                ))}
                {showActions && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-left">
                    <ActionButtons
                      onView={onRowClick ? (e) => { e.stopPropagation(); onRowClick(item); } : undefined}
                      onEdit={onEdit ? (e) => { e.stopPropagation(); onEdit(item); } : undefined}
                      onDelete={onDelete ? (e) => { e.stopPropagation(); onDelete(item); } : undefined}
                    />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredData.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Aucune donnée à afficher</p>
        </div>
      )}
    </div>
  );
};

export default DataTable; 