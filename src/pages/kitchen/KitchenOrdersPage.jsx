import { RiClipboardLine } from "@remixicon/react";
import OrderTabs from "../../components/kitchen/orders/OrderTabs";
import SelectedOrder from "../../components/kitchen/orders/SelectedOrder";
import { useState, useEffect, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ClipboardList } from "lucide-react";
import { toast } from "react-toastify";
import useWebSocket from "../../hooks/useWebSocket";

const KitchenOrdersPage = () => {
  const [selectedOrder, setSelectedOrder] = useState(null); // Tracks which order is currently selected in the left panel
  const { setHeaderInfo } = useOutletContext();
  const [activeTab, setActiveTab] = useState(1); // When the page loads, the Pending tab (id: 1) is active by default

  // Used to trigger a refresh of the pending orders list when a new order arrives
  const [pendingRefreshKey, setPendingRefreshKey] = useState(0)

  const { user } = useAuth()
  const branchId = user?.branchId

  useEffect(() => {
    setHeaderInfo({
      title: "Order Management",
      description: "Monitor and manage your kitchen orders in real-time.",
      Icon: RiClipboardLine,
    });
  }, []);

  // Called when a new order notification arrives from the receptionist via WebSocket
  const handleNewOrder = useCallback((message) => {
    // Show a toast notification so the chef is alerted immediately
    toast.success(`🍽️ ${message.message}`, { autoClose: 5000 })

    // Silently refresh the pending list in the background — do NOT switch tabs,
    // as the chef may be actively working on a different section
    setPendingRefreshKey((prev) => prev + 1)
  }, [])

  // Subscribe to the kitchen-orders topic for this branch
  const kitchenOrderTopic = branchId
    ? `/topic/branch/${branchId}/kitchen-orders`
    : null

  useWebSocket(branchId, kitchenOrderTopic, handleNewOrder)

  return (
    <div className="flex h-[calc(100vh-80px)] gap-4 p-0">

      {/* Left panel — order list with tab switcher */}
      <div className="flex w-80 shrink-0 flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
        <OrderTabs
          handleOrderClick={(id) => setSelectedOrder(id)}
          selectedOrderId={selectedOrder}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          pendingRefreshKey={pendingRefreshKey} // Passed to trigger re-fetch when a new order arrives
        />
      </div>

      {/* Right panel — full detail of the selected order */}
      <div className="flex-1 overflow-y-auto">
        {selectedOrder ? (
          <SelectedOrder orderId={selectedOrder} setActiveTab={setActiveTab} />
        ) : (
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
