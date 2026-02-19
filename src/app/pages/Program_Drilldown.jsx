import { useParams, Link } from "react-router-dom";
import { Home, ChevronRight } from "lucide-react";

import DataTable from "../components/DataTable";

import summaryData from "../../data/Program_Summary.json";
import finishedProgramData from "../../data/Finished_Program_Planning.json";
import level1MaterialsData from "../../data/Level_1_Materials.json";
import level2MaterialsData from "../../data/Level_2_Materials.json";
import parametersPoolData from "../../data/Parameters_Pool.json";
import newImage from '../../assets/image.png'

export default function ProgramDrilldown() {
  const { programId } = useParams();
  const programSummary = summaryData[programId];
  const finishedData = finishedProgramData.data[programId];
  const level1Data = level1MaterialsData.data[programId];
  const level2Data = level2MaterialsData.data[programId];

  if (!programSummary) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200/80 p-12 shadow-sm text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-800">Program Not Found</h2>
        <p className="text-gray-600 mt-2">
          The program with ID <span className="font-semibold">{programId}</span> could not be found.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors"
        >
          Go Back to Programs
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Breadcrumbs */}
      <div className="flex items-center text-gray-500 text-sm mb-4">
        <Link to="/" className="hover:text-gray-700">
          <Home className="w-4 h-4" />
        </Link>
        <ChevronRight className="w-4 h-4 mx-1" />
        <Link to="/" className="hover:text-gray-700">
          Programs
        </Link>
        <ChevronRight className="w-4 h-4 mx-1" />
        <span className="font-medium text-gray-700">{programId}</span>
      </div>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
          {programId}
        </h1>
        <p className="text-gray-600 mt-2 text-base">
          Detailed planning and material information for {programId}
        </p>
      </div>

      {/* Program Summary Card */}
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

      {/* Parameters Pool Card */}
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
                  {parametersPoolData.FP.siteExecution}
                </p>.
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  MOQ
                </label>
                <p className="mt-1 text-base text-gray-900">
                  {parametersPoolData.FP.moq}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Release Lead Time
                </label>
                <p className="mt-1 text-base text-gray-900">
                  {parametersPoolData.FP.releaseLeadTime}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Execution Lead Time
                </label>
                <p className="mt-1 text-base text-gray-900">
                  {parametersPoolData.FP.executionLeadTime}
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
                  {parametersPoolData.IP1.safetyStock}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Consumption Ratio (PC/FP)
                </label>
                <p className="mt-1 text-base text-gray-900">
                  {parametersPoolData.IP1.consumptionRatio}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Site Execution
                </label>
                <p className="mt-1 text-base text-gray-900">
                  {parametersPoolData.IP1.siteExecution}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  MOQ
                </label>
                <p className="mt-1 text-base text-gray-900">
                  {parametersPoolData.IP1.moq}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Release Lead Time
                </label>
                <p className="mt-1 text-base text-gray-900">
                  {parametersPoolData.IP1.releaseLeadTime}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Execution Lead Time
                </label>
                <p className="mt-1 text-base text-gray-900">
                  {parametersPoolData.IP1.executionLeadTime}
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
                  {parametersPoolData.IP2.safetyStock}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Consumption Ratio (IP/PC)
                </label>
                <p className="mt-1 text-base text-gray-900">
                  {parametersPoolData.IP2.consumptionRatio}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Site Execution
                </label>
                <p className="mt-1 text-base text-gray-900">
                  {parametersPoolData.IP2.siteExecution}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  MOQ
                </label>
                <p className="mt-1 text-base text-gray-900">
                  {parametersPoolData.IP2.moq}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Release Lead Time
                </label>
                <p className="mt-1 text-base text-gray-900">
                  {parametersPoolData.IP2.releaseLeadTime}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Execution Lead Time
                </label>
                <p className="mt-1 text-base text-gray-900">
                  {parametersPoolData.IP2.executionLeadTime}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Finished Program Planning Table */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800">
          Finished Product: FP-14522
        </h2>
        <p className="text-gray-600 mt-1 text-base mb-4">
          GS-5423 Injection, 150 mg/mL, 2 mL/vial
        </p>
        <DataTable
          columns={finishedProgramData.columns}
          data={finishedData}
        />
      </div>

      {/* Level 1 Materials Table */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800">
          Drug Product: PC-12723
        </h2>
        <p className="text-gray-600 mt-1 text-base mb-4">
          DP -GS-5423 Injection, 150 mg/mL,  2 mL /via
        </p>
        <DataTable
          columns={level1MaterialsData.columns}
          data={level1Data}
        />
      </div>

      {/* Level 2 Raw Materials Table */}
      <div>
        <h2 className="text-xl font-bold text-gray-800">
          Drug Substance: IP-15699
        </h2>
        <p className="text-gray-600 mt-1 text-base mb-4">
          DS - GS-5423 Drug Substance, 85mg/mL
        </p>
        <DataTable
          columns={level2MaterialsData.columns}
          data={level2Data}
        />
      </div>
      
      {/* Added Image */}
      <div className="mt-8">
        <img
          src={newImage}
          alt="Placeholder"
          className="w-full h-auto rounded-lg shadow-sm"
        />
      </div>
    </div>
  );
}
