import React from "react";
import { RiCheckboxCircleFill, RiProhibitedFill } from "@remixicon/react";

const TableStatusCard = () => {
  const freeTables = ["01", "04", "07", "09", "12"];
  const reservedTables = ["02", "03", "05", "08"];
  const occupiedTables = ["06", "10", "11"];

  return (
    <div className="flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="mb-6 border-b border-gray-50 pb-2 text-lg font-bold text-gray-800">
        Table Availability
      </h2>

      <div className="space-y-6">
        {/* --- FREE TABLES SECTION --- */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <RiCheckboxCircleFill className="text-green-500" size={20} />
            <span className="text-sm font-bold text-gray-700">Free Tables</span>
            <span className="ml-auto rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
              {freeTables.length} Tables
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {freeTables.map((num) => (
              <span
                key={num}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-100 bg-gray-50 text-xs font-bold text-gray-600"
              >
                T-{num}
              </span>
            ))}
          </div>
        </div>

        {/* --- RESERVED TABLES SECTION --- */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <RiProhibitedFill className="text-red-500" size={20} />
            <span className="text-sm font-bold text-gray-700">
              Reserved / Occupied
            </span>
            <span className="ml-auto rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
              {reservedTables.length} Tables
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {reservedTables.map((num) => (
              <span
                key={num}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-xs font-bold text-red-500"
              >
                T-{num}
              </span>
            ))}
          </div>
        </div>
        {/* --- OCCUPIED TABLES SECTION --- */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <RiProhibitedFill className="text-red-500" size={20} />
            <span className="text-sm font-bold text-gray-700">
              Occupied Tables
            </span>
            <span className="ml-auto rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
              {occupiedTables.length} Tables
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {occupiedTables.map((num) => (
              <span
                key={num}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-xs font-bold text-red-500"
              >
                T-{num}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableStatusCard;
