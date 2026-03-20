import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import Pagination from "./Pagination";

export default function DataTable({ columns, data, itemsPerPage = 10 }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;

    const sorted = [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      // Handle numeric values (including those with currency symbols)
      const aNum = parseFloat(String(aValue).replace(/[^0-9.-]/g, ""));
      const bNum = parseFloat(String(bValue).replace(/[^0-9.-]/g, ""));

      if (!isNaN(aNum) && !isNaN(bNum)) {
        return sortConfig.direction === "asc" ? aNum - bNum : bNum - aNum;
      }

      // Handle string values
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();

      if (aStr < bStr) return sortConfig.direction === "asc" ? -1 : 1;
      if (aStr > bStr) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [data, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = sortedData.slice(startIndex, endIndex);

  const handleSort = (key, sortable) => {
    if (!sortable) return;

    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnKey, sortable) => {
    if (!sortable) return null;

    if (sortConfig.key === columnKey) {
      return sortConfig.direction === "asc" ? (
        <ChevronUp className="w-4 h-4 text-[#c5203f]" />
      ) : (
        <ChevronDown className="w-4 h-4 text-[#c5203f]" />
      );
    }
    return <ChevronsUpDown className="w-4 h-4 text-gray-300" />;
  };

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200/80 p-12 shadow-sm">
        <div className="text-center text-gray-500">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p className="text-base font-medium text-gray-900">No data available</p>
          <p className="text-sm text-gray-500 mt-1">There are no records to display at this time.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
      {/* Table Container with Horizontal Scroll */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#306e9a] border-b border-gray-200">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={column.key}
                  onClick={() => handleSort(column.key, column.sortable)}
                  className={`
                    px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider whitespace-nowrap
                    ${column.sortable ? "cursor-pointer hover:bg-gray-200 select-none" : ""}
                    transition-colors duration-150
                    ${index === 0 ? "sticky left-0 bg-[#306e9a] z-10" : ""}
                  `}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.label}</span>
                    {getSortIcon(column.key, column.sortable)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="odd:bg-white even:bg-gray-50 hover:bg-gray-100 transition-colors duration-150"
              >
                {columns.map((column, index) => (
                  <td
                    key={column.key}
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-800 ${
                      index === 0 ? "sticky left-0 odd:bg-white even:bg-gray-50 z-10" : ""
                    }`}
                  >
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        startIndex={startIndex}
        endIndex={endIndex}
        totalItems={sortedData.length}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
