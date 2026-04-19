import React from "react";
import { UserPlus, Play, XCircle } from "lucide-react";

const MealTable = ({ meals }) => {
  return (
    <div className="mt-8">
      {/* Table Title */}
      <h2 className="text-lg font-bold text-gray-800 mb-4">
        Meal List ({meals.length} items)
      </h2>

      {/* --- Table Header --- */}
      <div className="grid grid-cols-12 bg-gray-50 p-4 rounded-t-xl text-[10px] font-bold text-gray-400 uppercase tracking-wider border border-gray-100">
        <div className="col-span-4">Meal Item</div>
        <div className="col-span-2 text-center">Qty</div>
        <div className="col-span-2 text-center">Status</div>
        <div className="col-span-4 text-center">Actions</div>
      </div>

      {/* --- Table Body --- */}
      <div className="border-x border-b border-gray-100 rounded-b-xl overflow-hidden">
        {meals.map((meal, index) => (
          <div 
            key={index} 
            className="grid grid-cols-12 items-center p-5 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
          >
            {/* Meal Name & Category */}
            <div className="col-span-4">
              <p className="font-bold text-gray-800">{meal.name}</p>
              <p className="text-xs text-gray-400">{meal.category}</p>
            </div>

            {/* Quantity */}
            <div className="col-span-2 text-center font-bold text-gray-800 text-lg">
              x{meal.qty}
            </div>

            {/* Status Badge */}
            <div className="col-span-2 text-center">
              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                meal.status === 'Pending' ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-blue-500'
              }`}>
                {meal.status}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="col-span-4 flex justify-center">
              <button className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-blue-600 border border-blue-100 rounded-lg hover:bg-blue-50">
                <UserPlus size={14} /> Assign
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MealTable;