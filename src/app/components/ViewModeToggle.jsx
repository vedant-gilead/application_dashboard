
import React from 'react';

const ViewModeToggle = ({ viewMode, onChange }) => {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-gray-700 font-medium">View Mode:</span>
      <div className="flex items-center bg-gray-200 rounded-full">
        <button
          onClick={() => onChange("PER_STUDY")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            viewMode === "PER_STUDY"
              ? "bg-[#306e9a] text-white"
              : "text-gray-700 hover:bg-gray-300"
          }`}
        >
          Per Study
        </button>
        <button
          onClick={() => onChange("CUMULATIVE")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            viewMode === "CUMULATIVE"
              ? "bg-[#306e9a] text-white"
              : "text-gray-700 hover:bg-gray-300"
          }`}
        >
          Cumulative
        </button>
      </div>
    </div>
  );
};

export default ViewModeToggle;
