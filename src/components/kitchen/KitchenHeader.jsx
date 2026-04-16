import React from "react";
import {
  RiSearchLine,
  RiNotification3Line,
  RiCalendarLine,
} from "@remixicon/react";

const KitchenHeader = () => {
  {/* today date */}
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="sticky top-0 flex h-20 items-center justify-between bg-white px-8">
      {/* 1. Welcome Message Area */}
      <div className="flex flex-col">
        <h1 className="text-xl font-bold text-gray-800">Hello, Isuru! 👋</h1>
        <p className="text-xs font-medium text-orange-600 uppercase">
          Welcome to the kitchen • Chief Chef
        </p>
      </div>

      {/* 2. Right Side Actions (Date, Notifications, Status) */}
      <div className="flex items-center gap-6">
        {/* Date Display */}
        <div className="flex items-center gap-2 text-gray-500">
          <RiCalendarLine size={18} />
          <span className="text-xs font-medium">{today}</span>
        </div>

        {/* Notification Bell */}
        <button className="relative rounded-xl p-2 text-gray-500 hover:bg-gray-50">
          <RiNotification3Line size={24} />
          {/* Notification Badge Dot */}
          <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500"></span>
        </button>
      </div>
    </header>
  );
};

export default KitchenHeader;
