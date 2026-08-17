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

// Maps each tab id to the matching key in the `counts` object passed down from KitchenOrdersPage.
const COUNT_KEYS = { 1: "pending", 2: "preparing", 3: "completed", 4: "onHold" };

// Same status-color convention already used in SelectedOrder.jsx's statusColors.
// Only Pending and Preparing get a blinking dot — Completed/On Hold don't need one.
const DOT_COLORS = { 1: "bg-orange-500", 2: "bg-blue-500" };

const OrderTabs = ({ handleOrderClick, selectedOrderId, activeTab, setActiveTab, pendingRefreshKey, itemUpdateKey, counts }) => {
  const activeCount = counts?.[COUNT_KEYS[activeTab]] ?? 0

  return (
    // Fill the full height of the left panel and prevent its own overflow — inner content scrolls separately
    <div className="flex h-full flex-col overflow-hidden">

      {/* Panel header and underline-style tab bar */}
      <div className="px-5 pt-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-800">Orders</h3>
          {/* Only the currently selected tab's count is shown — matches the Receptionist Orders page */}
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-bold text-gray-500">
            {activeCount}
          </span>
        </div>

        {/* Tab buttons — negative horizontal margin makes the bottom border span the full panel width */}
        <div className="-mx-5 flex border-b border-gray-100 px-5">
          {TABS.map((tab) => {
            const count = counts?.[COUNT_KEYS[tab.id]] ?? 0
            return (
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
                <span className="flex items-center justify-center gap-1">
                  {tab.label}
                  {count > 0 && DOT_COLORS[tab.id] && (
                    <span className={`h-1.5 w-1.5 rounded-full ${DOT_COLORS[tab.id]} animate-pulse`} />
                  )}
                </span>
              </button>
            )
          })}
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
