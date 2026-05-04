const statesColours = {
  PENDING: 'bg-orange-50 text-orange-500',
  PREPARING: 'bg-blue-50 text-blue-500',
  COMPLETED: 'bg-green-50 text-green-500',
  ON_HOLD: 'bg-red-50 text-red-500',
}

const timeLabels = {
  PENDING: 'Received at',
  PREPARING: 'Started at',
  COMPLETED: 'Completed at',
  ON_HOLD: 'Hold at',
}

const OrderCard = ({status,time, id, numberOfItems, onClick,isClickable = true, isSelected,}) => {
  return (
    <div
      className={`flex flex-col gap-1.5 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm transition-all ${isSelected ? 'border-gray-900 shadow-md' : 'border-gray-100'} ${isClickable ? 'cursor-pointer hover:border-orange-100 hover:shadow-md' : 'cursor-default'}`}
      onClick={isClickable ? onClick : undefined}
    >
      <div className="flex items-center justify-between">
        <span
          className={`rounded-full px-3 py-1 text-[10px] font-bold tracking-wider uppercase ${statesColours[status]}`}
        >
          {status.replace("_", " ")}
        </span>
        {/* Dynamically pick the correct label based on the current status */}
        <p className="text-xs font-medium text-gray-400">
          {timeLabels[status]} {time}
        </p>
      </div>
      <h2 className="text-base font-bold text-gray-800">{id}</h2>
      <p className="text-sm font-medium text-gray-400">
        {/* make the meals word singular if number of meals is 1 */}
        {numberOfItems} {numberOfItems === 1 ? 'Meal' : 'Meals'}
      </p>
    </div>
  )
}

export default OrderCard
