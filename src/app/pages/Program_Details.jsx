import { useState } from 'react';
import DataTable from '../components/DataTable';
import initialProgramData from '../../data/Program_Details.json';
import { columns } from '../config/programDetailsColumns';
import AddProgramForm from '../components/AddProgramForm';

export default function Program_Details() {
  const [programData, setProgramData] = useState(initialProgramData);

  const handleAddProgram = (newProgram) => {
    const updatedData = { ...programData, data: [...programData.data, newProgram] };
    setProgramData(updatedData);
  };

  return (
    <div className="w-full">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Program Details</h1>
          <p className="text-gray-600 mt-2 text-base">Programs: Manages clinical programs, studies, and associated materials with their site execution details.</p>
        </div>
        <AddProgramForm onAddProgram={handleAddProgram} />
      </div>

      {/* Table Card */}
      <DataTable columns={columns} data={programData.data} />
    </div>
  );
}