import DataTable from '../components/DataTable';
import productsData from '../../data/productsData.json';

export default function Products() {
  return (
    <div className="max-w-7xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Program Flow Map</h1>
        <p className="text-gray-600 mt-2 text-base">Description of the Page if needed</p>
      </div>

      {/* Table Card */}
      <DataTable columns={productsData.columns} data={productsData.data} />
    </div>
  );
}
