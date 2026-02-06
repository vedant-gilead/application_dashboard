import DataTable from '../components/DataTable';
import analyticsData from '../../data/analyticsData.json';

export default function Analytics() {
  return (
    <div className="w-full">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Expiry Summary</h1>
        <p className="text-gray-600 mt-2 text-base">Description of the Page if needed</p>
      </div>

      {/* Table Card */}
      <DataTable columns={analyticsData.columns} data={analyticsData.data} itemsPerPage={6} />
    </div>
  );
}
