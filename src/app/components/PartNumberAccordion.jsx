import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function PartNumberAccordion({ partNumber, programsData, allColumns, onDataChange }) {
  const [isExpanded, setIsExpanded] = useState(false); // Default false for Part Number view
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Get only the month columns (exclude static columns)
  const monthColumns = allColumns.filter(col => !['program', 'partNumber', 'partDescription', 'materialStage'].includes(col.key));

  // Create a mapping of programs by aggregating their numbers for duplicate programs 
  // under the same Part Number grouping (happens when the same Part exists across variants of a single Program)
  const dedupedProgramsData = programsData.reduce((acc, current) => {
    const existingEntry = acc.find(item => item.program === current.program);
    
    if (existingEntry) {
      // Add numeric columns together to consolidate the metrics
      monthColumns.forEach(col => {
        if (typeof current[col.key] === 'number' && !isNaN(current[col.key])) {
          existingEntry[col.key] = (existingEntry[col.key] || 0) + current[col.key];
        }
        if (typeof current[`${col.key}_clinical`] === 'number' && !isNaN(current[`${col.key}_clinical`])) {
          existingEntry[`${col.key}_clinical`] = (existingEntry[`${col.key}_clinical`] || 0) + current[`${col.key}_clinical`];
        }
        if (typeof current[`${col.key}_independent`] === 'number' && !isNaN(current[`${col.key}_independent`])) {
          existingEntry[`${col.key}_independent`] = (existingEntry[`${col.key}_independent`] || 0) + current[`${col.key}_independent`];
        }
      });
    } else {
      // Just push it cleanly to output
      const clonedEntry = { ...current };
      acc.push(clonedEntry);
    }
    return acc;
  }, []);

  const sortedProgramsData = useMemo(() => {
    if (!sortConfig.key) return dedupedProgramsData;
    return [...dedupedProgramsData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortConfig.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return 0;
    });
  }, [dedupedProgramsData, sortConfig]);

  // Get unique programs list (calculated off the deduped array directly)
  const uniquePrograms = dedupedProgramsData.map(d => d.program);
  const programsLabel = uniquePrograms.join(', ');

  // Calculate total demand across all programs for this part
  let totalDemand = 0;
  programsData.forEach(row => {
    monthColumns.forEach(col => {
      const val = row[col.key];
      if (typeof val === 'number' && !isNaN(val)) {
        totalDemand += val;
      }
    });
  });

  // Calculate split for Clinical and Independent mock values
  const calculateSplit = (total) => {
    const clinical = Math.round(total * 0.7);
    const independent = total - clinical;
    return { clinical, independent };
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3 ml-1 inline text-[#306e9a]" /> : <ChevronDown className="w-3 h-3 ml-1 inline text-[#306e9a]" />;
    }
    return <span className="text-[10px] ml-1 text-[#306e9a]">↑↓</span>;
  };

  return (
    <div className={`overflow-hidden shadow-sm border border-gray-200 bg-white ${isExpanded ? 'mb-4' : ''}`}>
      {/* Accordion Header */}
      <div 
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-1 grid grid-cols-[1.8fr_1.7fr_1.3fr] items-center">
          <div className="font-semibold text-[#306e9a]">{partNumber}</div>
          <div className="text-sm font-semibold text-gray-600 truncate" title={programsLabel}>
            {programsLabel}
          </div>
          <div className="text-xl font-bold text-gray-600 text-right">{totalDemand.toLocaleString()}</div>
        </div>

        {/* Expand Icon */}
        <div className="ml-4">
          {isExpanded ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
        </div>
      </div>

      {/* Accordion Content (Table) */}
      {isExpanded && (
        <div className="bg-white overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[max-content]">
            <thead className="bg-[#F9FAFB] border-b border-gray-200">
              {/* Top Header Row - Months */}
              <tr>
                <th 
                  className="p-3 border-r border-gray-200 bg-white align-bottom w-48 sticky left-0 z-10 cursor-pointer hover:bg-gray-50 transition-colors" 
                  rowSpan={2}
                  onClick={() => handleSort('program')}
                >
                  <div className="flex items-center text-xs font-semibold text-[#306e9a] tracking-wider uppercase select-none">
                    PROGRAM
                    {getSortIcon('program')}
                  </div>
                </th>
                {monthColumns.map(col => (
                  <th key={col.key} colSpan={3} className="text-center p-2 border-r border-gray-200 text-xs font-semibold text-[#306e9a] uppercase border-b border-gray-200">
                    {col.label}
                  </th>
                ))}
              </tr>
              {/* Bottom Header Row - Categories */}
              <tr>
                {monthColumns.map(col => (
                  <React.Fragment key={`sub-${col.key}`}>
                    <th className="p-2 text-center text-[10px] font-semibold text-[#306e9a] tracking-wider">TOTAL</th>
                    <th className="p-2 text-center text-[10px] font-semibold text-[#306e9a] tracking-wider">CLINICAL</th>
                    <th className="p-2 text-center text-[10px] font-semibold text-[#306e9a] tracking-wider border-r border-gray-200">INDEPENDENT</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedProgramsData.map((row, idx) => (
                <tr key={`${row.program}-${idx}`} className="hover:bg-gray-50 group">
                  <td className="p-3 border-r border-gray-200 font-medium text-sm text-gray-900 bg-white group-hover:bg-gray-50 sticky left-0 shadow-[1px_0_0_0_#e5e7eb] z-10">
                    {row.program}
                  </td>
                  {monthColumns.map(col => {
                    const total = row[col.key] || 0;
                    const clinicalValue = row[`${col.key}_clinical`];
                    const independentValue = row[`${col.key}_independent`];
                    
                    let clinical, independent;
                    if (clinicalValue !== undefined && independentValue !== undefined) {
                      clinical = clinicalValue;
                      independent = independentValue;
                    } else {
                      const split = calculateSplit(total);
                      clinical = split.clinical;
                      independent = split.independent;
                    }

                    return (
                      <React.Fragment key={`${row.program}-${col.key}`}>
                        <td className="p-3 text-center text-sm font-bold text-gray-900 border-r border-gray-100">
                          {total > 0 ? total : '-'}
                        </td>
                        <td className="p-3 text-center text-sm text-gray-600 border-r border-gray-100">
                          {clinical > 0 ? clinical : '-'}
                        </td>
                        <td 
                          className="p-3 text-center text-sm text-[#306e9a] font-medium border-r border-gray-200 outline-none focus:ring-2 focus:ring-[#306e9a] hover:bg-gray-100 transition-colors cursor-text"
                          contentEditable={true}
                          suppressContentEditableWarning={true}
                          onBlur={(e) => {
                            const val = e.target.innerText.replace(/[^0-9.-]/g, '');
                            let num = val === '' || val === '-' || val === '.' ? 0 : parseFloat(val);
                            if (isNaN(num)) num = 0;
                            if (num !== independent && onDataChange) {
                              onDataChange(row.partNumber, col.key, num, row.program);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              e.target.blur();
                            }
                          }}
                        >
                          {independent > 0 ? independent : '-'}
                        </td>
                      </React.Fragment>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
