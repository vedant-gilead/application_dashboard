import React, { useState, useMemo } from 'react';
import { useParams, Link } from "react-router-dom";
import { Home, ChevronRight } from "lucide-react";

import DataTable from "../components/DataTable";
import StudySelector from '../components/StudySelector';
import ViewModeToggle from '../components/ViewModeToggle';
import programs from '../../data/programData.json';
import { calculateCumulativeData } from '../utils/cumulativeCalculations';

import summaryData from "../../data/Program_Summary.json";
import parametersPoolData from "../../data/Parameters_Pool.json";
import onhandInventoryData from "../../data/onhand_inventory_data.json";

import ProgramSummary from './Program_Drilldown/components/ProgramSummary';
import ProgramParameters from './Program_Drilldown/components/ProgramParameters';
import ProgramTables from './Program_Drilldown/components/ProgramTables';

export default function Program_Drilldown() {
  const { programId } = useParams();
  const [selectedStudyId, setSelectedStudyId] = useState("ALL");
  const [viewMode, setViewMode] = useState("PER_STUDY");

  const programSummary = summaryData[programId];
  const programParameters = parametersPoolData[programId];
  const program = programs[programId];

  const { data: cumulativeData, columns: cumulativeColumns } = useMemo(() => {
    if (!program) return { data: [], columns: [] };
    return calculateCumulativeData(program.studies);
  }, [program]);

  if (!programSummary || !programParameters || !program) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200/80 p-12 shadow-sm text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-800">Program Not Found</h2>
        <p className="text-gray-600 mt-2">
          The program with ID <span className="font-semibold">{programId}</span> could not be found.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors"
        >
          Go Back to Programs
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Breadcrumbs */}
      <div className="flex items-center text-gray-500 text-sm mb-4">
        <Link to="/" className="hover:text-gray-700">
          <Home className="w-4 h-4" />
        </Link>
        <ChevronRight className="w-4 h-4 mx-1" />
        <Link to="/" className="hover:text-gray-700">
          Programs
        </Link>
        <ChevronRight className="w-4 h-4 mx-1" />
        <span className="font-medium text-gray-700">{programId}</span>
      </div>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
          {programId}
        </h1>
        <p className="text-gray-600 mt-2 text-base">
          Detailed planning and material information for {programId}
        </p>
      </div>

      <ProgramSummary programSummary={programSummary} />
      <ProgramParameters programParameters={programParameters} />
      
      <div className="flex justify-between items-center mb-4">
        <StudySelector
            studies={program.studies}
            selectedStudyId={selectedStudyId}
            onChange={setSelectedStudyId}
            disabled={viewMode === 'CUMULATIVE'}
        />
        <ViewModeToggle viewMode={viewMode} onChange={setViewMode} />
      </div>

      <ProgramTables
        program={program}
        viewMode={viewMode}
        cumulativeColumns={cumulativeColumns}
        cumulativeData={cumulativeData}
        selectedStudyId={selectedStudyId}
      />

      {/* Onhand Inventory Table */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Onhand Inventory
        </h2>
        <DataTable
          columns={onhandInventoryData.columns}
          data={onhandInventoryData.data}
        />
      </div>
    </div>
  );
}
