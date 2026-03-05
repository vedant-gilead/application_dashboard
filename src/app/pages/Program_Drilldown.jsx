import React, { useState, useMemo } from 'react';
import { useParams, Link } from "react-router-dom";
import { Home, ChevronRight } from "lucide-react";

import DataTable from "../components/DataTable";
import StudySelector from '../components/StudySelector';
import ViewModeToggle from '../components/ViewModeToggle';
import { programData } from '../../data/programData';
import { calculateCumulativeData } from '../utils/cumulativeCalculations';

import summaryData from "../../data/Program_Summary.json";
import parametersPoolData from "../../data/Parameters_Pool.json";
import onhandInventoryData from "../../data/onhand_inventory_data.json";

export default function ProgramDrilldown() {
  const { programId } = useParams();
  const [selectedStudyId, setSelectedStudyId] = useState("ALL");
  const [viewMode, setViewMode] = useState("PER_STUDY");

  const programSummary = summaryData[programId];
  const programParameters = parametersPoolData[programId];
  const program = programData;

  const { data: cumulativeData, columns: cumulativeColumns } = useMemo(() => {
    return calculateCumulativeData(program.studies);
  }, [program]);

  const renderTables = () => {
    if (viewMode === 'CUMULATIVE') {
      return (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800">
            Cumulative Program View
          </h2>
          <DataTable columns={cumulativeColumns} data={cumulativeData} />
        </div>
      );
    }



    if (selectedStudyId !== 'ALL') {
      const study = program.studies.find(s => s.id === selectedStudyId);
      return study.materials.map(material => (
        <div key={material.id} className="mb-8">
          <h2 className="text-xl font-bold text-gray-800">
            {material.type}: {material.id}
          </h2>
          {material.description && <p className="text-gray-600 mt-1 text-base mb-4">{material.description}</p>}
          <DataTable columns={material.columns} data={material.data} />
        </div>
      ));
    }

    // "ALL" + "PER_STUDY"
    return program.studies.map(study => (
      <div key={study.id}>
        <h2 className="text-2xl font-bold text-gray-800 mb-4 mt-8">{study.name}</h2>
        {study.materials.map(material => (
          <div key={material.id} className="mb-8">
            <h3 className="text-xl font-bold text-gray-800">
              {material.type}: {material.id}
            </h3>
            {material.description && <p className="text-gray-600 mt-1 text-base mb-4">{material.description}</p>}
            <DataTable columns={material.columns} data={material.data} />
          </div>
        ))}
      </div>
    ));
  };


  if (!programSummary || !programParameters) {
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

      {/* Program Summary Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Program Summary
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500">
              Program
            </label>
            <p className="mt-1 text-base text-gray-900">
              {programSummary.program}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">
              Therapeutic Area
            </label>
            <p className="mt-1 text-base text-gray-900">
              {programSummary.therapeuticArea}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">
              Study Numbers
            </label>
            <p className="mt-1 text-base text-gray-900">
              {programSummary.study}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">
              Material Numbers
            </label>
            <p className="mt-1 text-base text-gray-900">
              {programSummary.materialNumber}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">
              Lot Numbers
            </label>
            <p className="mt-1 text-base text-gray-900">
              {programSummary.lot}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">
              Site Execution
            </label>
            <p className="mt-1 text-base text-gray-900">
              {programSummary.siteExecution}
            </p>
          </div>
        </div>
      </div>

      {/* Parameters Pool Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Program Parameters
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Finished Product (FP) */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              Finished Product (FP)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Site Execution
                </label>
                <p className="mt-1 text-base text-gray-900">
                  {programParameters.FP.siteExecution}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  MOQ
                </label>
                <p className="mt-1 text-base text-gray-900">
                  {programParameters.FP.moq}
                </p>
              </div>
            </div>
          </div>

          {/* Drug Product (IP) - Group 1 */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              Drug Product (PC)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Safety Stock
                </label>
                <p className="mt-1 text-base text-gray-900">
                  {programParameters.IP1.safetyStock}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Consumption Ratio (PC/FP)
                </label>
                <p className="mt-1 text-base text-gray-900">
                  {programParameters.IP1.consumptionRatio}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Site Execution
                </label>
                <p className="mt-1 text-base text-gray-900">
                  {programParameters.IP1.siteExecution}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  MOQ
                </label>
                <p className="mt-1 text-base text-gray-900">
                  {programParameters.IP1.moq}
                </p>
              </div>
            </div>
          </div>

          {/* Drug Product (IP) - Group 2 */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              Drug Substance (IP)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Safety Stock
                </label>
                <p className="mt-1 text-base text-gray-900">
                  {programParameters.IP2.safetyStock}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Consumption Ratio (IP/PC)
                </label>
                <p className="mt-1 text-base text-gray-900">
                  {programParameters.IP2.consumptionRatio}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Site Execution
                </label>
                <p className="mt-1 text-base text-gray-900">
                  {programParameters.IP2.siteExecution}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  MOQ
                </label>
                <p className="mt-1 text-base text-gray-900">
                  {programParameters.IP2.moq}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <StudySelector
            studies={program.studies}
            selectedStudyId={selectedStudyId}
            onChange={setSelectedStudyId}
            disabled={viewMode === 'CUMULATIVE'}
        />
        <ViewModeToggle viewMode={viewMode} onChange={setViewMode} />
      </div>


      {renderTables()}


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
