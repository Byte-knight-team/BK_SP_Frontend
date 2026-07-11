import React from 'react'
import ProgressBar from './ProgressBar'

const warningLevelColors = {
  CRITICAL: 'text-red-500',
  LOW: 'text-yellow-500',
}

const KitchenStatBar = ({
  mealName,
  itemName,
  percentage,
  color,
  count,
  maxStock,
  quantity,
  unit,
  warningLevel,
}) => {
  return (
    <div className="mb-3 flex flex-col">
      <div className="mb-1 flex flex-row items-center justify-between">
        <div className="text-sm font-bold text-gray-800">
          {itemName || mealName}
        </div>
        <div className="text-sm font-bold text-gray-800">
          {maxStock && quantity
            ? `${quantity} / ${maxStock}` //availableCount + " / " + maxStock
            : count}
        </div>
      </div>

      {/*conditional rendering - if weight and warningLevel are present, then show the weight and warning level - then this can be used for low inventory alerts*/}
      {unit && warningLevel && (
        <div className="mb-2 flex flex-row items-center justify-between">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            Unit: {unit}
          </div>
          <div
            className={`text-[11px] font-black uppercase ${warningLevelColors[warningLevel]}`}
          >
            {warningLevel}
          </div>
        </div>
      )}

      {/* progress bar */}
      <div className="mt-1">
        <ProgressBar percentage={percentage} color={color} />
      </div>
    </div>
  )
}

export default KitchenStatBar
