import EditableDataTable from '../components/EditableDataTable';
import sitesMasterData from '../../data/sitesMasterData.json';
import { Plus } from 'lucide-react';
import { Button } from '../components/ui/button';
 
export default function Sites_Master_Data() {
  const editableColumns = sitesMasterData.columns.map((col, index) => ({
    ...col,
    editable: index === 0 ? false : true,
  }));
 
  const handleSitesChange = async (newData) => {
    try {
      await fetch('/api/save-sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          columns: sitesMasterData.columns,
          data: newData,
        }),
      });
    } catch (err) {
      console.error('Failed to save sites master data:', err);
    }
  };
 
  return (
    <div className="w-full">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Sites Master Data</h1>
          <p className="text-gray-600 mt-2 text-base">Sites: Manages clinical sites, and associated materials with their site execution details.</p>
        </div>
        <Button className="bg-[#306e9a] text-white px-4 py-2 rounded-lg shadow hover:bg-[#245371] transition-colors flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Site
        </Button>
      </div>
 
      {/* Table Card */}
      <EditableDataTable
        columns={editableColumns}
        data={sitesMasterData.data}
        onDataChange={handleSitesChange}
      />
    </div>
  );
}
 