import React from 'react'
import ProgressBar from './ProgressBar'

{/*warning level colors*/}
const warningLevelColors = {
    CRITICAL: "text-red-500",
    LOW: "text-yellow-500",
}


const KitchenStatBar = ({ label, percentage, color, count, weight, warningLevel }) => {
  return (
    <div className="flex flex-col mb-5">
        <div className="flex flex-row justify-between mb-1">
            <div className="text-base font-semibold text-gray-700">
                {label}
            </div>
            {count && (
                <div className="text-base font-bold text-gray-900">
                    {count}
                </div>
            )}
        </div>

        {/*conditional rendering - if weight and warningLevel are present, then show the weight and warning level - then this component can be used for low inventory alerts*/}
        {weight && warningLevel && (
            <div className="flex flex-row justify-between mb-2">
                <div className="text-xs text-gray-500 uppercase font-medium">
                    Weight: {weight}
                </div>
                <div className={`text-xs font-black uppercase ${warningLevelColors[warningLevel]}`}>
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