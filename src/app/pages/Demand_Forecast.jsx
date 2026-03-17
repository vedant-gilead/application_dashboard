import React, { useMemo, useState } from 'react';
import ProgramAccordion from '../components/ProgramAccordion';
import PartNumberAccordion from '../components/PartNumberAccordion';
import initialDemandData from '../../data/Demand_Forecast.json';
import { Plus } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function Demand_Forecast() {
  const [demandData, setDemandData] = useState(initialDemandData);
  const [viewMode, setViewMode] = useState('program'); // 'program' | 'part'

  // Group data by program
  const programs = useMemo(() => {
    const grouped = {};
    demandData.data.forEach(row => {
      if (!grouped[row.program]) {
        grouped[row.program] = [];
      }
      grouped[row.program].push(row);
    });
    return grouped;
  }, [demandData]);

  // Group data by part number
  const parts = useMemo(() => {
    const grouped = {};
    demandData.data.forEach(row => {
      if (!grouped[row.partNumber]) {
        grouped[row.partNumber] = [];
      }
      grouped[row.partNumber].push(row);
    });
    return grouped;
  }, [demandData]);

  const handleDataChange = (partNumber, monthKey, newValue, programName) => {
    // Find and update the row in our local state
    const newData = [...demandData.data];
    // Find using both partNumber and programName to be absolute sure if editing in part view
    const rowIndex = newData.findIndex(row => row.partNumber === partNumber && row.program === programName);
    
    if (rowIndex !== -1) {
      // Calculate the new total: clinical (existing) + new independent value
      // Handle the case where the clinical value doesn't explicitly exist yet on the record
      const clinicalKey = `${monthKey}_clinical`;
      const independentKey = `${monthKey}_independent`;
      
      const currentClinical = newData[rowIndex][clinicalKey] || 0;
      const newTotal = currentClinical + newValue;

      newData[rowIndex] = {
        ...newData[rowIndex],
        [independentKey]: newValue,
        [monthKey]: newTotal
      };
      
      const newDemandData = { ...demandData, data: newData };
      setDemandData(newDemandData);

      // Save to backend (mocked or real endpoint)
      fetch('/api/save-demand', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          columns: newDemandData.columns,
          data: newData
        })
      }).catch(err => console.error('Failed to save demand:', err));
    }
  };

  return (
    <div className="w-full">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Demand Forecast</h1>
          <p className="text-gray-600 mt-2 text-base">Demand Forecasts: showing Total, Clinical, and Independent demand across different time periods.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-gray-700 font-medium text-sm">View Mode:</span>
            <div className="flex bg-[#E5E7EB] rounded-full p-1 border border-gray-200 shadow-sm relative overflow-hidden">
               <button 
                  onClick={() => setViewMode('program')}
                  className={`relative z-10 px-6 py-1.5 text-[13px] font-medium rounded-full transition-all duration-200 ${viewMode === 'program' ? 'text-white' : 'text-gray-700 hover:text-gray-900'}`}
                >
                  By Program
                </button>
                <button 
                  onClick={() => setViewMode('part')}
                  className={`relative z-10 px-6 py-1.5 text-[13px] font-medium rounded-full transition-all duration-200 ${viewMode === 'part' ? 'text-white' : 'text-gray-700 hover:text-gray-900'}`}
                >
                  By Part Number
                </button>

                 {/* Absolute Sliding Pill Background */}
                 <div 
                   className={`absolute top-1 bottom-1 bg-[#306e9a] rounded-full transition-all duration-300 ease-in-out z-0`}
                   style={{
                     left: viewMode === 'program' ? '4px' : '50%',
                     width: 'calc(50% - 4px)',
                   }}
                 />
            </div>
          </div>
          <Button className="bg-[#306e9a] text-white px-4 py-2 rounded-lg shadow hover:bg-[#245371] transition-colors flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Demand
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        {/* Static column header (outside accordions) */}
        <div className="rounded-xl bg-[#1f5d96] px-4 py-3 shadow-sm">
          {viewMode === 'program' ? (
            <div className="grid grid-cols-5 gap-4 text-sm font-semibold text-white">
              <div>Program</div>
              <div>Start Date</div>
              <div>Parts</div>
              <div>Status</div>
              <div className="text-right">Total Demand</div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4 text-sm font-semibold text-white">
              <div>Part Number</div>
              <div>Programs</div>
              <div className="text-right">Total Demand</div>
            </div>
          )}
        </div>

        {/* Accordion List */}
        <div className="w-full flex flex-col">
        {viewMode === 'program' 
          ? Object.entries(programs).map(([programName, partsData]) => (
              <ProgramAccordion 
                key={programName}
                program={programName}
                partsData={partsData}
                allColumns={demandData.columns}
                onDataChange={handleDataChange}
              />
            ))
          : Object.entries(parts).map(([partNum, programsData]) => (
              <PartNumberAccordion 
                key={partNum}
                partNumber={partNum}
                programsData={programsData}
                allColumns={demandData.columns}
                onDataChange={handleDataChange}
              />
            ))
        }
      </div>
    </div>
  </div>
);
}
