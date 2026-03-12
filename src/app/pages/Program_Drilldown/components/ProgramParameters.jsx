export default function ProgramParameters({ programParameters }) {
  // Logic to dynamically identify all IP (Intermediate Product/Substance) keys
  // This filters for keys like IP1, IP2, IP3... while excluding FP
  const ipKeys = Object.keys(programParameters).filter(key => key.startsWith('IP'));

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 mb-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        Program Parameters
      </h2>
      
      {/* Container with horizontal scroll */}
      <div className="flex flex-nowrap overflow-x-auto gap-6 pb-4 scrollbar-hide">
        
        {/* Finished Product (FP) - Fixed width to ensure consistency in scroll */}
        <div className="flex-none w-[350px] border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            Finished Product (FP)
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Site Execution</label>
              <p className="mt-1 text-base text-gray-900">{programParameters.FP.siteExecution}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">MOQ</label>
              <p className="mt-1 text-base text-gray-900">{programParameters.FP.moq}</p>
            </div>
          </div>
        </div>

        {/* Dynamic IP Tiles (Drug Product/Substance) */}
        {ipKeys.map((key) => {
          const item = programParameters[key];
          // Check if it's a Substance or Product based on the consumption ratio label or key
          const title = key === 'IP1' ? "Drug Product (PC)" : "Drug Substance (IP)";
          const ratioLabel = key === 'IP1' ? "Consumption Ratio (PC/FP)" : "Consumption Ratio (IP/PC)";

          return (
            <div key={key} className="flex-none w-[350px] border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                {title}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Safety Stock</label>
                  <p className="mt-1 text-base text-gray-900">{item.safetyStock}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">{ratioLabel}</label>
                  <p className="mt-1 text-base text-gray-900">{item.consumptionRatio}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Site Execution</label>
                  <p className="mt-1 text-base text-gray-900">{item.siteExecution}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">MOQ</label>
                  <p className="mt-1 text-base text-gray-900">{item.moq}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}