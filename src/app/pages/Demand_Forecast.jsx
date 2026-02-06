import EditableDataTable from '../components/EditableDataTable';
import demandData from '../../data/Demand_Forecast.json';

export default function Users() {
  return (
    <div className="w-full">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Demand Forecast</h1>
        <p className="text-gray-600 mt-2 text-base">Demand Forecasts: showing demand across different time periods for a given program and products.</p>
      </div>

      {/* Table Card */}
      <EditableDataTable columns={demandData.columns} data={demandData.data} />
    </div>
  );
}
