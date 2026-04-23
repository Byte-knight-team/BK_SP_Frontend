import React from "react";
import { Plus, RotateCcw, Search } from "lucide-react";
import ProgressBar from "../ProgressBar";
import { useState, useEffect } from "react";
import { getAllInventoryAPI } from "../../../apis/kitchen/inventory";


const InventoryTable = () => {
  // store the search term
  //const [searchTerm, setSearchTerm] = useState("");

  // save inventory data
  const [inventoryData, setInventoryData] = useState([]);

  // set loading state
  const [loading, setLoading] = useState(false);

  //filter logic
  // const filteredData = inventoryData.filter((item) =>
  //   item.itemName.toLowerCase().includes(searchTerm.toLowerCase())
  // );

  //fetch data from API
  useEffect(() => {
    const fetchInventory = async () => {
      setLoading(true);
      const { data, error } = await getAllInventoryAPI();
      if (data) {
        setInventoryData(data);
      } else {
        console.error("Failed to load inventory:", error);
      }
      setLoading(false);
    };
    fetchInventory();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      {/* header actions */}
      <div className="flex flex-row justify-between">
        <div>
          <div className="flex items-center pl-4 text-gray-400">
            <div className="pr-4">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search inventory..."
              className="w-full rounded-2xl border border-gray-100 bg-gray-50 py-3 pr-4 pl-11 text-sm font-medium"
              // value={searchTerm}
              //onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="mb-8 flex flex-row justify-end gap-3">
          <button className="flex items-center gap-2 rounded-2xl bg-orange-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 transition-all hover:bg-orange-700">
            <Plus size={18} /> Request New Item
          </button>
          <button className="flex items-center gap-2 rounded-2xl border border-orange-100 bg-orange-50 px-6 py-3 text-sm font-bold text-orange-600 transition-all hover:bg-orange-100">
            <RotateCcw size={18} /> Start-of-day Update
          </button>
        </div>
      </div>

      {/* table */}
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-y-4 text-center">
          <thead>
            <tr className="text-sm font-black text-gray-400 uppercase">
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
                  {item.name}
                </td>
                <td className="px-6 py-5 font-medium text-gray-400">
                  {item.unit}
                </td>

                {/* progress bar column */}
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
                      {item.quantity}
                    </span>
                  </div>
                </td>

                <td className="px-6 py-5 text-lg font-bold text-gray-400">
                  {item.maxStock}
                </td>

                {/* status */}
                <td className="px-6 py-5">
                  <span
                    className={`rounded-full px-4 py-1.5 text-[11px] font-black tracking-tighter uppercase ${
                      item.warningLevel === "CRITICAL"
                        ? "border border-red-100 bg-red-50 text-red-500"
                        : item.warningLevel === "LOW"
                          ? "border border-orange-100 bg-orange-50 text-orange-500"
                          : "border border-green-100 bg-green-50 text-green-500"
                    }`}
                  >
                    {item.warningLevel}
                  </span>
                </td>

                {/* action buttons */}
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
