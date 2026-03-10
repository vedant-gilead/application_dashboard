import DataTable from '../components/DataTable';
import studiesMasterData from '../../data/studiesMasterData.json';
import { Plus } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function Studies_Master_Data() {
  return (
    <div className="w-full">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Studies Master Data</h1>
          <p className="text-gray-600 mt-2 text-base">Studies: Description</p>
        </div>
        <Button className="bg-[#306e9a] text-white px-4 py-2 rounded-lg shadow hover:bg-[#245371] transition-colors flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Study
        </Button>
      </div>

      {/* Table Card */}
      <DataTable 
        columns={studiesMasterData.columns.map(col => {
          if (col.key === 'status') {
            return {
              ...col,
              render: (row) => {
                const status = row.status;
                let colorClass = "bg-gray-100 text-gray-800 border-gray-200";
                
                if (status === "Active") {
                  colorClass = "bg-emerald-100 text-emerald-800 border-emerald-200";
                } else if (status === "Completed") {
                  colorClass = "bg-blue-100 text-blue-800 border-blue-200";
                } else if (status === "Planned") {
                  colorClass = "bg-amber-100 text-amber-800 border-amber-200";
                } else if (status === "On Hold" || status === "Cancelled") {
                  colorClass = "bg-rose-100 text-rose-800 border-rose-200";
                }
                
                return (
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
                    {status}
                  </span>
                );
              }
            };
          }
          return col;
        })} 
        data={studiesMasterData.data} 
      />
    </div>
  );
}