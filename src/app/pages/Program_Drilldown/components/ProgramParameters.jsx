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
        
        {/* Finished Product (FP) */}
        <div className="flex-1 min-w-[320px] max-w-md border border-gray-200 rounded-lg p-4 bg-gray-50 flex flex-col justify-start shadow-[0_2px_4px_-2px_rgba(0,0,0,0.05)]">
          <h3 className="text-sm font-semibold text-gray-800 mb-3 break-words">
            Finished Product (FP)
          </h3>
          <div className="grid grid-cols-2 gap-4 mt-auto">
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1">Site Execution</label>
              <p className="text-[13px] text-gray-900 font-medium whitespace-nowrap overflow-hidden text-ellipsis">{programParameters.FP.siteExecution}</p>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1">MOQ</label>
              <p className="text-[13px] text-gray-900 font-medium whitespace-nowrap overflow-hidden text-ellipsis">{programParameters.FP.moq}</p>
            </div>
          </div>
        </div>

        {/* Dynamic IP Tiles (Drug Product/Substance) */}
        {ipKeys.map((key) => {
          const item = programParameters[key];
          // Check if it's a Substance or Product based on the consumption ratio label or key
          const isProduct = item.name ? item.name.toLowerCase().includes("product") : key === 'IP1';
          const title = item.name || (isProduct ? "Drug Product (PC)" : "Drug Substance (IP)");
          const ratioLabel = isProduct ? "Consumption Ratio (PC/FP)" : "Consumption Ratio (IP/PC)";

          return (
            <div key={key} className="flex-1 min-w-[320px] max-w-md border border-gray-200 rounded-lg p-4 bg-gray-50 flex flex-col justify-start shadow-[0_2px_4px_-2px_rgba(0,0,0,0.05)]">
              <h3 className="text-sm font-semibold text-gray-800 mb-3 break-words">
                {title}
              </h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 mb-1">Safety Stock</label>
                  <p className="text-[13px] text-gray-900 font-medium whitespace-nowrap overflow-hidden text-ellipsis">{item.safetyStock}</p>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 mb-1">{ratioLabel}</label>
                  <p className="text-[13px] text-gray-900 font-medium whitespace-nowrap overflow-hidden text-ellipsis">{item.consumptionRatio}</p>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 mb-1">Site Execution</label>
                  <p className="text-[13px] text-gray-900 font-medium whitespace-nowrap overflow-hidden text-ellipsis">{item.siteExecution}</p>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 mb-1">MOQ</label>
                  <p className="text-[13px] text-gray-900 font-medium whitespace-nowrap overflow-hidden text-ellipsis">{item.moq}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}