import DataTable from '../components/DataTable';
import dashboardData from '../../data/dashboardData.json';

export default function Dashboard() {
  return (
    <div className="max-w-7xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Program Details</h1>
        <p className="text-gray-600 mt-2 text-base">Description of the Page if needed</p>
      </div>

      {/* Table Card */}
      <DataTable columns={dashboardData.columns} data={dashboardData.data} />
    </div>
  );
}
