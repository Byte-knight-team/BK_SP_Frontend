import React from "react";
import { Plus, RotateCcw, } from "lucide-react";
import ProgressBar from "../ProgressBar";

const InventoryTable = () => {
  // Mock data to match your image
  const inventoryData = [
    {
      itemName: "Garlic",
      unit: "kg",
      availableCount: 10,
      maxStock: 50,
      warningLevel: "CRITICAL",
      percentage: 20,
    },
    {
      itemName: "Tomato",
      unit: "kg",
      availableCount: 15,
      maxStock: 60,
      warningLevel: "LOW",
      percentage: 25,
    },
    {
      itemName: "Onion",
      unit: "kg",
      availableCount: 20,
      maxStock: 80,
      warningLevel: "LOW",
      percentage: 25,
    },
    {
      itemName: "Chicken Breast",
      unit: "kg",
      availableCount: 85,
      maxStock: 100,
      warningLevel: "OK",
      percentage: 85,
    },
    {
      itemName: "Olive Oil",
      unit: "Litre",
      availableCount: 120,
      maxStock: 150,
      warningLevel: "OK",
      percentage: 80,
    },
  ];

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      {/* Header Actions */}
      <div className="mb-8 flex justify-end gap-3">
        <button className="flex items-center gap-2 rounded-2xl bg-orange-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 transition-all hover:bg-orange-700">
          <Plus size={18} /> Request New Item
        </button>
        <button className="flex items-center gap-2 rounded-2xl border border-orange-100 bg-orange-50 px-6 py-3 text-sm font-bold text-orange-600 transition-all hover:bg-orange-100">
          <RotateCcw size={18} /> Start-of-day Update
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-y-4 text-left">
          <thead>
            <tr className="text-[13px] font-black tracking-widest text-gray-400 uppercase">
              <th className="px-6 pb-2">Item Name</th>
              <th className="px-6 pb-2">Unit</th>
              <th className="px-6 pb-2">Current Qty</th>
              <th className="px-6 pb-2">Max Stock</th>
              <th className="px-6 pb-2">Status</th>
              <th className="px-6 pb-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {inventoryData.map((item, index) => (
              <tr
                key={index}
                className="group transition-colors hover:bg-gray-50/50"
              >
                <td className="px-6 py-5 text-lg font-bold text-gray-800">
                  {item.itemName}
                </td>
                <td className="px-6 py-5 font-medium text-gray-400">
                  {item.unit}
                </td>

                {/* Progress Bar Column */}
                <td className="px-6 py-5">
                  <div className="flex min-w-[220px] items-center gap-4">
                    <div className="flex-1">
                      <ProgressBar
                        percentage={item.percentage}
                        color={
                          item.warningLevel === "CRITICAL"
                            ? "#EF4444"
                            : item.warningLevel === "LOW"
                              ? "#F97316"
                              : "#EA580C"
                        }
                      />
                    </div>
                    <span className="w-10 text-right text-lg font-black text-gray-800">
                      {item.availableCount}
                    </span>
                  </div>
                </td>

                <td className="px-6 py-5 text-lg font-bold text-gray-400">
                  {item.maxStock}
                </td>

                {/* Status Badge */}
                <td className="px-6 py-5">
                  <span
                    className={`rounded-full px-4 py-1.5 text-[11px] font-black tracking-tighter uppercase ${
                      item.status === "CRITICAL"
                        ? "border border-red-100 bg-red-50 text-red-500"
                        : item.status === "LOW"
                          ? "border border-orange-100 bg-orange-50 text-orange-500"
                          : "border border-green-100 bg-green-50 text-green-500"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>

                {/* Action Buttons */}
                <td className="px-6 py-5 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button className="rounded-lg bg-orange-50 px-4 py-2 text-[11px] font-bold text-orange-700 transition-all hover:bg-orange-100">
                      Update
                    </button>
                    <button className="rounded-lg bg-orange-50 px-4 py-2 text-[11px] font-bold text-orange-700 transition-all hover:bg-orange-100">
                      Request
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryTable;
