import React from "react";

const StatCard = ({ title, value, icon, iconBgColor }) => {
  return (
    <div className="flex flex-row justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex-1 min-w-[240px] ">
      <div>
        <h3 className="text-gray-500 text-sm font-bold tracking-wider">
          {title}
        </h3>
        <div className="flex items-center justify-between mt-4">
          <h3 className="text-4xl font-black text-gray-800">{value}</h3>
        </div>
      </div>
      <div className={`flex items-center p-4 ${iconBgColor} justify-center rounded-2xl`}>{icon}</div>
    </div>
  );
};

export default StatCard;
