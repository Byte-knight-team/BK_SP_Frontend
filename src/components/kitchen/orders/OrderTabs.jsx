import PendingOrdersTab from "./PendingOrdersTab";
import PreparingOrdersTab from "./PreparingOrdersTab";
import CompletedOrdersTab from "./CompletedOrdersTab";
import OnHoldOrdersTab from "./OnHoldOrdersTab";

// Each tab maps to a numeric ID so child components (like SelectedOrder) can switch tabs programmatically
const TABS = [
  { id: 1, label: "Pending" },
  { id: 2, label: "Preparing" },
  { id: 3, label: "Completed" },
  { id: 4, label: "On Hold" },
];

const OrderTabs = ({ handleOrderClick, selectedOrderId, activeTab, setActiveTab, pendingRefreshKey, itemUpdateKey }) => {
  return (
    // Fill the full height of the left panel and prevent its own overflow — inner content scrolls separately
    <div className="flex h-full flex-col overflow-hidden">

      {/* Panel header and underline-style tab bar */}
      <div className="px-5 pt-5">
        <h3 className="mb-4 text-base font-bold text-gray-800">Orders</h3>

        {/* Tab buttons — negative horizontal margin makes the bottom border span the full panel width */}
        <div className="-mx-5 flex border-b border-gray-100 px-5">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              // flex-1 makes all tabs share equal width so they never overflow or create a scrollbar
              // Active tab gets an orange underline border; inactive tabs are muted gray
              className={`flex-1 pb-3 pt-1 text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? "border-b-2 border-orange-500 text-orange-500"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable order card list — only this area scrolls, not the tab bar above */}
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 pb-4 pt-3">
        {/* Conditionally render the correct tab content based on the active tab ID */}
        {/* pendingRefreshKey increments when a new order arrives via WebSocket — triggers a re-fetch inside PendingOrdersTab */}
        {activeTab === 1 && <PendingOrdersTab handleOrderClick={handleOrderClick} selectedOrderId={selectedOrderId} refreshKey={pendingRefreshKey} />}
        {activeTab === 2 && <PreparingOrdersTab handleOrderClick={handleOrderClick} selectedOrderId={selectedOrderId} refreshKey={itemUpdateKey} />}
        {activeTab === 3 && <CompletedOrdersTab handleOrderClick={handleOrderClick} selectedOrderId={selectedOrderId} refreshKey={itemUpdateKey} />}
        {activeTab === 4 && <OnHoldOrdersTab handleOrderClick={handleOrderClick} selectedOrderId={selectedOrderId} />}
      </div>

    </div>
  );
};

export default OrderTabs;
