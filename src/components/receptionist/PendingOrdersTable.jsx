import React from "react";

const SimpleOrderTable = () => {
  return (
    <div className="relative overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
      <table className="w-full text-sm text-left text-gray-500">
        {/* Table Head */}
        <thead className="text-xs text-gray-400 uppercase bg-gray-50/50 border-b border-gray-100">
          <tr className="bg-gray-50/50">
            <th className="w-[15%] px-6 py-4 ...">ORDER ID</th>
            <th className="w-[25%] px-6 py-4 ...">TABLE</th>
            <th className="w-[20%] px-6 py-4 ...">TIME</th>
            <th className="w-[20%] px-6 py-4 ...">STATUS</th>
            <th className="w-[20%] px-6 py-4 text-right ...">TOTAL</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="bg-white">
          <tr className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
            <th className="px-6 py-4 font-bold text-gray-900 whitespace-nowrap">#3</th>
            <td className="px-6 py-4 font-medium text-gray-600">Table 09</td>
            <td className="px-6 py-4">04:45 PM</td>
            <td className="px-6 py-4">
               <span className="bg-red-50 text-red-500 px-2 py-1 rounded text-[10px] font-bold">CANCELLED</span>
            </td>
            <td className="px-6 py-4 font-bold text-gray-800">LKR 0.00</td>
          </tr>

          <tr className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
            <th className="px-6 py-4 font-bold text-gray-900 whitespace-nowrap">#2</th>
            <td className="px-6 py-4 font-medium text-gray-600">Table 02</td>
            <td className="px-6 py-4">04:32 PM</td>
            <td className="px-6 py-4">
               <span className="bg-orange-50 text-orange-500 px-2 py-1 rounded text-[10px] font-bold">OPEN</span>
            </td>
            <td className="px-6 py-4 font-bold text-gray-800">LKR 320.50</td>
          </tr>

          <tr className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
            <th className="px-6 py-4 font-bold text-gray-900 whitespace-nowrap">#1</th>
            <td className="px-6 py-4 font-medium text-gray-600">Table 14</td>
            <td className="px-6 py-4">04:15 PM</td>
            <td className="px-6 py-4">
               <span className="bg-green-50 text-green-500 px-2 py-1 rounded text-[10px] font-bold">PAID</span>
            </td>
            <td className="px-6 py-4 font-bold text-gray-800">LKR 840.00</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default SimpleOrderTable;