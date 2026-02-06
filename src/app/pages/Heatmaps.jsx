import DataTable from '../components/DataTable';
import reportsData from '../../data/reportsData.json';

export default function Reports() {
  return (
    <div className="w-full">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Heatmaps</h1>
        <p className="text-gray-600 mt-2 text-base">Description of the Page if needed</p>
      </div>

      {/* Table Card */}
      <DataTable columns={reportsData.columns} data={reportsData.data} itemsPerPage={8} />
    </div>
  );
}
