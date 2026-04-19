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
      <ul className="flex w-full justify-between text-center text-sm font-medium border-b border-gray-200">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <li key={tab.id}>
              <a
                href="#"
                onClick={(e) => handleTabClick(e, tab.id)}
                className={`rounded-base inline-block px-4 py-2.5 font-bold transition-all ${
                  isActive
                    ? "text-fg-brand border-brand rounded-t-base inline-block border-b p-4 text-yellow-500"
                    : "text-body hover:bg-neutral-secondary-soft"
                }`}
              >
                {tab.label}
              </a>
            </li>
          );
        })}
      </ul>

      {/* Content Area */}
      <div className="rounded-base mt-4 p-4">
        {activeTab === 1 && (
          <PendingOrdersTab handleOrderClick={handleOrderClick} />
        )}
        {activeTab === 2 && (
          <PreparingOrdersTab handleOrderClick={handleOrderClick} />
        )}
        {activeTab === 3 && (
          <CompletedOrdersTab handleOrderClick={handleOrderClick} />
        )}
        {activeTab === 4 && (
          <OnHoldOrdersTab handleOrderClick={handleOrderClick} />
        )}
      </div>
    </div>
  );
};

export default OrderTabs;
