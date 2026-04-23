import React from "react";
import { RiMoneyDollarCircleFill, RiBankCardFill, RiSmartphoneFill } from "@remixicon/react";

const ShiftStatistics = () => {
  const totalRevenue = "45,800";
  
  const paymentMethods = [
    { label: "Cash", amount: "12,500", color: "#B87E1E", percentage: 35, icon: <RiMoneyDollarCircleFill className="text-green-600" /> },
    { label: "Card", amount: "28,300", color: "#1D61AB", percentage: 65, icon: <RiBankCardFill className="text-blue-600" /> },
    { label: "Online", amount: "5,000", color: "#6D31C1", percentage: 15, icon: <RiSmartphoneFill className="text-purple-600" /> },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
      {/* Title */}
      <h2 className="text-lg font-bold text-gray-800 mb-4">Payment Statistics</h2>

      {/* Main Revenue Display */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2">
          <div className="text-2xl font-bold text-gray-900">Rs</div>
          <div className="text-4xl font-bold text-gray-900 tracking-tight">{totalRevenue}</div>
        </div>
        <p className="text-gray-400 text-sm mt-1 font-medium">Total revenue this shift</p>
      </div>

      {/* Payment Methods Progress Bars */}
      <div className="space-y-4 mb-8">
        {paymentMethods.map((method, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className="flex items-center gap-2 w-20">
              {method.icon}
              <span className="text-sm font-medium text-gray-500">{method.label}</span>
            </div>
            
            {/* Progress Bar Container */}
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${method.percentage}%`, backgroundColor: method.color }}
              />
            </div>

            <span className="text-sm font-bold text-gray-800 w-16 text-right">
              {method.amount}
            </span>
          </div>
        ))}
      </div>

      {/* Bottom Stats (Dine-in & Takeaway) */}
      <div className="grid grid-cols-2 gap-4 mt-auto">
        <div className="flex flex-col items-center justify-center p-4 bg-white border border-gray-100 rounded-2xl shadow-xs">
          <span className="text-2xl font-bold text-gray-900">14</span>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs font-medium text-gray-400">🍽️ Dine-in</span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center p-4 bg-white border border-gray-100 rounded-2xl shadow-xs">
          <span className="text-2xl font-bold text-gray-900">4</span>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs font-medium text-gray-400">🥡 Takeaway</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShiftStatistics;