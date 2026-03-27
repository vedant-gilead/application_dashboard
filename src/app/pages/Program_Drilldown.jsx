import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from "react-router-dom";
import { Home, ChevronRight, Upload } from "lucide-react";

import DataTable from "../components/DataTable";
import StudySelector from '../components/StudySelector';
import ViewModeToggle from '../components/ViewModeToggle';
import programs from '../../data/programData.json';
import initialDemandForecastData from '../../data/Demand_Forecast.json';
import { calculateCumulativeData } from '../utils/cumulativeCalculations';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';

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
  const [demandForecastData, setDemandForecastData] = useState(initialDemandForecastData);
  const [onhandUploadDialogOpen, setOnhandUploadDialogOpen] = useState(false);

  const programSummary = summaryData[programId];
  const programParameters = parametersPoolData[programId];
  const baseProgram = programs[programId];

  useEffect(() => {
    let cancelled = false;
    const loadLatestDemand = async () => {
      try {
        const resp = await fetch(`/src/data/Demand_Forecast.json?t=${Date.now()}`);
        if (!resp.ok) return;
        const json = await resp.json();
        if (!cancelled) setDemandForecastData(json);
      } catch {
        // Keep using bundled fallback data if live fetch fails.
      }
    };
    loadLatestDemand();
    return () => {
      cancelled = true;
    };
  }, [programId]);

  const program = useMemo(() => {
    if (!baseProgram) return null;

    const monthLabelToDemandKey = (label) => {
      // Program table labels look like "Jul-25"; Demand_Forecast keys look like "Jul-2025".
      const [mon, yy] = String(label || '').split('-');
      if (!mon || !yy) return null;
      const year = Number(yy);
      if (!Number.isFinite(year)) return null;
      return `${mon}-20${String(year).padStart(2, '0')}`;
    };

    const demandMonthColumns = (demandForecastData?.columns || [])
      .filter((col) => !['program', 'partNumber', 'partDescription', 'materialStage'].includes(col.key))
      .map((col) => {
        const [mon, year] = String(col.key).split('-'); // e.g. Mar, 2025
        const yy = String(year || '').slice(-2);
        return {
          demandKey: col.key, // e.g. Mar-2025
          key: `${String(mon || '').toLowerCase()}${yy}`, // e.g. mar25
          label: `${mon}-${yy}`, // e.g. Mar-25
        };
      });

    const findForecastRow = (partNumber) =>
      (demandForecastData?.data || []).find((r) => r.program === programId && r.partNumber === partNumber);

    return {
      ...baseProgram,
      studies: baseProgram.studies.map((study) => ({
        ...study,
        materials: study.materials.map((material) => {
          const forecastRow = findForecastRow(material.id);

          const remappedColumns = [
            { key: 'metric', label: 'Metric' },
            ...demandMonthColumns.map((m) => ({ key: m.key, label: m.label })),
          ];

          const oldDemandKeyToColumnKey = new Map();
          (material.columns || []).forEach((col) => {
            if (!col || col.key === 'metric') return;
            const demandKey = monthLabelToDemandKey(col.label);
            if (demandKey) oldDemandKeyToColumnKey.set(demandKey, col.key);
          });

          const updatedRows = (material.data || []).map((row) => {
            const metric = String(row.metric || '').toLowerCase();
            const isClinical = metric === 'demand (clinical)';
            const isIndependent = metric === 'demand (independent)';
            const isTotal = metric === 'total demand';

            const next = { ...row };
            demandMonthColumns.forEach((monthCol) => {
              const oldColKey = oldDemandKeyToColumnKey.get(monthCol.demandKey);
              const oldVal = oldColKey ? row[oldColKey] : 0;

              if (isClinical) {
                next[monthCol.key] = Number(forecastRow?.[`${monthCol.demandKey}_clinical`] ?? 0);
              } else if (isIndependent) {
                next[monthCol.key] = Number(forecastRow?.[`${monthCol.demandKey}_independent`] ?? 0);
              } else if (isTotal) {
                next[monthCol.key] = Number(forecastRow?.[monthCol.demandKey] ?? 0);
              } else {
                next[monthCol.key] = oldVal ?? 0;
              }
            });

            return next;
          });

          return { ...material, columns: remappedColumns, data: updatedRows };
        }),
      })),
    };
  }, [baseProgram, demandForecastData, programId]);

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
      {/* <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Onhand Inventory
        </h2>
        <DataTable
          columns={onhandInventoryData.columns}
          data={onhandInventoryData.data}
        />
      </div> */}
      {/* Onhand Inventory Table */}
<div className="mt-8">
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-xl font-bold text-gray-800">Onhand Inventory</h2>
    <div>
      <Button
        type="button"
        className="bg-gray-200 text-gray-800 hover:bg-gray-300 px-4 py-2 rounded-lg shadow-sm transition-colors"
        onClick={() => setOnhandUploadDialogOpen(true)}
      >
        <Upload className="w-4 h-4 mr-2" />
        Upload CSV
      </Button>
    </div>
  </div>
  {(() => {
    const slice = onhandInventoryData[programId] || { columns: [], data: [] };
    
 // If no data, build a placeholder row with "--" in all columns
    const dataWithPlaceholder =
      slice.data.length === 0
        ? [Object.fromEntries(slice.columns.map(col => [col.key, "--"]))]
        : slice.data;

    return <DataTable columns={slice.columns} data={dataWithPlaceholder} />;
  })()}
</div>

      <Dialog
        open={onhandUploadDialogOpen}
        onOpenChange={(open) => {
          setOnhandUploadDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-[520px] bg-white rounded-lg shadow-xl border border-gray-200">
          <DialogHeader>
            <DialogTitle>Bulk Upload Onhand Inventory</DialogTitle>
            <DialogDescription>Upload CSV for {programId}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-md border border-dashed border-gray-300 bg-gray-50 px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm text-gray-700">
                  <div className="font-medium">Drag & drop your CSV here</div>
                  <div className="text-gray-500">or use the Upload CSV button.</div>
                </div>
                <Button
                  type="button"
                  className="bg-gray-200 text-gray-800 hover:bg-gray-300 shadow-sm"
                >
                  Upload CSV
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              className="bg-[#306e9a] hover:bg-[#255577] text-white shadow-sm"
              onClick={() => setOnhandUploadDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
 