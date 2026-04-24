import { useState } from "react";
import PendingOrdersTab from "./PendingOrdersTab";
import PreparingOrdersTab from "./PreparingOrdersTab";
import CompletedOrdersTab from "./CompletedOrdersTab";
import OnHoldOrdersTab from "./OnHoldOrdersTab";

const OrderTabs = ({ handleOrderClick }) => {
  const [activeTab, setActiveTab] = useState(1);

  const tabs = [
    { id: 1, label: "Pending", color: "orange" },
    { id: 2, label: "Preparing", color: "blue" },
    { id: 3, label: "Completed", color: "green" },
    { id: 4, label: "On Hold", color: "red" },
  ];

  return (
    <div className="w-full">
      {/* Tabs Header */}
      <div className="flex gap-2 border-b border-gray-100 pb-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === tab.id
                ? "bg-orange-500 text-white shadow-sm"
                : "text-gray-400 hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="mt-4">
        {activeTab === 1 && <PendingOrdersTab handleOrderClick={handleOrderClick} />}
        {activeTab === 2 && <PreparingOrdersTab handleOrderClick={handleOrderClick} />}
        {activeTab === 3 && <CompletedOrdersTab handleOrderClick={handleOrderClick} />}
        {activeTab === 4 && <OnHoldOrdersTab handleOrderClick={handleOrderClick} />}
      </div>
    </div>
  );
};

export default OrderTabs;
