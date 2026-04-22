import React, { useState } from "react";
import PendingOrdersTab from "./PendingOrdersTab";
import PreparingOrdersTab from "./PreparingOrdersTab";
import CompletedOrdersTab from "./CompletedOrdersTab";
import OnHoldOrdersTab from "./OnHoldOrdersTab";

const OrderTabs = ({ handleOrderClick }) => {
  const [activeTab, setActiveTab] = useState(1);

  const tabs = [
    { id: 1, label: "Pending" },
    { id: 2, label: "Preparing" },
    { id: 3, label: "Completed" },
    { id: 4, label: "On Hold" },
  ];

  const handleTabClick = (e, id) => {
    e.preventDefault();
    setActiveTab(id);
  };

  return (
    <div className="w-full">
      {/* Tabs Header */}
      <ul className="flex w-full justify-between border-b border-gray-200 text-center text-sm font-medium">
        {tabs.map((tab) => (
          <li key={tab.id}>
            <a
              href="#"
              onClick={(e) => handleTabClick(e, tab.id)}
              className={`inline-block px-4 py-2 transition-all ${activeTab === tab.id //check the tab active or not and apply the style 
                  ? "border-b-2 border-orange-500 text-orange-500 font-semibold" // Active
                  : "text-gray-500 hover:bg-gray-50"             // Normal
              }`}
            >
              {tab.label}
            </a>
          </li>
        ))}
      </ul>

      {/* Content Area */}
      <div className="mt-4 rounded-xl bg-white p-4">
        {activeTab === 1 && <PendingOrdersTab handleOrderClick={handleOrderClick} />}
        {activeTab === 2 && <PreparingOrdersTab handleOrderClick={handleOrderClick} />}
        {activeTab === 3 && <CompletedOrdersTab handleOrderClick={handleOrderClick} />}
        {activeTab === 4 && <OnHoldOrdersTab handleOrderClick={handleOrderClick} />}
      </div>
    </div>
  );
};

export default OrderTabs;