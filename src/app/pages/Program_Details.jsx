import { Link } from 'react-router-dom';
import DataTable from '../components/DataTable';
import programData from '../../data/Program_Details.json';
import { Plus } from 'lucide-react';

export default function Dashboard() {
  const columns = [
    {
      key: "program",
      label: "Program",
      sortable: true,
      render: (row) => (
        <Link to={`/programs/${row.program}`} className="text-blue-600 hover:underline">
          {row.program}
        </Link>
      ),
    },
    ...programData.columns.filter((col) => col.key !== "program"),
  ];

  return (
    <div className="w-full">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Program Details</h1>
          <p className="text-gray-600 mt-2 text-base">Programs: Manages clinical programs, studies, and associated materials with their site execution details.</p>
        </div>
        <button className="bg-[#306e9a] text-white px-4 py-2 rounded-lg shadow hover:bg-[#245371] transition-colors flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Program
        </button>
      </div>

      {/* Table Card */}
      <DataTable columns={columns} data={programData.data} />
    </div>
  );
}
