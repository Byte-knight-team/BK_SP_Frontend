import { RiClipboardLine } from "@remixicon/react";
import OrderTabs from "../../components/kitchen/orders/OrderTabs";
import SelectedOrder from "../../components/kitchen/orders/SelectedOrder";
import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { ClipboardList } from "lucide-react";

const KitchenOrdersPage = () => {
  const [selectedOrder, setSelectedOrder] = useState(null); // Tracks which order is currently selected in the left panel
  const { setHeaderInfo } = useOutletContext();
  const [activeTab, setActiveTab] = useState(1); // When the page loads, the Pending tab (id: 1) is active by default

  useEffect(() => {
    setHeaderInfo({
      title: "Order Management",
      description: "Monitor and manage your kitchen orders in real-time.",
      Icon: RiClipboardLine,
    });
  }, []);

  return (
    // Full height layout minus the header bar — fills the screen without scrolling the page itself
    <div className="flex h-[calc(100vh-80px)] gap-5 bg-gray-50 p-6">

      {/* Left panel — scrollable order list with tab switcher */}
      <div className="flex w-96 shrink-0 flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
        {/* OrderTabs manages both the tab buttons and the order card list inside */}
        <OrderTabs
          handleOrderClick={(id) => setSelectedOrder(id)} // When a card is clicked, store its ID as the selected order
          selectedOrderId={selectedOrder} // Passed down so the active card can be highlighted
          activeTab={activeTab} // Tells OrderTabs which tab is currently active
          setActiveTab={setActiveTab} // Allows child components (like SelectedOrder) to switch tabs when an order status changes
        />
      </div>

      {/* Right panel — shows full detail of the selected order */}
      <div className="flex-1 overflow-y-auto">
        {selectedOrder ? (
          // Render the full order detail when an order is selected
          <SelectedOrder orderId={selectedOrder} setActiveTab={setActiveTab} />
        ) : (
          // Empty state — shown when no order is selected yet
          <div className="flex h-full flex-col items-center justify-center gap-3 rounded-3xl border border-gray-100 bg-white">
            <div className="rounded-2xl bg-orange-50 p-5 text-orange-300">
              <ClipboardList size={32} />
            </div>
            <p className="text-sm font-bold text-gray-400">Select an order to view details</p>
            <p className="text-xs text-gray-300">Click any order from the list on the left</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default KitchenOrdersPage;
