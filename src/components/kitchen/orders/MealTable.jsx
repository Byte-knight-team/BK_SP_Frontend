import { UserPlus, MessageSquare } from 'lucide-react'

const statusStyles = {
  PENDING:   'bg-orange-50 text-orange-500',
  PREPARING: 'bg-blue-50 text-blue-500',
  READY:     'bg-green-50 text-green-500',
  ON_HOLD:   'bg-red-50 text-red-500',
}

const MealTable = ({ mealsData, orderStatus, onAssignChef }) => {
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100 [&::-webkit-scrollbar]:hidden">
      <table className="w-full border-collapse text-left">
        <thead className="bg-gray-50/80 text-[10px] font-bold tracking-wider text-gray-400 uppercase">
          <tr>
            <th className="px-4 py-3">Meal Item</th>
            <th className="px-4 py-3 text-center">Qty</th>
            <th className="px-4 py-3 text-center">Status</th>
            <th className="px-4 py-3 text-center">Line Chef</th>
            {(orderStatus === 'PENDING' || orderStatus === 'PREPARING') && (
              <th className="px-4 py-3 text-center">Action</th>
            )}
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-50 bg-white">
          {mealsData.map((meal) => (
            <tr key={meal.id} className="transition-colors hover:bg-gray-50/50">
              <td className="px-3 py-3">
                <span className="font-bold text-gray-800">{meal.name}</span>
                {meal.kitchenNotes && (
                  <p className="mt-0.5 flex items-center gap-1 text-[10px] font-medium text-orange-500">
                    <MessageSquare size={9} /> {meal.kitchenNotes}
                  </p>
                )}
              </td>

              <td className="px-3 py-3 text-center">
                <span className="rounded-lg bg-gray-50 px-3 py-1 text-sm font-bold text-gray-800">
                  x{meal.qty}
                </span>
              </td>

              <td className="px-3 py-3 text-center">
                <span className={`inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase ${statusStyles[meal.status] || 'bg-gray-50 text-gray-400'}`}>
                  {meal.status.replace('_', ' ')}
                </span>
              </td>

              <td className="px-3 py-3 text-center">
                <p className={`text-xs font-bold tracking-tight ${
                  meal.chefName === 'Not Assigned' ? 'italic text-gray-300' : 'text-gray-800'
                }`}>
                  {meal.chefName}
                </p>
              </td>

              {(orderStatus === 'PENDING' || orderStatus === 'PREPARING') && (
                <td className="px-3 py-3 text-center">
                  {meal.status === 'PENDING' && (
                    <button
                      onClick={() => onAssignChef(meal)}
                      className="flex items-center gap-1 rounded-xl border border-blue-100 px-3 py-2 text-xs font-bold text-blue-600 transition-all hover:bg-blue-50 mx-auto"
                    >
                      <UserPlus size={14} /> Assign
                    </button>
                  )}
                  {meal.status === 'PREPARING' && (
                    <span className="text-xs font-bold text-blue-400">Cooking...</span>
                  )}
                  {meal.status === 'READY' && (
                    <span className="text-xs font-bold text-green-500">✓ Ready</span>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default MealTable
