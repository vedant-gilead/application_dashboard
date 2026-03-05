export default function ProgramParameters({ programParameters }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 mb-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        Program Parameters
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Finished Product (FP) */}
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            Finished Product (FP)
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Site Execution
              </label>
              <p className="mt-1 text-base text-gray-900">
                {programParameters.FP.siteExecution}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">
                MOQ
              </label>
              <p className="mt-1 text-base text-gray-900">
                {programParameters.FP.moq}
              </p>
            </div>
          </div>
        </div>

        {/* Drug Product (IP) - Group 1 */}
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            Drug Product (PC)
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Safety Stock
              </label>
              <p className="mt-1 text-base text-gray-900">
                {programParameters.IP1.safetyStock}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Consumption Ratio (PC/FP)
              </label>
              <p className="mt-1 text-base text-gray-900">
                {programParameters.IP1.consumptionRatio}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Site Execution
              </label>
              <p className="mt-1 text-base text-gray-900">
                {programParameters.IP1.siteExecution}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">
                MOQ
              </label>
              <p className="mt-1 text-base text-gray-900">
                {programParameters.IP1.moq}
              </p>
            </div>
          </div>
        </div>

        {/* Drug Product (IP) - Group 2 */}
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            Drug Substance (IP)
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Safety Stock
              </label>
              <p className="mt-1 text-base text-gray-900">
                {programParameters.IP2.safetyStock}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Consumption Ratio (IP/PC)
              </label>
              <p className="mt-1 text-base text-gray-900">
                {programParameters.IP2.consumptionRatio}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Site Execution
              </label>
              <p className="mt-1 text-base text-gray-900">
                {programParameters.IP2.siteExecution}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">
                MOQ
              </label>
              <p className="mt-1 text-base text-gray-900">
                {programParameters.IP2.moq}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
