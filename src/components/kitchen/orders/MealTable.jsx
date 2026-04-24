import { UserPlus, Play, Check } from "lucide-react";

const MealTable = ({
  mealsData,
  orderStatus,
  onAssignChef,
  onStartMeal,
  onCompleteMeal,
}) => {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 shadow-sm">
      <table className="w-full border-collapse text-left">
        {/* table header */}
        <thead className="bg-gray-50 text-[10px] font-bold tracking-wider text-gray-400 uppercase">
          <tr>
            <th className="px-6 py-4">Meal Item</th>
            <th className="px-6 py-4 text-center">Qty</th>
            <th className="px-6 py-4 text-center">Status</th>
            <th className="px-6 py-4 text-center uppercase">Chef Name</th>

            {/* show actions only if the order is not completed or on_hold */}
            {(orderStatus === "PENDING" || orderStatus === "PREPARING") && (
              <th className="px-6 py-4 text-center">Actions</th>
            )}
          </tr>
        </thead>

        {/* table body */}
        <tbody className="divide-y divide-gray-50 bg-white leading-3">
          {mealsData.map((meal) => (
            <tr key={meal.id} className="transition-colors hover:bg-gray-50/50">
              {/* meal name */}
              <td className="px-6 py-5">
                <div className="flex flex-col text-left">
                  {/* the main meal name */}
                  <span className="font-bold text-gray-800">{meal.name}</span>
                  {/* display the special note badge only if a note exists */}
                  {meal.kitchenNotes && (
                    <span className="mt-0.5 text-xs text-gray-500 italic">
                      Note: {meal.kitchenNotes}
                    </span>
                  )}
                </div>
              </td>

              {/* quantity */}
              <td className="px-6 py-5 text-center text-lg font-bold tracking-tight text-gray-800">
                x{meal.qty}
              </td>

              {/* status badge */}
              <td className="px-6 py-5 text-center">
                <span
                  className={`inline-block rounded px-2 py-1 text-[10px] font-bold uppercase ${
                    meal.status === "PENDING"
                      ? "bg-orange-50 text-orange-500"
                      : meal.status === "PREPARING"
                        ? "bg-blue-50 text-blue-500"
                        : "bg-green-50 text-green-500"
                  }`}
                >
                  {meal.status}
                </span>
              </td>

              {/* chef name column */}
              <td className="px-6 py-5 text-center">
                <p className="text-xs font-bold tracking-tighter text-gray-800 uppercase">
                  {meal.chefName}
                </p>
              </td>

              {/* action buttons column - only visible when the order is pending or preparing */}
              {(orderStatus === "PENDING" || orderStatus === "PREPARING") && (
                <td className="px-6 py-5">
                  <div className="flex justify-center gap-2">
                    {/* if the meal is PENDING, show Assign and Start buttons */}
                    {meal.status === "PENDING" && (
                      <>
                        <button
                          //passing the whole meal object for display meal details in the modal whenever want
                          onClick={() => onAssignChef(meal)}
                          className="flex items-center gap-1 rounded-lg border border-blue-200 px-3 py-2 text-xs font-bold text-blue-600 transition-all hover:bg-blue-50"
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
                    {/* only show "Complete" if the individual meal is Preparing AND the whole order is in Preparing tab */}
                    {meal.status === "PREPARING" &&
                      orderStatus === "PREPARING" && (
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
