import EditableDataTable from '../components/EditableDataTable';
import demandData from '../../data/Demand_Forecast.json';
import { Plus } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function Demand_Forecast() {
  // Filter columns to only include Program, Part Number, and Month columns
  const filteredColumns = demandData.columns.filter(col => 
    col.key === 'program' || 
    col.key === 'partNumber' || 
    /^[A-Z][a-z]{2}-\d{4}$/.test(col.key)
  );

  return (
    <div className="w-full">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Demand Forecast</h1>
          <p className="text-gray-600 mt-2 text-base">Demand Forecasts: showing demand across different time periods for a given program and products.</p>
        </div>
        <Button className="bg-[#306e9a] text-white px-4 py-2 rounded-lg shadow hover:bg-[#245371] transition-colors flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Demand
        </Button>
      </div>

      {/* Table Card */}
      <EditableDataTable 
        columns={filteredColumns} 
        data={demandData.data} 
        groupBy="program"
        onDataChange={(newData) => {
          fetch('/api/save-demand', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              columns: demandData.columns,
              data: newData
            })
          });
        }}
      />
    </div>
  );
}
