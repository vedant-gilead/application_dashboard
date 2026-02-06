import DataTable from '../components/DataTable';
import usersData from '../../data/usersData.json';

export default function Users() {
  return (
    <div className="max-w-7xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Demand Forecast</h1>
        <p className="text-gray-600 mt-2 text-base">Description of the Page if needed</p>
      </div>

      {/* Table Card */}
      <DataTable columns={usersData.columns} data={usersData.data} />
    </div>
  );
}
