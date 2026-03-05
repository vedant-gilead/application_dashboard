import DataTable from "../../../components/DataTable";

export default function ProgramTables({
  program,
  viewMode,
  cumulativeColumns,
  cumulativeData,
  selectedStudyId,
}) {
  if (!program) return null;

  if (viewMode === "CUMULATIVE") {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800">
          Cumulative Program View
        </h2>
        <DataTable columns={cumulativeColumns} data={cumulativeData} />
      </div>
    );
  }

  if (selectedStudyId !== "ALL") {
    const study = program.studies.find((s) => s.id === selectedStudyId);
    if (!study) return null;
    return study.materials.map((material) => (
      <div key={material.id} className="mb-8">
        <h2 className="text-xl font-bold text-gray-800">
          {material.type}: {material.id}
        </h2>
        {material.description && (
          <p className="text-gray-600 mt-1 text-base mb-4">
            {material.description}
          </p>
        )}
        <DataTable columns={material.columns} data={material.data} />
      </div>
    ));
  }

  // "ALL" + "PER_STUDY"
  return program.studies.map((study) => (
    <div key={study.id}>
      <h2 className="text-2xl font-bold text-gray-800 mb-4 mt-8">
        {study.name}
      </h2>
      {study.materials.map((material) => (
        <div key={material.id} className="mb-8">
          <h3 className="text-xl font-bold text-gray-800">
            {material.type}: {material.id}
          </h3>
          {material.description && (
            <p className="text-gray-600 mt-1 text-base mb-4">
              {material.description}
            </p>
          )}
          <DataTable columns={material.columns} data={material.data} />
        </div>
      ))}
    </div>
  ));
}
