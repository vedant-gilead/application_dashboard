import DataTable from '../components/DataTable';
import ordersData from '../../data/ordersData.json';

export default function Orders() {
  return (
    <div className="max-w-7xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Capacity</h1>
        <p className="text-gray-600 mt-2 text-base">Description of the Page if needed</p>
      </div>

      {/* Table Card */}
      <DataTable columns={ordersData.columns} data={ordersData.data} />
    </div>
  );
}
