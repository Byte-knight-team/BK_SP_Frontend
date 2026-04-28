import { useState } from "react";
import PendingOrdersTab from "./PendingOrdersTab";
import PreparingOrdersTab from "./PreparingOrdersTab";
import CompletedOrdersTab from "./CompletedOrdersTab";
import OnHoldOrdersTab from "./OnHoldOrdersTab";

const OrderTabs = ({ handleOrderClick, selectedOrderId, activeTab, setActiveTab }) => {

  const tabs = [
    { id: 1, label: "Pending", color: "orange" },
    { id: 2, label: "Preparing", color: "blue" },
    { id: 3, label: "Completed", color: "green" },
    { id: 4, label: "On Hold", color: "red" },
  ];

  return (
    <div className="w-full">
      {/* Tabs Header */}
      <div className="flex flex-wrap gap-1 border-b border-gray-100 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-xl px-2 py-1.5 text-[11px] font-bold transition-all ${
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
        {activeTab === 1 && <PendingOrdersTab handleOrderClick={handleOrderClick} selectedOrderId={selectedOrderId}/>}
        {activeTab === 2 && <PreparingOrdersTab handleOrderClick={handleOrderClick} selectedOrderId={selectedOrderId}/>}
        {activeTab === 3 && <CompletedOrdersTab handleOrderClick={handleOrderClick} selectedOrderId={selectedOrderId}/>}
        {activeTab === 4 && <OnHoldOrdersTab handleOrderClick={handleOrderClick} selectedOrderId={selectedOrderId}/>}
      </div>
    </div>
  );
};

export default OrderTabs;
