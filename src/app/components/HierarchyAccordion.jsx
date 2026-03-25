import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, ChevronUp, ChevronsUpDown } from 'lucide-react';
import Pagination from './Pagination';

const HierarchyNode = ({ node, level = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isRoot = level === 0;

  const toggleExpand = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  if (isRoot) {
    return (
      <div className={`bg-white shadow-sm border border-gray-200 overflow-hidden ${isExpanded ? 'mb-4' : ''}`}>
        {/* Root Header Row */}
        <div 
          className="flex items-center px-4 py-3 cursor-pointer transition-colors border-b border-gray-100"
          onClick={toggleExpand}
        >
          {/* Expand Icon */}
          <div className="w-8 flex-shrink-0 flex justify-center text-gray-500">
            {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </div>

          {/* Columns */}
          <div className="flex-1 grid grid-cols-4 items-center gap-4">
            <div className="col-span-1">
              <div className="font-semibold text-[#306e9a]">{node.studyName}</div>
              <div className="text-xs text-gray-500">{node.studyDescription}</div>
            </div>
            <div className="text-sm text-gray-600 text-center">{node.finishedGoods}</div>
            <div className="text-sm text-gray-600 text-center">{node.drugProducts}</div>
            <div className="text-sm text-gray-600 text-center">{node.drugSubstances}</div>
          </div>
        </div>

        {/* Children */}
        {isExpanded && node.children && (
          <div className="p-4 bg-white relative">
            {node.children.map((child, idx) => (
              <HierarchyNode key={child.id || idx} node={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Child Nodes (FG, DP, DS)
  const isFG = node.type === 'fg';
  const isDP = node.type === 'dp';
  const isDS = node.type === 'ds';

  const indentClass = isFG ? '' : isDP ? 'pl-6' : 'pl-10';
  const bulletColorClass = isFG ? 'text-emerald-500' : isDP ? 'text-purple-600' : 'text-orange-500';
  const treeLineClass = isDP || isDS ? 'border-l border-gray-200 pl-4' : '';

  return (
    <div className={`relative ${indentClass} mb-2`}>
      <div className={`relative ${treeLineClass} py-1`}> 
        <div className="flex items-start">
        {/* Bullet and Title Row */}
        <div className="flex-1">
          <div className="flex items-center">
            <span className={`${bulletColorClass} mr-2 text-xl leading-none`}>•</span>
            <span className={`font-medium ${isDS ? 'text-sm text-gray-700' : 'text-gray-900'}`}>
              {node.name} {node.code && <span className="text-gray-500 font-normal">{node.code}</span>}
            </span>
          </div>
          
          {/* Description/Manufacturing content */}
          {(node.description || node.manufacturing) && (
            <div className="ml-5 mt-1 text-sm text-gray-500">
              {node.description}
              {node.manufacturing}
            </div>
          )}
        </div>
      </div>
    </div>

      {/* Children */}
      {node.children && node.children.length > 0 && (
        <div className="mt-2">
          {node.children.map((child, idx) => (
            <HierarchyNode key={child.id || idx} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function HierarchyAccordion({ data, columns, itemsPerPage = 10 }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;

    const sorted = [...data].sort((a, b) => {
      const aValue = a[sortConfig.key] || 0;
      const bValue = b[sortConfig.key] || 0;

      // Numeric values
      const aNum = parseFloat(String(aValue).replace(/[^0-9.-]/g, ""));
      const bNum = parseFloat(String(bValue).replace(/[^0-9.-]/g, ""));

      if (!isNaN(aNum) && !isNaN(bNum)) {
        return sortConfig.direction === "asc" ? aNum - bNum : bNum - aNum;
      }

      // String values
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

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key === columnKey) {
      return sortConfig.direction === "asc" ? (
        <ChevronUp className="w-4 h-4 ml-1 inline text-white" />
      ) : (
        <ChevronDown className="w-4 h-4 ml-1 inline text-white" />
      );
    }
    return <ChevronsUpDown className="w-4 h-4 ml-1 inline text-blue-200 hover:text-white" />;
  };

  const headerCells = [
    { key: 'studyName' },
    { key: 'finishedGoods' },
    { key: 'drugProducts' },
    { key: 'drugSubstances' }
  ];

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header Row (matches root node layout) */}
      <div className="flex items-center px-4 py-4 bg-[#306e9a] text-sm font-semibold text-white">
        <div className="w-8 flex-shrink-0"></div> {/* Space for expand icon */}
        <div className="flex-1 grid grid-cols-4 gap-4">
          <div 
            className="col-span-1 cursor-pointer select-none flex items-center -m-1 p-1 rounded transition-colors"
            onClick={() => handleSort('studyName')}
          >
            {columns.find(c => c.key === 'studyName')?.label || 'Title'}
            {getSortIcon('studyName')}
          </div>
          <div 
            className="text-center cursor-pointer select-none flex items-center justify-center -m-1 p-1 rounded transition-colors"
            onClick={() => handleSort('finishedGoods')}
          >
            {columns.find(c => c.key === 'finishedGoods')?.label || 'FG'}
            {getSortIcon('finishedGoods')}
          </div>
          <div 
            className="text-center cursor-pointer select-none flex items-center justify-center -m-1 p-1 rounded transition-colors"
            onClick={() => handleSort('drugProducts')}
          >
            {columns.find(c => c.key === 'drugProducts')?.label || 'DP'}
            {getSortIcon('drugProducts')}
          </div>
          <div 
            className="text-center cursor-pointer select-none flex items-center justify-center -m-1 p-1 rounded transition-colors"
            onClick={() => handleSort('drugSubstances')}
          >
            {columns.find(c => c.key === 'drugSubstances')?.label || 'DS'}
            {getSortIcon('drugSubstances')}
          </div>
        </div>
      </div>

      {/* Accordion Items */}
      <div className="flex flex-col">
        {currentData.length > 0 ? (
          currentData.map((item, idx) => (
            <HierarchyNode key={item.id || idx} node={item} />
          ))
        ) : (
          <div className="p-8 text-center text-gray-500 bg-white">
            No items match your query.
          </div>
        )}
      </div>

      {/* Pagination */}
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
