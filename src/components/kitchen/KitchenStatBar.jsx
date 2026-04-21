import React from "react";
import ProgressBar from "./ProgressBar";

const warningLevelColors = {
  CRITICAL: "text-red-500",
  LOW: "text-yellow-500",
};

const KitchenStatBar = ({
  mealName,
  itemName,
  percentage,
  color,
  count,
  maxStock,
  availableCount,
  unit,
  warningLevel,
}) => {
  return (
    <div className="mb-5 flex flex-col">
      <div className="mb-1 flex flex-row justify-between">
        <div className="text-base font-semibold text-gray-700">
          {itemName || mealName}
        </div>
        <div className="text-base font-bold text-gray-900">
          {maxStock && availableCount
            ? `${availableCount} / ${maxStock}` //availableCount + " / " + maxStock
            : count}
        </div>
      </div>

      {/*conditional rendering - if weight and warningLevel are present, then show the weight and warning level - then this component can be used for low inventory alerts*/}
      {unit && warningLevel && (
        <div className="mb-2 flex flex-row justify-between">
          <div className="text-xs font-medium text-gray-500 uppercase">
            Unit: {unit}
          </div>
          <div
            className={`text-xs font-black uppercase ${warningLevelColors[warningLevel]}`}
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
  );
};

export default KitchenStatBar;
