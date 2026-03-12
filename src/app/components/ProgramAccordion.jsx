import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function ProgramAccordion({ program, partsData, allColumns, onDataChange }) {
  const [isExpanded, setIsExpanded] = useState(true); // Default to expanded for demo

  // Get only the month columns (exclude static columns)
  const monthColumns = allColumns.filter(col => !['program', 'partNumber', 'partDescription', 'materialStage'].includes(col.key));

  // Determine start date
  const startDate = monthColumns.length > 0 ? monthColumns[0].label : 'N/A';

  // Get unique parts list
  const uniqueParts = [...new Set(partsData.map(d => d.partNumber))];
  const partsLabel = uniqueParts.slice(0, 2).join(', ') + (uniqueParts.length > 2 ? '...' : '');

  // Calculate total demand
  let totalDemand = 0;
  partsData.forEach(row => {
    monthColumns.forEach(col => {
      const val = row[col.key];
      if (typeof val === 'number' && !isNaN(val)) {
        totalDemand += val;
      }
    });
  });

  // Calculate split for Clinical and Independent mock values since they don't exist in raw JSON
  // Just deterministic splitting for display accuracy
  const calculateSplit = (total) => {
    const clinical = Math.round(total * 0.7);
    const independent = total - clinical;
    return { clinical, independent };
  };

  return (
    <div className="mb-6 rounded-xl overflow-hidden shadow-sm border border-gray-200">
      {/* Accordion Header */}
      <div 
        className="bg-[#306e9a] text-white p-4 flex items-center justify-between cursor-pointer hover:bg-[#285c80] transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-1 grid grid-cols-5 gap-4 items-center">
          {/* Program Info */}
          <div>
            <div className="text-xs text-blue-100 font-medium tracking-wide">Program Header</div>
            <div className="text-lg font-bold">{program}</div>
          </div>
          
          {/* Start Date */}
          <div>
            <div className="text-xs text-blue-100 font-medium tracking-wide">Start Date</div>
            <div className="text-sm font-semibold">{startDate}</div>
          </div>
          
          {/* Parts */}
          <div>
            <div className="text-xs text-blue-100 font-medium tracking-wide">Parts ({uniqueParts.length})</div>
            <div className="text-sm font-semibold truncate" title={uniqueParts.join(', ')}>
              {partsLabel}
            </div>
          </div>
          
          {/* Status */}
          <div>
            <div className="text-xs text-blue-100 font-medium tracking-wide mb-1">Status</div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Active
            </span>
          </div>
          
          {/* Total Demand */}
          <div>
            <div className="text-xs text-blue-100 font-medium tracking-wide">Total Demand</div>
            <div className="text-xl font-bold">{totalDemand.toLocaleString()}</div>
          </div>
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
                <th className="p-3 border-r border-gray-200 bg-[#F3F4F6] align-bottom w-48" rowSpan={2}>
                  <div className="flex items-center gap-1 text-xs font-semibold text-[#6B7280] tracking-wider uppercase">
                    PART NUMBER
                    <span className="text-[10px] ml-1 text-gray-400">↑↓</span>
                  </div>
                </th>
                {monthColumns.map(col => (
                  <th key={col.key} colSpan={3} className="text-center p-2 border-r border-gray-200 text-xs font-bold text-gray-600 uppercase border-b border-gray-200">
                    {col.label}
                  </th>
                ))}
              </tr>
              {/* Bottom Header Row - Categories */}
              <tr>
                {monthColumns.map(col => (
                  <React.Fragment key={`sub-${col.key}`}>
                    <th className="p-2 text-center text-[10px] font-bold text-gray-500 tracking-wider">TOTAL</th>
                    <th className="p-2 text-center text-[10px] font-bold text-gray-500 tracking-wider">CLINICAL</th>
                    <th className="p-2 text-center text-[10px] font-bold text-gray-500 tracking-wider border-r border-gray-200">INDEPENDENT</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {partsData.map((row, idx) => (
                <tr key={`${row.partNumber}-${idx}`} className="hover:bg-gray-50 group">
                  <td className="p-3 border-r border-gray-200 font-medium text-sm text-gray-900 bg-white group-hover:bg-gray-50 sticky left-0 shadow-[1px_0_0_0_#e5e7eb]">
                    {row.partNumber}
                  </td>
                  {monthColumns.map(col => {
                    const total = row[col.key] || 0;
                    // For the new data, clinical and independent are explicit in the data
                    // as col.key + '_clinical' and col.key + '_independent'. Fall back to splitting if needed.
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
                      <React.Fragment key={`${row.partNumber}-${col.key}`}>
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
                              onDataChange(row.partNumber, col.key, num, program);
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
