import { UserPlus, Play, Check } from "lucide-react";

const statusStyles = {
  PENDING: "bg-orange-50 text-orange-500",
  PREPARING: "bg-blue-50 text-blue-500",
  COMPLETED: "bg-green-50 text-green-500",
  ON_HOLD: "bg-red-50 text-red-500",
  READY: "bg-green-50 text-green-500"
};

const MealTable = ({
  mealsData,
  orderStatus,
  onAssignChef,
  onStartMeal,
  onCompleteMeal,
}) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100">
      <table className="w-full border-collapse text-left">
        {/* table header */}
        <thead className="bg-gray-50/80 text-[10px] font-bold tracking-wider text-gray-400 uppercase">
          <tr>
            <th className="px-6 py-4">Meal Item</th>
            <th className="px-6 py-4 text-center">Qty</th>
            <th className="px-6 py-4 text-center">Status</th>
            <th className="px-6 py-4 text-center">Chef Name</th>
            {/* show actions only if the order is not completed or on_hold */}
            {(orderStatus === "PENDING" || orderStatus === "PREPARING") && (
              <th className="px-6 py-4 text-center">Actions</th>
            )}
          </tr>
        </thead>

        {/* table body */}
        <tbody className="divide-y divide-gray-50 bg-white">
          {mealsData.map((meal) => (
            <tr key={meal.id} className="transition-colors hover:bg-gray-50/50">
              {/* meal name */}
              <td className="px-4 py-3">
                <div className="flex flex-col text-left">
                  <span className="font-bold text-gray-800">{meal.name}</span>
                </div>
              </td>

              {/* quantity */}
              <td className="px-4 py-3 text-center">
                <span className="rounded-lg bg-gray-50 px-3 py-1 text-sm font-bold text-gray-800">
                  x{meal.qty}
                </span>
              </td>

              {/* status badge */}
              <td className="px-4 py-3 text-center">
                <span
                  className={`inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase ${
                    statusStyles[meal.status] || "bg-gray-50 text-gray-400"
                  }`}
                >
                  {meal.status.replace("_", " ")}
                </span>
              </td>

              {/* chef name column */}
              <td className="px-4 py-3 text-center">
                <p
                  className={`text-xs font-bold tracking-tight ${
                    meal.chefName === "Not Assigned"
                      ? "text-gray-300 italic"
                      : "text-gray-800"
                  }`}
                >
                  {meal.chefName}
                </p>
              </td>

              {/* action buttons column */}
              {(orderStatus === "PENDING" || orderStatus === "PREPARING") && (
                <td className="px-4 py-3">
                  <div className="flex justify-center gap-2">
                    {meal.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => onAssignChef(meal)}
                          className="flex items-center gap-1 rounded-xl border border-blue-100 px-3 py-2 text-xs font-bold text-blue-600 transition-all hover:bg-blue-50"
                        >
                          <UserPlus size={14} /> Assign
                        </button>
                        <button
                          onClick={() => onStartMeal(meal)}
                          // Check if a chef is assigned. If not, disable the button
                          disabled={meal.chefName === "Not Assigned"}
                          className={`flex items-center gap-1 rounded-xl border px-3 py-2 text-xs font-bold transition-all ${
                            meal.chefName === "Not Assigned"
                              ? "cursor-not-allowed border-gray-100 bg-gray-50/50 text-gray-300" // Disabled Style
                              : "border-green-100 text-green-600 hover:bg-green-50" // Enabled Style
                          }`}
                        >
                          <Play size={14} /> Start
                        </button>
                      </>
                    )}
                    {meal.status === "PREPARING" &&
                      orderStatus === "PREPARING" && (
                        <button
                          onClick={() => onCompleteMeal(meal)}
                          className="flex items-center gap-1 rounded-xl border border-green-100 px-3 py-2 text-xs font-bold text-green-600 transition-all hover:bg-green-50"
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
