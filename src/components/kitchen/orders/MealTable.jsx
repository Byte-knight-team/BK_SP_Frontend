import React from "react";
import { UserPlus, Play, Check } from "lucide-react";

const MealTable = ({ mealsData, orderStatus, onAssignChef, onStartMeal, onCompleteMeal }) => {
  // සූපවේදීන්ගේ ලැයිස්තුව (මේකත් පස්සේ API එකකින් එන්නේ)
  const chefs = ["Chef Kamal", "Chef Amara", "Chef Nimal"];

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 shadow-sm">
      <table className="w-full border-collapse text-left">
        {/* Table Header */}
        <thead className="bg-gray-50 text-[10px] font-bold tracking-wider text-gray-400 uppercase">
          <tr>
            <th className="px-6 py-4">Meal Item</th>
            <th className="px-6 py-4 text-center">Qty</th>
            <th className="px-6 py-4 text-center">Status</th>
            <th className="px-6 py-4 text-center uppercase">Chef Name</th>
            
            {/* Conditional Rendering: Order එක Ongoing නම් පමණක් Actions පෙන්වයි */}
            {(orderStatus === "Pending" || orderStatus === "Preparing") && (
              <th className="px-6 py-4 text-center">Actions</th>
            )}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-gray-50 bg-white leading-3">
          {mealsData.map((meal) => (
            <tr key={meal.id} className="transition-colors hover:bg-gray-50/50">
              {/* Meal Name */}
              <td className="px-6 py-5 font-bold text-gray-800">{meal.name}</td>
              
              {/* Quantity */}
              <td className="px-6 py-5 text-center text-lg font-bold text-gray-800 tracking-tight">x{meal.qty}</td>
              
              {/* Status Badge (තනිකරම දත්ත මත පමණක් තීරණය වේ) */}
              <td className="px-6 py-5 text-center">
                <span className={`inline-block rounded px-2 py-1 text-[10px] font-bold uppercase ${
                  meal.status === "Pending" ? "bg-orange-50 text-orange-500" : 
                  meal.status === "Preparing" ? "bg-blue-50 text-blue-500" : "bg-green-50 text-green-500"
                }`}>
                  {meal.status}
                </span>
              </td>
              
              {/* Chef Name Column */}
              <td className="px-6 py-5 text-center">
                <p className="text-xs font-bold text-gray-800 uppercase tracking-tighter">
                  {meal.chefName}
                </p>
              </td>

              {/* Action Buttons Column */}
              {(orderStatus === "Pending" || orderStatus === "Preparing") && (
                <td className="px-6 py-5">
                  <div className="flex justify-center gap-2">
                    {meal.status === "Pending" && (
                      <>
                        <button
                          onClick={() => onAssignChef(meal.id, "Chef Kamal")}
                          className="flex items-center gap-1 rounded-lg border border-blue-200 px-3 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 transition-all"
                        >
                          <UserPlus size={14} /> Assign Chef
                        </button>
                        <button
                          onClick={() => onStartMeal(meal.id)}
                          className="flex items-center gap-1 rounded-lg border border-green-300 px-3 py-2 text-xs font-bold text-green-600 hover:bg-green-50"
                        >
                          <Play size={14} /> Start
                        </button>
                      </>
                    )}
                    {meal.status === "Preparing" && (
                      <button
                        onClick={() => onCompleteMeal(meal.id)}
                        className="flex items-center gap-1 rounded-lg border border-green-300 px-3 py-2 text-xs font-bold text-green-600 hover:bg-green-50"
                      >
                        <Check size={14} /> Complete
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MealTable;
