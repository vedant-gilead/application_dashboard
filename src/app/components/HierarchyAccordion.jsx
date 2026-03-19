import React, { useState } from 'react';
import { ChevronDown, ChevronRight, MoreVertical } from 'lucide-react';

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
          className="flex items-center px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100"
          onClick={toggleExpand}
        >
          {/* Expand Icon */}
          <div className="w-8 flex-shrink-0 flex justify-center text-gray-500">
            {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </div>

          {/* Columns */}
          <div className="flex-1 grid grid-cols-4 items-center">
            <div className="col-span-1">
              <div className="font-semibold text-[#306e9a]">{node.studyName}</div>
              <div className="text-xs text-gray-500">{node.studyDescription}</div>
            </div>
            <div className="text-sm text-gray-600 text-center">{node.finishedGoods}</div>
            <div className="text-sm text-gray-600 text-center">{node.drugProducts}</div>
            <div className="text-sm text-gray-600 text-center">{node.drugSubstances}</div>
          </div>
          
          {/* Actions */}
          {/* <div className="w-10 flex-shrink-0 flex justify-end">
            <button className="text-gray-400 hover:text-gray-600" onClick={(e) => e.stopPropagation()}>
              <MoreVertical className="w-5 h-5" />
            </button>
          </div> */}
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

export default function HierarchyAccordion({ data, columns }) {
  return (
    <div className="w-full">
      {/* Header Row (matches root node layout) */}
      <div className="flex items-center  py-4 bg-[#306e9a] rounded-t-xl border border-gray-100 shadow-sm text-sm font-semibold text-white">
        <div className="w-8 flex-shrink-0"></div> {/* Space for expand icon */}
        <div className="flex-1 grid grid-cols-4">
          <div className="col-span-1">{columns.find(c => c.key === 'studyName')?.label || 'Title'}</div>
          <div className="text-center">{columns.find(c => c.key === 'finishedGoods')?.label || 'FG'}</div>
          <div className="text-center">{columns.find(c => c.key === 'drugProducts')?.label || 'DP'}</div>
          <div className="text-center">{columns.find(c => c.key === 'drugSubstances')?.label || 'DS'}</div>
        </div>
        {/* <div className="w-10 flex-shrink-0 text-right text-white">{columns.find(c => c.key === 'actions')?.label || 'Actions'}</div> */}
      </div>

      {/* Accordion Items */}
      <div className="flex flex-col">
        {data.map((item, idx) => (
          <HierarchyNode key={item.id || idx} node={item} />
        ))}
      </div>
    </div>
  );
}
