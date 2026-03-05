export default function ProgramSummary({ programSummary }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 mb-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        Program Summary
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-500">
            Program
          </label>
          <p className="mt-1 text-base text-gray-900">
            {programSummary.program}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500">
            Therapeutic Area
          </label>
          <p className="mt-1 text-base text-gray-900">
            {programSummary.therapeuticArea}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500">
            Study Numbers
          </label>
          <p className="mt-1 text-base text-gray-900">
            {programSummary.study}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500">
            Material Numbers
          </label>
          <p className="mt-1 text-base text-gray-900">
            {programSummary.materialNumber}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500">
            Lot Numbers
          </label>
          <p className="mt-1 text-base text-gray-900">
            {programSummary.lot}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500">
            Site Execution
          </label>
          <p className="mt-1 text-base text-gray-900">
            {programSummary.siteExecution}
          </p>
        </div>
      </div>
    </div>
  );
}
