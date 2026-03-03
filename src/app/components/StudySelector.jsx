import React from 'react';

const StudySelector = ({ studies, selectedStudyId, onChange, disabled }) => {
  const allStudies = [{ id: "ALL", name: "All" }, ...studies];

  return (
    <div className={`flex items-center space-x-2 ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}>
      <span className="text-gray-700 font-medium">Study:</span>
      <div className="flex items-center space-x-2">
        {allStudies.map((study) => (
          <button
            key={study.id}
            onClick={() => !disabled && onChange(study.id)}
            disabled={disabled}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedStudyId === study.id
                ? "bg-[#306e9a] text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            } ${disabled ? "cursor-not-allowed" : ""}`}
          >
            {study.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StudySelector;
